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
const support = require('./support');
const account = require('./account');
const push = require('./push');
const stats = require('./stats');
const adminauth = require('./adminauth');
const adminapi = require('./adminapi');
const sitelock = require('./sitelock');

const PORT = process.env.PORT || 3000;

const app = express();
// Solo se fía de la cabecera X-Forwarded-For si llega desde la propia máquina o
// la red interna (el proxy HTTPS); así nadie puede falsear su IP desde fuera.
app.set('trust proxy', process.env.TRUST_PROXY || 'loopback, linklocal, uniquelocal');
app.disable('x-powered-by');
// Etiqueta RTA también como cabecera, para filtros parentales que no leen el HTML
app.use((req, res, next) => { res.setHeader('Rating', 'RTA-5042-1996-1400-1577-RTA'); next(); });
app.use(privacy.securityHeaders);
// Web cerrada con contraseña mientras no esté abierta al público (SITE_PASSWORD)
app.use(sitelock.middleware);
const keepRaw = (req, _res, buf) => { req.rawBody = buf; };
const jsonSmall = express.json({ limit: '50kb', verify: keepRaw });
const jsonUpload = express.json({ limit: '700kb' }); // imágenes de banners subidas desde el panel
app.use((req, res, next) => (req.path === '/api/admin/ads/banners' ? jsonUpload : jsonSmall)(req, res, next));
// El service worker no se guarda en caché para que las actualizaciones lleguen enseguida
app.get('/sw.js', (_req, res, next) => { res.set('Cache-Control', 'no-cache'); next(); });
// Páginas por idioma (/es/ayuda, /en/help…), sitemap y robots.txt
require('./seo').register(app);
require('./indexnow').register(app, require('./seo').allUrls);
require('./ads').routes(app, { requireAdmin: adminauth.requireAdmin, audit: adminauth.audit });
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
support.routes(app);
account.routes(app);
push.routes(app);
adminauth.routes(app);
adminapi.routes(app);
require('./report').start(adminapi.overview);

// Qué funciones opcionales están activas
app.get('/api/config', (_req, res) => res.json({ translate: translate.enabled, turnstile: captcha.SITE_KEY || null, providers: oauth.enabled, trialDays: gifts.TRIAL_DAYS, tips: tips.ENABLED, guests: auth.GUESTS }));

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

// ---------- Guindillas y superpoderes ----------
app.get('/api/game', auth.requireUser, (req, res) => res.json(rewards.summary(req.user.id)));
app.get('/api/ranking', auth.requireUser, (req, res) => res.json({ ...rewards.ranking(req.user.id), prizes: gifts.RANK_PRIZES }));
// 🤝 Invita a un amigo: tu enlace y cuántas invitaciones te han dado Premium
app.get('/api/invite', auth.requireUser, (req, res) => res.json(gifts.inviteInfo(req.user.id, auth.baseUrl(req))));
app.post('/api/invite/claim', auth.requireUser, (req, res) => {
  const r = gifts.claim(req.user, String(req.body?.code || '').slice(0, 20));
  res.status(r.ok ? 200 : 400).json(r);
});
app.post('/api/powers/:power', auth.requireUser, (req, res) => {
  const uid = req.user.id;
  const now = Date.now();
  const power = req.params.power;
  if (power === 'flame') {
    if ((req.user.boostUntil || 0) > now) return res.status(409).json({ code: 'active' });
    const paid = rewards.spend(uid, 'flame');
    if (!paid.ok) return res.status(402).json(paid);
    store.updateUser(uid, { boostUntil: now + 15 * 60 * 1000 });
  } else if (power === 'incognito') {
    if (req.body?.on === false) store.updateUser(uid, { incognitoUntil: null });
    else {
      const paid = rewards.spend(uid, 'incognito');
      if (!paid.ok) return res.status(402).json(paid);
      store.updateUser(uid, { incognitoUntil: Math.max(now, req.user.incognitoUntil || 0) + 3600 * 1000 });
    }
  } else if (power === 'super') {
    const text = String(req.body?.text || '').replace(/\s+/g, ' ').trim().slice(0, 140);
    if (text && !rewards.canSpend(uid, 'super')) return res.status(402).json({ code: 'points', need: rewards.PRICES.super });
    store.updateUser(uid, { superMsg: text });
  } else if (power === 'second') {
    const paid = rewards.spend(uid, 'second');
    if (!paid.ok) return res.status(402).json(paid);
    const seen = new Set();
    const people = (store.getUser(uid).lovedBy || []).filter((l) => l.at > now - 24 * 3600 * 1000).reverse()
      .filter((l) => !seen.has(l.uid) && seen.add(l.uid))
      .map((l) => ({ ...friends.contactInfo(uid, l.uid), at: l.at }))
      .filter((c) => c.handle);
    return res.json({ ok: true, people, game: rewards.summary(uid) });
  } else return res.status(404).json({ code: 'invalid' });
  res.json({ ok: true, game: rewards.summary(uid) });
});

