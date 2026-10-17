// Panel de administración: resumen (ingresos, suscripciones, usuarios, actividad),
// denuncias, avisos DSA, recursos, mensajes, usuarios, anuncio general y seguridad.
const $ = (id) => document.getElementById(id);
let adminToken = sessionStorage.getItem('admin-token') || '';
let view = 'overview';
let listStatus = 'open';
const genders = { mujer: 'Mujer', hombre: 'Hombre', trans: 'Transexual', pareja: 'Pareja' };
const ageLabels = { none: 'sin verificar', pending: 'en revisión', approved: '✅ verificada', declined: '❌ rechazada', retry: 'repetir', underage: '⛔ MENOR' };
const fmt = (ms) => new Date(ms).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eur = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n || 0);
const int = (n) => new Intl.NumberFormat('es-ES').format(n || 0);
const mins = (s) => (s >= 60 ? `${Math.round(s / 60)} min` : `${s || 0} s`);
const REASON_CODES = { moderation: 'Incumplir las normas', burlas: 'Burlas o insultos', acoso: 'Acoso', homofobia: 'Homofobia o transfobia', grabacion: 'Grabación o capturas', menor: 'Parece menor de edad', ilegal: 'Contenido ilegal', fraud: 'Uso fraudulento', chargeback: 'Contracargo' };

function toast(text) {
  $('toast').textContent = text; $('toast').hidden = false;
  setTimeout(() => { $('toast').hidden = true; }, 3000);
}

async function api(path, body) {
  const r = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: { 'x-admin-token': adminToken, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (r.status === 403) { showLogin(''); throw new Error('forbidden'); }
  return r.json();
}

function showLogin(error) {
  $('login').hidden = false; $('panel').hidden = true;
  $('loginError').textContent = error; $('loginError').hidden = !error;
}

$('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const r = await fetch('/api/admin/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: $('adminKey').value, code: $('adminCode').value.trim() || undefined }),
  });
  const res = await r.json().catch(() => ({}));
  if (res.needCode) { $('codeField').hidden = false; $('adminCode').focus(); }
  if (!res.token) { showLogin(res.needCode && !$('adminCode').value ? '' : (res.error || 'No se pudo entrar')); return; }
  adminToken = res.token;
  sessionStorage.setItem('admin-token', adminToken);
  $('adminKey').value = ''; $('adminCode').value = '';
  start();
});

async function start() {
  $('login').hidden = true; $('panel').hidden = false;
  await counts().catch(() => {});
  show(view);
}

async function counts() {
  const s = await api('/api/admin/summary');
  const o = await api('/api/admin/stats?days=7');
  $('cReports').textContent = s.reportsOpen || '';
  $('cNotice').textContent = o.open.notice || '';
  $('cAppeal').textContent = o.open.appeal || '';
  $('cContact').textContent = o.open.contact || '';
}

// ---------- Resumen ----------
const tile = (value, label, note) => `<div class="tile"><b>${value}</b><span>${esc(label)}</span>${note ? `<small>${esc(note)}</small>` : ''}</div>`;

