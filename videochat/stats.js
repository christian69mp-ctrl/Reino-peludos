// Estadísticas del sitio, por día y sin datos personales: no usa cookies ni
// guarda IPs. Un visitante único se cuenta con un código que se calcula con la
// IP, el navegador y una sal que cambia cada día y no se guarda (como Plausible).

const crypto = require('crypto');
const store = require('./store');
const geo = require('./geo');

const today = () => new Date().toISOString().slice(0, 10);
let salt = { day: '', value: '' };
const seen = { day: '', visitors: new Set(), users: new Set() };

function rollDay() {
  const d = today();
  if (seen.day !== d) { seen.day = d; seen.visitors = new Set(); seen.users = new Set(); }
  if (salt.day !== d) salt = { day: d, value: crypto.randomBytes(16).toString('hex') };
  return d;
}

// Día actual en memoria; se guarda en la base de datos como mucho cada 30 s
const empty = (id) => ({
  id, views: 0, visitors: 0, pages: {}, countries: {}, devices: { mobile: 0, desktop: 0 }, langs: {},
  signups: {}, conversations: 0, convSeconds: 0, peakOnline: 0, peakInChat: 0, activeUsers: 0,
});
let dirty = false;
function day() {
  const d = rollDay();
  return store.get('stats', d) || store.put('stats', empty(d));
}
function touch() { dirty = true; }
setInterval(() => { if (dirty) { dirty = false; const s = day(); store.put('stats', s); } }, 30000).unref();
const inc = (obj, key, n = 1) => { obj[key] = (obj[key] || 0) + n; };

// Visita a una página (solo las páginas, no imágenes ni scripts)
function pageView(req, page, lang) {
  const s = day();
  s.views += 1;
  inc(s.pages, page);
  if (lang) inc(s.langs, lang);
  const ua = String(req.get('user-agent') || '');
  if (/bot|crawl|spider|slurp|preview/i.test(ua)) return touch();
  const v = crypto.createHash('sha256').update(`${salt.value}|${req.ip}|${ua}`).digest('hex').slice(0, 16);
  if (!seen.visitors.has(v)) {
    seen.visitors.add(v);
    s.visitors += 1;
    inc(s.devices, /mobile|android|iphone|ipad/i.test(ua) ? 'mobile' : 'desktop');
    const g = geo.lookup(req.ip);
    inc(s.countries, g?.country || '??');
  }
  touch();
}

function signup(method) { inc(day().signups, method || 'email'); touch(); }

function conversation(seconds) {
  const s = day();
  s.conversations += 1;
  s.convSeconds += Math.max(0, Math.round(seconds || 0));
  touch();
}

function activeUser(uid) {
  rollDay();
  const h = crypto.createHash('sha256').update(`${salt.value}|${uid}`).digest('hex').slice(0, 16);
  if (seen.users.has(h)) return;
  seen.users.add(h);
  day().activeUsers += 1;
  touch();
}

// Máximo de gente conectada (se mide cada minuto desde server.js)
function online(connected, inChat) {
  const s = day();
  if (connected > s.peakOnline) { s.peakOnline = connected; touch(); }
  if (inChat > s.peakInChat) { s.peakInChat = inChat; touch(); }
}

function range(days) {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    out.push(store.get('stats', d) || empty(d));
  }
  return out;
}

module.exports = { pageView, signup, conversation, activeUser, online, range, today };