// Página 404 para direcciones que no existen
// 🪙 Propinas en la llamada y retirada de lo ganado (tips.js; apagado salvo TIPS=on)
const tips = require('./tips')({ notify: (uid, ev, data) => notifyUser(uid, ev, data) });
tips.routes(app, { requireAdmin: adminauth.requireAdmin, audit: adminauth.audit, baseUrl: process.env.BASE_URL });

app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ code: 'notFound' });
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

const server = http.createServer(app);
const io = new Server(server, { allowRequest: (req, done) => done(null, sitelock.allowed(req)) });

// Cola de espera y emparejamientos activos
let queue = [];               // ids de socket esperando pareja
const partners = new Map();   // socketId -> socketId de su pareja
const lastPartner = new Map();// evita volver a emparejar con el anterior al instante
const chatLogs = new Map();   // socketId -> últimos mensajes de la conversación actual
const reacted = new Map();    // socketId -> reacciones ya contadas en la conversación actual
const meetings = new Map();   // socketId -> { x, y, at } de la conversación actual (para el historial)
const rewinds = new Map();    // socketId invitado a ↩️ Rebobinar -> { from, at }
const REACTIONS = ['like', 'love'];
const LANG_RE = /^[a-z]{2,3}$/;
// Juegos, piropos y «¿Volverías a hablar?» (play.js)
const rewards = require('./rewards')({ store, payments, notify: (uid, ev, data) => notifyUser(uid, ev, data) });

// 🔥 Hora caliente: se avisa a todo el mundo conectado cuando empieza y cuando acaba
let hotWas = rewards.hotHour().active;
setInterval(() => {
  const hot = rewards.hotHour();
  if (hot.active !== hotWas) { hotWas = hot.active; io.emit('hot-hour', hot); }
}, 30 * 1000).unref();
const play = require('./play')({ io, partners, store, payments, rewards });
// 🎁 Premium de regalo: prueba opcional, invitaciones y premios del ranking (gifts.js)
const gifts = require('./gifts')({
  store, payments, rewards,
  notify: (uid, ev, data) => notifyUser(uid, ev, data),
  online: (uid) => (userSockets.get(uid)?.size || 0) > 0,
  onPremium: (uid) => refreshPremium(uid),
});
auth.onSignup((user) => gifts.welcome(user));
// Premios del ranking: se comprueba al arrancar y cada hora (el lunes se reparten una vez)
setTimeout(() => gifts.weeklyPrizes(), 5000).unref();
setInterval(() => gifts.weeklyPrizes(), 3600 * 1000).unref();
const MIN_CONV_MS = 60 * 1000; // conversaciones que cuentan para guindillas, insignias y retos

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
  if (meet) { friends.meetEnded(meet.x, meet.y, meet.at); stats.conversation((Date.now() - meet.at) / 1000); }
  play.ended(socket.id, partnerId, meet);
  const mate = io.sockets.sockets.get(partnerId);
  if (meet && mate && Date.now() - meet.at >= MIN_CONV_MS) {
    for (const [a, b] of [[socket, mate], [mate, socket]]) {
      rewards.count(a.data.uid, 'convs');
      rewards.award(a.data.uid, 1, 'conversation');
      gifts.conversation(a.data.uid);
      if (!isIncognito(b.data.uid)) rewards.count(a.data.uid, 'countries', b.data.geo?.country);
    }
  }
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
  const ok = (id) => {
    const other = io.sockets.sockets.get(id);
    return other && id !== avoid && compatible(socket, other);
  };
  // Primero quien tiene la 🔥 Llama caliente activa, después quien no tiene muchas respuestas
  // «no volvería a hablar» y, si no hay, cualquiera
  const uidOf = (id) => io.sockets.sockets.get(id).data.uid;
  const boosted = (id) => (store.getUser(uidOf(id))?.boostUntil || 0) > Date.now();
  let idx = queue.findIndex((id) => ok(id) && boosted(id) && !play.lowRated(uidOf(id)));
  if (idx === -1) idx = queue.findIndex((id) => ok(id) && !play.lowRated(uidOf(id)));
  if (idx === -1) idx = queue.findIndex(ok);
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
  play.paired(socket, partner);
  meetings.set(partnerId, meet);
  friends.meet(meet.x, meet.y, meet.at);
  socket.emit('matched', { initiator: true, call, ...partnerInfo(socket, partner) });
  partner.emit('matched', { initiator: false, call, ...partnerInfo(partner, socket) });
  // 💌 Supersaludo preparado: la otra persona lo ve nada más conectar
  for (const [from, to] of [[socket, partner], [partner, socket]]) {
    const text = store.getUser(from.data.uid)?.superMsg;
    if (!text) continue;
    const paid = rewards.spend(from.data.uid, 'super');
    store.updateUser(from.data.uid, { superMsg: '' });
    if (paid.ok) { to.emit('super-msg', { text }); from.emit('super-sent'); } else from.emit('super-off', paid);
  }
  presenceChanged(meet.x);
  presenceChanged(meet.y);
}