function barChart(title, series, key, format) {
  const vals = series.map((d) => d[key] || 0);
  const max = Math.max(1, ...vals);
  const W = 600; const H = 150; const pad = { l: 34, r: 4, t: 8, b: 20 };
  const bw = (W - pad.l - pad.r) / series.length;
  const y = (v) => H - pad.b - (v / max) * (H - pad.t - pad.b);
  const total = vals.reduce((a, b) => a + b, 0);
  const label = (d) => new Date(`${d}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  const bars = series.map((d, i) => {
    const v = vals[i];
    const x = pad.l + i * bw;
    const h = H - pad.b - y(v);
    const w = Math.max(1, bw - 2);
    const r = Math.min(4, w / 2, h);
    const top = y(v);
    const path = h > 0 ? `M${x},${H - pad.b} V${top + r} Q${x},${top} ${x + r},${top} H${x + w - r} Q${x + w},${top} ${x + w},${top + r} V${H - pad.b} Z` : '';
    return `<g data-tip="${esc(label(d.day))}: ${esc(format(v))}"><rect class="hit" x="${x}" y="${pad.t}" width="${bw}" height="${H - pad.t - pad.b}"></rect>${path ? `<path class="bar" d="${path}"></path>` : ''}</g>`;
  }).join('');
  const grid = [0, 0.5, 1].map((f) => {
    const v = max * f; const yy = y(v);
    return `<line class="grid" x1="${pad.l}" x2="${W - pad.r}" y1="${yy}" y2="${yy}"></line><text class="axis" x="${pad.l - 6}" y="${yy + 3}" text-anchor="end">${esc(format(Math.round(v * 100) / 100, true))}</text>`;
  }).join('');
  const xl = `<text class="axis" x="${pad.l}" y="${H - 4}">${esc(label(series[0].day))}</text><text class="axis" x="${W - pad.r}" y="${H - 4}" text-anchor="end">${esc(label(series[series.length - 1].day))}</text>`;
  const rows = series.map((d, i) => `<tr><td>${esc(d.day)}</td><td class="num">${esc(format(vals[i]))}</td></tr>`).join('');
  return `<div class="chart"><h3>${esc(title)}</h3><p class="total">Total: ${esc(format(total))}</p>
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(title)}">${grid}${bars}${xl}</svg>
    <details><summary>Ver como tabla</summary><div class="table-wrap"><table class="data"><tr><th>Día</th><th>Valor</th></tr>${rows}</table></div></details></div>`;
}

function breakdown(title, entries, format = int) {
  const max = Math.max(1, ...entries.map((e) => e[1]));
  const rows = entries.length ? entries.map(([k, v]) => `<div class="bd-row"><span>${esc(k)}</span><span class="v">${esc(format(v))}</span><div class="track"><div class="fill" style="width:${(v / max) * 100}%"></div></div></div>`).join('') : '<p class="meta">Sin datos todavía</p>';
  return `<div class="bd"><h3>${esc(title)}</h3>${rows}</div>`;
}

const countryName = (cc) => { try { return cc === '??' ? 'Desconocido' : new Intl.DisplayNames(['es'], { type: 'region' }).of(cc); } catch { return cc; } };
const langNames = { es: 'Español', en: 'Inglés', pt: 'Portugués', fr: 'Francés', de: 'Alemán', it: 'Italiano' };
const pageNames = { home: 'Portada', help: 'Ayuda', contact: 'Contacto', rules: 'Normas', terms: 'Condiciones', privacy: 'Privacidad', legal: 'Aviso legal', refunds: 'Reembolsos', report: 'Denunciar contenido', about: 'Sobre nosotros', cookies: 'Cookies' };
const methodNames = { email: 'Email', google: 'Google', apple: 'Apple', facebook: 'Facebook' };

async function renderOverview() {
  const o = await api(`/api/admin/stats?days=${$('period').value}`);
  const m = o.money; const u = o.users;
  const modeText = { free: 'Modo lanzamiento: Premium es gratis para todos y no se cobra nada. Los ingresos aparecerán cuando actives Segpay.', demo: 'Modo de prueba: los pagos se simulan. Los cobros de prueba no cuentan como ingresos.' }[o.mode];
  $('modeNote').hidden = !modeText; $('modeNote').textContent = modeText || '';
  $('tilesNow').innerHTML = [
    tile(int(o.now.connected), 'Conectados ahora'),
    tile(int(o.now.inChat), 'En una videollamada'),
    tile(int(o.now.premiumPaid), 'Premium de pago activos', o.now.premiumDemo ? `+${o.now.premiumDemo} de prueba` : ''),
    tile(int(u.total), 'Usuarios registrados', `+${int(u.new)} en el periodo`),
    tile(int(o.traffic.visitors), 'Visitantes únicos', `${int(o.traffic.views)} páginas vistas`),
    tile(`${u.visitorToSignup} %`, 'Visitantes que se registran'),
    tile(int(o.activity.conversations), 'Conversaciones', `media ${mins(o.activity.avgConv)}`),
    tile(int(o.activity.peakOnline), 'Máximo a la vez'),
  ].join('');
  $('tilesMoney').innerHTML = [
    tile(eur(m.revenue), 'Ingresos del periodo'),
    tile(eur(m.net), 'Neto', `después de ${eur(-m.refunds)} en devoluciones`),
    tile(eur(m.mrr), 'Ingreso mensual recurrente', 'suscripciones con tarjeta activas'),
    tile(eur(m.total), 'Ingresos totales'),
    tile(int(m.newSubs), 'Nuevas suscripciones'),
    tile(int(m.renewals), 'Renovaciones'),
    tile(int(m.cancels), 'Bajas'),
    tile(int(m.refundsCount + m.chargebacks), 'Reembolsos y contracargos', `${m.chargebacks} contracargos`),
    tile(`${m.conversion} %`, 'Usuarios que han pagado'),
    tile(eur(m.arpu), 'Ingreso medio por usuario'),
  ].join('');
  const s = o.series;
  $('charts').innerHTML = [
    barChart('Ingresos por día', s, 'revenue', (v) => eur(v)),
    barChart('Visitantes por día', s, 'visitors', int),
    barChart('Registros por día', s, 'signups', int),
    barChart('Conversaciones por día', s, 'conversations', int),
    barChart('Nuevas suscripciones por día', s, 'newSubs', int),
    barChart('Máximo de gente conectada a la vez', s, 'peakOnline', int),
  ].join('');
  const plan = { week: 'Semanal', month: 'Mensual' };
  $('breakdowns').innerHTML = [
    breakdown('Premium activo por plan', Object.entries(m.activeByPlan).map(([k, v]) => [plan[k], v])),
    breakdown('Premium activo por forma de pago', Object.entries(m.activeByMethod).map(([k, v]) => [k === 'card' ? 'Tarjeta / Google Pay / Apple Pay' : 'Criptomonedas', v])),
    breakdown('Países (visitantes)', o.traffic.countries.map(([k, v]) => [countryName(k), v])),
    breakdown('Páginas más vistas', o.traffic.pages.map(([k, v]) => [pageNames[k] || k, v])),
    breakdown('Dispositivo', o.traffic.devices.map(([k, v]) => [k === 'mobile' ? 'Móvil' : 'Ordenador', v])),
    breakdown('Idioma de la web', o.traffic.langs.map(([k, v]) => [langNames[k] || k, v])),
    breakdown('Cómo se registran', u.signupMethods.map(([k, v]) => [methodNames[k] || k, v])),
    breakdown('Usuarios por tipo', Object.entries(u.genders).map(([k, v]) => [genders[k], v])),
    breakdown('Usuarios por edad', Object.entries(u.ageGroups).map(([k, v]) => [k === '?' ? 'Sin fecha' : k, v])),
    breakdown('Denuncias por motivo', o.moderation.byReason.map(([k, v]) => [REASON_CODES[k] || k, v])),
    breakdown('Transparencia (DSA)', [['Avisos recibidos', o.moderation.notices], ['Avisos con medidas', o.moderation.noticesActioned], ['Recursos', o.moderation.appeals], ['Recursos aceptados', o.moderation.appealsAccepted], ['Mensajes de contacto', o.moderation.messages], ['Denuncias en el chat', o.moderation.reports]]),
    breakdown('Cuentas', [['Email confirmado', u.verifiedEmail], ['Suspendidas', u.suspended], ['Expulsadas', u.banned]]),
  ].join('');
  const types = { new: 'Alta', renewal: 'Renovación', refund: 'Reembolso', chargeback: 'Contracargo', void: 'Anulado', cancel: 'Baja' };
  $('payments').innerHTML = `<tr><th>Fecha</th><th>Tipo</th><th>Usuario</th><th>Plan</th><th>Pago</th><th class="num">Importe</th></tr>` + (o.recentPayments.map((p) => `<tr><td>${fmt(p.at)}</td><td>${types[p.type] || p.type}${p.demo ? ' (prueba)' : ''}</td><td>${esc(p.email)}</td><td>${plan[p.plan] || ''}</td><td>${p.method === 'crypto' ? 'Cripto' : 'Tarjeta'}</td><td class="num">${eur(p.amount)}</td></tr>`).join('') || '<tr><td colspan="6" class="meta">Todavía no hay pagos</td></tr>');
}

// Tooltip de las gráficas
document.addEventListener('mousemove', (e) => {
  const g = e.target.closest?.('[data-tip]');
  const tip = $('chartTip');
  if (!g) { tip.hidden = true; return; }
  tip.textContent = g.dataset.tip; tip.hidden = false;
  tip.style.left = `${Math.min(e.clientX + 12, innerWidth - tip.offsetWidth - 8)}px`;
  tip.style.top = `${e.clientY - 36}px`;
});

// ---------- Denuncias y usuarios ----------
function userLine(u, label) {
  if (!u) return `<p class="meta">${label}: (cuenta borrada)</p>`;
  const state = u.status === 'banned' ? '<span class="tag red">Expulsado</span>'
    : u.suspendedUntil ? `<span class="tag gold">Suspendido hasta ${fmt(u.suspendedUntil)}</span>` : '';
  const caps = u.captureAttempts ? ` · <span class="tag red">📸 ${u.captureAttempts} capturas</span>` : '';
  return `<p class="meta">${label}: <b>${esc(u.email)}</b> · código ${esc(u.code)} · ${genders[u.gender] || ''} · ${u.reportsReceived} denuncias recibidas ${state}${caps}</p>`;
}

function reportCard(r) {
  const chat = (r.chat || []).map((m) => {
    const who = m.from === r.reportedId ? '<span class="who reported">Denunciado</span>' : '<span class="who">Denunciante</span>';
    return `<p>${who}: ${esc(m.text)}</p>`;
  }).join('') || '<p class="muted">Sin mensajes de texto</p>';
  const actions = r.status === 'open' ? `
    <div class="actions">
      <button class="btn ghost sm" data-report="${r.id}" data-action="dismiss">Descartar</button>
      <button class="btn ghost sm" data-report="${r.id}" data-action="suspend" data-days="1">Suspender 1 día</button>
      <button class="btn ghost sm" data-report="${r.id}" data-action="suspend" data-days="7">Suspender 7 días</button>
      <button class="btn primary sm" data-report="${r.id}" data-action="ban">Expulsar</button>
    </div>` : `<p class="meta">Resuelta: ${esc(r.action)} · ${r.resolvedAt ? fmt(r.resolvedAt) : ''}</p>`;
  return `
    <article class="item ${r.urgent ? 'urgent' : ''}">
      <div class="item-head">
        <span class="tag ${r.urgent ? 'red' : ''}">${esc(r.reasonLabel)}${r.urgent ? ' · URGENTE' : ''}</span>
        <span class="meta">${fmt(r.createdAt)}</span>
      </div>
      ${userLine(r.reported, 'Denunciado')}
      ${userLine(r.reporter, 'Denunciante')}
      ${r.comment ? `<div class="quote">${esc(r.comment)}</div>` : ''}
      <div class="log">${chat}</div>
      ${actions}
    </article>`;
}

function userCard(u) {
  const state = u.status === 'banned' ? '<span class="tag red">Expulsado</span>'
    : u.suspendedUntil ? `<span class="tag gold">Suspendido hasta ${fmt(u.suspendedUntil)}</span>` : '<span class="tag">Activo</span>';
  const restricted = u.status === 'banned' || u.suspendedUntil;
  const reasonSelect = `<select class="reason-pick" data-user="${u.id}">${Object.entries(REASON_CODES).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select>`;
  return `
    <article class="item">
      <div class="item-head"><b>${esc(u.email)}</b>${u.nick ? ` · «${esc(u.nick)}»` : ''}${state}</div>
      <p class="meta">Código <b>${esc(u.code)}</b> · ${genders[u.gender] || ''} · registrado el ${fmt(u.createdAt)} · ${u.reportsReceived} denuncias (${u.reportsOpen} pendientes)${u.declaredAge !== null ? ` · ${u.declaredAge} años` : ''} · Edad: ${ageLabels[u.age] || u.age}${u.ageCheck && u.age !== 'approved' ? ' · <b>⚠️ debe verificar su edad</b>' : ''}${u.captureAttempts ? ` · 📸 ${u.captureAttempts} intentos de captura` : ''}${u.rep && u.rep.up + u.rep.down ? ` · Volverían a hablar: <b>${Math.round((100 * u.rep.up) / (u.rep.up + u.rep.down))} %</b> (${u.rep.up + u.rep.down})${u.rep.up + u.rep.down >= 10 && u.rep.down / (u.rep.up + u.rep.down) > 0.6 ? ' ⚠️ sale al final de la cola' : ''}` : ''}${u.spicy ? ' · 🌶️ modo picante' : ''}${u.piropos ? ` · ${u.piropos} piropos recibidos` : ''}</p>
      <div class="actions">
        ${u.nick ? `<button class="btn ghost sm" data-user="${u.id}" data-action="clearNick">Quitar nombre</button>` : ''}
        ${u.age === 'approved' ? '' : u.ageCheck
    ? `<button class="btn ghost sm" data-user="${u.id}" data-action="clearAge">Ya no pedir verificación</button>`
    : `<button class="btn ghost sm" data-user="${u.id}" data-action="requireAge">Pedir verificación de edad</button>`}
        ${restricted ? `<button class="btn ghost sm" data-user="${u.id}" data-action="restore">Readmitir</button>` : `
        <label class="meta">Motivo ${reasonSelect}</label>
        <button class="btn ghost sm" data-user="${u.id}" data-action="suspend" data-days="1">Suspender 1 día</button>
        <button class="btn ghost sm" data-user="${u.id}" data-action="suspend" data-days="7">Suspender 7 días</button>
        <button class="btn primary sm" data-user="${u.id}" data-action="ban">Expulsar</button>`}
      </div>
    </article>`;
}

// ---------- Avisos DSA, recursos y mensajes ----------
const KIND_TITLE = { notice: 'Aviso de contenido ilegal', appeal: 'Recurso de sanción', contact: 'Mensaje de contacto' };
const NOTICE_CAT = { minors: 'Menores', nonconsensual: 'Imágenes sin consentimiento', violence: 'Violencia o amenazas', hate: 'Odio o discriminación', harassment: 'Acoso', ip: 'Derechos de autor o imagen', fraud: 'Fraude o suplantación', other: 'Otro' };
const CONTACT_CAT = { support: 'Ayuda', account: 'Cuenta', billing: 'Pagos', privacy: 'Privacidad', report: 'Problema con usuario', press: 'Prensa', authorities: 'Autoridades', other: 'Otro' };

function ticketCard(t) {
  const head = t.kind === 'notice' ? `${NOTICE_CAT[t.category] || t.category}${t.urgent ? ' · URGENTE' : ''}`
    : t.kind === 'contact' ? CONTACT_CAT[t.category] || t.category
      : `${t.restriction?.type === 'banned' ? 'Expulsión' : 'Suspensión'} · ${REASON_CODES[t.restriction?.reason] || t.restriction?.reason || ''}`;
  const who = t.kind === 'appeal'
    ? `<p class="meta">Cuenta: <b>${esc(t.email)}</b>${t.user?.status === 'banned' ? ' <span class="tag red">Expulsada</span>' : t.user?.suspendedUntil > Date.now() ? ` <span class="tag gold">Suspendida hasta ${fmt(t.user.suspendedUntil)}</span>` : ' <span class="tag">Activa</span>'}</p>`
    : `<p class="meta">De: <b>${esc(t.name || '—')}</b> &lt;${esc(t.email || 'sin email')}&gt;${t.userId ? ' · con sesión' : ''}</p>`;
  const extra = t.kind === 'notice'
    ? `<p class="meta">Cuenta o código: <b>${esc(t.accountCode || '—')}</b> · Dónde: ${esc(t.location || '—')}</p>` : '';
  const text = t.message || t.explanation || '';
  const decisions = t.kind === 'appeal'
    ? `<label class="meta"><input type="radio" name="dec-${t.id}" value="accept"> Aceptar (readmitir la cuenta)</label> <label class="meta"><input type="radio" name="dec-${t.id}" value="reject"> Rechazar (mantener la sanción)</label>`
    : t.kind === 'notice'
      ? `<label class="meta"><input type="radio" name="dec-${t.id}" value="action"> He tomado medidas</label> <label class="meta"><input type="radio" name="dec-${t.id}" value="noAction" checked> Sin medidas</label>` : '';
  const actions = t.status === 'open' ? `
      <label class="field">Respuesta (se envía por email${t.email ? ` a ${esc(t.email)}` : ''})<textarea id="resp-${t.id}" rows="3"></textarea></label>
      <div class="actions">${decisions}</div>
      <div class="actions"><button class="btn primary sm" data-ticket="${t.id}" data-kind="${t.kind}" data-action="close">Responder y cerrar</button>
      ${t.email ? `<span class="meta">o escribe directamente a <b>${esc(t.email)}</b></span>` : ''}</div>`
    : `<p class="meta">Cerrado ${t.closedAt ? fmt(t.closedAt) : ''}${t.decision ? ` · ${esc({ accept: 'aceptado', reject: 'rechazado', action: 'con medidas', noAction: 'sin medidas' }[t.decision])}` : ''}</p>
      ${t.response ? `<div class="quote">${esc(t.response)}</div>` : ''}
      <div class="actions"><button class="btn ghost sm" data-ticket="${t.id}" data-action="reopen">Reabrir</button></div>`;
  return `<article class="item ${t.urgent ? 'urgent' : ''}">
    <div class="item-head"><span class="tag ${t.urgent ? 'red' : ''}">${esc(KIND_TITLE[t.kind])} · ${esc(head)}</span><span class="meta">${esc(t.reference)} · ${fmt(t.createdAt)}</span></div>
    ${who}${extra}<div class="quote">${esc(text)}</div>${actions}</article>`;
}

// ---------- Anuncio y seguridad ----------
async function renderAnnounce() {
  const { announcement: a } = await api('/api/admin/announcement');
  $('annEs').value = a?.text?.es || ''; $('annEn').value = a?.text?.en || '';
  $('annLevel').value = a?.level || 'info';
  $('annCurrent').textContent = a ? `Publicado ${fmt(a.version)}${a.until ? ` · se quita el ${fmt(a.until)}` : ''}` : 'No hay ningún anuncio publicado.';
}
$('announceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  await api('/api/admin/announcement', { es: $('annEs').value, en: $('annEn').value, level: $('annLevel').value, days: Number($('annDays').value) });
  toast('Anuncio publicado'); renderAnnounce();
});
$('annRemove').addEventListener('click', async () => {
  await api('/api/admin/announcement', { es: '' });
  toast('Anuncio quitado'); renderAnnounce();
});

// ---------- Publicidad ----------
const MODE_NAMES = { off: 'Desactivado', own: 'Mis anunciantes', network: 'Red publicitaria' };
const day = (ts) => (ts ? new Date(ts).toLocaleDateString('es-ES') : '');
async function renderAds() {
  const { slots, banners } = await api('/api/admin/ads');
  $('adSlots').innerHTML = Object.entries(slots).map(([k, v]) => `
    <div class="ad-row" data-slot="${k}">
      <label class="field">${esc(v.name)}
        <select class="ad-mode">${Object.entries(MODE_NAMES).map(([m, n]) => `<option value="${m}" ${v.mode === m ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <label class="field ad-code" ${v.mode === 'network' ? '' : 'hidden'}>Código de la red para este hueco (${v.w}×${v.h})
        <textarea class="ad-code-text" rows="4" spellcheck="false" placeholder="&lt;script …&gt;&lt;/script&gt; &lt;ins …&gt;&lt;/ins&gt;">${esc(v.code)}</textarea></label>
    </div>`).join('');
  $('adSlot').innerHTML = Object.entries(slots).map(([k, v]) => `<option value="${k}">${esc(v.name)}</option>`).join('');
  $('adList').innerHTML = banners.map((b) => `<tr>
      <td><img src="/ads/img/${b.id}?v=${b.updatedAt || b.createdAt}" alt="" style="max-width:120px;max-height:60px;display:block;border-radius:4px"></td>
      <td><b>${esc(b.advertiser)}</b><br><a class="link" href="${esc(b.url)}" target="_blank" rel="noopener noreferrer">${esc(b.url.replace(/^https?:\/\//, '').slice(0, 40))}</a></td>
      <td>${esc(slots[b.slot]?.name.split(' (')[0] || b.slot)}</td>
      <td>${b.startsAt || b.endsAt ? `${day(b.startsAt) || '…'} – ${day(b.endsAt) || '…'}` : 'Siempre'}</td>
      <td class="num">${int(b.impressions || 0)}</td><td class="num">${int(b.clicks || 0)}</td>
      <td class="num">${b.impressions ? ((100 * (b.clicks || 0)) / b.impressions).toFixed(2) : '0.00'} %</td>
      <td><button class="btn ghost sm" data-ad="${b.id}" data-active="${b.active ? 0 : 1}">${b.active ? 'Pausar' : 'Activar'}</button>
        <button class="btn ghost sm" data-ad="${b.id}" data-del="1">Borrar</button></td></tr>`).join('')
    || '<tr><td colspan="8" class="muted">Todavía no hay banners.</td></tr>';
}
$('adSlots').addEventListener('change', (e) => {
  const row = e.target.closest('.ad-row');
  if (row && e.target.matches('.ad-mode')) row.querySelector('.ad-code').hidden = e.target.value !== 'network';
});
$('adSlotsForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const slots = {};
  document.querySelectorAll('.ad-row').forEach((r) => { slots[r.dataset.slot] = { mode: r.querySelector('.ad-mode').value, code: r.querySelector('.ad-code-text').value }; });
  await api('/api/admin/ads/slots', { slots });
  toast('Huecos guardados'); renderAds();
});
$('adBannerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const showErr = (m) => { $('adError').textContent = m; $('adError').hidden = !m; };
  showErr('');
  const file = $('adImage').files[0];
  if (!file) return showErr('Elige la imagen del banner');
  if (file.size > 400 * 1024) return showErr('La imagen pesa demasiado (máx. 400 KB)');
  const image = await new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(file); });
  const res = await api('/api/admin/ads/banners', {
    slot: $('adSlot').value, advertiser: $('adAdvertiser').value, url: $('adUrl').value.trim(),
    start: $('adStart').value, end: $('adEnd').value, weight: Number($('adWeight').value), image,
  });
  if (!res.ok) return showErr(res.error || 'No se pudo guardar');
  e.target.reset(); toast('Banner añadido'); renderAds();
});
$('adList').addEventListener('click', async (e) => {
  const b = e.target.closest('button[data-ad]');
  if (!b) return;
  if (b.dataset.del && !confirm('¿Borrar este banner? Se pierden sus estadísticas.')) return;
  await api(`/api/admin/ads/banners/${b.dataset.ad}`, b.dataset.del ? { action: 'delete' } : { active: b.dataset.active === '1' });
  renderAds();
});

