const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);
const { t } = window.I18N;
const localVideo = $('localVideo');
const remoteVideo = $('remoteVideo');
const messages = $('messages');
const chatInput = $('chatInput');

let socket = null;
let localStream = null;
let pc = null;
let iceConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
let pendingCandidates = [];
let running = false;
let connected = false;

let token = load('session');
let me = null;            // respuesta de /api/me
let premium = false;
let want = '';            // '' = todos
let pendingAction = null; // lo que quería hacer antes de iniciar sesión
let plans = null;         // planes Premium del servidor: { week, month }
let freeMode = false;     // lanzamiento: filtros gratis para todos (PREMIUM_MODE=free)
let selectedPlan = 'month';
let translateEnabled = false;
let partner = null;       // { gender, lang, likes }
let statusKey = { key: 'chat.pressStart' };

// ---------- Utilidades ----------
function load(key) { try { return localStorage.getItem(key) || ''; } catch { return ''; } }
function save(key, value) {
  try { value ? localStorage.setItem(key, value) : localStorage.removeItem(key); } catch { /* sin almacenamiento */ }
}

async function api(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  try {
    const r = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const data = await r.json().catch(() => ({}));
    return { status: r.status, ...data };
  } catch {
    return { status: 0, code: 'offline' };
  }
}

// Texto de error de una respuesta del servidor, en el idioma de la web
function errorText(res) {
  return res?.code ? t(`err.${res.code}`) : t('err.generic');
}

let toastTimer;
function toast(text) {
  const el = $('toast');
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 4000);
}

function openModal(id) { $(id).hidden = false; }

// Pone el cursor en un campo al abrir una ventana, salvo que la persona ya haya
// pulsado otro campo (si no, lo que escribe acabaría en el campo equivocado)
function focusSoon(id) {
  setTimeout(() => {
    const el = $(id);
    const modal = el.closest('.overlay');
    const active = document.activeElement;
    if (modal && active && active !== document.body && modal.contains(active)) return;
    el.focus();
  }, 50);
}
function closeModal(id) { $(id).hidden = true; }
function anyModalOpen() { return [...$$('.overlay')].some((o) => !o.hidden); }

$$('.overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (overlay.id === 'ageGate') return;
    if (e.target === overlay || e.target.closest('[data-close]')) overlay.hidden = true;
  });
});

const money = (n) => new Intl.NumberFormat(I18N.lang, { style: 'currency', currency: 'EUR' }).format(n);
const dateText = (ms, withTime) => new Date(ms).toLocaleString(I18N.lang, withTime
  ? { dateStyle: 'medium', timeStyle: 'short' }
  : { day: 'numeric', month: 'long' });

// ---------- Idioma ----------
function fillLangSelects() {
  $$('[data-lang-select]').forEach((sel) => {
    sel.innerHTML = I18N.SUPPORTED.map((l) => `<option value="${l}">${I18N.NAMES[l]}</option>`).join('');
    sel.value = I18N.lang;
    sel.onchange = () => I18N.setLang(sel.value);
  });
}

// Textos que dependen del estado y no se pueden marcar en el HTML
function renderDynamicTexts() {
  $$('[data-lang-select]').forEach((sel) => { sel.value = I18N.lang; });
  $('authSubmit').textContent = t(authMode === 'login' ? 'auth.submitLogin' : 'auth.submitSignup');
  $('statusText').textContent = t(statusKey.key, statusKey.vars);
  renderPlans();
  renderPartner();
  renderMyLikes();
  refreshOnline();
  if (!$('ageModal').hidden) renderAge();
  if (!$('accountModal').hidden) renderAccount();
  if (connected) renderWatermark();
}

document.addEventListener('langchange', () => {
  renderDynamicTexts();
  // El chat se traduce al idioma elegido: el servidor lo sabe al reconectar
  if (socket?.connected && !connected) { socket.disconnect().connect(); }
});

// ---------- Aviso de edad ----------
if (!load('age-ok')) openModal('ageGate');
$('ageYes').addEventListener('click', () => { save('age-ok', '1'); closeModal('ageGate'); });

// ---------- Antibots (Cloudflare Turnstile, solo si está configurado) ----------
let turnstileKey = null;
const captchaWidgets = {};
const captchaTokens = {};
let turnstileLoading = null;

function loadTurnstile() {
  turnstileLoading ||= new Promise((resolve) => {
    const sc = document.createElement('script');
    sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    sc.async = true;
    sc.onload = resolve;
    document.head.appendChild(sc);
  });
  return turnstileLoading;
}

async function ensureCaptcha(id) {
  if (!turnstileKey || captchaWidgets[id] !== undefined) return;
  captchaWidgets[id] = null;
  await loadTurnstile();
  captchaWidgets[id] = window.turnstile.render(`#${id}`, {
    sitekey: turnstileKey,
    theme: 'dark',
    language: I18N.lang,
    callback: (tok) => { captchaTokens[id] = tok; },
    'expired-callback': () => { captchaTokens[id] = ''; },
  });
}

