const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const store = require('./store');
const auth = require('./auth');
const payments = require('./payments');
const moderation = require('./moderation');

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
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
// Tipografía servida desde el propio servidor (sin llamadas a Google)
app.get('/fonts/plus-jakarta-sans.woff2', (_req, res) => {
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  res.sendFile(require.resolve('@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2'));
});

auth.routes(app);
payments.routes(app, process.env.BASE_URL);
moderation.routes(app);

// Sesión actual: datos de la cuenta, Premium y restricciones
app.get('/api/me', auth.requireUser, (req, res) => {
  res.json({
    user: auth.publicUser(req.user),
    ...payments.premiumInfo(req.user.id),
    restriction: auth.restriction(req.user),
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
  // El que acaba de llegar inicia la oferta WebRTC
  socket.emit('matched', { initiator: true, gender: partner.data.gender });
  partner.emit('matched', { initiator: false, gender: socket.data.gender });
}

// Expulsa del chat a un usuario suspendido o expulsado
moderation.setOnRestrict((userId, restriction) => {
  for (const s of io.of('/').sockets.values()) {
    if (s.data.uid !== userId) continue;
    s.emit('restricted', restriction);
    s.disconnect(true);
  }
});

io.use((socket, next) => {
  const user = auth.userFromToken(socket.handshake.auth?.token);
  if (!user) return next(new Error('auth'));
  const restriction = auth.restriction(user);
  if (restriction) {
    const err = new Error('restricted');
    err.data = restriction;
    return next(err);
  }
  socket.data.uid = user.id;
  socket.data.gender = user.gender;
  socket.data.premium = payments.isPremium(user.id);
  socket.data.blocked = new Set(user.blocked || []);
  socket.data.want = [];
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

  // Denuncia a la persona actual: se guarda con el chat como prueba, se corta
  // la conversación y no vuelven a coincidir
  socket.on('report', ({ reason, comment } = {}, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {};
    const partnerId = partners.get(socket.id);
    const partner = partnerId && io.sockets.sockets.get(partnerId);
    if (!partner) return reply({ error: 'No hay nadie a quien denunciar' });
    if (!moderation.REASONS[reason]) return reply({ error: 'Elige un motivo' });

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