async function renderSecurity() {
  const s = await api('/api/admin/security');
  $('tfaState').textContent = s.twoFactor
    ? '✅ Activada: para entrar hace falta la contraseña y el código de tu app.'
    : '⚠️ Desactivada. Actívala: así, aunque alguien consiga tu contraseña, no podrá entrar sin tu móvil.';
  $('tfaStart').hidden = s.twoFactor; $('tfaDisable').hidden = !s.twoFactor;
  $('tfaCode').hidden = !s.twoFactor; $('tfaConfirm').hidden = true; $('tfaSetup').hidden = true;
  $('auditLog').innerHTML = '<tr><th>Fecha</th><th>Acción</th><th>Detalle</th><th>IP</th></tr>' + (s.log.map((l) => `<tr><td>${fmt(l.at)}</td><td>${esc(l.action)}</td><td>${esc(l.detail)}</td><td>${esc(l.ip)}</td></tr>`).join('') || '<tr><td colspan="4" class="meta">Sin actividad</td></tr>');
}
$('tfaStart').addEventListener('click', async () => {
  const r = await api('/api/admin/2fa/setup', {});
  if (r.error) return toast(r.error);
  $('tfaQr').innerHTML = r.qr; $('tfaSecret').textContent = r.secret;
  $('tfaSetup').hidden = false; $('tfaCode').hidden = false; $('tfaConfirm').hidden = false; $('tfaStart').hidden = true;
  $('tfaCode').focus();
});
$('tfaConfirm').addEventListener('click', async () => {
  const r = await api('/api/admin/2fa/enable', { code: $('tfaCode').value });
  if (!r.ok) return toast(r.error || 'Código incorrecto');
  adminToken = r.token; sessionStorage.setItem('admin-token', adminToken);
  $('tfaCode').value = ''; toast('Verificación en dos pasos activada'); renderSecurity();
});
$('tfaDisable').addEventListener('click', async () => {
  if (!confirm('¿Desactivar la verificación en dos pasos?')) return;
  const r = await api('/api/admin/2fa/disable', { code: $('tfaCode').value });
  if (!r.ok) return toast(r.error || 'Escribe el código de tu app');
  adminToken = r.token; sessionStorage.setItem('admin-token', adminToken);
  $('tfaCode').value = ''; toast('Verificación en dos pasos desactivada'); renderSecurity();
});
$('logoutAllAdmin').addEventListener('click', async () => {
  if (!confirm('¿Cerrar todas las sesiones del panel, también esta?')) return;
  await api('/api/admin/logout-all', {});
  sessionStorage.removeItem('admin-token'); adminToken = ''; showLogin('');
});

