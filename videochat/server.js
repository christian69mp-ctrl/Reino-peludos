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
const privacy = require('./privacy');
const captcha = require('./captcha');
const friends = require('./friends');
const oauth = require('./oauth');
const geo = require('./geo');
const proxyAddr = require('proxy-addr');

const PORT = process.env.PORT || 3000;

const app = express();
// Solo se fía de la cabecera X-Forwarded-For si llega desde la propia máquina o
// la red interna (el proxy HTTPS); así nadie puede falsear su IP desde fuera.
app.set('trust proxy', process.env.TRUST_PROXY || 'loopback, linklocal, uniquelocal');
app.disable('x-powered-by');
app.use(privacy.securityHeaders);
app.use(express.json({ limit: '50kb', verify: (req, _res, buf) => { req.rawBody = buf; } }));
// El service worker no se guarda en caché para que las actualizaciones lleguen enseguida
app.get('/sw.js', (_req, res, next) => { res.set('Cache-Control', 'no-cache'); next(); });
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
privacy.routes(app);
friends.routes(app);
oauth.routes(app);

// Qué funciones opcionales están activas
app.get('/api/config', (_req, res) => res.json({ translate: translate.enabled, turnstile: captcha.SITE_KEY || null, providers: oauth.enabled }));

// Sesión actual: datos de la cuenta, Premium y restricciones
app.get('/api/me', auth.requireUser, (req, res) => {
  res.json({
    user: auth.publicUser(req.user),
    ...payments.premiumInfo(req.user.id),
    restriction: auth.restriction(req.user),
    age: age.publicAge(req.user),
    emailRequired: auth.EMAIL_VERIFY,
    watermark: privacy.watermarkCode(req.user),
  });
});

// Configuración ICE para el cliente. En producción añade un servidor TURN
// (p. ej. coturn) mediante variables de entorno, si no muchas conexiones fallan.
// - TURN_URL: una o varias URL separadas por comas (turn:dominio:3478?transport=udp,…)
// - TURN_SECRET: el static-auth-secret de coturn. Se generan credenciales que
//   caducan a las 12 h, así nadie puede reutilizar el servidor TURN por su cuenta.
// - O bien TURN_USER y TURN_PASS fijos.
// - STUN_URL: servidor STUN propio (por defecto el de Google si no hay TURN).
// Privacidad: con TURN, el vídeo pasa siempre por él (RELAY_ONLY, activado por
// defecto) y así ninguna persona puede ver la IP de la otra. El vídeo sigue
// cifrado de extremo a extremo: el servidor no puede verlo. RELAY_ONLY=off lo desactiva.
const TURN_TTL = 12 * 3600;
const RELAY_ONLY = !!process.env.TURN_URL && process.env.RELAY_ONLY !== 'off';
app.get('/ice', (_req, res) => {
  const iceServers = [];
  const stun = process.env.STUN_URL || (process.env.TURN_URL ? '' : 'stun:stun.l.google.com:19302');
  if (stun && !RELAY_ONLY) iceServers.push({ urls: stun.split(',').map((u) => u.trim()) });
  if (process.env.TURN_URL) {
    const urls = process.env.TURN_URL.split(',').map((u) => u.trim()).filter(Boolean);
    let username = process.env.TURN_USER;
    let credential = process.env.TURN_PASS;
    if (process.env.TURN_SECRET) {
      username = `${Math.floor(Date.now() / 1000) + TURN_TTL}:lrc`;
      credential = require('crypto').createHmac('sha1', process.env.TURN_SECRET).update(username).digest('base64');
    }
    iceServers.push({ urls, username, credential });
  }
  res.set('Cache-Control', 'no-store');
  res.json(RELAY_ONLY ? { iceServers, iceTransportPolicy: 'relay' } : { iceServers });
});

app.get('/stats', (_req, res) => {
  res.json({ online: io.of('/').sockets.size });
});

// Página 404 para direcciones que no existen
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ code: 'notFound' });
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

const server = http.createServer(app);
const io = new Server(server);

