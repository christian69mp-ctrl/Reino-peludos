// Ubicación aproximada a partir de la IP: país, región y coordenadas de la ciudad.
// Solo para los filtros Premium «Mi país» y «Cerca de mí» y para mostrar la bandera
// del país. No se guarda: se calcula al conectarse y vive solo en memoria.
//
// Base de datos: DB-IP Lite (gratis, licencia CC BY 4.0, hay que citarla: está en
// el pie de la web). Se descarga sola en data/geoip/ y se renueva cada mes.
// - GEOIP_DB: usar otro archivo .mmdb (o varios separados por comas).
// - GEOIP_AUTO_UPDATE=off: no descargar nada.
// Sin base de datos, los filtros por país y cercanía no aparecen.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');
const { Readable } = require('stream');
const { Reader } = require('mmdb-lib');
const store = require('./store');

const NEAR_KM = Number(process.env.NEAR_KM) || 100;
const DIR = path.join(path.dirname(store.file), 'geoip');
const AUTO_FILE = path.join(DIR, 'dbip-city-lite.mmdb');
const CUSTOM = (process.env.GEOIP_DB || '').split(',').map((s) => s.trim()).filter(Boolean);
const AUTO = !CUSTOM.length && process.env.GEOIP_AUTO_UPDATE !== 'off';
const MAX_AGE = 32 * 24 * 3600 * 1000;

let readers = [];

function load() {
  const files = CUSTOM.length ? CUSTOM : [AUTO_FILE];
  const next = [];
  for (const f of files) {
    try { next.push(new Reader(fs.readFileSync(f))); } catch { /* aún no existe */ }
  }
  readers = next;
  if (readers.length) console.log(`[ubicación] base de datos cargada (${files.map((f) => path.basename(f)).join(', ')})`);
  else console.warn('[ubicación] sin base de datos de IP: los filtros por país y cercanía no estarán disponibles.');
}

// Descarga la base de datos del mes (o la del mes anterior si aún no ha salido)
async function update() {
  const now = new Date();
  const months = [0, 1].map((back) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - back, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  });
  fs.mkdirSync(DIR, { recursive: true });
  for (const m of months) {
    const url = `https://download.db-ip.com/free/dbip-city-lite-${m}.mmdb.gz`;
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      const tmp = `${AUTO_FILE}.tmp`;
      await pipeline(Readable.fromWeb(r.body), zlib.createGunzip(), fs.createWriteStream(tmp));
      new Reader(fs.readFileSync(tmp)); // comprueba que se puede leer
      fs.renameSync(tmp, AUTO_FILE);
      console.log(`[ubicación] base de datos actualizada (${m})`);
      load();
      return true;
    } catch (err) {
      console.error(`[ubicación] no se pudo descargar ${url}:`, err.message);
    }
  }
  return false;
}

function maybeUpdate() {
  let fresh = false;
  try { fresh = Date.now() - fs.statSync(AUTO_FILE).mtimeMs < MAX_AGE; } catch { /* no existe */ }
  if (!fresh) update();
}

load();
if (AUTO) {
  maybeUpdate();
  setInterval(maybeUpdate, 24 * 3600 * 1000).unref();
}

// Acepta los dos formatos de DB-IP: el oficial (como GeoIP2) y el de ip-location-db
function normalize(r) {
  if (!r) return null;
  const country = r.country_code || r.country?.iso_code;
  if (!country || !/^[A-Z]{2}$/.test(country)) return null;
  const lat = r.latitude ?? r.location?.latitude;
  const lon = r.longitude ?? r.location?.longitude;
  return {
    country,
    region: r.state1 || r.subdivisions?.[0]?.names?.en || '',
    lat: typeof lat === 'number' ? lat : null,
    lon: typeof lon === 'number' ? lon : null,
  };
}

function lookup(ip) {
  const clean = String(ip || '').replace(/^::ffff:/, '');
  if (!clean || !readers.length) return null;
  for (const r of readers) {
    try {
      const found = normalize(r.get(clean));
      if (found) return found;
    } catch { /* IP de otra versión (v4/v6) para este archivo */ }
  }
  return null;
}

// Distancia en km entre dos puntos (fórmula del haversine)
function distanceKm(a, b) {
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

// ¿Están cerca? A menos de NEAR_KM km, o en la misma región si no hay coordenadas
function near(a, b) {
  if (!a || !b) return false;
  if (a.lat !== null && b.lat !== null) return distanceKm(a, b) <= NEAR_KM;
  return a.country === b.country && !!a.region && a.region === b.region;
}

module.exports = { lookup, near, distanceKm, NEAR_KM, available: () => readers.length > 0 };
