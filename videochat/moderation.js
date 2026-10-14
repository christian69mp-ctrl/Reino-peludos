// Denuncias y moderación.
//
// - Los usuarios denuncian a la persona con la que están hablando por burlas,
//   acoso, homofobia/transfobia, menores o contenido ilegal, u otros motivos.
// - La denuncia guarda los últimos mensajes del chat como prueba.
// - Suspensión automática de 24 h cuando varias personas distintas denuncian a
//   alguien en 24 h. Las denuncias por menores o contenido ilegal son urgentes.
// - El panel /admin.html permite revisar denuncias, suspender, expulsar o readmitir.

const store = require('./store');
const { safeEqual } = require('./tokens');

const REASONS = {
  burlas: 'Burlas o insultos',
  acoso: 'Acoso',
  homofobia: 'Homofobia o transfobia',
  menor: 'Menor de edad o contenido ilegal',
  otro: 'Otro motivo',
};
const URGENT = new Set(['menor']);
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

  const all = [...recent, created];
  const reporters = new Set(all.map((r) => r.reporterId)).size;
  const urgentReporters = new Set(all.filter((r) => r.urgent).map((r) => r.reporterId)).size;
  if (reported.status !== 'banned' &&
      (reporters >= AUTO_SUSPEND_REPORTERS || urgentReporters >= AUTO_SUSPEND_REPORTERS_URGENT)) {
    const until = Date.now() + AUTO_SUSPEND_MS;
    store.updateUser(reported.id, { suspendedUntil: until, suspendedReason: 'Denuncias de varios usuarios' });
    onRestrict(reported.id, { type: 'suspended', until });
    console.log(`[moderación] suspensión automática de ${reported.email} hasta ${new Date(until).toISOString()}`);
  }
  return created;
}

function requireAdmin(req, res, next) {
  if (!ADMIN_PASSWORD || !safeEqual(String(req.get('x-admin-key') || ''), ADMIN_PASSWORD)) {
    return res.status(403).json({ error: 'Acceso no autorizado' });
  }
  next();
}

function userSummary(user) {
  if (!user) return null;
  const reports = store.listReports().filter((r) => r.reportedId === user.id);
  return {
    id: user.id,
    email: user.email,
    gender: user.gender,
    createdAt: user.createdAt,
    status: user.status,
    suspendedUntil: user.suspendedUntil && user.suspendedUntil > Date.now() ? user.suspendedUntil : null,
    reportsReceived: reports.length,
    reportsOpen: reports.filter((r) => r.status === 'open').length,
  };
}

function applyUserAction(user, action, days) {
  if (action === 'ban') {
    store.updateUser(user.id, { status: 'banned', bannedAt: Date.now() });
    onRestrict(user.id, { type: 'banned' });
  } else if (action === 'suspend') {
    const until = Date.now() + Math.min(Math.max(Number(days) || 1, 1), 365) * 86400000;
    store.updateUser(user.id, { suspendedUntil: until, suspendedReason: 'Moderación' });
    onRestrict(user.id, { type: 'suspended', until });
  } else if (action === 'restore') {
    store.updateUser(user.id, { status: 'active', suspendedUntil: null });
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
      if (!user || !applyUserAction(user, action, days)) return res.status(400).json({ error: 'Acción no válida' });
    }
    store.updateReport(r.id, { status: action === 'dismiss' ? 'dismissed' : 'actioned', action, resolvedAt: Date.now() });
    res.json({ ok: true });
  });

  app.get('/api/admin/users', requireAdmin, (req, res) => {
    const q = String(req.query.q || '').trim().toLowerCase();
    const list = store.listUsers()
      .filter((u) => !q || u.email.includes(q) || u.id === q)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 100)
      .map(userSummary);
    res.json(list);
  });

  app.post('/api/admin/users/:id', requireAdmin, (req, res) => {
    const user = store.getUser(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    if (!applyUserAction(user, req.body?.action, req.body?.days)) return res.status(400).json({ error: 'Acción no válida' });
    res.json({ ok: true, user: userSummary(store.getUser(user.id)) });
  });
}

module.exports = {
  routes,
  report,
  REASONS,
  setOnRestrict: (fn) => { onRestrict = fn; },
};