// Los tokens solo valen una vez: tras cada envío se pide uno nuevo
function resetCaptcha(id) {
  captchaTokens[id] = '';
  if (captchaWidgets[id] && window.turnstile) window.turnstile.reset(captchaWidgets[id]);
}

// ---------- Cuenta ----------
let authMode = 'register';
let myGender = '';

function setAuthMode(mode) {
  authMode = mode;
  $$('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === mode));
  $('authForm').classList.toggle('login', mode === 'login');
  $('authSubmit').textContent = t(mode === 'login' ? 'auth.submitLogin' : 'auth.submitSignup');
  $('authPassword').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  $('authError').hidden = true;
}

function openAuth(mode = 'register', action = null) {
  pendingAction = action;
  setAuthMode(mode);
  openModal('authModal');
  ensureCaptcha('captchaRegister');
  focusSoon('authEmail');
}

$$('[data-open-auth]').forEach((b) => b.addEventListener('click', () => openAuth(b.dataset.openAuth)));
$$('.tab').forEach((tab) => tab.addEventListener('click', () => setAuthMode(tab.dataset.tab)));
$('myGender').addEventListener('click', (e) => {
  const g = e.target.closest('[data-g]')?.dataset.g;
  if (!g) return;
  myGender = g;
  $$('#myGender .chip').forEach((c) => c.classList.toggle('active', c.dataset.g === g));
});

$('authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const showError = (msg) => { $('authError').textContent = msg; $('authError').hidden = false; };
  const email = $('authEmail').value.trim();
  const password = $('authPassword').value;
  if (!email || !password) return showError(t('err.fill'));

  let res;
  if (authMode === 'register') {
    if (!myGender) return showError(t('err.gender'));
    if (!$('authTerms').checked) return showError(t('err.terms'));
    $('authSubmit').disabled = true;
    res = await api('/api/register', { method: 'POST', body: { email, password, gender: myGender, adult: true, terms: true, lang: I18N.chatLang(), captcha: captchaTokens.captchaRegister } });
    resetCaptcha('captchaRegister');
  } else {
    $('authSubmit').disabled = true;
    res = await api('/api/login', { method: 'POST', body: { email, password } });
  }
  $('authSubmit').disabled = false;
  if (!res.token) return showError(errorText(res));

  token = res.token;
  save('session', token);
  $('authPassword').value = '';
  closeModal('authModal');
  await refreshMe();
  toast(t(authMode === 'register' ? 'msg.welcome' : 'msg.welcomeBack'));
  const action = pendingAction;
  pendingAction = null;
  if (action === 'start') enterChat();
  if (action === 'premium') openPremium();
});

async function refreshMe() {
  if (!token) { applyMe(null); return; }
  const res = await api('/api/me');
  if (res.status === 401) { logout(false); return; }
  if (res.user) applyMe(res);
}

function applyMe(data) {
  me = data;
  const logged = !!data;
  $('guestActions').hidden = logged;
  $('userActions').hidden = !logged;
  setPremium(!!data?.premium);
  renderMyLikes();
  if (data?.restriction) showRestricted(data.restriction);
}

function logout(notify = true) {
  stop();
  if (socket) { socket.disconnect(); socket = null; }
  token = '';
  save('session', '');
  applyMe(null);
  showLanding();
  if (notify) toast(t('msg.loggedOut'));
}
$('logoutBtn').addEventListener('click', () => logout());

function showRestricted(r) {
  stop();
  const banned = r.type === 'banned';
  $('restrictedTitle').textContent = t(banned ? 'res.banned' : 'res.suspended');
  $('restrictedText').textContent = banned ? t('res.bannedText') : t('res.suspendedText', { date: dateText(r.until, true) });
  openModal('restrictedModal');
}

// ---------- Recuperar contraseña ----------
$('forgotLink').addEventListener('click', () => {
  closeModal('authModal');
  $('forgotEmail').value = $('authEmail').value.trim();
  $('forgotForm').hidden = false;
  $('forgotSent').hidden = true;
  $('forgotError').hidden = true;
  openModal('forgotModal');
  ensureCaptcha('captchaForgot');
  focusSoon('forgotEmail');
});
$('backToLogin').addEventListener('click', () => { closeModal('forgotModal'); openAuth('login'); });

$('forgotForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('forgotEmail').value.trim();
  if (!email) { $('forgotError').textContent = t('err.email'); $('forgotError').hidden = false; return; }
  $('forgotSubmit').disabled = true;
  const res = await api('/api/password/forgot', { method: 'POST', body: { email, lang: I18N.chatLang(), captcha: captchaTokens.captchaForgot } });
  resetCaptcha('captchaForgot');
  $('forgotSubmit').disabled = false;
  if (!res.ok) { $('forgotError').textContent = errorText(res); $('forgotError').hidden = false; return; }
  $('forgotForm').hidden = true;
  $('forgotSent').hidden = false;
});