// ---------- Navegación ----------
async function renderList() {
  const isTickets = ['notice', 'appeal', 'contact'].includes(view);
  $('statusBar').hidden = view === 'users';
  $('userSearch').hidden = view !== 'users';
  document.querySelectorAll('[data-status]').forEach((b) => b.classList.toggle('statusbar-active', b.dataset.status === listStatus));
  let html;
  if (view === 'users') {
    const users = await api(`/api/admin/users?q=${encodeURIComponent($('q').value)}`);
    html = users.map(userCard).join('') || '<p class="empty">No hay usuarios</p>';
  } else if (isTickets) {
    const list = await api(`/api/admin/tickets?kind=${view}&status=${listStatus}`);
    html = list.map(ticketCard).join('') || '<p class="empty">Nada pendiente 🎉</p>';
  } else {
    const list = await api(`/api/admin/reports?status=${listStatus}`);
    html = list.map(reportCard).join('') || '<p class="empty">No hay denuncias 🎉</p>';
  }
  $('list').innerHTML = html;
}

async function show(v) {
  view = v;
  document.querySelectorAll('[data-view]').forEach((x) => x.classList.toggle('active', x.dataset.view === v));
  const sections = { overview: 'overviewView', announce: 'announceView', ads: 'adsView', security: 'securityView', reveal: 'revealView' };
  for (const id of ['overviewView', 'listView', 'announceView', 'adsView', 'securityView', 'revealView']) $(id).hidden = true;
  $(sections[v] || 'listView').hidden = false;
  try {
    if (v === 'overview') await renderOverview();
    else if (v === 'announce') await renderAnnounce();
    else if (v === 'ads') await renderAds();
    else if (v === 'security') await renderSecurity();
    else if (v !== 'reveal') await renderList();
  } catch { /* sin sesión: se muestra el acceso */ }
}

