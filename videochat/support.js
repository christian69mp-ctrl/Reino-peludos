// Atención al usuario y obligaciones del Reglamento de Servicios Digitales (DSA):
// - Contacto: formulario público (soporte, privacidad, pagos, prensa, autoridades…).
// - Avisos de contenido ilegal: cualquiera, con o sin cuenta (art. 16 DSA). Se
//   envía acuse de recibo y, al decidir, la respuesta.
// - Recursos: quien ha sido suspendido o expulsado puede recurrir (art. 20 DSA);
//   lo revisa una persona y se le responde por email.
// - Anuncio general: un aviso que ven todos (p. ej. mantenimiento).
// Todo se guarda en la tabla «tickets» y se gestiona desde /admin.

const crypto = require('crypto');
const store = require('./store');
const mailer = require('./mailer');
const captcha = require('./captcha');
const auth = require('./auth');

const DAY = 24 * 3600 * 1000;
const KEEP_CLOSED_DAYS = 730; // tickets cerrados: 2 años (pruebas y transparencia DSA)
const CONTACT_CATEGORIES = ['support', 'account', 'billing', 'privacy', 'report', 'press', 'authorities', 'other'];
const NOTICE_CATEGORIES = ['minors', 'nonconsensual', 'violence', 'hate', 'harassment', 'ip', 'fraud', 'other'];
const URGENT_NOTICES = new Set(['minors', 'nonconsensual', 'violence']);
const clean = (v, max) => String(v ?? '').trim().slice(0, max);
const reference = (prefix) => `${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

let alertAdmin = (subject, text) => mailer.sendAdminAlert(subject, text).catch(() => {});
let onRestore = () => {};

// Límite por IP: 5 envíos cada hora
const sent = new Map();
// Máximo 5 mensajes enviados por hora y conexión (los que fallan por un dato mal puesto no cuentan)
function limited(ip) {
  const list = (sent.get(ip) || []).filter((t) => t > Date.now() - 3600 * 1000);
  sent.set(ip, list);
  return list.length >= 5;
}
const counted = (ip) => sent.get(ip).push(Date.now());
setInterval(() => { const cut = Date.now() - 3600 * 1000; for (const [k, v] of sent) if (!v.some((t) => t > cut)) sent.delete(k); }, 600000).unref();

function newTicket(kind, fields) {
  const t = { id: store.newId('t'), kind, status: 'open', createdAt: Date.now(), ...fields };
  return store.put('tickets', t);
}

function publicTicket(t) {
  return { reference: t.reference, status: t.status, decision: t.decision || null, response: t.response || '', createdAt: t.createdAt, closedAt: t.closedAt || null };
}

// Limpieza: tickets cerrados hace más de 2 años
function prune() {
  const cut = Date.now() - KEEP_CLOSED_DAYS * DAY;
  for (const t of store.list('tickets')) if (t.status === 'closed' && (t.closedAt || t.createdAt) < cut) store.remove('tickets', t.id);
}
prune();
setInterval(prune, DAY).unref();

// ---- Anuncio general ----
function announcement() {
  const a = store.get('settings', 'announcement');
  if (!a || !a.text?.es || (a.until && a.until < Date.now())) return null;
  return { id: a.version, level: a.level, text: a.text };
}

function routes(app) {
  // Contacto
  app.post('/api/contact', async (req, res) => {
    if (limited(req.ip)) return res.status(429).json({ code: 'tooMany' });
    const email = clean(req.body?.email, 200).toLowerCase();
    const message = clean(req.body?.message, 5000);
    const category = CONTACT_CATEGORIES.includes(req.body?.category) ? req.body.category : 'other';
    if (!auth.EMAIL_RE.test(email)) return res.status(400).json({ code: 'email' });
    if (message.length < 10) return res.status(400).json({ code: 'messageShort' });
    if (!(await captcha.verifyHuman(req))) return res.status(400).json({ code: 'captcha' });
    const user = auth.userFromToken(auth.bearer(req));
    counted(req.ip);
    const t = newTicket('contact', {
      reference: reference('C'), email, name: clean(req.body?.name, 100), category, message,
      userId: user?.id || null, lang: auth.cleanLang(req.body?.lang),
    });
    alertAdmin(`Mensaje de contacto (${category}) ${t.reference}`, `De: ${t.name || '-'} <${email}>\nCuenta: ${user?.email || 'sin sesión'}\n\n${message}`);
    res.json({ ok: true, reference: t.reference });
  });

  // Aviso de contenido ilegal (cualquiera, con o sin cuenta)
  app.post('/api/notices', async (req, res) => {
    if (limited(req.ip)) return res.status(429).json({ code: 'tooMany' });
    const category = NOTICE_CATEGORIES.includes(req.body?.category) ? req.body.category : null;
    const explanation = clean(req.body?.explanation, 5000);
    const email = clean(req.body?.email, 200).toLowerCase();
    const name = clean(req.body?.name, 100);
    if (!category) return res.status(400).json({ code: 'category' });
    if (explanation.length < 20) return res.status(400).json({ code: 'explanationShort' });
    // El DSA pide nombre y email, salvo en avisos de abuso sexual infantil
    if (category !== 'minors' && (!name || !auth.EMAIL_RE.test(email))) return res.status(400).json({ code: 'nameEmail' });
    if (email && !auth.EMAIL_RE.test(email)) return res.status(400).json({ code: 'email' });
    if (req.body?.goodFaith !== true) return res.status(400).json({ code: 'goodFaith' });
    if (!(await captcha.verifyHuman(req))) return res.status(400).json({ code: 'captcha' });
    counted(req.ip);
    const t = newTicket('notice', {
      reference: reference('N'), category, urgent: URGENT_NOTICES.has(category), name, email, explanation,
      location: clean(req.body?.location, 500), accountCode: clean(req.body?.accountCode, 60),
      lang: auth.cleanLang(req.body?.lang),
    });
    alertAdmin(`${t.urgent ? '⚠️ URGENTE · ' : ''}Aviso de contenido ilegal (${category}) ${t.reference}`,
      `Notificante: ${name || '-'} <${email || '-'}>\nCuenta o código: ${t.accountCode || '-'}\nDónde: ${t.location || '-'}\n\n${explanation}`);
    if (email) {
      mailer.sendText(email, `Hemos recibido tu aviso ${t.reference} / We received your notice ${t.reference}`,
        `Hemos recibido tu aviso de contenido ilegal (referencia ${t.reference}). Lo revisaremos lo antes posible y te diremos qué hemos decidido.\n\nWe have received your illegal content notice (reference ${t.reference}). We will review it as soon as possible and tell you our decision.`).catch(() => {});
    }
    res.json({ ok: true, reference: t.reference });
  });

  // Recurso contra una suspensión o expulsión (funciona aunque la cuenta esté restringida)
  app.get('/api/appeals/mine', auth.requireUser, (req, res) => {
    const mine = store.list('tickets').filter((t) => t.kind === 'appeal' && t.userId === req.user.id).sort((a, b) => b.createdAt - a.createdAt)[0];
    res.json({ appeal: mine ? publicTicket(mine) : null });
  });

  app.post('/api/appeals', auth.requireUser, (req, res) => {
    const user = req.user;
    const restriction = auth.restriction(user);
    if (!restriction) return res.status(400).json({ code: 'notRestricted' });
    const open = store.list('tickets').some((t) => t.kind === 'appeal' && t.userId === user.id && t.status === 'open');
    if (open) return res.status(409).json({ code: 'appealOpen' });
    const message = clean(req.body?.message, 3000);
    if (message.length < 10) return res.status(400).json({ code: 'messageShort' });
    const t = newTicket('appeal', {
      reference: reference('R'), userId: user.id, email: user.email, message,
      restriction: { ...restriction }, lang: user.lang || 'en',
    });
    alertAdmin(`Recurso de sanción ${t.reference}`, `${user.email} recurre: ${restriction.type} (${restriction.reason || 'sin motivo'})\n\n${message}`);
    res.json({ ok: true, appeal: publicTicket(t) });
  });

  // Anuncio general para todos
  app.get('/api/announcement', (_req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json({ announcement: announcement() });
  });
}

// ---- Gestión desde el panel ----
function adminList(kind, status) {
  return store.list('tickets')
    .filter((t) => (!kind || t.kind === kind) && (!status || t.status === status))
    .sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0) || b.createdAt - a.createdAt)
    .slice(0, 300)
    .map((t) => ({ ...t, user: t.userId ? (({ email, status: st, suspendedUntil }) => ({ email, status: st, suspendedUntil }))(store.getUser(t.userId) || {}) : null }));
}

// Cierra un ticket con una respuesta (y, en los recursos, una decisión)
async function adminClose(id, { response, decision }) {
  const t = store.get('tickets', id);
  if (!t) return null;
  const text = clean(response, 5000);
  const fields = { status: 'closed', closedAt: Date.now(), response: text };
  if (t.kind === 'appeal') {
    if (!['accept', 'reject'].includes(decision)) return { error: 'decision' };
    fields.decision = decision;
    if (decision === 'accept') {
      store.updateUser(t.userId, { status: 'active', suspendedUntil: null, bannedAt: null, restrictionCode: null });
      onRestore(t.userId);
    }
  }
  if (t.kind === 'notice') fields.decision = ['action', 'noAction'].includes(decision) ? decision : 'noAction';
  store.patch('tickets', id, fields);
  const subject = { appeal: `Respuesta a tu recurso ${t.reference}`, notice: `Respuesta a tu aviso ${t.reference}`, contact: `Respuesta a tu mensaje ${t.reference}` }[t.kind];
  const lead = t.kind === 'appeal'
    ? (decision === 'accept' ? 'Hemos aceptado tu recurso: tu cuenta vuelve a estar activa.' : 'Hemos revisado tu recurso y mantenemos la decisión.')
    : t.kind === 'notice'
      ? (fields.decision === 'action' ? 'Hemos revisado tu aviso y hemos actuado contra el contenido o la cuenta.' : 'Hemos revisado tu aviso y no hemos encontrado motivo para actuar.')
      : '';
  const body = [lead, text].filter(Boolean).join('\n\n');
  if (t.email && body) await mailer.sendText(t.email, subject, `${body}\n\n— El equipo de La Ruleta Caliente`, process.env.ADMIN_EMAIL).catch(() => {});
  return store.get('tickets', id);
}

function adminReopen(id) {
  return store.patch('tickets', id, { status: 'open', closedAt: null });
}

function setAnnouncement({ es, en, level, days }) {
  const text = { es: clean(es, 300), en: clean(en, 300) };
  if (!text.es) { store.remove('settings', 'announcement'); return null; }
  const d = Math.min(Math.max(Number(days) || 0, 0), 90);
  return store.put('settings', {
    id: 'announcement', version: Date.now(), text, level: level === 'warning' ? 'warning' : 'info',
    until: d ? Date.now() + d * DAY : null,
  });
}

module.exports = {
  routes, adminList, adminClose, adminReopen, setAnnouncement, announcement,
  CONTACT_CATEGORIES, NOTICE_CATEGORIES,
  setHooks: (h) => { if (h.alertAdmin) alertAdmin = h.alertAdmin; if (h.onRestore) onRestore = h.onRestore; },
};
