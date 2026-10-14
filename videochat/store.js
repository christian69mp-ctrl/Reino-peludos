// Almacén mínimo en un fichero JSON: usuarios, pedidos Premium y denuncias.
// Suficiente para empezar; con muchos usuarios conviene pasar a una base de datos.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FILE = process.env.DATA_FILE || path.join(__dirname, 'data', 'store.json');

let data = {};
try {
  data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
} catch { /* primera ejecución */ }
data.orders ||= {};      // orderId -> pedido
data.purchases ||= {};   // purchaseId de Segpay -> orderId
data.users ||= {};       // userId -> usuario
data.emails ||= {};      // email -> userId
data.reports ||= {};     // reportId -> denuncia
data.bannedEmails ||= [];// hash de emails de cuentas expulsadas que se borraron (evita volver a registrarse)

let saveTimer = null;
function save() {
  if (saveTimer) return;
  saveTimer = setTimeout(flush, 200);
}
function flush() {
  clearTimeout(saveTimer);
  saveTimer = null;
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data));
  fs.renameSync(tmp, FILE);
}
process.on('exit', () => { if (saveTimer) flush(); });

const newId = (prefix) => `${prefix}${crypto.randomBytes(12).toString('hex')}`;

// Borra pedidos que nunca se pagaron (más de 2 días)
setInterval(() => {
  const limit = Date.now() - 2 * 24 * 3600 * 1000;
  let changed = false;
  for (const [id, o] of Object.entries(data.orders)) {
    if (o.status === 'pending' && o.createdAt < limit) { delete data.orders[id]; changed = true; }
  }
  if (changed) save();
}, 3600 * 1000).unref();

module.exports = {
  newId,

  // ---- Pedidos ----
  getOrder: (id) => data.orders[id],
  createOrder(id, fields) {
    data.orders[id] = { status: 'pending', createdAt: Date.now(), ...fields };
    save();
    return data.orders[id];
  },
  updateOrder(id, fields) {
    if (!data.orders[id]) return null;
    Object.assign(data.orders[id], fields);
    if (fields.purchaseId) data.purchases[fields.purchaseId] = id;
    save();
    return data.orders[id];
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
    save();
    return data.users[id];
  },
  updateUser(id, fields) {
    if (!data.users[id]) return null;
    Object.assign(data.users[id], fields);
    save();
    return data.users[id];
  },
  listUsers: () => Object.values(data.users),
  // Borra la cuenta. Los pedidos se conservan sin dato personal (obligación de
  // facturación) y las denuncias se mantienen para la moderación.
  deleteUser(id) {
    const user = data.users[id];
    if (!user) return false;
    delete data.emails[user.email];
    delete data.users[id];
    for (const o of Object.values(data.orders)) if (o.userId === id) o.userId = null;
    save();
    return true;
  },
  banEmailHash(hash) {
    if (!data.bannedEmails.includes(hash)) { data.bannedEmails.push(hash); save(); }
  },
  isEmailHashBanned: (hash) => data.bannedEmails.includes(hash),
  save,

  // ---- Denuncias ----
  createReport(fields) {
    const id = newId('r');
    data.reports[id] = { id, status: 'open', createdAt: Date.now(), ...fields };
    save();
    return data.reports[id];
  },
  updateReport(id, fields) {
    if (!data.reports[id]) return null;
    Object.assign(data.reports[id], fields);
    save();
    return data.reports[id];
  },
  getReport: (id) => data.reports[id],
  listReports: () => Object.values(data.reports),
};
