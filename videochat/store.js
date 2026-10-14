// Almacén mínimo de pedidos Premium en un fichero JSON.
// Suficiente para empezar; con muchos usuarios conviene pasar a una base de datos.

const fs = require('fs');
const path = require('path');

const FILE = process.env.DATA_FILE || path.join(__dirname, 'data', 'store.json');

let data = { orders: {}, purchases: {} };
try {
  data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
} catch { /* primera ejecución */ }

let saveTimer = null;
function save() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    const tmp = `${FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data));
    fs.renameSync(tmp, FILE);
  }, 200);
}

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
};