let resetToken = '';
$('resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const showError = (msg) => { $('resetError').textContent = msg; $('resetError').hidden = false; };
  const password = $('resetPassword').value;
  if (password.length < 8) return showError(t('err.password'));
  $('resetSubmit').disabled = true;
  const res = await api('/api/password/reset', { method: 'POST', body: { token: resetToken, password } });
  $('resetSubmit').disabled = false;
  if (!res.token) return showError(errorText(res));
  token = res.token;
  save('session', token);
  $('resetPassword').value = '';
  closeModal('resetModal');
  await refreshMe();
  toast(t('rs.done'));
});

// ---------- Confirmar email ----------
function openEmail(notice) {
  $('emailText').textContent = t('ev.text', { email: me?.user?.email || '' });
  $('emailNotice').textContent = notice || '';
  $('emailNotice').hidden = !notice;
  openModal('emailModal');
}

$('emailCheck').addEventListener('click', async () => {
  await refreshMe();
  if (me?.user?.emailVerified) { closeModal('emailModal'); toast(t('ev.done')); enterChat(); }
  else openEmail(t('ev.pending'));
});

$('emailResend').addEventListener('click', async () => {
  $('emailResend').disabled = true;
  const res = await api('/api/email/resend', { method: 'POST', body: { lang: I18N.chatLang() } });
  setTimeout(() => { $('emailResend').disabled = false; }, 60000);
  openEmail(res.ok ? t('ev.resent') : errorText(res));
});

// ---------- Verificación de edad ----------
let agePolling = false;

function renderAge() {
  const status = me?.age?.status || 'none';
  const notice = $('ageNotice');
  $('ageDemo').hidden = !me?.age?.demo;
  $('ageIntro').hidden = status === 'pending';
  notice.className = 'notice';
  notice.hidden = true;
  $('ageStart').hidden = false;
  $('ageStart').textContent = t('age.vStart');
  if (status === 'pending') {
    notice.textContent = t('age.vPending');
    notice.classList.add('pending');
    notice.hidden = false;
    $('ageStart').hidden = true;
  } else if (status === 'declined' || status === 'retry') {
    notice.textContent = t('age.vDeclined');
    notice.classList.add('warn');
    notice.hidden = false;
    $('ageStart').textContent = t('age.vRetry');
  }
}

function openAge() {
  renderAge();
  openModal('ageModal');
  if (me?.age?.status === 'pending') pollAge();
}

function ageApproved() {
  closeModal('ageModal');
  toast(t('age.vDone'));
  enterChat();
}

$('ageStart').addEventListener('click', async () => {
  $('ageStart').disabled = true;
  const res = await api('/api/age/start', { method: 'POST' });
  $('ageStart').disabled = false;
  if (res.url) { location.href = res.url; return; }          // página de Veriff
  if (res.age) {
    me.age = res.age;
    if (res.age.status === 'approved') { ageApproved(); return; } // modo demo
    renderAge();
    return;
  }
  toast(errorText(res));
});

// Al volver de Veriff el resultado puede tardar: se consulta cada 4 s (máx. 15 min)
async function pollAge() {
  if (agePolling) return;
  agePolling = true;
  const until = Date.now() + 15 * 60000;
  while (Date.now() < until && !$('ageModal').hidden) {
    const res = await api('/api/age/status');
    if (res.age && me) {
      me.age = res.age;
      if (res.age.status === 'approved') { agePolling = false; ageApproved(); return; }
      if (res.age.status !== 'pending') break;
    }
    await new Promise((r) => setTimeout(r, 4000));
  }
  agePolling = false;
  await refreshMe();
  if (!$('ageModal').hidden) renderAge();
  if (!$('accountModal').hidden) renderAccount();
  if (connected) renderWatermark();
}

// ---------- Mi cuenta y datos personales ----------
function renderAccount() {
  if (!me) return;
  $('accEmail').textContent = me.user.email;
  $('accPremium').textContent = me.free ? t('acc.premiumFree')
    : me.premium ? t('acc.premiumUntil', { date: dateText(me.expires) }) : t('acc.premiumNo');
  $('accAge').textContent = me.age?.status === 'approved' ? t('acc.ageOk') : t('acc.ageNo');
  $('accLikes').textContent = `👍 ${me.user.likes?.like || 0}  ❤️ ${me.user.likes?.love || 0}`;
  $('accCode').textContent = me.watermark || '';
}

$('accountBtn').addEventListener('click', async () => {
  await refreshMe();
  if (!me) return;
  renderAccount();
  $('deleteForm').hidden = true;
  $('deleteOpen').hidden = false;
  openModal('accountModal');
});

