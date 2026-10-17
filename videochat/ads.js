// Publicidad: tres huecos que no tapan nunca el vídeo.
// - side: vertical 160×600, a la derecha del videochat (solo en pantallas anchas).
// - top: horizontal 728×90, en la portada entre secciones.
// - top-mobile: horizontal 320×100, el mismo sitio en móviles.
//
// Cada hueco puede estar desactivado, mostrar banners de tus propios anunciantes
// (los subes en /admin y cuentas impresiones y clics sin cookies) o el código de una
// red publicitaria para adultos (ExoClick, TrafficStars, JuicyAds…). El código de la
// red se sirve en una página aparte que va dentro de un iframe aislado (sin acceso a
// la sesión ni a nada de la web) y solo se carga si la persona acepta las cookies de
// publicidad. Quien tiene Premium de pago no ve anuncios.
const crypto = require('crypto');
const store = require('./store');
const auth = require('./auth');
const payments = require('./payments');

const SLOTS = {
  side: { w: 160, h: 600, name: 'Lateral 160×600 (videochat, pantallas anchas)' },
  top: { w: 728, h: 90, name: 'Horizontal 728×90 (portada, ordenador)' },
  'top-mobile': { w: 320, h: 100, name: 'Horizontal 320×100 (portada, móvil)' },
};
const MODES = ['off', 'own', 'network'];
const IMAGE_TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };
const MAX_IMAGE = 400 * 1024;
const DAY = 24 * 3600 * 1000;

function config() {
  const c = store.get('settings', 'ads') || { id: 'ads', slots: {} };
  for (const s of Object.keys(SLOTS)) c.slots[s] ||= { mode: 'off', code: '' };
  return c;
}

const today = () => new Date().toISOString().slice(0, 10);
const live = (b, now = Date.now()) => b.active && (!b.startsAt || b.startsAt <= now) && (!b.endsAt || b.endsAt + DAY > now);
const publicBanner = ({ image, ...b }) => ({ ...b, imageType: image?.type });

// Banner para un hueco: al azar entre los activos (cada uno con su peso)
function pickBanner(slot) {
  const list = store.list('adbanners').filter((b) => b.slot === slot && live(b));
  const total = list.reduce((a, b) => a + (b.weight || 1), 0);
  let r = Math.random() * total;
  for (const b of list) { r -= b.weight || 1; if (r <= 0) return b; }
  return list[0] || null;
}

function count(b, field) {
  const day = today();
  const daily = b.daily || {};
  daily[day] = daily[day] || { i: 0, c: 0 };
  daily[day][field] += 1;
  // solo se guardan los últimos 120 días
  for (const d of Object.keys(daily)) if (Date.parse(d) < Date.now() - 120 * DAY) delete daily[d];
  store.patch('adbanners', b.id, { [field === 'i' ? 'impressions' : 'clicks']: (b[field === 'i' ? 'impressions' : 'clicks'] || 0) + 1, daily });
}

// Quien paga Premium no ve anuncios (en el modo lanzamiento gratuito sí se ven)
function adFree(req) {
  const user = auth.userFromToken(auth.bearer(req));
  return !!(user && payments.activeOrder(user.id) && !payments.FREE);
}

const safeUrl = (u) => /^https?:\/\/[^\s]+$/i.test(String(u || '')) && String(u).length <= 500;

