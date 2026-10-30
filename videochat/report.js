// Informe semanal por email al dueño (ADMIN_EMAIL): cada lunes a las 9:00 (hora de España)
// llega un resumen de los últimos 7 días comparado con la semana anterior. También se puede
// enviar al momento desde /admin. WEEKLY_REPORT=off lo desactiva.
const store = require('./store');
const mailer = require('./mailer');

const ON = process.env.WEEKLY_REPORT !== 'off';
const fmtNum = (n) => new Intl.NumberFormat('es-ES').format(Math.round(n || 0));
const eur = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0);
const mins = (s) => (s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s || 0} s`);
const COUNTRY = new Intl.DisplayNames(['es'], { type: 'region' });
const countryName = (cc) => { try { return cc === '??' ? 'Desconocido' : COUNTRY.of(cc); } catch { return cc; } };

const PAGE_NAMES = {
  home: 'Portada', landing: 'Páginas para Google (SEO)', help: 'Ayuda', contact: 'Contacto', rules: 'Normas',
  terms: 'Términos', privacy: 'Privacidad', legal: 'Aviso legal', refunds: 'Reembolsos', report: 'Denunciar contenido',
  cookies: 'Cookies', games: 'Juegos', how: 'Cómo funciona', safety: 'Seguridad', about: 'Sobre nosotros',
};

// Diferencia con la semana anterior: «▲ 12» / «▼ 3» / «= »
function diff(now, before) {
  const d = Math.round(now - before);
  return d > 0 ? `▲ ${fmtNum(d)}` : d < 0 ? `▼ ${fmtNum(-d)}` : '=';
}

function build(overview) {
  const w = overview(7);
  const two = overview(14);
  const prev = {
    visitors: two.traffic.visitors - w.traffic.visitors,
    signups: two.users.new - w.users.new,
    conversations: two.activity.conversations - w.activity.conversations,
  };
  const top = (list, n, name = (x) => x) => list.slice(0, n).map(([k, v]) => `   · ${name(k)}: ${fmtNum(v)}`).join('\n') || '   · (sin datos)';
  const lines = [
    'Hola, Christian:',
    '',
    'Así ha ido La Ruleta Caliente en los últimos 7 días (entre paréntesis, la diferencia con la semana anterior).',
    '',
    '👥 GENTE',
    `   · Visitantes reales: ${fmtNum(w.traffic.visitors)} (${diff(w.traffic.visitors, prev.visitors)})`,
    `   · Altas nuevas (invitados y cuentas): ${fmtNum(w.users.new)} (${diff(w.users.new, prev.signups)})`,
    `   · Cuentas en total: ${fmtNum(w.users.total)}`,
    `   · Máximo de gente conectada a la vez: ${fmtNum(w.activity.peakOnline)}`,
    '',
    '🎥 VIDEOCHAT',
    `   · Conversaciones: ${fmtNum(w.activity.conversations)} (${diff(w.activity.conversations, prev.conversations)})`,
    `   · Duración media: ${mins(w.activity.avgConv)}`,
    '',
    '🌍 DE DÓNDE VIENEN (visitantes reales)',
    top(w.traffic.countries, 5, countryName),
    '',
    '📱 DISPOSITIVOS',
    top(w.traffic.devices, 2, (k) => (k === 'mobile' ? 'Móvil' : 'Ordenador')),
    '',
    '📄 PÁGINAS MÁS VISTAS',
    top(w.traffic.pages, 5, (k) => PAGE_NAMES[k] || k),
    '',
    '🛡️ MODERACIÓN',
    `   · Denuncias: ${fmtNum(w.moderation.reports)}`,
    `   · Pendientes ahora: ${fmtNum(w.open.contact)} mensajes, ${fmtNum(w.open.notice)} avisos DSA, ${fmtNum(w.open.appeal)} recursos`,
    '',
    '💶 DINERO',
    w.mode === 'free' ? '   · Ahora todo es gratis (modo lanzamiento): no hay cobros.' : `   · Ingresos netos: ${eur(w.money.net)} · Premium activos: ${fmtNum(w.now.premiumPaid)}`,
    '',
    `Más detalles en tu panel: ${(process.env.BASE_URL || 'https://laruletacaliente.com').replace(/\/$/, '')}/admin`,
    '',
    '— Informe automático de La Ruleta Caliente',
  ];
  return { subject: `Informe semanal: ${fmtNum(w.traffic.visitors)} visitantes, ${fmtNum(w.activity.conversations)} conversaciones`, text: lines.join('\n') };
}

// Semana del año (para enviar una sola vez por semana)
function weekId(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const y = t.getUTCFullYear();
  return `${y}-W${Math.ceil(((t - Date.UTC(y, 0, 1)) / 86400000 + 1) / 7)}`;
}

async function send(overview) {
  const r = build(overview);
  await mailer.sendAdminAlert(r.subject, r.text);
  return r;
}

function start(overview) {
  if (!ON) return;
  const tick = async () => {
    if (!mailer.enabled || !process.env.ADMIN_EMAIL) return;
    const madrid = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
    if (madrid.getDay() !== 1 || madrid.getHours() < 9) return;
    const week = weekId(madrid);
    const s = store.get('settings', 'weeklyReport');
    if (s?.week === week) return;
    store.put('settings', { id: 'weeklyReport', week, at: Date.now() });
    try { await send(overview); console.log('[informe] informe semanal enviado'); } catch (err) { console.error('[informe] no se pudo enviar:', err.message); }
  };
  setInterval(tick, 15 * 60 * 1000).unref();
  setTimeout(tick, 60 * 1000).unref();
}

module.exports = { build, send, start };
