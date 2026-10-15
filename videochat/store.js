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
  CREATE TABLE IF NOT EXISTS purchases (purchase_id TEXT PRIMARY KEY, order_id TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS banned_emails (hash TEXT PRIMARY KEY);
`);

const TABLES = ['users', 'orders', 'reports'];
const put = Object.fromEntries(TABLES.map((t) => [t, db.prepare(`INSERT INTO ${t} (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data`)]));
const del = Object.fromEntries(TABLES.map((t) => [t, db.prepare(`DELETE FROM ${t} WHERE id = ?`)]));
const putPurchase = db.prepare('INSERT OR REPLACE INTO purchases (purchase_id, order_id) VALUES (?, ?)');
const putBanned = db.prepare('INSERT OR IGNORE INTO banned_emails (hash) VALUES (?)');

// ---- Carga en memoria ----
const data = { users: {}, orders: {}, reports: {}, purchases: {}, emails: {}, bannedEmails: new Set() };
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