// Cola de espera y emparejamientos activos
let queue = [];               // ids de socket esperando pareja
const partners = new Map();   // socketId -> socketId de su pareja
const lastPartner = new Map();// evita volver a emparejar con el anterior al instante
const chatLogs = new Map();   // socketId -> últimos mensajes de la conversación actual
const reacted = new Map();    // socketId -> reacciones ya contadas en la conversación actual
const meetings = new Map();   // socketId -> { x, y, at } de la conversación actual (para el historial)
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
  const meet = meetings.get(socket.id);
  meetings.delete(socket.id);
  meetings.delete(partnerId);
  if (meet) friends.meetEnded(meet.x, meet.y, meet.at);
  if (notify) io.to(partnerId).emit('partner-left');
  presenceChanged(socket.data.uid);
  const other = io.sockets.sockets.get(partnerId);
  if (other) presenceChanged(other.data.uid);
}

// Filtros Premium: género, de dónde (todo el mundo / mi país / cerca de mí) y edad
const SCOPES = ['all', 'country', 'near'];
const AGE_RANGES = { '18-24': [18, 24], '25-34': [25, 34], '35-44': [35, 44], '45+': [45, 120] };
const NO_FILTERS = { want: [], scope: 'all', age: null };

// a quiere ver a b? (sin filtros = cualquiera)
function wants(a, b) {
  const f = a.data.filters;
  if (f.want.length && !f.want.includes(b.data.gender)) return false;
  if (f.scope === 'country' && (!a.data.geo || b.data.geo?.country !== a.data.geo.country)) return false;
  if (f.scope === 'near' && !geo.near(a.data.geo, b.data.geo)) return false;
  if (f.age) {
    const [min, max] = AGE_RANGES[f.age];
    if (!(b.data.age >= min && b.data.age <= max)) return false;
  }
  return true;
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
  pair(socket, io.sockets.sockets.get(partnerId));
}

// Une a dos personas. La primera inicia la oferta WebRTC.
function pair(socket, partner, { call = false } = {}) {
  const partnerId = partner.id;
  partners.set(socket.id, partnerId);
  partners.set(partnerId, socket.id);
  lastPartner.set(socket.id, partnerId);
  lastPartner.set(partnerId, socket.id);
  const log = [];
  chatLogs.set(socket.id, log);
  chatLogs.set(partnerId, log);
  reacted.set(socket.id, new Set());
  reacted.set(partnerId, new Set());
  const meet = { x: socket.data.uid, y: partner.data.uid, at: Date.now() };
  meetings.set(socket.id, meet);
  meetings.set(partnerId, meet);
  friends.meet(meet.x, meet.y, meet.at);
  socket.emit('matched', { initiator: true, call, ...partnerInfo(socket, partner) });
  partner.emit('matched', { initiator: false, call, ...partnerInfo(partner, socket) });
  presenceChanged(meet.x);
  presenceChanged(meet.y);
}

// Lo que se enseña de la otra persona: su nombre, qué es, su idioma, sus likes
// y si ya sois amigos
function partnerInfo(viewer, s) {
  const user = store.getUser(s.data.uid) || {};
  return {
    gender: s.data.gender,
    lang: s.data.lang,
    likes: auth.likesOf(user),
    name: user.nick || '',
    handle: friends.handle(viewer.data.uid, s.data.uid),
    relation: friends.relation(viewer.data.uid, s.data.uid),
    country: s.data.geo?.country || '',
    age: s.data.age ?? null,
  };
}

// ---------- Presencia de amigos ----------
const userSockets = new Map(); // uid -> Set de ids de socket
const lastStatus = new Map();  // uid -> último estado avisado

function presence(uid) {
  const ids = userSockets.get(uid);
  if (!ids?.size) return 'offline';
  for (const id of ids) if (partners.has(id)) return 'busy';
  return 'online';
}

function notifyUser(uid, event, data) {
  for (const id of userSockets.get(uid) || []) io.to(id).emit(event, data);
}