document.querySelectorAll('[data-view]').forEach((t) => t.addEventListener('click', () => { listStatus = 'open'; show(t.dataset.view); }));
document.querySelectorAll('[data-status]').forEach((b) => b.addEventListener('click', () => { listStatus = b.dataset.status; renderList(); }));
$('period').addEventListener('change', renderOverview);
$('reload').addEventListener('click', () => { counts().catch(() => {}); renderOverview(); });
$('qBtn').addEventListener('click', renderList);
$('q').addEventListener('keydown', (e) => { if (e.key === 'Enter') renderList(); });

$('list').addEventListener('click', async (e) => {
  const b = e.target.closest('button[data-action]');
  if (!b) return;
  const { action, days } = b.dataset;
  if (b.dataset.ticket) {
    const id = b.dataset.ticket;
    const decision = document.querySelector(`input[name="dec-${id}"]:checked`)?.value;
    if (action === 'close' && b.dataset.kind === 'appeal' && !decision) return toast('Elige aceptar o rechazar');
    b.disabled = true;
    const res = await api(`/api/admin/tickets/${id}`, { action, decision, response: $(`resp-${id}`)?.value || '' });
    toast(res.error || (action === 'reopen' ? 'Reabierto' : 'Respondido y cerrado'));
  } else {
    if (action === 'ban' && !confirm('¿Expulsar a este usuario de forma definitiva?')) return;
    b.disabled = true;
    const reason = b.dataset.user ? document.querySelector(`.reason-pick[data-user="${b.dataset.user}"]`)?.value : undefined;
    const path = b.dataset.report ? `/api/admin/reports/${b.dataset.report}` : `/api/admin/users/${b.dataset.user}`;
    const res = await api(path, { action, days: Number(days) || undefined, reason });
    toast(res.error || 'Hecho');
  }
  counts().catch(() => {});
  renderList();
});