// Descarga un JSON con todos los datos de la cuenta (derecho de acceso y portabilidad)
$('exportBtn').addEventListener('click', async () => {
  try {
    const r = await fetch('/api/me/export', { headers: { Authorization: `Bearer ${token}` } });
    if (!r.ok) throw new Error();
    const url = URL.createObjectURL(await r.blob());
    const a = document.createElement('a');
    a.href = url;
    a.download = 'la-ruleta-caliente-my-data.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    toast(t('err.generic'));
  }
});

$('deleteOpen').addEventListener('click', () => {
  $('deleteOpen').hidden = true;
  $('deleteForm').hidden = false;
  $('deleteError').hidden = true;
  $('deletePassword').value = '';
  focusSoon('deletePassword');
});

$('deleteForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('deleteSubmit').disabled = true;
  const res = await api('/api/me/delete', { method: 'POST', body: { password: $('deletePassword').value } });
  $('deleteSubmit').disabled = false;
  if (!res.ok) { $('deleteError').textContent = errorText(res); $('deleteError').hidden = false; return; }
  closeModal('accountModal');
  logout(false);
  toast(t('acc.deleted'));
});

// ---------- Protección de la imagen ----------
// Ningún navegador permite impedir que el sistema grabe la pantalla. Lo que sí
// hacemos: marca de agua con el código de quien mira (si graba, se sabe quién
// fue), difuminar el vídeo cuando no estás en la ventana y avisar al detectar
// las teclas de captura.
let windowBlurred = false;
let captureFlashUntil = 0;
let watermarkTimer = null;

function renderWatermark() {
  const wm = $('watermark');
  if (!connected || !me?.watermark) { wm.hidden = true; return; }
  const stamp = new Date().toLocaleString(I18N.lang, { dateStyle: 'short', timeStyle: 'short' });
  const text = `${me.watermark} · ${stamp}`;
  wm.innerHTML = '';
  for (let i = 0; i < 30; i++) {
    const span = document.createElement('span');
    span.textContent = text;
    wm.appendChild(span);
  }
  wm.hidden = false;
}

// La marca de agua cambia de sitio cada 30 s para que no se pueda tapar o recortar
// (entre medias está quieta: así, en una grabación, se puede promediar y leer mejor)
function moveWatermark() {
  const wm = $('watermark');
  wm.style.setProperty('--wx', `${Math.round((Math.random() - 0.5) * 80)}px`);
  wm.style.setProperty('--wy', `${Math.round((Math.random() - 0.5) * 80)}px`);
}

function startWatermark() {
  renderWatermark();
  clearInterval(watermarkTimer);
  watermarkTimer = setInterval(() => { moveWatermark(); }, 30000);
}

function stopWatermark() {
  clearInterval(watermarkTimer);
  $('watermark').hidden = true;
}

function updateShield() {
  const shielded = connected && (document.hidden || windowBlurred || Date.now() < captureFlashUntil);
  $('remote').classList.toggle('shielded', shielded);
  $('shield').hidden = !shielded;
}

document.addEventListener('visibilitychange', updateShield);
window.addEventListener('blur', () => { windowBlurred = true; updateShield(); });
window.addEventListener('focus', () => { windowBlurred = false; updateShield(); });

function onCaptureKey() {
  if (!connected) return;
  captureFlashUntil = Date.now() + 3000;
  updateShield();
  setTimeout(updateShield, 3100);
  toast(t('prot.captureWarn'));
  socket.emit('capture-attempt');
}

// Imprimir pantalla (Windows/Linux) y Cmd+Shift+3/4/5 (Mac), Win+Shift+S
document.addEventListener('keyup', (e) => { if (e.key === 'PrintScreen') onCaptureKey(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'PrintScreen') { onCaptureKey(); return; }
  if (e.shiftKey && (e.metaKey || e.ctrlKey) && ['3', '4', '5', 's', 'S'].includes(e.key)) onCaptureKey();
});

// Sin menú contextual ni arrastrar sobre el vídeo de la otra persona
$('remote').addEventListener('contextmenu', (e) => e.preventDefault());
$('remote').addEventListener('dragstart', (e) => e.preventDefault());

// ---------- Vistas ----------
function showLanding() {
  document.body.classList.remove('in-chat');
  $('landing').hidden = false;
  $('chatView').hidden = true;
}

function enterChat() {
  if (!token) { openAuth('register', 'start'); return; }
  if (me?.restriction) { showRestricted(me.restriction); return; }
  if (me?.emailRequired && !me.user.emailVerified) { openEmail(); return; }
  if (me?.age?.required && me.age.status !== 'approved') { openAge(); return; }
  document.body.classList.add('in-chat');
  $('landing').hidden = true;
  $('chatView').hidden = false;
  window.scrollTo(0, 0);
  if (!running) start();
}

$$('[data-start]').forEach((b) => b.addEventListener('click', enterChat));
$('homeLink').addEventListener('click', (e) => {
  if (!document.body.classList.contains('in-chat')) return;
  e.preventDefault();
  stop();
  showLanding();
});

