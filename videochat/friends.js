// Historial de chats y amigos.
//
// - Historial: las personas con las que has hablado en los últimos 30 días
//   (como máximo 100). Solo lo ve su dueño. No se guarda ninguna imagen.
// - Amigos: solicitud → aceptar o rechazar. Los amigos ven si el otro está en
//   línea y pueden llamarse (la llamada la gestiona server.js).
// - A cada persona se la nombra con un "handle": un código distinto para cada
//   quien lo mira, así no se exponen los ids internos ni se puede rastrear a
//   alguien entre cuentas.
// - Rechazar o bloquear no se le notifica a la otra persona.
// - Es una función Premium: sin plan activo solo se pueden aceptar o rechazar
//   las solicitudes que llegan (y contestar llamadas de amigos Premium). Ver el
//   historial, la lista de amigos, quién está en línea, enviar solicitudes y
//   llamar requieren Premium. El historial se guarda igualmente (30 días), así
//   al hacerse Premium ya aparece.

const store = require('./store');
const { mac } = require('./tokens');
const { requireUser } = require('./auth');
const { isPremium } = require('./payments');

const DAY = 24 * 3600 * 1000;
const HISTORY_DAYS = 30;
const MAX_FRIENDS = 300;
const MAX_REQUESTS_PER_DAY = 30;
const NICK_RE = /^[\p{L}\p{N}][\p{L}\p{N} ._-]{1,19}$/u;

// Lo rellena server.js: estado de conexión y avisos en tiempo real
let presence = () => 'offline';     // uid -> 'offline' | 'online' | 'busy'
let notify = () => {};              // (uid, evento, datos)
let onBlock = () => {};             // (uid, bloqueadoUid)
let onRequest = () => {};           // (para, de): aviso al móvil si no está conectado

const handle = (viewer, other) => mac(`contact:${viewer}:${other}`);

function blockedEither(x, y) {
  const ux = store.getUser(x);
  const uy = store.getUser(y);
  if (!ux || !uy) return true;
  return (ux.blocked || []).includes(y) || (uy.blocked || []).includes(x);
}

// Cómo ve "viewer" a "other"
function contactInfo(viewer, other) {
  const u = store.getUser(other);
  if (!u) return null;
  return { handle: handle(viewer, other), name: u.nick || '', gender: u.gender, lang: u.lang || '' };
}

// Relación de viewer con other: friend | sent | received | none
function relation(viewer, other) {
  const f = store.getFriendship(viewer, other);
  if (!f) return 'none';
  if (f.status === 'accepted') return 'friend';
  if (f.status === 'pending') return f.requester === viewer ? 'sent' : 'received';
  return f.requester === viewer ? 'sent' : 'none'; // rechazada: quien la envió no se entera
}

// Busca a quién corresponde un handle entre los contactos de viewer
function resolve(viewer, h) {
  if (typeof h !== 'string' || !h) return null;
  for (const r of store.listHistory(viewer)) if (handle(viewer, r.partner) === h) return r.partner;
  for (const f of store.listFriendships(viewer)) {
    const other = f.a === viewer ? f.b : f.a;
    if (handle(viewer, other) === h) return other;
  }
  return null;
}

// ---- Solicitudes de amistad ----
const sentToday = new Map(); // uid -> { day, n }
function underDailyLimit(uid) {
  const day = Math.floor(Date.now() / DAY);
  const e = sentToday.get(uid);
  if (!e || e.day !== day) { sentToday.set(uid, { day, n: 1 }); return true; }
  if (e.n >= MAX_REQUESTS_PER_DAY) return false;
  e.n += 1;
  return true;
}
const friendCount = (uid) => store.listFriendships(uid).filter((f) => f.status === 'accepted').length;

function request(from, to) {
  if (from === to) return { code: 'contact' };
  if (blockedEither(from, to)) return { relation: 'sent' }; // no se revela el bloqueo
  const f = store.getFriendship(from, to);
  if (f?.status === 'accepted') return { relation: 'friend' };
  if (f?.status === 'pending' && f.requester === to) return accept(from, to);
  if (f && f.requester === from) return { relation: 'sent' }; // pendiente o rechazada
  if (!isPremium(from)) return { code: 'premium' };
  if (friendCount(from) >= MAX_FRIENDS || !underDailyLimit(from)) return { code: 'friendLimit' };
  store.setFriendship(from, to, 'pending', from);
  notify(to, 'friend-request', contactInfo(to, from));
  onRequest(to, from);
  return { relation: 'sent' };
}

function accept(uid, other) {
  const f = store.getFriendship(uid, other);
  if (!f || f.status !== 'pending' || f.requester !== other) return { code: 'contact' };
  if (friendCount(uid) >= MAX_FRIENDS) return { code: 'friendLimit' };
  store.setFriendship(uid, other, 'accepted', other);
  notify(other, 'friend-accepted', { ...contactInfo(other, uid), status: presence(uid) });
  notify(uid, 'friend-accepted', { ...contactInfo(uid, other), status: presence(other), silent: true });
  return { relation: 'friend' };
}