if (adminToken) start(); else showLogin('');

// ---------- Revelar la marca de agua ----------
// La marca cambia los píxeles solo unos pocos niveles. Se quita la imagen "de
// fondo" (desenfocada) y se amplifica la diferencia: el texto aparece.
let revealSource = null;

let revealGray = null; // imagen en grises (promedio de fotogramas si es vídeo)
let revealSize = null;

function grayOf(src, w, h, ctx) {
  ctx.drawImage(src, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  const g = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) g[i] = (d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2]) / 3;
  return g;
}

// En vídeo se promedian ~40 fotogramas de los 4 s siguientes: la marca está
// quieta y el ruido de la compresión no, así que el texto sale más claro
async function revealCapture() {
  if (!revealSource) return;
  const src = revealSource;
  const sw = src.videoWidth || src.naturalWidth;
  const sh = src.videoHeight || src.naturalHeight;
  const scale = Math.min(1, 1600 / sw);
  const w = Math.round(sw * scale), h = Math.round(sh * scale);
  const canvas = $('revealCanvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!src.videoWidth) {
    revealGray = grayOf(src, w, h, ctx);
  } else {
    const start = src.currentTime;
    const end = Math.min(src.duration || start, start + 4);
    const acc = new Float32Array(w * h);
    let n = 0;
    for (let t = start; n === 0 || t <= end; t += 0.1) {
      src.currentTime = t;
      await new Promise((r) => { src.onseeked = r; setTimeout(r, 1000); });
      const g = grayOf(src, w, h, ctx);
      for (let i = 0; i < acc.length; i++) acc[i] += g[i];
      n++;
      if (end <= start) break;
    }
    for (let i = 0; i < acc.length; i++) acc[i] /= n;
    revealGray = acc;
    src.currentTime = start;
  }
  revealSize = { w, h };
  revealDraw();
}