// Avisa a los amigos conectados cuando alguien entra, sale o empieza/acaba una videollamada
function presenceChanged(uid) {
  const status = presence(uid);
  if (lastStatus.get(uid) === status) return;
  if (status === 'offline') lastStatus.delete(uid); else lastStatus.set(uid, status);
  for (const f of friends.friendIds(uid)) {
    if (userSockets.has(f) && payments.isPremium(f)) notifyUser(f, 'friend-status', { handle: friends.handle(f, uid), status });
  }
}

friends.setHooks({
  presence,
  notify: notifyUser,
  // Al bloquear: no vuelven a coincidir y, si estaban hablando, se corta
  onBlock(uid, other) {
    for (const id of userSockets.get(uid) || []) {
      const s = io.sockets.sockets.get(id);
      if (!s) continue;
      s.data.blocked.add(other);
      const p = io.sockets.sockets.get(partners.get(id));
      if (p?.data.uid === other) unpair(s);
    }
    for (const [callId, c] of calls) {
      if ((c.callerUid === uid && c.calleeUid === other) || (c.callerUid === other && c.calleeUid === uid)) endCall(callId, 'declined');
    }
  },
});

// ---------- Llamadas entre amigos ----------
const CALL_TIMEOUT = 30 * 1000;
const calls = new Map(); // callId -> { callerSid, callerUid, calleeUid, timer }

function endCall(callId, reason) {
  const call = calls.get(callId);
  if (!call) return;
  clearTimeout(call.timer);
  calls.delete(callId);
  const caller = io.sockets.sockets.get(call.callerSid);
  if (caller) {
    caller.data.calling = null;
    caller.emit('call-ended', { reason, ...friends.contactInfo(call.callerUid, call.calleeUid) });
  }
  notifyUser(call.calleeUid, 'call-closed', { callId, reason });
}