function routes(app, { requireAdmin, audit }) {
  // ---- Público ----
  app.get('/api/ads', (req, res) => {
    res.set('Cache-Control', 'no-store');
    if (adFree(req)) return res.json({ slots: {} });
    const c = config();
    const slots = {};
    for (const s of String(req.query.slots || '').split(',').filter((x) => SLOTS[x])) {
      const conf = c.slots[s];
      if (conf.mode === 'off') continue;
      const out = { ...SLOTS[s] };
      delete out.name;
      if (conf.mode === 'network' && conf.code) out.frame = `/ads/frame/${s}`;
      // Banner propio: lo principal en modo «own» y, en modo «network», la alternativa
      // para quien rechaza las cookies de publicidad
      const b = pickBanner(s);
      if (b) out.banner = { id: b.id, img: `/ads/img/${b.id}?v=${b.updatedAt || b.createdAt}`, alt: b.advertiser };
      if (out.frame || out.banner) slots[s] = out;
    }
    res.json({ slots });
  });

  // Impresión contada cuando el banner se ve de verdad (no al pedir la lista)
  // (una por persona y banner cada minuto, para que no se puedan inflar recargando)
  const recent = new Map();
  setInterval(() => recent.clear(), 60 * 1000).unref();
  app.post('/api/ads/seen', (req, res) => {
    const b = store.get('adbanners', String(req.body?.id || ''));
    const key = `${req.ip}|${b?.id}`;
    if (b && live(b) && !recent.has(key)) { recent.set(key, 1); count(b, 'i'); }
    res.json({ ok: true });
  });

  app.get('/ads/click/:id', (req, res) => {
    const b = store.get('adbanners', req.params.id);
    if (!b || !safeUrl(b.url)) return res.redirect('/');
    count(b, 'c');
    res.set('Referrer-Policy', 'no-referrer');
    res.redirect(b.url);
  });

  app.get('/ads/img/:id', (req, res) => {
    const b = store.get('adbanners', req.params.id);
    if (!b?.image) return res.status(404).end();
    res.set('Cache-Control', 'public, max-age=86400');
    res.type(b.image.type).send(Buffer.from(b.image.data, 'base64'));
  });

  // Código de la red publicitaria, en su propia página. Se incrusta con
  // <iframe sandbox> sin allow-same-origin: no puede leer la sesión ni la web.
  app.get('/ads/frame/:slot', (req, res) => {
    const conf = config().slots[req.params.slot];
    if (!SLOTS[req.params.slot] || conf?.mode !== 'network' || !conf.code) return res.status(404).end();
    res.set({
      'Content-Security-Policy': "default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'self'",
      'X-Frame-Options': 'SAMEORIGIN',
      'Cache-Control': 'no-store',
    });
    res.type('html').send(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex">
<style>html,body{margin:0;padding:0;background:transparent;overflow:hidden;display:flex;justify-content:center}</style></head><body>
${conf.code}
</body></html>`);
  });

  // ---- Panel ----
  app.get('/api/admin/ads', requireAdmin, (_req, res) => {
    const c = config();
    res.json({
      slots: Object.fromEntries(Object.entries(SLOTS).map(([k, v]) => [k, { ...v, ...c.slots[k] }])),
      banners: store.list('adbanners').sort((a, b) => b.createdAt - a.createdAt).map(publicBanner),
    });
  });

  app.post('/api/admin/ads/slots', requireAdmin, (req, res) => {
    const c = config();
    for (const [k, v] of Object.entries(req.body?.slots || {})) {
      if (!SLOTS[k] || !MODES.includes(v?.mode)) continue;
      c.slots[k] = { mode: v.mode, code: String(v.code || '').slice(0, 20000) };
    }
    store.put('settings', c);
    audit(req, 'Publicidad: huecos guardados', Object.entries(c.slots).map(([k, v]) => `${k}=${v.mode}`).join(' '));
    res.json({ ok: true });
  });

  app.post('/api/admin/ads/banners', requireAdmin, (req, res) => {
    const b = req.body || {};
    if (!SLOTS[b.slot]) return res.status(400).json({ error: 'Elige el hueco' });
    if (!safeUrl(b.url)) return res.status(400).json({ error: 'La dirección del anunciante debe empezar por https://' });
    const m = String(b.image || '').match(/^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=]+)$/);
    if (!m || !IMAGE_TYPES[m[1]]) return res.status(400).json({ error: 'La imagen debe ser PNG, JPG, WEBP o GIF' });
    if (m[2].length * 0.75 > MAX_IMAGE) return res.status(400).json({ error: 'La imagen pesa demasiado (máx. 400 KB)' });
    const day = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d || '') ? Date.parse(d) : null);
    const banner = store.put('adbanners', {
      id: `ad${crypto.randomBytes(6).toString('hex')}`,
      slot: b.slot,
      advertiser: String(b.advertiser || '').trim().slice(0, 80) || 'Anunciante',
      url: String(b.url).trim(),
      startsAt: day(b.start), endsAt: day(b.end),
      weight: Math.min(Math.max(Number(b.weight) || 1, 1), 10),
      active: true, impressions: 0, clicks: 0, daily: {},
      image: { type: m[1], data: m[2] },
      createdAt: Date.now(),
    });
    audit(req, 'Publicidad: banner añadido', `${banner.advertiser} (${banner.slot})`);
    res.json({ ok: true, banner: publicBanner(banner) });
  });

  app.post('/api/admin/ads/banners/:id', requireAdmin, (req, res) => {
    const b = store.get('adbanners', req.params.id);
    if (!b) return res.status(404).json({ error: 'No encontrado' });
    if (req.body?.action === 'delete') {
      store.remove('adbanners', b.id);
      audit(req, 'Publicidad: banner borrado', b.advertiser);
      return res.json({ ok: true });
    }
    const active = !!req.body?.active;
    store.patch('adbanners', b.id, { active, updatedAt: Date.now() });
    audit(req, active ? 'Publicidad: banner activado' : 'Publicidad: banner pausado', b.advertiser);
    res.json({ ok: true });
  });
}

module.exports = { routes, SLOTS, config };
