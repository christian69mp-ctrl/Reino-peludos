// Copias de seguridad de la base de datos.
// - Automáticas: una al arrancar y otra cada 24 h en BACKUP_DIR (por defecto
//   data/copias). Se guardan las BACKUP_KEEP más recientes (14 por defecto).
// - Manual: npm run backup
// Las copias contienen datos personales: si las sacas del servidor, guárdalas cifradas.

const fs = require('fs');
const path = require('path');
const store = require('./store');

const DIR = process.env.BACKUP_DIR || path.join(path.dirname(store.file), 'copias');
const KEEP = Math.max(1, Number(process.env.BACKUP_KEEP) || 14);
const PREFIX = 'la-ruleta-';

function run() {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  const dest = path.join(DIR, `${PREFIX}${stamp}.db`);
  store.backup(dest);
  const old = fs.readdirSync(DIR).filter((f) => f.startsWith(PREFIX) && f.endsWith('.db')).sort().slice(0, -KEEP);
  for (const f of old) fs.unlinkSync(path.join(DIR, f));
  return dest;
}

function schedule() {
  if (process.env.BACKUP_DIR === 'off') return;
  const safeRun = () => {
    try { console.log(`[copias] copia guardada en ${run()}`); }
    catch (err) { console.error('[copias] no se pudo hacer la copia:', err.message); }
  };
  safeRun();
  setInterval(safeRun, 24 * 3600 * 1000).unref();
}

if (require.main === module) console.log(`Copia guardada en ${run()}`);

module.exports = { run, schedule };
