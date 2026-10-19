// Denuncias y moderación.
//
// - Los usuarios denuncian a la persona con la que están hablando por burlas,
//   acoso, homofobia/transfobia, menores o contenido ilegal, u otros motivos.
// - La denuncia guarda los últimos mensajes del chat como prueba.
// - Suspensión automática de 24 h cuando varias personas distintas denuncian a
//   alguien en 24 h. Las denuncias por menores o contenido ilegal son urgentes.
// - El panel /admin.html permite revisar denuncias, suspender, expulsar o readmitir.

const store = require('./store');
const mailer = require('./mailer');

// Avisos al equipo por email (ADMIN_EMAIL). No bloquean nunca la petición.
function alertAdmin(subject, text) {
  const panel = `${process.env.BASE_URL || ''}/admin`;
  mailer.sendAdminAlert(subject, `${text}\n\nRevísalo en el panel de moderación: ${panel}`)
    .catch((err) => console.error('[moderación] no se pudo avisar por email:', err.message));
}

const REASONS = {
  burlas: 'Burlas o insultos',
  acoso: 'Acoso',
  homofobia: 'Homofobia o transfobia',
  grabacion: 'Grabación o capturas sin permiso',
  menor: 'Parece menor de edad',
  ilegal: 'Contenido ilegal',
  otro: 'Otro motivo',
};
const URGENT = new Set(['menor', 'ilegal']);
const WINDOW_MS = 24 * 3600 * 1000;
const AUTO_SUSPEND_REPORTERS = 3;        // personas distintas en 24 h
const AUTO_SUSPEND_REPORTERS_URGENT = 2; // para menores / contenido ilegal
const AUTO_SUSPEND_MS = 24 * 3600 * 1000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) console.warn('[moderación] ADMIN_PASSWORD no definido: el panel de moderación está desactivado.');

let onRestrict = () => {};

// Crea una denuncia y aplica la suspensión automática si corresponde
function report({ reporter, reported, reason, comment, chat }) {
  if (!REASONS[reason] || !reporter || !reported || reporter.id === reported.id) return null;

  // Una misma persona no puede denunciar a otra más de una vez al día
  const since = Date.now() - WINDOW_MS;
  const recent = store.listReports().filter((r) => r.reportedId === reported.id && r.createdAt > since);
  if (recent.some((r) => r.reporterId === reporter.id)) return { duplicate: true };

  const created = store.createReport({
    reporterId: reporter.id,
    reportedId: reported.id,
    reason,
    urgent: URGENT.has(reason),
    comment: String(comment || '').trim().slice(0, 500),
    chat: (chat || []).slice(-30),
  });
  // Si parece menor, tiene que verificar su edad con documento para seguir
  if (reason === 'menor') require('./age').requireCheck(reported.id, 'report');
  if (created.urgent) {
    alertAdmin('⚠️ Denuncia URGENTE: menor o contenido ilegal',
      `Se ha denunciado a ${reported.email} por: ${REASONS[reason]}.\nComentario: ${created.comment || '(sin comentario)'}`);
  }

  const all = [...recent, created];
  const reporters = new Set(all.map((r) => r.reporterId)).size;
  const urgentReporters = new Set(all.filter((r) => r.urgent).map((r) => r.reporterId)).size;
  if (reported.status !== 'banned' &&
      (reporters >= AUTO_SUSPEND_REPORTERS || urgentReporters >= AUTO_SUSPEND_REPORTERS_URGENT)) {
    const until = Date.now() + AUTO_SUSPEND_MS;
    store.updateUser(reported.id, { suspendedUntil: until, suspendedReason: 'Denuncias de varios usuarios', restrictionCode: 'multipleReports' });
    onRestrict(reported.id, { type: 'suspended', until, reason: 'multipleReports' });
    console.log(`[moderación] suspensión automática de ${reported.email} hasta ${new Date(until).toISOString()}`);
    alertAdmin('Suspensión automática', `La cuenta ${reported.email} se ha suspendido 24 h por denuncias de ${reporters} personas distintas.`);
  }
  return created;
}

const { requireAdmin, audit } = require('./adminauth');

function userSummary(user) {
  if (!user) return null;
  const reports = store.listReports().filter((r) => r.reportedId === user.id);
  return {
    id: user.id,
    email: user.email,
    nick: user.nick || '',
    rep: { up: user.rep?.up || 0, down: user.rep?.down || 0 },
    piropos: Object.values(user.piropos || {}).reduce((a, b) => a + b, 0),
    points: user.game?.points || 0,
    giftUntil: user.giftUntil > Date.now() ? user.giftUntil : null,
    invites: user.invitesTotal || 0,
    invitedBy: user.referredBy || null,
    badges: (user.game?.badges || []).length,
    spicy: !!user.prefs?.spicy,
    gender: user.gender,
    createdAt: user.createdAt,
    status: user.status,
    suspendedUntil: user.suspendedUntil && user.suspendedUntil > Date.now() ? user.suspendedUntil : null,
    reportsReceived: reports.length,
    reportsOpen: reports.filter((r) => r.status === 'open').length,
    age: user.age?.status || 'none',
    ageCheck: !!user.ageCheck,
    declaredAge: require('./auth').ageFrom(user.birthDate),
    code: user.id.slice(1, 9).toUpperCase().replace(/^(.{4})/, '$1-'),
    captureAttempts: user.captureAttempts || 0,
  };
}