// ---------- Estadísticas ----------
let online = 0;
async function refreshOnline() {
  try {
    ({ online } = await (await fetch('/stats')).json());
  } catch { /* sin estadísticas */ }
  $('onlineText').textContent = t('header.online', { n: online });
  $('onlinePill').hidden = online < 1;
}
setInterval(refreshOnline, 15000);

// ---------- Premium ----------
function setPremium(value) {
  premium = value;
  const logged = !!me;
  $('premiumBtn').hidden = !logged || premium;
  $('manageBtn').hidden = !logged || !premium || freeMode;
  $('lockNote').hidden = premium || freeMode;
  $('filter').classList.toggle('locked', !premium);
  if (!premium) selectWant('');
}

function selectWant(g) {
  want = g;
  $$('#wantGender .chip').forEach((c) => c.classList.toggle('active', c.dataset.g === g));
}

$('wantGender').addEventListener('click', (e) => {
  const g = e.target.closest('[data-g]')?.dataset.g;
  if (g === undefined) return;
  if (g && !premium) { openPremium(); return; }
  if (g === want) return;
  selectWant(g);
  if (running) next();
});

function openPremium() {
  if (!token) { openAuth('register', 'premium'); return; }
  if (premium) { manage(); return; }
  openModal('premiumModal');
}
$$('[data-premium]').forEach((b) => b.addEventListener('click', openPremium));

async function premiumActivated() {
  closeModal('premiumModal');
  $('payWait').hidden = true;
  await refreshMe();
  toast(t('msg.premiumOn'));
  // Reconecta para que el servidor reconozca la suscripción
  if (socket) {
    socket.disconnect().connect();
    if (running) { closePeer(); setStatus('msg.searching', null, true); }
  }
}

// Precios, ahorro del plan mensual y textos de los métodos de pago según el plan elegido
function renderPlans() {
  if (!plans) return;
  $$('.price-week').forEach((el) => { el.textContent = money(plans.week.price); });
  $$('.price-month').forEach((el) => { el.textContent = money(plans.month.price); });
  const perDay = (p) => p.price / p.days;
  const pct = Math.round((1 - perDay(plans.month) / perDay(plans.week)) * 100);
  $$('.save-month').forEach((el) => { el.textContent = t('plan.save', { pct }); el.hidden = pct <= 0; });
  $$('#planPicker .plan-opt').forEach((b) => {
    b.classList.toggle('active', b.dataset.plan === selectedPlan);
    b.setAttribute('aria-checked', b.dataset.plan === selectedPlan);
  });
  const p = plans[selectedPlan];
  $('payCard').hidden = !p.methods.card;
  $('payCrypto').hidden = !p.methods.crypto;
  $('payCardSub').textContent = t(selectedPlan === 'week' ? 'pay.cardSubWeek' : 'pay.cardSub', { price: money(p.price) });
  $('payCryptoSub').textContent = t('pay.cryptoSub', { price: money(p.price), days: p.days });
}

$('planPicker').addEventListener('click', (e) => {
  const b = e.target.closest('[data-plan]');
  if (!b) return;
  selectedPlan = b.dataset.plan;
  renderPlans();
});

// method: 'card' (tarjeta, Google Pay, Apple Pay) o 'crypto'
async function pay(method) {
  const buttons = [$('payCard'), $('payCrypto')];
  buttons.forEach((b) => { b.disabled = true; });
  const res = await api('/api/checkout', { method: 'POST', body: { method, plan: selectedPlan } });
  buttons.forEach((b) => { b.disabled = false; });
  if (res.activated) premiumActivated();              // modo demo
  else if (res.url) location.href = res.url;          // página de pago de Segpay
  else toast(errorText(res));
}
$('payCard').addEventListener('click', () => pay('card'));
$('payCrypto').addEventListener('click', () => pay('crypto'));

function manage() {
  if (!me?.premium) return;
  if (me.free) { toast(t('msg.premiumFree')); return; }
  const date = dateText(me.expires);
  if (me.cancelUrl) {
    if (confirm(t('msg.premiumRenews', { date }))) window.open(me.cancelUrl, '_blank', 'noopener');
  } else {
    toast(t('msg.premiumUntil', { date }));
  }
}
$('manageBtn').addEventListener('click', manage);

// Tras pagar, Segpay avisa al servidor (las cripto pueden tardar más):
// se consulta cada 4 s durante un máximo de 1 h
async function waitPayment(orderId) {
  openModal('premiumModal');
  $('payWait').hidden = false;
  const until = Date.now() + 3600 * 1000;
  while (Date.now() < until) {
    const res = await api(`/api/checkout/confirm?order=${encodeURIComponent(orderId)}`);
    if (res.activated) { premiumActivated(); return; }
    if (!res.pending && res.status !== 0) break;
    await new Promise((r) => setTimeout(r, 4000));
  }
  $('payWait').hidden = true;
  toast(t('msg.payNotConfirmed'));
}

