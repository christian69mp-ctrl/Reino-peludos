// Panel /admin: estadísticas (ingresos, suscripciones, usuarios, actividad),
// bandejas (contacto, avisos DSA, recursos) y anuncio general.

const store = require('./store');
const stats = require('./stats');
const support = require('./support');
const payments = require('./payments');
const auth = require('./auth');
const { requireAdmin, audit } = require('./adminauth');

const DAY = 86400000;
let live = () => ({ connected: 0, inChat: 0 });

const sum = (arr, f) => arr.reduce((n, x) => n + (f(x) || 0), 0);
const round2 = (n) => Math.round(n * 100) / 100;
const dayOf = (ms) => new Date(ms).toISOString().slice(0, 10);

function overview(days) {
  const now = Date.now();
  const since = now - days * DAY;
  const users = store.listUsers();
  const ledgerAll = store.list('ledger');
  const real = ledgerAll.filter((l) => !l.demo);
  const inRange = (l) => l.at >= since;

  // Suscripciones activas ahora (de pago y de prueba por separado)
  const active = users.map((u) => payments.activeOrder(u.id)).filter(Boolean);
  const activePaid = active.filter((o) => !o.demo);
  const byPlan = (list) => ({ week: list.filter((o) => (o.plan || 'month') === 'week').length, month: list.filter((o) => (o.plan || 'month') === 'month').length });
  const byMethod = (list) => ({ card: list.filter((o) => o.method === 'card').length, crypto: list.filter((o) => o.method === 'crypto').length });
  // Ingreso mensual recurrente: lo que suman al mes las suscripciones con tarjeta activas
  const mrr = sum(activePaid.filter((o) => o.method === 'card'), (o) => ((o.plan || 'month') === 'week' ? payments.PLANS.week.price * 30 / 7 : payments.PLANS.month.price));

  const revenue = (list) => round2(sum(list, (l) => l.amount));
  const r = real.filter(inRange);
  const series = stats.range(days).map((s) => {
    const dayLedger = real.filter((l) => dayOf(l.at) === s.id);
    return {
      day: s.id, visitors: s.visitors, views: s.views, peakOnline: s.peakOnline, activeUsers: s.activeUsers,
      conversations: s.conversations, avgConv: s.conversations ? Math.round(s.convSeconds / s.conversations) : 0,
      signups: users.filter((u) => dayOf(u.createdAt) === s.id).length,
      revenue: revenue(dayLedger),
      newSubs: dayLedger.filter((l) => l.type === 'new').length,
      cancels: dayLedger.filter((l) => l.type === 'cancel').length,
    };
  });
  const st = stats.range(days);
  const merge = (key) => {
    const out = {};
    for (const s of st) for (const [k, v] of Object.entries(s[key] || {})) out[k] = (out[k] || 0) + v;
    return Object.entries(out).sort((a, b) => b[1] - a[1]);
  };
  const ageGroups = { '18-24': 0, '25-34': 0, '35-44': 0, '45+': 0, '?': 0 };
  for (const u of users) {
    const a = auth.ageFrom(u.birthDate);
    ageGroups[a === null ? '?' : a < 25 ? '18-24' : a < 35 ? '25-34' : a < 45 ? '35-44' : '45+'] += 1;
  }
  const reports = store.listReports().filter((x) => x.createdAt >= since);
  const tickets = store.list('tickets').filter((t) => t.createdAt >= since);
  const visitors = sum(st, (s) => s.visitors);
  const signups = users.filter((u) => u.createdAt >= since).length;
  const payers = new Set(real.filter((l) => l.type === 'new').map((l) => l.userId)).size;

  return {
    days,
    mode: payments.FREE ? 'free' : payments.DEMO ? 'demo' : 'live',
    now: { ...live(), premiumPaid: activePaid.length, premiumDemo: active.length - activePaid.length },
    money: {
      revenue: revenue(r.filter((l) => l.amount > 0)),
      refunds: revenue(r.filter((l) => l.amount < 0)),
      net: revenue(r),
      total: revenue(real),
      mrr: round2(mrr),
      newSubs: r.filter((l) => l.type === 'new').length,
      renewals: r.filter((l) => l.type === 'renewal').length,
      cancels: r.filter((l) => l.type === 'cancel').length,
      refundsCount: r.filter((l) => l.type === 'refund').length,
      chargebacks: r.filter((l) => l.type === 'chargeback').length,
      arpu: users.length ? round2(revenue(real) / users.length) : 0,
      conversion: users.length ? round2((payers / users.length) * 100) : 0,
      activeByPlan: byPlan(activePaid),
      activeByMethod: byMethod(activePaid),
      demoRevenue: revenue(ledgerAll.filter((l) => l.demo && inRange(l))),
    },
    users: {
      total: users.length,
      new: signups,
      verifiedEmail: users.filter((u) => u.emailVerified).length,
      banned: users.filter((u) => u.status === 'banned').length,
      suspended: users.filter((u) => u.suspendedUntil > now).length,
      genders: Object.fromEntries(auth.GENDERS.map((g) => [g, users.filter((u) => u.gender === g).length])),
      ageGroups,
      signupMethods: Object.entries(users.filter((u) => u.createdAt >= since).reduce((m, u) => {
        const k = Object.keys(u.oauth || {})[0] || 'email';
        m[k] = (m[k] || 0) + 1;
        return m;
      }, {})),
      visitorToSignup: visitors ? Math.min(100, round2((signups / visitors) * 100)) : 0,
    },
    traffic: {
      visitors, views: sum(st, (s) => s.views),
      countries: merge('countries').slice(0, 12), pages: merge('pages').slice(0, 12),
      devices: merge('devices'), langs: merge('langs'),
    },
    activity: {
      conversations: sum(st, (s) => s.conversations),
      avgConv: (() => { const c = sum(st, (s) => s.conversations); return c ? Math.round(sum(st, (s) => s.convSeconds) / c) : 0; })(),
      peakOnline: Math.max(0, ...st.map((s) => s.peakOnline)),
    },
    moderation: {
      reports: reports.length,
      byReason: Object.entries(reports.reduce((m, x) => { m[x.reason] = (m[x.reason] || 0) + 1; return m; }, {})),
      notices: tickets.filter((t) => t.kind === 'notice').length,
      noticesActioned: tickets.filter((t) => t.kind === 'notice' && t.decision === 'action').length,
      appeals: tickets.filter((t) => t.kind === 'appeal').length,
      appealsAccepted: tickets.filter((t) => t.kind === 'appeal' && t.decision === 'accept').length,
      messages: tickets.filter((t) => t.kind === 'contact').length,
    },
    open: {
      contact: store.list('tickets').filter((t) => t.kind === 'contact' && t.status === 'open').length,
      notice: store.list('tickets').filter((t) => t.kind === 'notice' && t.status === 'open').length,
      appeal: store.list('tickets').filter((t) => t.kind === 'appeal' && t.status === 'open').length,
    },
    series,
    recentPayments: ledgerAll.sort((a, b) => b.at - a.at).slice(0, 25).map((l) => ({
      at: l.at, type: l.type, amount: l.amount, plan: l.plan, method: l.method, demo: !!l.demo,
      email: store.getUser(l.userId)?.email || '—',
    })),
  };
}

