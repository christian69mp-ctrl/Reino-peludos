// Almacén de usuarios, pedidos Premium y denuncias en una base de datos SQLite
// (incluida en Node.js, sin instalar nada).
//
// - Fichero: DB_FILE, o data/la-ruleta.db por defecto.
// - Los datos se cargan en memoria al arrancar (lecturas instantáneas) y cada
//   cambio se escribe al momento en la base de datos.
// - Si existe el antiguo data/store.json, se importa automáticamente la primera vez.
// Para muchos miles de usuarios simultáneos convendría pasar a PostgreSQL.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DatabaseSync } = require('node:sqlite');

const LEGACY_JSON = process.env.DATA_FILE || path.join(__dirname, 'data', 'store.json');
const DB_FILE = process.env.DB_FILE
  || (process.env.DATA_FILE ? process.env.DATA_FILE.replace(/\.json$/, '') + '.db' : path.join(__dirname, 'data', 'la-ruleta.db'));

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
const db = new DatabaseSync(DB_FILE);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  CREATE TABLE IF NOT EXISTS users     (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS orders    (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS reports   (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  -- Mensajes de contacto, avisos de contenido ilegal (DSA) y recursos de sanciones
  CREATE TABLE IF NOT EXISTS tickets   (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  -- Cobros, renovaciones, reembolsos y contracargos (para los ingresos del panel)
  CREATE TABLE IF NOT EXISTS ledger    (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  -- Estadísticas por día (id = AAAA-MM-DD), sin datos personales
  CREATE TABLE IF NOT EXISTS stats     (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  -- Ajustes del sitio (anuncio general, seguridad del panel…)
  CREATE TABLE IF NOT EXISTS settings  (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  -- Suscripciones a notificaciones del navegador
  CREATE TABLE IF NOT EXISTS pushsubs  (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS adbanners (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS purchases (purchase_id TEXT PRIMARY KEY, order_id TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS banned_emails (hash TEXT PRIMARY KEY);
  -- Historial: una fila por persona con la que se ha hablado (la última vez)
  CREATE TABLE IF NOT EXISTS history (
    owner TEXT NOT NULL, partner TEXT NOT NULL,
    first_at INTEGER NOT NULL, last_at INTEGER NOT NULL,
    duration INTEGER NOT NULL DEFAULT 0, times INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (owner, partner)
  );
  CREATE INDEX IF NOT EXISTS history_owner ON history (owner, last_at);
  CREATE INDEX IF NOT EXISTS history_partner ON history (partner);
  -- Amistades: a < b; status pending / accepted / declined
  CREATE TABLE IF NOT EXISTS friends (
    a TEXT NOT NULL, b TEXT NOT NULL, status TEXT NOT NULL, requester TEXT NOT NULL,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
    PRIMARY KEY (a, b)
  );
  CREATE INDEX IF NOT EXISTS friends_b ON friends (b);
`);

const TABLES = ['users', 'orders', 'reports', 'tickets', 'ledger', 'stats', 'settings', 'pushsubs', 'adbanners'];
const put = Object.fromEntries(TABLES.map((t) => [t, db.prepare(`INSERT INTO ${t} (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data`)]));
const del = Object.fromEntries(TABLES.map((t) => [t, db.prepare(`DELETE FROM ${t} WHERE id = ?`)]));
const putPurchase = db.prepare('INSERT OR REPLACE INTO purchases (purchase_id, order_id) VALUES (?, ?)');
const putBanned = db.prepare('INSERT OR IGNORE INTO banned_emails (hash) VALUES (?)');

// ---- Carga en memoria ----
const data = { users: {}, orders: {}, reports: {}, purchases: {}, emails: {}, bannedEmails: new Set() };
for (const t of TABLES) data[t] ||= {};
for (const t of TABLES) {
  for (const row of db.prepare(`SELECT id, data FROM ${t}`).all()) data[t][row.id] = JSON.parse(row.data);
}
for (const row of db.prepare('SELECT purchase_id, order_id FROM purchases').all()) data.purchases[row.purchase_id] = row.order_id;
for (const row of db.prepare('SELECT hash FROM banned_emails').all()) data.bannedEmails.add(row.hash);

// ---- Importar el antiguo store.json (solo si la base de datos está vacía) ----
const empty = TABLES.every((t) => Object.keys(data[t]).length === 0);
if (empty && fs.existsSync(LEGACY_JSON)) {
  try {
    const old = JSON.parse(fs.readFileSync(LEGACY_JSON, 'utf8'));
    db.exec('BEGIN');
    for (const t of TABLES) {
      for (const [id, obj] of Object.entries(old[t] || {})) { data[t][id] = obj; put[t].run(id, JSON.stringify(obj)); }
    }
    for (const [p, o] of Object.entries(old.purchases || {})) { data.purchases[p] = o; putPurchase.run(p, o); }
    for (const h of old.bannedEmails || []) { data.bannedEmails.add(h); putBanned.run(h); }
    db.exec('COMMIT');
    fs.renameSync(LEGACY_JSON, `${LEGACY_JSON}.importado`);
    console.log(`[datos] importado ${LEGACY_JSON} a la base de datos SQLite`);
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch { /* nada que deshacer */ }
    console.error('[datos] no se pudo importar el JSON antiguo:', err.message);
  }
}
// Los pedidos antiguos no guardaban su id dentro
for (const t of TABLES) for (const [id, obj] of Object.entries(data[t])) obj.id ||= id;
for (const u of Object.values(data.users)) data.emails[u.email] = u.id;

// ---- Escritura ----
function write(table, obj) { put[table].run(obj.id, JSON.stringify(obj)); }

// Guarda todo (tras cambios hechos directamente sobre los objetos, p. ej. la limpieza diaria)
function save() {
  db.exec('BEGIN');
  try {
    for (const t of TABLES) for (const obj of Object.values(data[t])) write(t, obj);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

// ---- Historial y amigos (consultas directas a la base de datos) ----
const HISTORY_KEEP = 100; // máximo por persona
const sql = {
  histMeet: db.prepare(`INSERT INTO history (owner, partner, first_at, last_at) VALUES (?, ?, ?, ?)
    ON CONFLICT(owner, partner) DO UPDATE SET last_at = excluded.last_at, duration = 0, times = times + 1`),
  histEnd: db.prepare('UPDATE history SET duration = ? WHERE owner = ? AND partner = ? AND last_at = ?'),
  histList: db.prepare('SELECT partner, first_at, last_at, duration, times FROM history WHERE owner = ? ORDER BY last_at DESC LIMIT ?'),
  histTrim: db.prepare(`DELETE FROM history WHERE owner = ? AND partner NOT IN
    (SELECT partner FROM history WHERE owner = ? ORDER BY last_at DESC LIMIT ${HISTORY_KEEP})`),
  histDel: db.prepare('DELETE FROM history WHERE owner = ? AND partner = ?'),
  histClear: db.prepare('DELETE FROM history WHERE owner = ?'),
  histPrune: db.prepare('DELETE FROM history WHERE last_at < ?'),
  histUser: db.prepare('DELETE FROM history WHERE owner = ? OR partner = ?'),
  frGet: db.prepare('SELECT * FROM friends WHERE a = ? AND b = ?'),
  frPut: db.prepare(`INSERT INTO friends (a, b, status, requester, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(a, b) DO UPDATE SET status = excluded.status, requester = excluded.requester, updated_at = excluded.updated_at`),
  frDel: db.prepare('DELETE FROM friends WHERE a = ? AND b = ?'),
  frList: db.prepare('SELECT * FROM friends WHERE a = ? OR b = ?'),
  frUser: db.prepare('DELETE FROM friends WHERE a = ? OR b = ?'),
  frPrune: db.prepare("DELETE FROM friends WHERE status != 'accepted' AND updated_at < ?"),
};
const pairKey = (x, y) => (x < y ? [x, y] : [y, x]);
const friendRow = (r) => r && ({ a: r.a, b: r.b, status: r.status, requester: r.requester, createdAt: r.created_at, updatedAt: r.updated_at });

const newId = (prefix) => `${prefix}${crypto.randomBytes(12).toString('hex')}`;

// Borra pedidos que nunca se pagaron (más de 2 días)
setInterval(() => {
  const limit = Date.now() - 2 * 24 * 3600 * 1000;
  for (const [id, o] of Object.entries(data.orders)) {
    if (o.status === 'pending' && o.createdAt < limit) { delete data.orders[id]; del.orders.run(id); }
  }
}, 3600 * 1000).unref();

module.exports = {
  newId,
  save,
  file: DB_FILE,

  // Copia de seguridad consistente (aunque la web esté funcionando)
  backup(dest) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    db.exec(`VACUUM INTO '${dest.replace(/'/g, "''")}'`);
  },

  // ---- Pedidos ----
  getOrder: (id) => data.orders[id],
  createOrder(id, fields) {
    data.orders[id] = { id, status: 'pending', createdAt: Date.now(), ...fields };
    write('orders', data.orders[id]);
    return data.orders[id];
  },
  updateOrder(id, fields) {
    const order = data.orders[id];
    if (!order) return null;
    Object.assign(order, fields);
    write('orders', order);
    if (fields.purchaseId) { data.purchases[fields.purchaseId] = id; putPurchase.run(fields.purchaseId, id); }
    return order;
  },
  orderIdForPurchase: (purchaseId) => data.purchases[purchaseId],
  ordersForUser: (userId) => Object.values(data.orders).filter((o) => o.userId === userId),

  // ---- Usuarios ----
  getUser: (id) => data.users[id],
  getUserByEmail: (email) => data.users[data.emails[email]],
  createUser(fields) {
    const id = newId('u');
    data.users[id] = { id, createdAt: Date.now(), blocked: [], ...fields };
    data.emails[fields.email] = id;
    write('users', data.users[id]);
    return data.users[id];
  },
  updateUser(id, fields) {
    const user = data.users[id];
    if (!user) return null;
    Object.assign(user, fields);
    write('users', user);
    return user;
  },
  listUsers: () => Object.values(data.users),
  // Cambia el email manteniendo el índice de búsqueda por email
  changeEmail(id, email) {
    const user = data.users[id];
    if (!user || data.emails[email]) return null;
    delete data.emails[user.email];
    user.email = email;
    data.emails[email] = id;
    write('users', user);
    return user;
  },
  // Borra la cuenta. Los pedidos se conservan sin dato personal (obligación de
  // facturación) y las denuncias se mantienen para la moderación.
  deleteUser(id) {
    const user = data.users[id];
    if (!user) return false;
    db.exec('BEGIN');
    try {
      delete data.emails[user.email];
      delete data.users[id];
      del.users.run(id);
      sql.histUser.run(id, id);
      sql.frUser.run(id, id);
      for (const [sid, sub] of Object.entries(data.pushsubs)) if (sub.userId === id) { delete data.pushsubs[sid]; del.pushsubs.run(sid); }
      for (const o of Object.values(data.orders)) if (o.userId === id) { o.userId = null; write('orders', o); }
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
    return true;
  },
  banEmailHash(hash) {
    if (!data.bannedEmails.has(hash)) { data.bannedEmails.add(hash); putBanned.run(hash); }
  },
  isEmailHashBanned: (hash) => data.bannedEmails.has(hash),

  // ---- Tablas genéricas (tickets, ledger, stats, settings, pushsubs, adbanners) ----
  get: (table, id) => data[table][id],
  list: (table) => Object.values(data[table]),
  put(table, obj) {
    data[table][obj.id] = obj;
    write(table, obj);
    return obj;
  },
  patch(table, id, fields) {
    const obj = data[table][id];
    if (!obj) return null;
    Object.assign(obj, fields);
    write(table, obj);
    return obj;
  },
  remove(table, id) {
    if (!data[table][id]) return false;
    delete data[table][id];
    del[table].run(id);
    return true;
  },

  // ---- Historial ----
  historyMeet(owner, partner, at) {
    sql.histMeet.run(owner, partner, at, at);
    sql.histTrim.run(owner, owner);
  },
  historyEnd: (owner, partner, startedAt, seconds) => { sql.histEnd.run(seconds, owner, partner, startedAt); },
  listHistory: (owner, limit = HISTORY_KEEP) => sql.histList.all(owner, limit)
    .map((r) => ({ partner: r.partner, firstAt: r.first_at, lastAt: r.last_at, duration: r.duration, times: r.times })),
  removeHistory: (owner, partner) => { sql.histDel.run(owner, partner); },
  clearHistory: (owner) => { sql.histClear.run(owner); },
  pruneHistory: (before) => Number(sql.histPrune.run(before).changes),

  // ---- Amigos ----
  getFriendship: (x, y) => friendRow(sql.frGet.get(...pairKey(x, y))),
  setFriendship(x, y, status, requester) {
    const now = Date.now();
    sql.frPut.run(...pairKey(x, y), status, requester, now, now);
  },
  deleteFriendship: (x, y) => { sql.frDel.run(...pairKey(x, y)); },
  listFriendships: (uid) => sql.frList.all(uid, uid).map(friendRow),
  pruneFriendRequests: (before) => Number(sql.frPrune.run(before).changes),

  // ---- Denuncias ----
  createReport(fields) {
    const id = newId('r');
    data.reports[id] = { id, status: 'open', createdAt: Date.now(), ...fields };
    write('reports', data.reports[id]);
    return data.reports[id];
  },
  updateReport(id, fields) {
    const report = data.reports[id];
    if (!report) return null;
    Object.assign(report, fields);
    write('reports', report);
    return report;
  },
  getReport: (id) => data.reports[id],
  listReports: () => Object.values(data.reports),
};