// Lo que se enseña de la otra persona: su nombre, qué es, su idioma, sus likes
// y si ya sois amigos
function isIncognito(uid) { return (store.getUser(uid)?.incognitoUntil || 0) > Date.now(); }
function partnerInfo(viewer, s) {
  const user = store.getUser(s.data.uid) || {};
  const hidden = isIncognito(s.data.uid); // 🕶️ Incógnito: sin edad ni país
  return {
    gender: s.data.gender,
    lang: s.data.lang,
    likes: auth.likesOf(user),
    name: user.nick || '',
    handle: friends.handle(viewer.data.uid, s.data.uid),
    relation: friends.relation(viewer.data.uid, s.data.uid),
    country: hidden ? '' : s.data.geo?.country || '',
    age: hidden ? null : s.data.age ?? null,
    incognito: hidden,
    badges: rewards.badgesOf(user),
    ...play.info(s),
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

// Cuando alguien pasa a ser Premium sin pagar (regalo), sus pestañas abiertas se enteran al momento
function refreshPremium(uid) {
  for (const id of userSockets.get(uid) || []) {
    const s = io.sockets.sockets.get(id);
    if (!s) continue;
    s.data.premium = payments.isPremium(uid);
    s.emit('account', { premium: s.data.premium, country: s.data.geo?.country || '', geo: geo.available() });
  }
}

function notifyUser(uid, event, data) {
  for (const id of userSockets.get(uid) || []) io.to(id).emit(event, data);
}

// Avisa a los amigos conectados cuando alguien entra, sale o empieza/acaba una videollamada
function presenceChanged(uid) {
  const status = presence(uid);
  const before = lastStatus.get(uid);
  if (before === status) return;
  // Se acaba de conectar: aviso al móvil a los amigos Premium que no están en la web
  if (!before && status === 'online') {
    for (const f of friends.friendIds(uid)) if (!userSockets.has(f) && payments.isPremium(f)) push.notifyOnline(f, uid);
  }
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

// Avisos al móvil de solicitudes de amistad si no está en la web
friends.setHooks({ onRequest: (to, from) => { if (!userSockets.has(to)) push.notify(to, 'request', from); } });
// Al desbloquear, vuelven a poder coincidir
account.setHooks({
  onUnblock(uid, other) {
    for (const id of userSockets.get(uid) || []) io.sockets.sockets.get(id)?.data.blocked.delete(other);
  },
});
support.setHooks({ alertAdmin: moderation.alertAdmin });
// Gente conectada ahora y en una videollamada (para el panel y las estadísticas)
adminapi.setLive(() => ({ connected: userSockets.size, inChat: partners.size / 2 }));
setInterval(() => stats.online(userSockets.size, partners.size / 2), 60000).unref();

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
  stats.activeUser(uid);
  if (!userSockets.has(uid)) userSockets.set(uid, new Set());
  userSockets.get(uid).add(socket.id);
  presenceChanged(uid);
  play.bind(socket);
  rewards.dailyLogin(uid);
  gifts.deliver(uid);

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
    play.heat(socket, 'msg');
  });

  // 🪙 Propina a la persona con la que se está hablando
  socket.on('tip', (amount, ack) => {
    const done = typeof ack === 'function' ? ack : () => {};
    const partnerId = partners.get(socket.id);
    const partner = partnerId && io.sockets.sockets.get(partnerId);
    if (!partner?.data.uid) return done({ code: 'tipInvalid' });
    const now = Date.now();
    if (now - (socket.data.lastTip || 0) < 1500) return done({ code: 'tipSlow' });
    socket.data.lastTip = now;
    const r = tips.tip(socket.data.uid, partner.data.uid, amount);
    if (r.ok) {
      partner.emit('tip', { coins: r.coins, net: r.net });
      play.heat(socket, 'love');
    }
    done(r);
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
      const fields = { likes };
      // ❤️ queda apuntado 24 h para 👀 Segunda oportunidad
      if (type === 'love') {
        const lovedBy = (store.getUser(partner.data.uid)?.lovedBy || []).filter((l) => l.at > Date.now() - 24 * 3600 * 1000 && l.uid !== socket.data.uid);
        fields.lovedBy = [...lovedBy, { uid: socket.data.uid, at: Date.now() }].slice(-30);
      }
      store.updateUser(partner.data.uid, fields);
      rewards.count(partner.data.uid, 'likes');
      rewards.award(partner.data.uid, 1, 'like');
      play.heat(socket, type === 'love' ? 'love' : 'like');
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
    if (status === 'busy') return reply({ code: 'callBusy' });
    // No está en la web: si tiene los avisos activados, le llega «X quiere hablar contigo»
    if (status !== 'online') return reply({ code: push.notify(other, 'call', uid) ? 'callOfflineNotified' : 'callOffline' });
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

  // ↩️ Rebobinar: volver a intentar con la persona anterior, si acepta
  socket.on('power:rewind', (_d, ack = () => {}) => {
    if (typeof ack !== 'function') return;
    const last = play.lastMetOf(socket.id);
    if (!last) return ack({ code: 'nobody' });
    if (!rewards.canSpend(uid, 'rewind')) return ack({ code: 'points', need: rewards.PRICES.rewind });
    const target = [...(userSockets.get(last.uid) || [])].map((id) => io.sockets.sockets.get(id))
      .find((t) => t && !partners.has(t.id) && !t.data.calling && compatible(socket, t));
    if (!target) return ack({ code: 'unavailable' });
    rewinds.set(target.id, { from: socket.id, at: Date.now() });
    const me = store.getUser(uid) || {};
    target.emit('rewind-request', { name: me.nick || '', gender: socket.data.gender });
    ack({ ok: true });
  });
  socket.on('rewind-reply', ({ accept } = {}) => {
    const r = rewinds.get(socket.id);
    rewinds.delete(socket.id);
    const from = r && Date.now() - r.at < 20000 && io.sockets.sockets.get(r.from);
    if (!from) return;
    if (!accept || partners.has(socket.id)) { from.emit('rewind-result', { code: 'declined' }); return; }
    const paid = rewards.spend(from.data.uid, 'rewind');
    if (!paid.ok) { from.emit('rewind-result', paid); return; }
    // Si quien rebobina ya estaba hablando con otra persona, esa conversación termina
    if (partners.has(from.id)) { cancelOutgoingCall(from); unpair(from); }
    removeFromQueue(socket.id); removeFromQueue(from.id);
    lastPartner.delete(socket.id); lastPartner.delete(from.id);
    pair(from, socket);
    from.emit('rewind-result', { ok: true });
  });

  socket.on('disconnect', () => {
    rewinds.delete(socket.id);
    cancelOutgoingCall(socket);
    // Si era su última pestaña abierta, las llamadas que recibía se cancelan
    if (userSockets.get(uid)?.size === 1) {
      for (const [callId, c] of calls) if (c.calleeUid === uid) endCall(callId, 'cancelled');
    }
    removeFromQueue(socket.id);
    unpair(socket);
    play.forget(socket.id);
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