function routes(app) {
  app.get('/api/admin/stats', requireAdmin, (req, res) => {
    const days = [7, 30, 90, 365].includes(Number(req.query.days)) ? Number(req.query.days) : 30;
    res.json(overview(days));
  });

  // Bandejas: kind = contact | notice | appeal
  app.get('/api/admin/tickets', requireAdmin, (req, res) => {
    const kind = ['contact', 'notice', 'appeal'].includes(req.query.kind) ? req.query.kind : null;
    const status = req.query.status === 'closed' ? 'closed' : 'open';
    res.json(support.adminList(kind, status));
  });

  app.post('/api/admin/tickets/:id', requireAdmin, async (req, res) => {
    const { action, response, decision } = req.body || {};
    const t = action === 'reopen' ? support.adminReopen(req.params.id) : await support.adminClose(req.params.id, { response, decision });
    if (!t) return res.status(404).json({ error: 'No encontrado' });
    if (t.error) return res.status(400).json({ error: 'Elige una decisión' });
    audit(req, action === 'reopen' ? 'Reabierto' : 'Respondido', `${t.reference} ${decision || ''}`);
    res.json({ ok: true, ticket: t });
  });

  // El contador «en línea» de la web solo se muestra si el dueño lo activa (va antes que el de server.js)
  app.get('/stats', (_req, res) => res.json({ online: store.get('settings', 'showOnline')?.on ? live().connected : null }));
  app.get('/api/admin/show-online', requireAdmin, (_req, res) => res.json({ on: !!store.get('settings', 'showOnline')?.on }));
  app.post('/api/admin/show-online', requireAdmin, (req, res) => {
    const on = req.body?.on === true;
    store.put('settings', { id: 'showOnline', on });
    audit(req, on ? 'Contador en línea visible' : 'Contador en línea oculto', '');
    res.json({ ok: true, on });
  });

  app.get('/api/admin/announcement', requireAdmin, (_req, res) => res.json({ announcement: store.get('settings', 'announcement') || null }));
  app.post('/api/admin/announcement', requireAdmin, (req, res) => {
    const a = support.setAnnouncement(req.body || {});
    audit(req, a ? 'Anuncio publicado' : 'Anuncio quitado', a?.text.es || '');
    res.json({ ok: true, announcement: a });
  });
}

module.exports = { routes, setLive: (fn) => { live = fn; } };
