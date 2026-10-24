// IndexNow: avisa a Bing (y a Yandex, Seznam, Naver…) de las páginas nuevas o cambiadas para que
// las indexen en horas en vez de semanas. Google no lo usa (para Google está el sitemap).
// Solo en la web pública (BASE_URL con https). Se avisa una vez tras cada actualización que cambie
// la lista de páginas o sus textos. INDEXNOW=off lo desactiva.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const store = require('./store');

const ENDPOINT = process.env.INDEXNOW_URL || 'https://api.indexnow.org/indexnow';

function key() {
  if (/^[a-zA-Z0-9-]{8,128}$/.test(process.env.INDEXNOW_KEY || '')) return process.env.INDEXNOW_KEY;
  let s = store.get('settings', 'indexnow');
  if (!s?.key) { s = { id: 'indexnow', key: crypto.randomBytes(16).toString('hex') }; store.put('settings', s); }
  return s.key;
}

// Huella de las páginas y de sus textos: si no cambia, no se vuelve a avisar
function fingerprint(urls) {
  const h = crypto.createHash('sha256').update(urls.join('\n'));
  for (const dir of ['seo/content', 'public']) {
    const full = path.join(__dirname, dir);
    for (const f of fs.readdirSync(full).sort()) if (/\.(js|html)$/.test(f)) h.update(fs.readFileSync(path.join(full, f)));
  }
  return h.digest('hex');
}

async function ping(urlsOf) {
  const base = (process.env.BASE_URL || '').replace(/\/$/, '');
  const k = key();
  const urls = urlsOf(base);
  const print = fingerprint(urls);
  const s = store.get('settings', 'indexnow') || { id: 'indexnow', key: k };
  if (s.print === print) return;
  const host = new URL(base).host;
  for (let i = 0; i < urls.length; i += 10000) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key: k, keyLocation: `${base}/${k}.txt`, urlList: urls.slice(i, i + 10000) }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok && res.status !== 202) throw new Error(`HTTP ${res.status}`);
  }
  store.put('settings', { ...s, key: k, print, at: Date.now(), count: urls.length });
  console.log(`[indexnow] avisado a Bing de ${urls.length} páginas`);
}

function register(app, urlsOf) {
  app.get('/:file.txt', (req, res, next) => {
    if (req.params.file !== key()) return next();
    res.type('text/plain').send(key());
  });
  const on = process.env.INDEXNOW !== 'off' && /^https:\/\//.test(process.env.BASE_URL || '');
  if (!on) return;
  setTimeout(() => ping(urlsOf).catch((err) => console.error('[indexnow] no se pudo avisar:', err.message)), Number(process.env.INDEXNOW_DELAY_MS) || 120000).unref();
}

module.exports = { register, ping, key };
