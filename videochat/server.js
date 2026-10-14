const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const store = require('./store');
const auth = require('./auth');
const payments = require('./payments');
const moderation = require('./moderation');
const translate = require('./translate');
const age = require('./age');

const PORT = process.env.PORT || 3000;

const app = express();
app.set('trust proxy', true);
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(self), microphone=(self)',
  });
  next();
});
// rawBody: el webhook de Veriff se firma sobre el cuerpo exacto recibido
app.use(express.json({ limit: '50kb', verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
// Tipografía servida desde el propio servidor (sin llamadas a Google)
app.get('/fonts/plus-jakarta-sans.woff2', (_req, res) => {
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(require.resolve('@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2'));
});

auth.routes(app);
payments.routes(app, process.env.BASE_URL);
moderation.routes(app);
translate.routes(app);
age.routes(app, process.env.BASE_URL);

// Qué funciones opcionales están activas
app.get('/api/config', (_req, res) => res.json({ translate: translate.enabled }));

// Sesión actual: datos de la cuenta, Premium y restricciones
app.get('/api/me', auth.requireUser, (req, res) => {
  res.json({
    user: auth.publicUser(req.user),
    ...payments.premiumInfo(req.user.id),
    restriction: auth.restriction(req.user),
    age: age.publicAge(req.user),
  });
});

// Configuración ICE para el cliente. En producción añade un servidor TURN
// (p. ej. coturn) mediante variables de entorno, si no muchas conexiones fallan.
app.get('/ice', (_req, res) => {
  const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
  if (process.env.TURN_URL) {
    iceServers.push({
      urls: process.env.TURN_URL,
      username: process.env.TURN_USER,
      credential: process.env.TURN_PASS,
    });
  }
  res.json({ iceServers });
});

app.get('/stats', (_req, res) => {
  res.json({ online: io.of('/').sockets.size });
});

const server = http.createServer(app);
const io = new Server(server);

// Cola de espera y emparejamientos activos
let queue = [];               // ids de socket esperando pareja
const partners = new Map();   // socketId -> socketId de su pareja
const lastPartner = new Map();// evita volver a emparejar con el anterior al instante
const chatLogs = new Map();   // socketId -> últimos mensajes de la conversación actual
const reacted = new Map();    // socketId -> reacciones ya contadas en la conversación actual
const REACTIONS = ['like', 'love'];
const LANG_RE = /^[a-z]{2,3}$/;

function removeFromQueue(id) {
  queue = queue.filter((q) => q !== id);
}

function unpair(socket, notify = true) {
  const partnerId = partners.get(socket.id);
  if (!partnerId) return;
  partners.delete(socket.id);
  partners.delete(partnerId);
  chatLogs.delete(socket.id);
  chatLogs.delete(partnerId);
  reacted.delete(socket.id);
  reacted.delete(partnerId);
  if (notify) io.to(partnerId).emit('partner-left');
}

// a quiere ver a b? (sin filtro = cualquiera)
function wants(a, b) {
  return a.data.want.length === 0 || a.data.want.includes(b.data.gender);
}

// Pueden coincidir? (no es la misma cuenta y ninguno ha denunciado al otro)
function compatible(a, b) {
  if (a.data.uid === b.data.uid) return false;
  if (a.data.blocked.has(b.data.uid) || b.data.blocked.has(a.data.uid)) return false;
  return wants(a, b) && wants(b, a);
}

function findMatch(socket) {
  removeFromQueue(socket.id);
  const avoid = lastPartner.get(socket.id);
  const idx = queue.findIndex((id) => {
    const other = io.sockets.sockets.get(id);
    return other && id !== avoid && compatible(socket, other);
  });
  if (idx === -1) {
    queue.push(socket.id);
    socket.emit('waiting');
    return;
  }
  const partnerId = queue.splice(idx, 1)[0];
  const partner = io.sockets.sockets.get(partnerId);
  partners.set(socket.id, partnerId);
  partners.set(partnerId, socket.id);
  lastPartner.set(socket.id, partnerId);
  lastPartner.set(partnerId, socket.id);
  const log = [];
  chatLogs.set(socket.id, log);
  chatLogs.set(partnerId, log);
  reacted.set(socket.id, new Set());
  reacted.set(partnerId, new Set());
  // El que acaba de llegar inicia la oferta WebRTC
  socket.emit('matched', { initiator: true, ...partnerInfo(partner) });
  partner.emit('matched', { initiator: false, ...partnerInfo(socket) });
}

// Lo que se enseña de la otra persona: qué es, su idioma y sus likes
function partnerInfo(s) {
  return { gender: s.data.gender, lang: s.data.lang, likes: auth.likesOf(store.getUser(s.data.uid) || {}) };
}

// Expulsa del chat a un usuario suspendido o expulsado
function kick(userId, restriction) {
  for (const s of io.of('/').sockets.values()) {
    if (s.data.uid !== userId) continue;
    s.emit('restricted', restriction);
    s.disconnect(true);
  }
}
moderation.setOnRestrict(kick);
age.setOnRestrict(kick);

io.use((socket, next) => {
  const user = auth.userFromToken(socket.handshake.auth?.token);
  if (!user) return next(new Error('auth'));
  const restriction = auth.restriction(user);
  if (restriction) {
    const err = new Error('restricted');
    err.data = restriction;
    return next(err);
  }
  if (age.needsVerification(user)) return next(new Error('age'));
  socket.data.uid = user.id;
  socket.data.gender = user.gender;
  socket.data.premium = payments.isPremium(user.id);
  socket.data.blocked = new Set(user.blocked || []);
  socket.data.want = [];
  const lang = String(socket.handshake.auth?.lang || '').toLowerCase();
  socket.data.lang = LANG_RE.test(lang) ? lang : 'en';
  next();
});

io.on('connection', (socket) => {
  socket.emit('account', { premium: socket.data.premium });

  socket.on('find', (opts = {}) => {
    // El filtro solo se aplica a usuarios Premium; el resto, siempre al azar
    const want = Array.isArray(opts.want) ? opts.want.filter((g) => auth.GENDERS.includes(g)) : [];
    socket.data.want = socket.data.premium ? want : [];
    unpair(socket);
    findMatch(socket);
  });

  socket.on('stop', () => {
    removeFromQueue(socket.id);
    unpair(socket);
  });

  // Reenvío de señalización WebRTC (offer/answer/ice) solo a la pareja actual
  socket.on('signal', (data) => {
    const partnerId = partners.get(socket.id);
    if (partnerId) io.to(partnerId).emit('signal', data);
  });

  socket.on('chat', (text) => {
    const partnerId = partners.get(socket.id);
    if (!partnerId || typeof text !== 'string') return;
    const clean = text.trim().slice(0, 500);
    if (!clean) return;
    const log = chatLogs.get(socket.id);
    if (log) {
      log.push({ from: socket.data.uid, text: clean, at: Date.now() });
      if (log.length > 30) log.shift();
    }
    io.to(partnerId).emit('chat', clean);
  });

  // Reacciones 👍 / ❤️: se animan en las dos pantallas y suman al perfil de la
  // otra persona (cada tipo cuenta una vez por conversación)
  socket.on('react', (type) => {
    const partnerId = partners.get(socket.id);
    const partner = partnerId && io.sockets.sockets.get(partnerId);
    if (!partner || !REACTIONS.includes(type)) return;
    const now = Date.now();
    if (now - (socket.data.lastReaction || 0) < 600) return;
    socket.data.lastReaction = now;

    const counted = reacted.get(socket.id);
    let likes = auth.likesOf(store.getUser(partner.data.uid) || {});
    if (counted && !counted.has(type)) {
      counted.add(type);
      likes = { ...likes, [type]: likes[type] + 1 };
      store.updateUser(partner.data.uid, { likes });
    }
    socket.emit('reaction', { type, from: 'me', partnerLikes: likes });
    partner.emit('reaction', { type, from: 'them', myLikes: likes });
  });

  // Denuncia a la persona actual: se guarda con el chat como prueba, se corta
  // la conversación y no vuelven a coincidir
  socket.on('report', ({ reason, comment } = {}, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {};
    const partnerId = partners.get(socket.id);
    const partner = partnerId && io.sockets.sockets.get(partnerId);
    if (!partner) return reply({ code: 'noPartner' });
    if (!moderation.REASONS[reason]) return reply({ code: 'reason' });

    const reporter = store.getUser(socket.data.uid);
    const reported = store.getUser(partner.data.uid);
    const result = moderation.report({ reporter, reported, reason, comment, chat: chatLogs.get(socket.id) });

    const blocked = new Set(reporter.blocked || []);
    blocked.add(reported.id);
    store.updateUser(reporter.id, { blocked: [...blocked].slice(-500) });
    socket.data.blocked.add(reported.id);

    unpair(socket);
    reply({ ok: true, duplicate: !!result?.duplicate });
  });

  socket.on('disconnect', () => {
    removeFromQueue(socket.id);
    unpair(socket);
    lastPartner.delete(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`La Ruleta Caliente escuchando en http://localhost:${PORT}`);
});
