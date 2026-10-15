// Panel de moderación
const $ = (id) => document.getElementById(id);
let key = sessionStorage.getItem('admin-key') || '';
let view = 'reports-open';
let reasons = {};
const genders = { mujer: 'Mujer', hombre: 'Hombre', trans: 'Transexual', pareja: 'Pareja' };
const ageLabels = { none: 'sin verificar', pending: 'en revisión', approved: '✅ verificada', declined: '❌ rechazada', retry: 'repetir', underage: '⛔ MENOR' };
const fmt = (ms) => new Date(ms).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function toast(text) {
  $('toast').textContent = text; $('toast').hidden = false;
  setTimeout(() => { $('toast').hidden = true; }, 3000);
}

async function api(path, body) {
  const r = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: { 'x-admin-key': key, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (r.status === 403) { showLogin(true); throw new Error('forbidden'); }
  return r.json();
}

function showLogin(error) {
  $('login').hidden = false; $('panel').hidden = true; $('loginError').hidden = !error;
}

$('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  key = $('adminKey').value;
  try { await refresh(); sessionStorage.setItem('admin-key', key); } catch { /* error mostrado */ }
});

async function refresh() {
  const s = await api('/api/admin/summary');
  reasons = s.reasons;
  $('login').hidden = true; $('panel').hidden = false;
  $('sUrgent').textContent = s.reportsUrgent;
  $('sOpen').textContent = s.reportsOpen;
  $('sUsers').textContent = s.users;
  await render();
}

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
  return `
    <article class="item">
      <div class="item-head"><b>${esc(u.email)}</b>${u.nick ? ` · «${esc(u.nick)}»` : ''}${state}</div>
      <p class="meta">Código <b>${esc(u.code)}</b> · ${genders[u.gender] || ''} · registrado el ${fmt(u.createdAt)} · ${u.reportsReceived} denuncias (${u.reportsOpen} pendientes) · Edad: ${ageLabels[u.age] || u.age}${u.captureAttempts ? ` · 📸 ${u.captureAttempts} intentos de captura` : ''}</p>
      <div class="actions">
        ${u.nick ? `<button class="btn ghost sm" data-user="${u.id}" data-action="clearNick">Quitar nombre</button>` : ''}
        ${restricted ? `<button class="btn ghost sm" data-user="${u.id}" data-action="restore">Readmitir</button>` : `
        <button class="btn ghost sm" data-user="${u.id}" data-action="suspend" data-days="1">Suspender 1 día</button>
        <button class="btn ghost sm" data-user="${u.id}" data-action="suspend" data-days="7">Suspender 7 días</button>
        <button class="btn primary sm" data-user="${u.id}" data-action="ban">Expulsar</button>`}
      </div>
    </article>`;
}

async function render() {
  $('userSearch').hidden = view !== 'users';
  $('revealView').hidden = view !== 'reveal';
  $('list').hidden = view === 'reveal';
  if (view === 'reveal') return;
  let html;
  if (view === 'users') {
    const users = await api(`/api/admin/users?q=${encodeURIComponent($('q').value)}`);
    html = users.map(userCard).join('') || '<p class="empty">No hay usuarios</p>';
  } else {
    const list = await api(`/api/admin/reports?status=${view === 'reports-open' ? 'open' : 'closed'}`);
    html = list.map(reportCard).join('') || '<p class="empty">No hay denuncias 🎉</p>';
  }
  $('list').innerHTML = html;
}

document.querySelectorAll('[data-view]').forEach((t) => t.addEventListener('click', () => {
  view = t.dataset.view;
  document.querySelectorAll('[data-view]').forEach((x) => x.classList.toggle('active', x === t));
  render();
}));
$('qBtn').addEventListener('click', render);
$('q').addEventListener('keydown', (e) => { if (e.key === 'Enter') render(); });

$('list').addEventListener('click', async (e) => {
  const b = e.target.closest('button[data-action]');
  if (!b) return;
  const { action, days } = b.dataset;
  if (action === 'ban' && !confirm('¿Expulsar a este usuario de forma definitiva?')) return;
  b.disabled = true;
  const path = b.dataset.report ? `/api/admin/reports/${b.dataset.report}` : `/api/admin/users/${b.dataset.user}`;
  const res = await api(path, { action, days: Number(days) || undefined });
  toast(res.error || 'Hecho');
  refresh();
});

if (key) refresh().catch(() => {}); else showLogin(false);

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