function cancelOutgoingCall(socket) {
  if (socket.data.calling) endCall(socket.data.calling, 'cancelled');
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
// Le piden verificar la edad: sale del chat hasta que se verifique
age.setOnRequire((userId) => {
  for (const s of io.of('/').sockets.values()) {
    if (s.data.uid !== userId) continue;
    s.emit('age-required');
    s.disconnect(true);
  }
});
privacy.setOnDeleted((userId) => kick(userId, { type: 'deleted' }));

io.use((socket, next) => {
  const user = auth.userFromToken(socket.handshake.auth?.token);
  if (!user) return next(new Error('auth'));
  const restriction = auth.restriction(user);
  if (restriction) {
    const err = new Error('restricted');
    err.data = restriction;
    return next(err);
  }
  if (auth.needsEmail(user)) return next(new Error('email'));
  if (age.needsVerification(user)) return next(new Error('age'));
  socket.data.uid = user.id;
  socket.data.gender = user.gender;
  socket.data.premium = payments.isPremium(user.id);
  socket.data.blocked = new Set(user.blocked || []);
  socket.data.filters = NO_FILTERS;
  socket.data.age = auth.ageFrom(user.birthDate);
  // IP real (detrás del proxy HTTPS) → país y zona aproximados, solo en memoria
  socket.data.geo = geo.lookup(proxyAddr(socket.request, app.get('trust proxy fn')));
  const lang = String(socket.handshake.auth?.lang || '').toLowerCase();
  socket.data.lang = LANG_RE.test(lang) ? lang : 'en';
  next();
});

io.on('connection', (socket) => {
  socket.emit('account', { premium: socket.data.premium, country: socket.data.geo?.country || '', geo: geo.available() });
  const uid = socket.data.uid;
  if (!userSockets.has(uid)) userSockets.set(uid, new Set());
  userSockets.get(uid).add(socket.id);
  presenceChanged(uid);

  socket.on('find', (opts = {}) => {
    // Los filtros solo se aplican a usuarios Premium; el resto, siempre al azar
    const want = Array.isArray(opts.want) ? opts.want.filter((g) => auth.GENDERS.includes(g)) : [];
    const scope = SCOPES.includes(opts.scope) && socket.data.geo ? opts.scope : 'all';
    const age = AGE_RANGES[opts.age] ? opts.age : null;
    socket.data.filters = socket.data.premium ? { want, scope, age } : NO_FILTERS;
    cancelOutgoingCall(socket);
    unpair(socket);
    findMatch(socket);
  });

  socket.on('stop', () => {
    cancelOutgoingCall(socket);
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

  // Intento de captura de pantalla detectado en el navegador (Imprimir pantalla,
  // Cmd+Shift+3/4/5…): se apunta en la cuenta y se avisa a la otra persona
  socket.on('capture-attempt', () => {
    const now = Date.now();
    if (now - (socket.data.lastCapture || 0) < 5000) return;
    socket.data.lastCapture = now;
    const user = store.getUser(socket.data.uid);
    if (user) store.updateUser(user.id, { captureAttempts: (user.captureAttempts || 0) + 1, lastCaptureAt: now });
    const partnerId = partners.get(socket.id);
    if (partnerId) io.to(partnerId).emit('partner-capture');
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

  // ---- Amigos ----
  // Solicitud de amistad a la persona con la que estás hablando
  socket.on('friend-request', (_data, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {};
    const partner = io.sockets.sockets.get(partners.get(socket.id));
    if (!partner) return reply({ code: 'noPartner' });
    reply(friends.request(socket.data.uid, partner.data.uid));
  });

  socket.on('friend-accept', (_data, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {};
    const partner = io.sockets.sockets.get(partners.get(socket.id));
    if (!partner) return reply({ code: 'noPartner' });
    reply(friends.accept(socket.data.uid, partner.data.uid));
  });

  // Llamar a un amigo que está en línea
  socket.on('call', ({ handle } = {}, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {};
    const other = friends.resolve(uid, handle);
    if (!other || !friends.areFriends(uid, other)) return reply({ code: 'contact' });
    if (!payments.isPremium(uid)) return reply({ code: 'premium' });
    const status = presence(other);
    if (status !== 'online') return reply({ code: status === 'busy' ? 'callBusy' : 'callOffline' });
    if ([...calls.values()].some((c) => c.calleeUid === other)) return reply({ code: 'callBusy' });
    cancelOutgoingCall(socket);
    removeFromQueue(socket.id);
    unpair(socket);
    const callId = store.newId('c');
    calls.set(callId, { callerSid: socket.id, callerUid: uid, calleeUid: other, timer: setTimeout(() => endCall(callId, 'timeout'), CALL_TIMEOUT) });
    socket.data.calling = callId;
    notifyUser(other, 'incoming-call', { callId, ...friends.contactInfo(other, uid) });
    reply({ ok: true, callId });
  });

  socket.on('call-cancel', () => cancelOutgoingCall(socket));

  socket.on('call-answer', ({ callId, accept } = {}, ack) => {
    const reply = typeof ack === 'function' ? ack : () => {};
    const call = calls.get(callId);
    if (!call || call.calleeUid !== uid) return reply({ code: 'callGone' });
    if (!accept) { endCall(callId, 'declined'); return reply({ ok: true }); }
    const caller = io.sockets.sockets.get(call.callerSid);
    if (!caller || partners.has(caller.id) || !friends.areFriends(uid, call.callerUid)) {
      endCall(callId, 'cancelled');
      return reply({ code: 'callGone' });
    }
    clearTimeout(call.timer);
    calls.delete(callId);
    caller.data.calling = null;
    notifyUser(uid, 'call-closed', { callId, reason: 'answered' });
    removeFromQueue(socket.id);
    removeFromQueue(caller.id);
    unpair(socket);
    pair(caller, socket, { call: true });
    reply({ ok: true });
  });

  socket.on('disconnect', () => {
    cancelOutgoingCall(socket);
    // Si era su última pestaña abierta, las llamadas que recibía se cancelan
    if (userSockets.get(uid)?.size === 1) {
      for (const [callId, c] of calls) if (c.calleeUid === uid) endCall(callId, 'cancelled');
    }
    removeFromQueue(socket.id);
    unpair(socket);
    lastPartner.delete(socket.id);
    const set = userSockets.get(uid);
    set?.delete(socket.id);
    if (set && !set.size) userSockets.delete(uid);
    presenceChanged(uid);
  });
});

require('./backup').schedule();

server.listen(PORT, () => {
  console.log(`La Ruleta Caliente escuchando en http://localhost:${PORT}`);
});