// code: motivo que se le explica a la persona (un motivo de denuncia o 'moderation')
function applyUserAction(user, action, days, code) {
  const reason = (REASONS[code] || ['moderation', 'chargeback', 'fraud'].includes(code)) ? code : 'moderation';
  if (action === 'ban') {
    store.updateUser(user.id, { status: 'banned', bannedAt: Date.now(), restrictionCode: reason });
    onRestrict(user.id, { type: 'banned', reason });
  } else if (action === 'suspend') {
    const until = Date.now() + Math.min(Math.max(Number(days) || 1, 1), 365) * 86400000;
    store.updateUser(user.id, { suspendedUntil: until, suspendedReason: 'Moderación', restrictionCode: reason });
    onRestrict(user.id, { type: 'suspended', until, reason });
  } else if (action === 'requireAge') {
    require('./age').requireCheck(user.id, 'admin');
  } else if (action === 'clearAge') {
    store.updateUser(user.id, { ageCheck: null });
  } else if (action === 'clearNick') {
    store.updateUser(user.id, { nick: '' });
  } else if (action === 'restore') {
    store.updateUser(user.id, { status: 'active', suspendedUntil: null, restrictionCode: null });
  } else {
    return false;
  }
  return true;
}

function routes(app) {
  app.get('/api/report-reasons', (_req, res) => res.json(REASONS));

  app.get('/api/admin/summary', requireAdmin, (_req, res) => {
    const reports = store.listReports();
    res.json({
      users: store.listUsers().length,
      reportsOpen: reports.filter((r) => r.status === 'open').length,
      reportsUrgent: reports.filter((r) => r.status === 'open' && r.urgent).length,
      reasons: REASONS,
    });
  });

  app.get('/api/admin/reports', requireAdmin, (req, res) => {
    const status = req.query.status === 'closed' ? 'closed' : 'open';
    const list = store.listReports()
      .filter((r) => (status === 'open' ? r.status === 'open' : r.status !== 'open'))
      .sort((a, b) => (b.urgent - a.urgent) || (b.createdAt - a.createdAt))
      .slice(0, 200)
      .map((r) => ({
        ...r,
        reasonLabel: REASONS[r.reason],
        reporter: userSummary(store.getUser(r.reporterId)),
        reported: userSummary(store.getUser(r.reportedId)),
      }));
    res.json(list);
  });

  // Resolver denuncia: dismiss (sin acción), suspend (con días) o ban
  app.post('/api/admin/reports/:id', requireAdmin, (req, res) => {
    const r = store.getReport(req.params.id);
    if (!r) return res.status(404).json({ error: 'Denuncia no encontrada' });
    const { action, days } = req.body || {};
    if (action !== 'dismiss') {
      const user = store.getUser(r.reportedId);
      if (!user || !applyUserAction(user, action, days, r.reason)) return res.status(400).json({ error: 'Acción no válida' });
    }
    store.updateReport(r.id, { status: action === 'dismiss' ? 'dismissed' : 'actioned', action, resolvedAt: Date.now() });
    audit(req, 'Denuncia resuelta', `${action} · ${store.getUser(r.reportedId)?.email || ''}`);
    res.json({ ok: true });
  });

  app.get('/api/admin/users', requireAdmin, (req, res) => {
    const q = String(req.query.q || '').trim().toLowerCase();
    const list = store.listUsers()
      // también se busca por el código de marca de agua (p. ej. "7F3A-91C2") que sale en grabaciones filtradas
      .filter((u) => !q || u.email.includes(q) || (u.nick || '').toLowerCase().includes(q) || u.id === q || u.id.includes(q.replace(/[^a-f0-9]/g, '') || '¬'))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 100)
      .map(userSummary);
    res.json(list);
  });

  app.post('/api/admin/users/:id', requireAdmin, (req, res) => {
    const user = store.getUser(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (!applyUserAction(user, req.body?.action, req.body?.days, req.body?.reason)) return res.status(400).json({ error: 'Acción no válida' });
    audit(req, 'Acción sobre usuario', `${req.body.action} · ${user.email}`);
    res.json({ ok: true, user: userSummary(store.getUser(user.id)) });
  });
}

module.exports = {
  routes,
  report,
  REASONS,
  setOnRestrict: (fn) => { onRestrict = fn; },
  alertAdmin,
};