// ---------- Mensajes ----------
function setStatus(key, vars, searching = false) {
  statusKey = { key, vars };
  $('status').hidden = !key;
  $('status').classList.toggle('searching', searching);
  $('statusText').textContent = key ? t(key, vars) : '';
}

function addMsg(text, who) {
  const p = document.createElement('p');
  p.className = `msg ${who}`;
  p.textContent = text;
  if (who === 'them' && canTranslate()) {
    const wrap = document.createElement('div');
    wrap.className = 'msg-wrap';
    wrap.append(p, translateButton(p, text));
    messages.appendChild(wrap);
  } else {
    messages.appendChild(p);
  }
  messages.scrollTop = messages.scrollHeight;
}

function resetMessages() {
  messages.innerHTML = '';
  addMsg(t('msg.beKind'), 'sys');
}

// ---------- Traducción del chat ----------
function canTranslate() {
  return translateEnabled && partner?.lang && partner.lang !== I18N.chatLang();
}

function translateButton(p, original) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'tr-btn';
  btn.innerHTML = '<svg class="i"><use href="#i-languages"/></svg><span></span>';
  const label = btn.querySelector('span');
  let translated = null;
  let showing = false;
  label.textContent = t('tr.translate');

  btn.addEventListener('click', async () => {
    if (showing) {
      p.textContent = original;
      p.classList.remove('translated');
      label.textContent = t('tr.translate');
      showing = false;
      return;
    }
    if (!translated) {
      btn.disabled = true;
      label.textContent = t('tr.translating');
      const res = await api('/api/translate', { method: 'POST', body: { text: original, target: I18N.chatLang() } });
      btn.disabled = false;
      if (!res.text) { label.textContent = t('tr.translate'); toast(errorText(res)); return; }
      translated = res.text;
    }
    p.textContent = translated;
    p.classList.add('translated');
    label.textContent = t('tr.original');
    showing = true;
  });
  return btn;
}

// ---------- Datos de la otra persona y likes ----------
function likesText(likes) {
  if (!likes || (!likes.like && !likes.love)) return '';
  return `👍 ${likes.like}  ❤️ ${likes.love}`;
}

function renderPartner() {
  if (!partner) { $('partnerInfo').hidden = true; return; }
  $('partnerInfo').hidden = false;
  $('partnerTag').textContent = t(`g.${partner.gender}`);
  $('partnerLikes').textContent = likesText(partner.likes);
  const showLang = partner.lang && partner.lang !== I18N.chatLang();
  $('partnerLang').hidden = !showLang;
  if (showLang) $('partnerLang').querySelector('span').textContent = t('msg.speaks', { lang: I18N.langName(partner.lang) });
}

function renderMyLikes() {
  const text = likesText(me?.user?.likes);
  $('myLikes').textContent = text;
  $('myLikes').hidden = !text;
}

// ---------- Reacciones 👍 ❤️ ----------
const EMOJI = { like: '👍', love: '❤️' };
const BURST_EXTRAS = { like: ['👍', '👍', '👍', '✨', '🔥'], love: ['❤️', '❤️', '❤️', '💖', '😍', '✨'] };

// Estallido de emojis sobre el vídeo (lo ven las dos personas)
function burst(type, label) {
  const layer = $('burstLayer');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const created = [];
  const add = (el) => { layer.appendChild(el); created.push(el); };
  const big = document.createElement('span');
  big.className = 'burst-big';
  big.textContent = EMOJI[type];
  add(big);

  const count = reduced ? 0 : 42;
  const { width, height } = layer.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const bit = document.createElement('span');
    bit.className = 'burst-bit';
    const extras = BURST_EXTRAS[type];
    bit.textContent = extras[Math.floor(Math.random() * extras.length)];
    const angle = Math.random() * Math.PI * 2;
    const dist = (0.35 + Math.random() * 0.65) * Math.max(width, height) * 0.6;
    bit.style.setProperty('--ox', `${50 + (Math.random() - 0.5) * 12}%`);
    bit.style.setProperty('--oy', `${50 + (Math.random() - 0.5) * 12}%`);
    bit.style.setProperty('--x', `${Math.cos(angle) * dist}px`);
    bit.style.setProperty('--y', `${Math.sin(angle) * dist - 40}px`);
    bit.style.setProperty('--rot', `${(Math.random() - 0.5) * 120}deg`);
    bit.style.setProperty('--scale', (0.8 + Math.random() * 1.2).toFixed(2));
    bit.style.setProperty('--size', `${22 + Math.random() * 30}px`);
    bit.style.setProperty('--dur', `${1 + Math.random() * 0.8}s`);
    bit.style.setProperty('--delay', `${Math.random() * 0.25}s`);
    add(bit);
  }
  if (label) {
    const tag = document.createElement('span');
    tag.className = 'burst-label';
    tag.textContent = `${label} ${EMOJI[type]}`;
    add(tag);
  }
  setTimeout(() => created.forEach((el) => el.remove()), 2200);
}