function revealDraw() {
  if (!revealGray) return;
  const { w, h } = revealSize;
  const canvas = $('revealCanvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const gray = revealGray;
  // desenfoque por caja con imagen integral
  const r = 7;
  const integral = new Float64Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) {
    let row = 0;
    for (let x = 0; x < w; x++) {
      row += gray[y * w + x];
      integral[(y + 1) * (w + 1) + x + 1] = integral[y * (w + 1) + x + 1] + row;
    }
  }
  const gain = Number($('revealGain').value);
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1);
      const sum = integral[y1 * (w + 1) + x1] - integral[y0 * (w + 1) + x1] - integral[y1 * (w + 1) + x0] + integral[y0 * (w + 1) + x0];
      const blur = sum / ((x1 - x0) * (y1 - y0));
      const v = Math.max(0, Math.min(255, 128 + (gray[y * w + x] - blur) * gain));
      const i = (y * w + x) * 4;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

$('revealFile').addEventListener('change', () => {
  const file = $('revealFile').files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  if (file.type.startsWith('video/')) {
    const v = $('revealVideo');
    v.src = url; v.hidden = false; $('revealFrame').hidden = false;
    v.onloadeddata = () => { revealSource = v; revealCapture(); };
  } else {
    $('revealVideo').hidden = true; $('revealFrame').hidden = true;
    const img = new Image();
    img.onload = () => { revealSource = img; revealCapture(); };
    img.src = url;
  }
});
$('revealFrame').addEventListener('click', revealCapture);
$('revealGain').addEventListener('input', revealDraw);