function decline(uid, other) {
  const f = store.getFriendship(uid, other);
  if (f?.status === 'pending' && f.requester === other) store.setFriendship(uid, other, 'declined', other);
  return { relation: 'none' };
}

function remove(uid, other) {
  const f = store.getFriendship(uid, other);
  if (f) store.deleteFriendship(uid, other);
  if (f?.status === 'accepted') notify(other, 'friend-removed', { handle: handle(other, uid), silent: true });
  return { relation: 'none' };
}

function block(uid, other) {
  const user = store.getUser(uid);
  if (!user) return { code: 'contact' };
  const blocked = new Set(user.blocked || []);
  blocked.add(other);
  store.updateUser(uid, { blocked: [...blocked].slice(-500) });
  remove(uid, other);
  store.removeHistory(uid, other);
  onBlock(uid, other);
  return { ok: true };
}

const areFriends = (x, y) => store.getFriendship(x, y)?.status === 'accepted' && !blockedEither(x, y);

function friendIds(uid) {
  return store.listFriendships(uid).filter((f) => f.status === 'accepted').map((f) => (f.a === uid ? f.b : f.a));
}

// ---- Historial ----
function meet(x, y, at) {
  store.historyMeet(x, y, at);
  store.historyMeet(y, x, at);
}
function meetEnded(x, y, at) {
  const secs = Math.round((Date.now() - at) / 1000);
  store.historyEnd(x, y, at, secs);
  store.historyEnd(y, x, at, secs);
}

function contacts(uid) {
  if (!isPremium(uid)) {
    // Sin Premium: solo las solicitudes recibidas y cuántos contactos tendría
    const all = fullContacts(uid);
    return { locked: true, friends: [], history: [], requests: all.requests, counts: { friends: all.friends.length, history: all.history.length } };
  }
  return fullContacts(uid);
}

function fullContacts(uid) {
  const user = store.getUser(uid);
  const blocked = new Set(user?.blocked || []);
  const friends = [];
  const requests = [];
  for (const f of store.listFriendships(uid)) {
    const other = f.a === uid ? f.b : f.a;
    if (blocked.has(other)) continue;
    const info = contactInfo(uid, other);
    if (!info) continue;
    if (f.status === 'accepted') friends.push({ ...info, status: presence(other), since: f.updatedAt });
    else if (f.status === 'pending' && f.requester === other) requests.push({ ...info, at: f.updatedAt });
  }
  const order = { online: 0, busy: 1, offline: 2 };
  friends.sort((p, q) => order[p.status] - order[q.status] || (p.name || '').localeCompare(q.name || ''));
  const history = [];
  for (const h of store.listHistory(uid)) {
    if (blocked.has(h.partner)) continue;
    const info = contactInfo(uid, h.partner);
    if (info) history.push({ ...info, lastAt: h.lastAt, duration: h.duration, times: h.times, relation: relation(uid, h.partner) });
  }
  return { friends, requests, history };
}

// ---- Limpieza diaria ----
function prune() {
  const cut = Date.now() - HISTORY_DAYS * DAY;
  const n = store.pruneHistory(cut) + store.pruneFriendRequests(cut);
  if (n) console.log(`[contactos] limpieza: ${n} entradas antiguas borradas`);
}
prune();
setInterval(prune, DAY).unref();

function routes(app) {
  app.get('/api/contacts', requireUser, (req, res) => res.json(contacts(req.user.id)));

  const action = (path, fn) => app.post(path, requireUser, (req, res) => {
    const other = resolve(req.user.id, req.body?.handle);
    if (!other) return res.status(404).json({ code: 'contact' });
    const result = fn(req.user.id, other);
    res.status(result.code ? 400 : 200).json(result);
  });
  action('/api/friends/request', request);
  action('/api/friends/accept', accept);
  action('/api/friends/decline', decline);
  action('/api/friends/remove', remove);
  action('/api/contacts/block', block);
  action('/api/history/remove', (uid, other) => { store.removeHistory(uid, other); return { ok: true }; });
  app.post('/api/history/clear', requireUser, (req, res) => { store.clearHistory(req.user.id); res.json({ ok: true }); });

  // Nombre que ven los demás (vacío = sin nombre)
  app.post('/api/me/nick', requireUser, (req, res) => {
    const nick = String(req.body?.nick || '').trim().replace(/\s+/g, ' ');
    if (nick && !NICK_RE.test(nick)) return res.status(400).json({ code: 'nick' });
    store.updateUser(req.user.id, { nick });
    res.json({ ok: true, nick });
  });
}

module.exports = {
  routes,
  handle,
  resolve,
  relation,
  contactInfo,
  request,
  accept,
  decline,
  areFriends,
  friendIds,
  isPremium,
  meet,
  meetEnded,
  contacts,
  setHooks: (h) => { ({ presence = presence, notify = notify, onBlock = onBlock, onRequest = onRequest } = h); },
};