$('reactions').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-react]');
  if (!btn || !connected) return;
  btn.classList.remove('pulse');
  void btn.offsetWidth;
  btn.classList.add('pulse');
  socket.emit('react', btn.dataset.react);
});

// ---------- WebRTC ----------
function setConnected(value) {
  connected = value;
  chatInput.disabled = !value;
  $('sendBtn').disabled = !value;
  $('reportBtn').hidden = !value;
  $('reactions').hidden = !value;
  if (value) startWatermark(); else stopWatermark();
  updateShield();
  if (!value) { partner = null; renderPartner(); }
}

function setRunning(on) {
  running = on;
  $('startBtn').hidden = on;
  $('nextBtn').hidden = !on;
  $('stopBtn').hidden = !on;
}

function closePeer() {
  if (pc) {
    pc.ontrack = pc.onicecandidate = pc.onconnectionstatechange = null;
    pc.close();
    pc = null;
  }
  pendingCandidates = [];
  remoteVideo.srcObject = null;
  setConnected(false);
}

function createPeer() {
  closePeer();
  pc = new RTCPeerConnection(iceConfig);
  localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));
  pc.ontrack = (e) => { remoteVideo.srcObject = e.streams[0]; };
  pc.onicecandidate = (e) => { if (e.candidate) socket.emit('signal', { candidate: e.candidate }); };
  pc.onconnectionstatechange = () => {
    if (pc && pc.connectionState === 'failed') {
      addMsg(t('msg.failed'), 'sys');
      next();
    }
  };
}

async function handleSignal(data) {
  if (!pc) return;
  if (data.sdp) {
    await pc.setRemoteDescription(data.sdp);
    for (const c of pendingCandidates) await pc.addIceCandidate(c).catch(() => {});
    pendingCandidates = [];
    if (data.sdp.type === 'offer') {
      await pc.setLocalDescription(await pc.createAnswer());
      socket.emit('signal', { sdp: pc.localDescription });
    }
  } else if (data.candidate) {
    if (pc.remoteDescription) await pc.addIceCandidate(data.candidate).catch(() => {});
    else pendingCandidates.push(data.candidate);
  }
}

// ---------- Emparejamiento ----------
function find() {
  // Si está reconectando, el evento 'connect' buscará con el filtro actual
  if (socket?.connected) socket.emit('find', { want: want ? [want] : [] });
}

function setSearching() {
  if (want) setStatus('msg.searchingFor', { who: t(`gs.${want}`) }, true);
  else setStatus('msg.searching', null, true);
}

function connectSocket() {
  const s = io({ auth: (cb) => cb({ token, lang: I18N.chatLang() }) });
  socket = s;

  s.on('connect', () => { refreshOnline(); if (running) find(); });

  s.on('connect_error', (err) => {
    // Errores de red: socket.io reintenta solo. Estos tres no se arreglan reintentando.
    if (!['auth', 'restricted', 'age', 'email'].includes(err.message)) return;
    s.disconnect();
    if (s !== socket) return; // conexión antigua (p. ej. tras cerrar sesión)
    if (err.message === 'auth') { logout(false); openAuth('login'); }
    if (err.message === 'restricted') showRestricted(err.data);
    if (err.message === 'age') { stop(); refreshMe().then(openAge); }
    if (err.message === 'email') { stop(); refreshMe().then(() => openEmail()); }
  });

  socket.on('account', (acc) => { if (acc.premium !== premium) refreshMe(); });

  socket.on('waiting', setSearching);

  socket.on('matched', async ({ initiator, gender, lang, likes }) => {
    createPeer();
    setConnected(true);
    partner = { gender, lang, likes };
    resetMessages();
    setStatus('');
    addMsg(t('msg.connected'), 'sys');
    addMsg(t('prot.notice'), 'sys');
    renderPartner();
    if (initiator) {
      await pc.setLocalDescription(await pc.createOffer());
      socket.emit('signal', { sdp: pc.localDescription });
    }
  });

  socket.on('signal', (data) => handleSignal(data).catch(console.error));
  socket.on('chat', (text) => addMsg(text, 'them'));

  socket.on('reaction', ({ type, from, partnerLikes, myLikes }) => {
    if (from === 'me') {
      if (partner) { partner.likes = partnerLikes; renderPartner(); }
      burst(type);
    } else {
      if (me?.user) { me.user.likes = myLikes; renderMyLikes(); }
      burst(type, t(type === 'love' ? 're.gotLove' : 're.gotLike'));
    }
  });

  socket.on('partner-left', () => {
    closePeer();
    addMsg(t('msg.left'), 'sys');
    setSearching();
    find();
  });

  socket.on('restricted', (r) => { if (r.type !== 'deleted') showRestricted(r); });

  socket.on('partner-capture', () => {
    addMsg(t('prot.partnerCapture'), 'sys');
    toast(t('prot.partnerCapture'));
  });
}

// Cada «Parar» o cierre de sesión cancela un arranque que aún esté en marcha
let startGen = 0;

async function start() {
  const gen = ++startGen;
  setStatus('msg.activatingCam');
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  } catch {
    if (gen === startGen) setStatus('msg.camera');
    return;
  }
  try {
    iceConfig = await (await fetch('/ice')).json();
  } catch { /* se usa la configuración por defecto */ }
  if (gen !== startGen || !token) { stream.getTracks().forEach((track) => track.stop()); return; }
  localStream = stream;
  localVideo.srcObject = localStream;
  setRunning(true);
  setSearching();
  if (!socket) connectSocket();   // al conectar emite 'find'
  else if (!socket.connected) socket.connect();
  else find();
}

function next() {
  closePeer();
  resetMessages();
  setSearching();
  find();
}

function stop() {
  startGen++;
  closePeer();
  if (socket?.connected) socket.emit('stop');
  if (localStream) localStream.getTracks().forEach((track) => track.stop());
  localStream = null;
  localVideo.srcObject = null;
  setRunning(false);
  setStatus('chat.pressStart');
}

$('startBtn').addEventListener('click', start);
$('nextBtn').addEventListener('click', next);
$('stopBtn').addEventListener('click', stop);

$('chatForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text || !connected) return;
  socket.emit('chat', text);
  addMsg(text, 'me');
  chatInput.value = '';
});

// ---------- Denuncias ----------
$('reportBtn').addEventListener('click', () => {
  $('reportForm').reset();
  $('reportError').hidden = true;
  openModal('reportModal');
});

$('reportForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const reason = new FormData($('reportForm')).get('reason');
  if (!reason) { $('reportError').textContent = t('err.reason'); $('reportError').hidden = false; return; }
  if (!connected) { closeModal('reportModal'); toast(t('msg.convEnded')); return; }
  socket.emit('report', { reason, comment: $('reportComment').value }, (res) => {
    if (res?.code) { $('reportError').textContent = errorText(res); $('reportError').hidden = false; return; }
    closeModal('reportModal');
    toast(t('msg.reportThanks'));
    next();
  });
});

// ---------- Teclado ----------
// Esc: cierra la ventana abierta o, si no hay ninguna, pasa a la siguiente persona
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (anyModalOpen()) {
    $$('.overlay').forEach((o) => { if (o.id !== 'ageGate') o.hidden = true; });
    return;
  }
  if (running) next();
});

// ---------- App instalable ----------
// Android/Chrome/Edge: el navegador avisa de que se puede instalar y mostramos el botón.
// iPhone/iPad: no hay aviso, así que el botón abre las instrucciones de Safari.
let installEvent = null;
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installEvent = e;
  $('installBtn').hidden = false;
});
window.addEventListener('appinstalled', () => {
  $('installBtn').hidden = true;
  toast(t('pwa.installed'));
});
if (isIOS && !isStandalone) $('installBtn').hidden = false;

$('installBtn').addEventListener('click', async () => {
  if (installEvent) {
    installEvent.prompt();
    await installEvent.userChoice.catch(() => {});
    installEvent = null;
    $('installBtn').hidden = true;
  } else if (isIOS) {
    openModal('iosModal');
  }
});

// ---------- Arranque ----------
I18N.apply();
fillLangSelects();
resetMessages();
setStatus('chat.pressStart');
refreshOnline();

fetch('/api/plan').then((r) => r.json()).then((p) => {
  plans = p.plans;
  freeMode = !!p.free;
  $('demoNote').hidden = !p.demo || freeMode;
  $('freeBox').hidden = !freeMode;
  $('paidBox').hidden = freeMode;
  setPremium(premium);
  renderDynamicTexts();
}).catch(() => {});

fetch('/api/config').then((r) => r.json()).then((c) => {
  translateEnabled = !!c.translate;
  turnstileKey = c.turnstile || null;
}).catch(() => {});

(async () => {
  await refreshMe();
  const params = new URLSearchParams(location.search);
  if (['order', 'reset', 'age', 'verify'].some((k) => params.has(k))) history.replaceState(null, '', '/');
  // Enlace del email de confirmación
  if (params.get('verify')) {
    if (!load('age-ok')) { save('age-ok', '1'); closeModal('ageGate'); }
    const res = await api('/api/email/verify', { method: 'POST', body: { token: params.get('verify') } });
    if (res.ok) { await refreshMe(); toast(t('ev.done')); } else toast(errorText(res));
  }
  const order = params.get('order');
  if (order && token) waitPayment(order);
  // Enlace del email para crear una contraseña nueva
  if (params.get('reset')) {
    resetToken = params.get('reset');
    if (!load('age-ok')) { save('age-ok', '1'); closeModal('ageGate'); }
    openModal('resetModal');
  }
  // Vuelta desde Veriff
  if (params.get('age') === 'done' && token && me) {
    if (me.age?.status === 'approved') ageApproved();
    else openAge();
  }
})();
