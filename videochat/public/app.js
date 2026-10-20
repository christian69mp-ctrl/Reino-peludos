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
let wantScope = 'all';    // all | country | near (Premium)
let wantAge = '';         // '' | '18-24' | '25-34' | '35-44' | '45+' (Premium)
let myCountry = '';       // país aproximado según la IP (lo dice el servidor)
let geoAvailable = false;
let pendingAction = null; // lo que quería hacer antes de iniciar sesión
let plans = null;         // planes Premium del servidor: { week, month }
let freeMode = false;     // lanzamiento: filtros gratis para todos (PREMIUM_MODE=free)
let selectedPlan = 'month';
let translateEnabled = false;
let partner = null;       // { gender, lang, likes, name, handle, relation }
let contacts = { friends: [], requests: [], history: [] };
let outgoingCall = null;  // llamada que estoy haciendo: { handle, name, gender, callId }
let incomingCall = null;  // llamada que estoy recibiendo: { callId, handle, name, gender }
let statusKey = { key: 'chat.pressStart' };

// Lo que necesitan los juegos y piropos (play.js)
window.App = {
  get socket() { return socket; },
  get partner() { return partner; },
  get premium() { return premium; },
  get me() { return me; },
  openPremium: () => openPremium(),
  toast: (text) => toast(text),
  savePrefs: (body) => savePrefs(body),
  api: (path, opts) => api(path, opts),
};

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
    if (overlay.id === 'ageGate' || overlay.id === 'callModal') return;
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
  renderContacts();
  if (incomingCall) renderIncomingCall();
  birthEls.forEach((id) => buildBirth($(id)));
  renderFilters();
  renderSettings();
  renderAnnouncement();
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
  $$('#authModal .tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === mode));
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
$$('#authModal .tab').forEach((tab) => tab.addEventListener('click', () => setAuthMode(tab.dataset.tab)));
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
    const birthDate = birthValue($('authBirth'));
    const birthProblem = birthCheck(birthDate);
    if (birthProblem) return showError(birthProblem);
    if (!$('authTerms').checked) return showError(t('err.terms'));
    $('authSubmit').disabled = true;
    res = await api('/api/register', { method: 'POST', body: { email, password, gender: myGender, birthDate, adult: true, terms: true, lang: I18N.chatLang(), captcha: captchaTokens.captchaRegister } });
    resetCaptcha('captchaRegister');
  } else {
    $('authSubmit').disabled = true;
    res = await api('/api/login', { method: 'POST', body: { email, password } });
  }
  $('authSubmit').disabled = false;
  if (!res.token) return showError(errorText(res));

  $('authPassword').value = '';
  closeModal('authModal');
  loggedIn(res.token, authMode === 'register', pendingAction);
});

// Sesión iniciada (con email o con Google/Apple/Facebook): sigue con lo que quería hacer
async function loggedIn(newToken, isNew, action) {
  token = newToken;
  save('session', token);
  await refreshMe();
  toast(t(isNew ? 'msg.welcome' : 'msg.welcomeBack'));
  pendingAction = null;
  if (action === 'start') enterChat();
  if (action === 'premium') openPremium();
}

// ---------- Entrar con Google / Apple / Facebook ----------
// Se va a la página del proveedor; al volver, ?social=… trae un código de un solo uso
$$('.social-btn').forEach((a) => a.addEventListener('click', () => {
  save('after-login', pendingAction || '');
  a.href = `/auth/${a.dataset.provider}?lang=${encodeURIComponent(I18N.chatLang())}`;
}));

let socialCode = '';
let socialGender = '';
async function finishSocial(code) {
  const res = await api('/api/social/finish', { method: 'POST', body: { code } });
  const action = load('after-login');
  if (res.token) { save('after-login', ''); loggedIn(res.token, false, action); return; }
  if (!res.signup) { toast(errorText(res)); return; }
  socialCode = code;
  $('socialText').textContent = t('soc.text', { email: res.email });
  $('socialError').hidden = true;
  openModal('socialModal');
}

$('socialGender').addEventListener('click', (e) => {
  const g = e.target.closest('[data-g]')?.dataset.g;
  if (!g) return;
  socialGender = g;
  $('socialError').hidden = true;
  $$('#socialGender .chip').forEach((c) => c.classList.toggle('active', c.dataset.g === g));
});

$('socialSubmit').addEventListener('click', async () => {
  const showError = (msg) => { $('socialError').textContent = msg; $('socialError').hidden = false; };
  if (!socialGender) return showError(t('err.gender'));
  const birthDate = birthValue($('socialBirth'));
  const birthProblem = birthCheck(birthDate);
  if (birthProblem) return showError(birthProblem);
  if (!$('socialTerms').checked) return showError(t('err.terms'));
  $('socialSubmit').disabled = true;
  const res = await api('/api/social/complete', { method: 'POST', body: { code: socialCode, gender: socialGender, birthDate, adult: true, terms: true, lang: I18N.chatLang() } });
  $('socialSubmit').disabled = false;
  if (!res.token) return showError(errorText(res));
  closeModal('socialModal');
  const action = load('after-login');
  save('after-login', '');
  loggedIn(res.token, true, action);
});

async function refreshMe() {
  if (!token) { applyMe(null); return; }
  const res = await api('/api/me');
  if (res.status === 401) { logout(false); return; }
  if (res.user) applyMe(res);
}

let trialOff = true; // prueba gratis al registrarse: solo si el dueño la activa (TRIAL_DAYS)

// ---------- 🤝 Invita a un amigo ----------
// Quien llega con ?ref=CÓDIGO lo guarda; al crear la cuenta (en las primeras 24 h) se apunta
try {
  const ref = new URLSearchParams(location.search).get('ref');
  if (ref && /^[A-Z0-9]{4,20}$/i.test(ref)) {
    save('ref', JSON.stringify({ code: ref.toUpperCase(), at: Date.now() }));
    const url = new URL(location.href);
    url.searchParams.delete('ref');
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  }
} catch { /* sin almacenamiento */ }
async function claimInvite() {
  let ref = null;
  try { ref = JSON.parse(load('ref') || 'null'); } catch { ref = null; }
  if (!ref || Date.now() - ref.at > 30 * 864e5) { save('ref', ''); return; }
  const res = await api('/api/invite/claim', { method: 'POST', body: { code: ref.code } });
  if (res?.ok) toast(t('gf.claimed'));
  if (res && res.status !== 0) save('ref', '');
}
async function loadInvite() {
  const info = await api('/api/invite');
  $('inviteBox').hidden = !info?.link || !info.enabled;
  if ($('inviteBox').hidden) return;
  $('inviteLink').value = info.link;
  $('inviteStats').textContent = t('gf.inviteStats', { n: info.rewarded, p: info.pending, left: info.monthLeft });
}
$('inviteShare').addEventListener('click', async () => {
  const link = $('inviteLink').value;
  const text = t('gf.shareText');
  try {
    if (navigator.share) { await navigator.share({ title: 'La Ruleta Caliente', text, url: link }); return; }
  } catch { /* cancelado: se copia */ }
  try { await navigator.clipboard.writeText(link); toast(t('gf.copied')); } catch { $('inviteLink').select(); }
});
document.querySelectorAll('[data-open-invite]').forEach((b) => b.addEventListener('click', async () => {
  document.querySelectorAll('.overlay:not([hidden])').forEach((o) => { o.hidden = true; });
  if (!me) { openAuth('register'); return; }
  $('accountBtn').click();
  setTimeout(() => $('inviteBox').scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
}));

function applyMe(data) {
  me = data;
  if (data?.user) claimInvite();
  window.Play?.sync();
  window.Powers?.refresh();
  const logged = !!data;
  $('guestActions').hidden = logged;
  $('userActions').hidden = !logged;
  setPremium(!!data?.premium);
  renderMyLikes();
  if (data?.restriction) showRestricted(data.restriction);
  if (!data) { contacts = { friends: [], requests: [], history: [] }; renderBadge(); }
  ensureSocket();
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
$('accLogout').addEventListener('click', () => { closeModal('accountModal'); logout(); });

function showRestricted(r) {
  stop();
  const banned = r.type === 'banned';
  $('restrictedTitle').textContent = t(banned ? 'res.banned' : 'res.suspended');
  $('restrictedText').textContent = banned ? t('res.bannedText2') : t('res.suspendedText2', { date: dateText(r.until, true) });
  $('restrictedReason').textContent = t('ap.reason', { reason: reasonText(r.reason) });
  openModal('restrictedModal');
  renderAppeal();
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
  $('ageReported').hidden = me?.age?.mode !== 'reports';
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
  const bd = me.user.birthDate;
  $('accBirth').textContent = bd ? new Date(`${bd}T12:00:00`).toLocaleDateString(I18N.lang, { dateStyle: 'long' }) : '—';
  $('birthForm').hidden = !!bd;
  $('birthError').hidden = true;
  $('accPremium').textContent = me.free ? t('acc.premiumFree')
    : me.gift ? t('gf.accUntil', { date: dateText(me.expires), why: t(`gf.why_${me.giftReason}`) })
      : me.premium ? t('acc.premiumUntil', { date: dateText(me.expires) }) : t('acc.premiumNo');
  loadInvite();
  // Verificada, pendiente de verificar (si se la han pedido) o la edad declarada
  const declared = bd ? Math.floor((Date.now() - new Date(`${bd}T00:00:00`)) / (365.2425 * 864e5)) : null;
  $('accAge').textContent = me.age?.status === 'approved' ? t('acc.ageOk')
    : me.age?.required ? t('acc.ageNo')
      : declared !== null ? t('acc.ageDeclared', { n: declared }) : '—';
  $('accLikes').textContent = `👍 ${me.user.likes?.like || 0}  ❤️ ${me.user.likes?.love || 0}`;
  $('accCode').textContent = me.watermark || '';
  if (document.activeElement !== $('nickInput')) $('nickInput').value = me.user.nick || '';
  $('nickError').hidden = true;
}

$('accountBtn').addEventListener('click', async () => {
  await refreshMe();
  if (!me) return;
  renderAccount();
  $('deleteForm').hidden = true;
  $('deleteOpen').hidden = false;
  renderSettings();
  setAccTab('profile');
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
  // Cuentas creadas con Google/Apple/Facebook: se confirma escribiendo el email
  const noPass = me?.user && !me.user.hasPassword;
  $('deletePassword').type = noPass ? 'email' : 'password';
  $('deletePassword').autocomplete = noPass ? 'off' : 'current-password';
  $('deletePasswordLabel').textContent = t(noPass ? 'acc.deleteEmail' : 'acc.deletePassword');
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
  showChat();
  if (!running) start();
}

function showChat() {
  if (document.body.classList.contains('in-chat')) return;
  document.body.classList.add('in-chat');
  $('landing').hidden = true;
  $('chatView').hidden = false;
  window.scrollTo(0, 0);
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
  const wasPremium = premium;
  premium = value;
  const logged = !!me;
  $('premiumBtn').hidden = !logged || premium;
  $('manageBtn').hidden = !logged || !premium || freeMode;
  $('lockNote').hidden = premium || freeMode;
  if (partner) renderFriendBtn();
  if (value !== wasPremium) { loadContacts(); window.AdSlots?.refresh(); }
  $('filter').classList.toggle('locked', !premium);
  if (!premium) { selectWant(''); selectScope('all'); selectAge(''); }
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

// ----- Más filtros (Premium): de dónde y edad -----
const flagOf = (cc) => String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 0x1F1E6 + c.charCodeAt(0) - 65));
function countryName(cc) {
  try { return new Intl.DisplayNames([I18N.lang], { type: 'region' }).of(cc); } catch { return cc; }
}

function selectScope(s) {
  wantScope = s;
  $$('#wantScope .chip').forEach((c) => c.classList.toggle('active', c.dataset.s === s));
  renderFilters();
}
function selectAge(a) {
  wantAge = a;
  $$('#wantAge .chip').forEach((c) => c.classList.toggle('active', c.dataset.a === a));
  renderFilters();
}

function renderFilters() {
  // Sin base de datos de IP no hay filtro por país ni cercanía
  $('scopeRow').hidden = !geoAvailable;
  $('myFlag').textContent = myCountry ? flagOf(myCountry) : '';
  $$('#wantScope [data-s=country], #wantScope [data-s=near]').forEach((c) => {
    c.disabled = !myCountry;
    c.title = myCountry ? countryName(myCountry) : t('f.noGeo');
  });
  if (!myCountry && wantScope !== 'all') { wantScope = 'all'; $$('#wantScope .chip').forEach((c) => c.classList.toggle('active', c.dataset.s === 'all')); }
  const n = (wantScope !== 'all' ? 1 : 0) + (wantAge ? 1 : 0);
  $('fCount').textContent = String(n);
  $('fCount').hidden = !n;
}

function filterClick(container, attr, select, current) {
  $(container).addEventListener('click', (e) => {
    const chip = e.target.closest(`[data-${attr}]`);
    if (!chip || chip.disabled) return;
    const v = chip.dataset[attr];
    if (!premium) { if (v && v !== 'all') openPremium(); return; }
    if (v === current()) return;
    select(v);
    if (running && !outgoingCall) next();
  });
}
filterClick('wantScope', 's', selectScope, () => wantScope);
filterClick('wantAge', 'a', selectAge, () => wantAge);

// ----- Fecha de nacimiento: tres desplegables (día, mes, año) -----
function buildBirth(el) {
  const keep = birthValue(el, true);
  const [d, m, y] = ['d', 'm', 'y'].map((p) => el.querySelector(`[data-part=${p}]`));
  const opt = (value, text) => `<option value="${value}">${text}</option>`;
  d.innerHTML = opt('', t('b.day')) + Array.from({ length: 31 }, (_, i) => opt(i + 1, i + 1)).join('');
  const monthFmt = new Intl.DateTimeFormat(I18N.lang, { month: 'long' });
  m.innerHTML = opt('', t('b.month')) + Array.from({ length: 12 }, (_, i) => opt(i + 1, monthFmt.format(new Date(2000, i, 1)))).join('');
  const top = new Date().getFullYear() - 18;
  y.innerHTML = opt('', t('b.year')) + Array.from({ length: 83 }, (_, i) => opt(top - i, top - i)).join('');
  [d, m, y].forEach((s) => s.setAttribute('aria-label', t(`b.${{ d: 'day', m: 'month', y: 'year' }[s.dataset.part]}`)));
  if (keep) [d.value, m.value, y.value] = keep;
}
// 'AAAA-MM-DD' (o '' si falta algo); con raw devuelve [día, mes, año] tal cual
function birthValue(el, raw) {
  const v = ['d', 'm', 'y'].map((p) => el.querySelector(`[data-part=${p}]`).value);
  if (raw) return v.some(Boolean) ? v : null;
  if (v.some((x) => !x)) return '';
  return `${v[2]}-${String(v[1]).padStart(2, '0')}-${String(v[0]).padStart(2, '0')}`;
}
// Mayor de 18 según la fecha elegida (el servidor lo vuelve a comprobar)
function birthCheck(value) {
  if (!value) return t('err.birthMissing');
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (date.getMonth() !== m - 1) return t('err.birth');
  const adult = new Date(y + 18, m - 1, d);
  return adult > new Date() ? t('err.underage') : '';
}
const birthEls = ['authBirth', 'socialBirth', 'accBirthInput'];
birthEls.forEach((id) => buildBirth($(id)));

$('birthForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const value = birthValue($('accBirthInput'));
  const problem = birthCheck(value);
  const showError = (msg) => { $('birthError').textContent = msg; $('birthError').hidden = false; };
  if (problem) return showError(problem);
  const res = await api('/api/me/birth', { method: 'POST', body: { birthDate: value } });
  if (!res.ok) return showError(errorText(res));
  me.user.birthDate = res.birthDate;
  renderAccount();
  toast(t('acc.birthSaved'));
  // El servidor calcula la edad al conectar: se reconecta si no está en una conversación
  if (socket?.connected && !connected) socket.disconnect().connect();
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

// En vista amplia el chat de texto no se ve: los mensajes salen un momento sobre el vídeo
function overlayMsg(text, who) {
  if (!document.body.classList.contains('wide-video') || (who !== 'them' && who !== 'me')) return;
  const p = document.createElement('p');
  p.className = who;
  p.textContent = text;
  const box = $('overlayMsgs');
  box.appendChild(p);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => p.remove(), 6200);
}

function addMsg(text, who) {
  overlayMsg(text, who);
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
  if (!partner) { $('partnerInfo').hidden = true; $('friendBtn').hidden = true; return; }
  $('partnerInfo').hidden = false;
  // «Ana · 27 · Mujer»
  $('partnerTag').textContent = [partner.name, partner.age, t(`g.${partner.gender}`)].filter((x) => x || x === 0).join(' · ');
  renderFriendBtn();
  $('partnerLikes').textContent = likesText(partner.likes);
  const pp = window.Play?.badges(partner) || '';
  $('partnerPiropos').hidden = !pp;
  $('partnerPiropos').textContent = pp;
  const bd = window.Powers?.partnerBadges(partner) || '';
  $('partnerBadges').hidden = !bd;
  $('partnerBadges').textContent = bd;
  const pc = $('partnerCountry');
  pc.hidden = !partner.country;
  if (partner.country) pc.textContent = `${flagOf(partner.country)} ${countryName(partner.country)}`;
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
  window.Play?.left();
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
  if (socket?.connected) socket.emit('find', { want: want ? [want] : [], scope: wantScope, age: wantAge });
}

const filtersActive = () => !!want || wantScope !== 'all' || !!wantAge;

// «Buscando mujeres de tu país de 25–34 años…»
let fewTimer = null;
function setSearching() {
  const extra = [];
  if (wantScope === 'country') extra.push(t('f.fromCountry'));
  if (wantScope === 'near') extra.push(t('f.nearYou'));
  if (wantAge) extra.push(t('f.aged', { range: wantAge.replace('-', '–') }));
  if (!want && !extra.length) setStatus('msg.searching', null, true);
  else setStatus('msg.searchingFor', { who: [want ? t(`gs.${want}`) : t('f.people'), ...extra].join(' ') }, true);
  // Con filtros puede haber poca gente: tras un rato se sugiere ampliarlos
  clearTimeout(fewTimer);
  if (filtersActive()) {
    fewTimer = setTimeout(() => { if (running && !connected && filtersActive()) addMsg(t('f.fewPeople'), 'sys'); }, 25000);
  }
}

function connectSocket() {
  const s = io({ auth: (cb) => cb({ token, lang: I18N.chatLang() }) });
  socket = s;
  window.Play?.attach(s);
  window.Powers?.attach(s);

  s.on('connect', () => {
    refreshOnline();
    loadContacts();
    if (running && !outgoingCall) find();
  });

  s.on('connect_error', (err) => {
    // Errores de red: socket.io reintenta solo. Estos tres no se arreglan reintentando.
    if (!['auth', 'restricted', 'age', 'email'].includes(err.message)) return;
    s.disconnect();
    if (s !== socket) return; // conexión antigua (p. ej. tras cerrar sesión)
    if (err.message === 'auth') { logout(false); openAuth('login'); }
    if (err.message === 'restricted') showRestricted(err.data);
    if (err.message === 'age' && running) { stop(); refreshMe().then(openAge); }
    if (err.message === 'email' && running) { stop(); refreshMe().then(() => openEmail()); }
  });

  socket.on('account', (acc) => {
    if (acc.premium !== premium) refreshMe();
    myCountry = acc.country || '';
    geoAvailable = !!acc.geo;
    renderFilters();
  });

  socket.on('waiting', setSearching);

  socket.on('matched', async ({ initiator, call, gender, lang, likes, name, handle, relation, country, age, spicy, piropos, incognito, badges }) => {
    clearOutgoingCall();
    clearTimeout(fewTimer);
    createPeer();
    setConnected(true);
    partner = { gender, lang, likes, name, handle, relation, country, age, spicy, piropos, incognito, badges };
    window.Play?.matched();
    resetMessages();
    setStatus('');
    addMsg(call ? t('call.connected', { name: name || t(`g.${gender}`) }) : t('msg.connected'), 'sys');
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
    window.Play?.left();
    window.Powers?.offerRewind();
    closePeer();
    addMsg(t('msg.left'), 'sys');
    setSearching();
    find();
  });

  socket.on('restricted', (r) => { if (r.type !== 'deleted') showRestricted(r); });

  // Le han denunciado como posible menor: tiene que verificar su edad para seguir
  socket.on('age-required', () => {
    stop();
    socket = null;
    refreshMe().then(() => { showChat(); openAge(); });
  });

  bindContactEvents(s);

  socket.on('partner-capture', () => {
    addMsg(t('prot.partnerCapture'), 'sys');
    toast(t('prot.partnerCapture'));
  });
}

// Cada «Parar» o cierre de sesión cancela un arranque que aún esté en marcha
let startGen = 0;

// Enciende la cámara (si no lo está ya). Devuelve false si no se pudo.
async function startCamera() {
  try {
    iceConfig = await (await fetch('/ice')).json();
  } catch { /* se usa la configuración por defecto */ }
  if (localStream) return true;
  const gen = ++startGen;
  setStatus('msg.activatingCam');
  let stream;
  try {
    const camId = load('camId');
    stream = await navigator.mediaDevices.getUserMedia({ video: camId ? { deviceId: { ideal: camId } } : true, audio: true });
  } catch {
    if (gen === startGen) setStatus('msg.camera');
    return false;
  }
  if (gen !== startGen || !token) { stream.getTracks().forEach((track) => track.stop()); return false; }
  localStream = stream;
  localVideo.srcObject = localStream;
  applyMirror();
  refreshCams();
  return true;
}

// ---------- Cambiar de cámara ----------
// Tu imagen se ve en espejo (como en cualquier videollamada) salvo con la cámara
// trasera; la otra persona siempre te ve al derecho.
let camDevices = [];
async function refreshCams() {
  try { camDevices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput'); } catch { camDevices = []; }
  $('switchCam').hidden = camDevices.length < 2 || !localStream;
}
function applyMirror() {
  const track = localStream?.getVideoTracks()[0];
  const facing = track?.getSettings?.().facingMode;
  const wantMirror = me?.user?.prefs?.mirror !== false;
  $('localVideo').parentElement.classList.toggle('mirror', facing === 'environment' ? false : wantMirror);
}
let switching = false;
async function switchCamera() {
  if (!localStream || camDevices.length < 2 || switching) return;
  switching = true;
  const old = localStream.getVideoTracks()[0];
  const oldId = old?.getSettings().deviceId;
  const i = camDevices.findIndex((d) => d.deviceId === oldId);
  const next = camDevices[(i + 1) % camDevices.length];
  // Muchos móviles no pueden tener dos cámaras abiertas: se cierra antes la actual
  old?.stop();
  let track;
  try {
    track = (await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: next.deviceId } } })).getVideoTracks()[0];
    save('camId', next.deviceId);
  } catch {
    toast(t('cam.switchFail'));
    try { track = (await navigator.mediaDevices.getUserMedia({ video: oldId ? { deviceId: { exact: oldId } } : true })).getVideoTracks()[0]; } catch { switching = false; return; }
  }
  if (!localStream) { track.stop(); switching = false; return; }
  if (old) localStream.removeTrack(old);
  localStream.addTrack(track);
  const sender = pc?.getSenders().find((x) => x.track?.kind === 'video');
  if (sender) await sender.replaceTrack(track).catch(() => {});
  localVideo.srcObject = localStream;
  applyMirror();
  switching = false;
}
$('switchCam').addEventListener('click', switchCamera);

// ---------- Vista: tamaño del recuadro, intercambiar, vista amplia, pantalla completa ----------
// Se recuerda en este navegador. Intercambiar solo mueve los vídeos con CSS: la marca de
// agua y el difuminado de protección siguen cubriendo el vídeo de la otra persona.
const PIP_SIZES = [['S', '16%'], ['M', '22%'], ['L', '32%'], ['XL', '44%']];
const view = (() => {
  try { return { pip: 1, swap: false, wide: false, ...JSON.parse(load('view') || '{}') }; } catch { return { pip: 1, swap: false, wide: false }; }
})();
function applyView() {
  view.pip = Math.min(Math.max(Number(view.pip) || 0, 0), PIP_SIZES.length - 1);
  $('remote').style.setProperty('--pip', PIP_SIZES[view.pip][1]);
  $('pipSizeLabel').textContent = PIP_SIZES[view.pip][0];
  $('pipSmaller').disabled = view.pip === 0;
  $('pipBigger').disabled = view.pip === PIP_SIZES.length - 1;
  $('remote').classList.toggle('swapped', view.swap);
  $('swapBtn').setAttribute('aria-pressed', String(view.swap));
  document.body.classList.toggle('wide-video', view.wide);
  $('wideBtn').setAttribute('aria-pressed', String(view.wide));
  const fs = !!document.fullscreenElement;
  $('fullBtn').querySelector('span').textContent = t(fs ? 'view.exitFull' : 'view.full');
  $('fullBtn').hidden = !document.fullscreenEnabled;
  save('view', JSON.stringify({ pip: view.pip, swap: view.swap, wide: view.wide }));
}
function setView(changes) { Object.assign(view, changes); applyView(); }
function toggleViewMenu(open = $('viewMenu').hidden) {
  $('viewMenu').hidden = !open;
  $('viewBtn').setAttribute('aria-expanded', String(open));
  if (open) $('viewMenu').querySelector('button:not(:disabled)')?.focus();
}
$('viewBtn').addEventListener('click', (e) => { e.stopPropagation(); toggleViewMenu(); });
$('pipSmaller').addEventListener('click', () => setView({ pip: view.pip - 1 }));
$('pipBigger').addEventListener('click', () => setView({ pip: view.pip + 1 }));
$('swapBtn').addEventListener('click', () => setView({ swap: !view.swap }));
$('wideBtn').addEventListener('click', () => setView({ wide: !view.wide }));
$('fullBtn').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.querySelector('.stage').requestFullscreen({ navigationUI: 'hide' });
  } catch { /* el navegador no lo permite */ }
  toggleViewMenu(false);
});
document.addEventListener('fullscreenchange', applyView);
// Doble clic (o doble toque) en el recuadro pequeño: intercambiar
document.querySelector('.self').addEventListener('dblclick', (e) => { if (!e.target.closest('button')) setView({ swap: !view.swap }); });
$('remoteVideo').addEventListener('dblclick', () => { if (view.swap) setView({ swap: false }); });
document.addEventListener('click', (e) => { if (!$('viewMenu').hidden && !e.target.closest('.view-wrap')) toggleViewMenu(false); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('viewMenu').hidden) { e.stopImmediatePropagation(); toggleViewMenu(false); $('viewBtn').focus(); } }, true);
document.addEventListener('langchange', applyView);
applyView();

async function start() {
  if (!(await startCamera())) return;
  setRunning(true);
  setSearching();
  if (!socket) connectSocket();   // al conectar emite 'find'
  else if (!socket.connected) socket.connect();
  else find();
}

function next() {
  const had = !!partner;
  clearOutgoingCall();
  closePeer();
  resetMessages();
  setSearching();
  find();
  if (had) window.Powers?.offerRewind(); // ↩️ por si ha sido sin querer
}

function stop() {
  startGen++;
  clearOutgoingCall();
  closePeer();
  if (socket?.connected) socket.emit('stop');
  if (localStream) localStream.getTracks().forEach((track) => track.stop());
  localStream = null;
  localVideo.srcObject = null;
  $('switchCam').hidden = true;
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

// ---------- Amigos e historial ----------
// La conexión en tiempo real se abre al entrar (sin cámara) para poder ver qué
// amigos están en línea y recibir llamadas aunque no estés en el videochat.
function ensureSocket() {
  if (socket || !token || !me) return;
  if (me.restriction) return;
  if (me.emailRequired && !me.user.emailVerified) return;
  if (me.age?.required && me.age.status !== 'approved') return;
  connectSocket();
}

const contactName = (c) => c.name || t(`g.${c.gender}`);

function avatarEl(c, status) {
  const el = document.createElement('span');
  el.className = 'avatar';
  let h = 0;
  for (const ch of c.handle || '') h = (h * 31 + ch.charCodeAt(0)) % 360;
  el.style.setProperty('--h', h);
  el.textContent = contactName(c).trim().charAt(0).toUpperCase();
  if (status) {
    const dot = document.createElement('span');
    dot.className = `dot ${status}`;
    el.appendChild(dot);
  }
  return el;
}

function agoText(ms) {
  const rtf = new Intl.RelativeTimeFormat(I18N.lang, { numeric: 'auto' });
  const secs = Math.round((ms - Date.now()) / 1000);
  const steps = [[60, 'second'], [3600, 'minute'], [86400, 'hour'], [Infinity, 'day']];
  let unit = 1;
  for (const [limit, name] of steps) {
    if (Math.abs(secs) < limit) return rtf.format(Math.round(secs / unit), name);
    unit = limit;
  }
  return '';
}

function durationText(secs) {
  if (!secs) return '';
  return secs < 60 ? `${secs} s` : `${Math.round(secs / 60)} min`;
}

async function loadContacts() {
  if (!token) return;
  const res = await api('/api/contacts');
  if (!res.friends) return;
  contacts = { friends: res.friends, requests: res.requests, history: res.history, locked: !!res.locked, counts: res.counts };
  renderContacts();
}

function renderBadge() {
  const n = contacts.requests.length;
  $('contactsBadge').textContent = n > 9 ? '9+' : String(n);
  $('contactsBadge').hidden = !n;
  $('ctRequestsCount').textContent = n ? String(n) : '';
  const on = contacts.friends.filter((f) => f.status !== 'offline').length;
  $('ctFriendsCount').textContent = contacts.friends.length ? `${on}/${contacts.friends.length}` : '';
}

// Crea un botón de acción de la lista
function actBtn(act, handle, { label, icon, cls = 'btn ghost', title, disabled } = {}) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = cls;
  b.dataset.act = act;
  b.dataset.h = handle;
  if (title) { b.title = title; b.setAttribute('aria-label', title); }
  if (icon) b.insertAdjacentHTML('beforeend', `<svg class="i"><use href="#i-${icon}"/></svg>`);
  if (label) { const sp = document.createElement('span'); sp.textContent = label; b.appendChild(sp); }
  b.disabled = !!disabled;
  return b;
}
const iconBtn = (act, handle, icon, title, danger) => actBtn(act, handle, { icon, title, cls: `icon-btn${danger ? ' danger' : ''}` });

function contactItem(c, { status, sub, subClass, actions }) {
  const li = document.createElement('li');
  li.className = 'ct-item';
  const main = document.createElement('div');
  main.className = 'ct-main';
  const name = document.createElement('div');
  name.className = 'ct-name';
  name.textContent = contactName(c);
  const s = document.createElement('div');
  s.className = `ct-sub ${subClass || ''}`;
  s.textContent = sub;
  main.append(name, s);
  const acts = document.createElement('div');
  acts.className = 'ct-actions';
  acts.append(...actions);
  li.append(avatarEl(c, status), main, acts);
  return li;
}

function relationTag(rel) {
  const tag = document.createElement('span');
  tag.className = 'ct-tag';
  if (rel === 'friend') tag.innerHTML = '<svg class="i"><use href="#i-user-check"/></svg>';
  tag.append(document.createTextNode(t(rel === 'friend' ? 'ct.isFriend' : 'ct.sent')));
  return tag;
}

function renderContacts() {
  renderBadge();
  if (typeof renderPushHint === 'function') renderPushHint();
  // Sin Premium: solo se ven las solicitudes; amigos e historial muestran la oferta
  const locked = !!contacts.locked;
  $('ctLocked').hidden = !locked || ctTab === 'requests';
  $$('.ct-panel').forEach((p) => { p.hidden = p.dataset.cpanel !== ctTab || (locked && ctTab !== 'requests'); });
  if (locked) {
    const h = contacts.counts?.history || 0;
    const f = contacts.counts?.friends || 0;
    const parts = [];
    if (h) parts.push(h === 1 ? t('ct.teaserOne') : t('ct.teaser', { h }));
    if (f) parts.push(f === 1 ? t('ct.friendsOne') : t('ct.friendsN', { f }));
    $('ctTeaser').textContent = parts.join(' · ');
    $('ctTeaser').hidden = !h && !f;
    $('ctClearLocked').hidden = !h;
  }
  const statusText = { online: t('ct.online'), busy: t('ct.busy'), offline: t('ct.offline') };

  $('ctFriends').replaceChildren(...contacts.friends.map((c) => contactItem(c, {
    status: c.status,
    sub: statusText[c.status],
    subClass: c.status,
    actions: [
      actBtn('call', c.handle, { label: t('ct.call'), icon: 'call', cls: 'btn primary', disabled: c.status !== 'online' }),
      iconBtn('remove', c.handle, 'x', t('ct.remove')),
      iconBtn('block', c.handle, 'ban', t('ct.block'), true),
    ],
  })));
  $('ctFriendsEmpty').hidden = contacts.friends.length > 0;

  $('ctRequests').replaceChildren(...contacts.requests.map((c) => contactItem(c, {
    sub: t('ct.wantsYou', { ago: agoText(c.at) }),
    actions: [
      actBtn('accept', c.handle, { label: t('ct.accept'), icon: 'check', cls: 'btn primary' }),
      actBtn('decline', c.handle, { label: t('ct.decline') }),
      iconBtn('block', c.handle, 'ban', t('ct.block'), true),
    ],
  })));
  $('ctRequestsEmpty').hidden = contacts.requests.length > 0;

  $('ctHistory').replaceChildren(...contacts.history.map((c) => {
    const parts = [agoText(c.lastAt), durationText(c.duration)];
    if (c.times > 1) parts.push(t('ct.times', { n: c.times }));
    let main;
    if (c.relation === 'none') main = actBtn('add', c.handle, { label: t('ct.add'), icon: 'user-plus' });
    else if (c.relation === 'received') main = actBtn('accept', c.handle, { label: t('ct.accept'), icon: 'check', cls: 'btn primary' });
    else main = relationTag(c.relation);
    return contactItem(c, {
      sub: parts.filter(Boolean).join(' · '),
      actions: [main, iconBtn('forget', c.handle, 'trash', t('ct.delete')), iconBtn('block', c.handle, 'ban', t('ct.block'), true)],
    });
  }));
  $('ctHistoryEmpty').hidden = contacts.history.length > 0;
  $('ctClear').hidden = contacts.history.length === 0;
}

let ctTab = 'friends';
function setCtTab(tab) {
  ctTab = tab;
  $$('.ct-tab').forEach((b) => b.classList.toggle('active', b.dataset.ctab === tab));
  renderContacts();
}
$('ctPremium').addEventListener('click', () => { closeModal('contactsModal'); openPremium(); });
$('ctClearLocked').addEventListener('click', () => $('ctClear').click());
$$('.ct-tab').forEach((b) => b.addEventListener('click', () => setCtTab(b.dataset.ctab)));

function openContacts(tab) {
  if (!token) { openAuth('register'); return; }
  setCtTab(tab || (contacts.requests.length ? 'requests' : ctTab));
  renderContacts();
  openModal('contactsModal');
  loadContacts();
}
$('contactsBtn').addEventListener('click', () => openContacts());

const findContact = (h) => [...contacts.friends, ...contacts.requests, ...contacts.history].find((c) => c.handle === h);

$('contactsModal').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const h = btn.dataset.h;
  const c = findContact(h);
  if (!c) return;
  const name = contactName(c);
  const post = (path) => api(path, { method: 'POST', body: { handle: h } });
  if (['call', 'add'].includes(btn.dataset.act) && !premium) { closeModal('contactsModal'); openPremium(); return; }
  let res;
  switch (btn.dataset.act) {
    case 'call': callFriend(c); return;
    case 'add':
      res = await post('/api/friends/request');
      if (res.relation) toast(t(res.relation === 'friend' ? 'ct.nowFriends' : 'ct.requestSent', { name }));
      break;
    case 'accept':
      res = await post('/api/friends/accept');
      if (res.relation) toast(t('ct.nowFriends', { name }));
      break;
    case 'decline': res = await post('/api/friends/decline'); break;
    case 'remove':
      if (!confirm(t('ct.confirmRemove', { name }))) return;
      res = await post('/api/friends/remove');
      break;
    case 'block':
      if (!confirm(t('ct.confirmBlock', { name }))) return;
      res = await post('/api/contacts/block');
      if (res.ok) toast(t('ct.blocked', { name }));
      break;
    case 'forget': res = await post('/api/history/remove'); break;
    default: return;
  }
  if (res?.code) toast(errorText(res));
  loadContacts();
});

$('ctClear').addEventListener('click', async () => {
  if (!confirm(t('ct.confirmClear'))) return;
  await api('/api/history/clear', { method: 'POST' });
  loadContacts();
});

// ----- Botón «Añadir amigo» durante el videochat -----
function renderFriendBtn() {
  const btn = $('friendBtn');
  if (!partner || !connected) { btn.hidden = true; return; }
  const rel = partner.relation || 'none';
  const conf = {
    none: [premium ? 'user-plus' : 'star', 'ct.add'],
    sent: ['user-plus', 'ct.sent'],
    received: ['user-check', 'ct.acceptFriend'],
    friend: ['user-check', 'ct.isFriend'],
  }[rel];
  btn.className = `friend-btn ${rel}`;
  btn.querySelector('use').setAttribute('href', `#i-${conf[0]}`);
  btn.querySelector('span').textContent = t(conf[1]);
  btn.setAttribute('aria-label', t(conf[1]));
  btn.disabled = rel === 'sent' || rel === 'friend';
  btn.hidden = false;
}

function friendFromChat() {
  if (!partner || !connected) return;
  const rel = partner.relation || 'none';
  if (rel !== 'none' && rel !== 'received') return;
  // Enviar solicitudes es Premium; aceptar las que llegan, no
  if (rel === 'none' && !premium) { toast(t('ct.premiumOnly')); openPremium(); return; }
  const name = contactName(partner);
  socket.emit(rel === 'received' ? 'friend-accept' : 'friend-request', null, (res) => {
    if (res?.code) { toast(errorText(res)); return; }
    if (!partner) return;
    partner.relation = res.relation;
    renderFriendBtn();
    toast(t(res.relation === 'friend' ? 'ct.nowFriends' : 'ct.requestSent', { name }));
    loadContacts();
  });
}
$('friendBtn').addEventListener('click', friendFromChat);

// Mensaje del sistema con un botón (p. ej. «Aceptar» una solicitud)
function addSysAction(text, label, fn) {
  const p = document.createElement('p');
  p.className = 'msg sys';
  p.textContent = text;
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'inline-btn';
  b.textContent = label;
  b.addEventListener('click', () => { b.remove(); fn(); });
  p.appendChild(b);
  messages.appendChild(p);
  messages.scrollTop = messages.scrollHeight;
}

// ----- Llamadas -----
function clearOutgoingCall() {
  if (outgoingCall && socket?.connected) socket.emit('call-cancel');
  outgoingCall = null;
  $('callCancel').hidden = true;
}

async function callFriend(c) {
  if (!socket?.connected) { toast(t('err.offline')); return; }
  closeModal('contactsModal');
  showChat();
  if (!(await startCamera())) return;
  if (outgoingCall) clearOutgoingCall();
  closePeer();
  resetMessages();
  setRunning(true);
  outgoingCall = { ...c };
  setStatus('call.calling', { name: contactName(c) }, true);
  $('callCancel').hidden = false;
  socket.emit('call', { handle: c.handle }, (res) => {
    if (!outgoingCall || outgoingCall.handle !== c.handle) return;
    if (res?.code) {
      outgoingCall = null;
      toast(errorText(res));
      stop();
      loadContacts();
      return;
    }
    outgoingCall.callId = res.callId;
  });
}

$('callCancel').addEventListener('click', () => { clearOutgoingCall(); stop(); });

const baseTitle = document.title;
function renderIncomingCall() {
  const c = incomingCall;
  const av = avatarEl(c);
  av.id = 'callAvatar';
  av.classList.add('xl', 'ringing');
  $('callAvatar').replaceWith(av);
  $('callTitle').textContent = t('call.incoming', { name: contactName(c) });
}

function closeIncomingCall() {
  incomingCall = null;
  closeModal('callModal');
  document.title = baseTitle;
  if (navigator.vibrate) navigator.vibrate(0);
}

$('callDecline').addEventListener('click', () => {
  if (incomingCall) socket?.emit('call-answer', { callId: incomingCall.callId, accept: false });
  closeIncomingCall();
});

$('callAccept').addEventListener('click', async () => {
  const c = incomingCall;
  if (!c) return;
  closeIncomingCall();
  const wasRunning = running;
  showChat();
  if (!(await startCamera())) {
    socket.emit('call-answer', { callId: c.callId, accept: false });
    return;
  }
  clearOutgoingCall();
  closePeer();
  resetMessages();
  setRunning(true);
  setStatus('call.connecting', null, true);
  socket.emit('call-answer', { callId: c.callId, accept: true }, (res) => {
    if (!res?.code) return;
    toast(errorText(res));
    if (wasRunning) { setSearching(); find(); } else stop();
  });
});

const greeted = new Set(); // amigos de los que ya avisamos que están en línea
function bindContactEvents(s) {
  s.on('friend-request', (c) => {
    const name = contactName(c);
    if (partner && connected && partner.handle === c.handle) {
      partner.relation = 'received';
      renderFriendBtn();
      addSysAction(t('ct.wantsFriend', { name }), t('ct.accept'), friendFromChat);
    } else {
      toast(t('ct.wantsFriend', { name }));
    }
    loadContacts();
  });

  s.on('friend-accepted', (c) => {
    if (partner && partner.handle === c.handle) { partner.relation = 'friend'; renderFriendBtn(); }
    if (!c.silent) toast(t('ct.nowFriends', { name: contactName(c) }));
    loadContacts();
  });

  s.on('friend-removed', (c) => {
    if (partner && partner.handle === c.handle) { partner.relation = 'none'; renderFriendBtn(); }
    loadContacts();
  });

  s.on('friend-status', ({ handle, status }) => {
    const f = contacts.friends.find((x) => x.handle === handle);
    if (!f) { loadContacts(); return; }
    const was = f.status;
    f.status = status;
    if (status === 'online' && was === 'offline' && !connected && !greeted.has(handle)) {
      greeted.add(handle);
      toast(t('ct.friendOnline', { name: contactName(f) }));
    }
    renderContacts();
  });

  s.on('incoming-call', (c) => {
    incomingCall = c;
    renderIncomingCall();
    openModal('callModal');
    document.title = `📞 ${t('call.incoming', { name: contactName(c) })}`;
    localNotify(t('call.incoming', { name: contactName(c) }), t('call.hint'), `call-${c.callId}`);
    if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 400]);
  });

  s.on('call-closed', ({ callId, reason }) => {
    if (incomingCall?.callId !== callId) return;
    const name = contactName(incomingCall);
    closeIncomingCall();
    if (reason === 'timeout' || reason === 'cancelled') toast(t('call.missed', { name }));
  });

  s.on('call-ended', ({ reason, name, gender }) => {
    if (!outgoingCall) return;
    outgoingCall = null;
    $('callCancel').hidden = true;
    if (reason !== 'cancelled') toast(t(`call.${reason}`, { name: name || t(`g.${gender}`) }));
    stop();
    loadContacts();
  });
}

// ----- Nombre en el chat -----
$('nickForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('nickError').hidden = true;
  const res = await api('/api/me/nick', { method: 'POST', body: { nick: $('nickInput').value } });
  if (!res.ok) { $('nickError').textContent = errorText(res); $('nickError').hidden = false; return; }
  if (me?.user) me.user.nick = res.nick;
  $('nickInput').value = res.nick;
  toast(t('acc.nickSaved'));
});

// ---------- Mi cuenta: pestañas y ajustes ----------
function setAccTab(tab) {
  $$('.acc-tab').forEach((b) => b.classList.toggle('active', b.dataset.atab === tab));
  $$('.acc-panel').forEach((p) => { p.hidden = p.dataset.apanel !== tab; });
  if (tab === 'privacy') loadBlocked();
  if (tab === 'notify') renderPush();
}
$$('.acc-tab').forEach((b) => b.addEventListener('click', () => setAccTab(b.dataset.atab)));

function renderSettings() {
  if (!me?.user) return;
  const hasPass = me.user.hasPassword;
  $('passCurrentField').hidden = !hasPass;
  $('passTitle').textContent = t(hasPass ? 'set.passTitle' : 'set.passCreate');
  $('emailConfirmLabel').textContent = t(hasPass ? 'set.confirmPass' : 'set.confirmEmail');
  $('emailConfirm').type = hasPass ? 'password' : 'email';
  $('emailPending').hidden = !me.user.pendingEmail;
  if (me.user.pendingEmail) $('emailPending').textContent = t('set.emailPending', { email: me.user.pendingEmail });
  $('prefMirror').checked = me.user.prefs?.mirror !== false;
  window.Play?.sync();
  const n = me.user.prefs?.notify || {};
  $('prefCalls').checked = n.calls !== false;
  $('prefRequests').checked = n.requests !== false;
  $('prefOnline').checked = !!n.online;
}

const formError = (id, msg) => { $(id).textContent = msg; $(id).hidden = !msg; };

$('passForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  formError('passError', '');
  const password = $('passNew').value;
  if (password.length < 8) return formError('passError', t('err.password'));
  const res = await api('/api/me/password', { method: 'POST', body: { current: $('passCurrent').value, password } });
  if (!res.token) return formError('passError', errorText(res));
  token = res.token;
  save('session', token);
  $('passCurrent').value = ''; $('passNew').value = '';
  await refreshMe();
  renderSettings();
  toast(t('set.passSaved'));
});

$('emailForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  formError('emailError', '');
  const res = await api('/api/me/email', { method: 'POST', body: { email: $('emailNew').value.trim(), password: $('emailConfirm').value } });
  if (!res.ok) return formError('emailError', errorText(res));
  $('emailNew').value = ''; $('emailConfirm').value = '';
  await refreshMe();
  renderAccount();
  toast(res.changed ? t('set.emailChanged') : t('set.emailSent', { email: res.email }));
});

$('logoutAll').addEventListener('click', async () => {
  if (!confirm(t('set.logoutAllConfirm'))) return;
  await api('/api/logout-all', { method: 'POST' });
  closeModal('accountModal');
  logout(false);
  toast(t('set.loggedOutAll'));
});

async function loadBlocked() {
  const res = await api('/api/me/blocked');
  const list = res.blocked || [];
  $('blockedList').replaceChildren(...list.map((c) => contactItem(c, {
    sub: t(`g.${c.gender}`),
    actions: [actBtn('unblock', c.handle, { label: t('set.unblock') })],
  })));
  $('blockedEmpty').hidden = list.length > 0;
}
$('blockedList').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-act=unblock]');
  if (!b) return;
  const name = b.closest('.ct-item').querySelector('.ct-name').textContent;
  const res = await api('/api/me/unblock', { method: 'POST', body: { handle: b.dataset.h } });
  if (res.ok) toast(t('set.unblocked', { name })); else toast(errorText(res));
  loadBlocked();
});

async function savePrefs(body) {
  const res = await api('/api/me/prefs', { method: 'POST', body });
  if (res.prefs && me?.user) me.user.prefs = res.prefs;
}
$('prefMirror').addEventListener('change', async () => { await savePrefs({ mirror: $('prefMirror').checked }); applyMirror(); });
['prefCalls', 'prefRequests', 'prefOnline'].forEach((id) => $(id).addEventListener('change', () => savePrefs({
  notify: { calls: $('prefCalls').checked, requests: $('prefRequests').checked, online: $('prefOnline').checked },
})));

// ---------- Notificaciones (con permiso del navegador) ----------
const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const b64ToBytes = (s) => {
  const b = atob((s + '='.repeat((4 - (s.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
};
async function pushSubscription() {
  if (!pushSupported) return null;
  try { return await (await navigator.serviceWorker.ready).pushManager.getSubscription(); } catch { return null; }
}
async function renderPush() {
  $('pushUnsupported').hidden = pushSupported;
  if (!pushSupported) { ['pushOn', 'pushOff', 'pushTest'].forEach((id) => { $(id).hidden = true; }); return; }
  const denied = Notification.permission === 'denied';
  const sub = await pushSubscription();
  $('pushDenied').hidden = !denied;
  $('pushOn').hidden = !!sub || denied;
  $('pushOff').hidden = !sub;
  $('pushTest').hidden = !sub;
  $('pushPrefs').classList.toggle('off', !sub);
  renderPushHint();
}
async function enablePush() {
  if (!pushSupported || !token) return;
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') { renderPush(); return; }
  try {
    const { key } = await (await fetch('/api/push/key')).json();
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(key) });
    const res = await api('/api/push/subscribe', { method: 'POST', body: { subscription: sub.toJSON() } });
    if (!res.ok) throw new Error();
    toast(t('push.on'));
  } catch {
    toast(t('push.failed'));
  }
  renderPush();
}
async function disablePush() {
  const sub = await pushSubscription();
  if (sub) {
    await api('/api/push/unsubscribe', { method: 'POST', body: { endpoint: sub.endpoint } });
    await sub.unsubscribe().catch(() => {});
  }
  toast(t('push.off'));
  renderPush();
}
$('pushOn').addEventListener('click', enablePush);
$('pushOff').addEventListener('click', disablePush);
$('pushTest').addEventListener('click', async () => {
  const res = await api('/api/push/test', { method: 'POST' });
  toast(res.ok ? t('push.testSent') : t('push.failed'));
});
// Sugerencia en el panel de amigos para activar los avisos
async function renderPushHint() {
  const show = pushSupported && token && Notification.permission === 'default' && contacts.friends.length > 0 && !(await pushSubscription());
  $('pushHint').hidden = !show;
}
$('pushHintBtn').addEventListener('click', enablePush);
// Notificación tocada con la web ya abierta: se abre el panel correspondiente
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (e) => {
    if (e.data?.type !== 'open' || !token) return;
    const which = new URL(e.data.url, location.origin).searchParams.get('contacts');
    if (which) openContacts(which === 'requests' ? 'requests' : 'friends');
  });
}

// Aviso del sistema cuando llaman y la pestaña no está a la vista
function localNotify(title, body, tag) {
  if (!pushSupported || Notification.permission !== 'granted' || !document.hidden) return;
  navigator.serviceWorker.ready.then((reg) => reg.showNotification(title, { body, tag, icon: '/icon-192.png', badge: '/icon-192.png', requireInteraction: true })).catch(() => {});
}

// ---------- Sanciones: motivo y recurso ----------
function reasonText(code) {
  const key = ['moderation', 'multipleReports', 'underage', 'chargeback', 'fraud'].includes(code) ? `rr.${code}` : `rep.${code}`;
  const text = t(key);
  return text === key ? t('rr.moderation') : text;
}
async function renderAppeal() {
  $('appealForm').hidden = true;
  $('appealOpen').hidden = true;
  $('appealStatus').hidden = true;
  if (!token) return;
  const res = await api('/api/appeals/mine');
  const a = res.appeal;
  if (a && a.status === 'open') {
    $('appealStatus').textContent = t('ap.pending', { ref: a.reference });
    $('appealStatus').hidden = false;
    return;
  }
  if (a && a.decision === 'reject') {
    $('appealStatus').textContent = [t('ap.rejected', { ref: a.reference }), a.response].filter(Boolean).join(' ');
    $('appealStatus').hidden = false;
  }
  $('appealOpen').hidden = false;
}
$('appealOpen').addEventListener('click', () => {
  $('appealOpen').hidden = true;
  $('appealForm').hidden = false;
  formError('appealError', '');
  focusSoon('appealText');
});
$('appealForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const res = await api('/api/appeals', { method: 'POST', body: { message: $('appealText').value } });
  if (!res.ok) return formError('appealError', errorText(res));
  $('appealText').value = '';
  toast(t('ap.sent'));
  renderAppeal();
});

// ---------- Anuncio general ----------
let announcement = null;
function renderAnnouncement() {
  const a = announcement;
  let dismissed = '';
  try { dismissed = localStorage.getItem('ann-dismissed') || ''; } catch { /* sin almacenamiento */ }
  if (!a || String(a.id) === dismissed) { $('announce').hidden = true; return; }
  $('announceText').textContent = a.text[I18N.lang] || (I18N.lang === 'es' ? a.text.es : a.text.en || a.text.es);
  $('announce').className = `announce ${a.level}`;
  $('announce').hidden = false;
}
$('announceClose').addEventListener('click', () => {
  try { localStorage.setItem('ann-dismissed', String(announcement?.id || '')); } catch { /* sin almacenamiento */ }
  $('announce').hidden = true;
});
fetch('/api/announcement').then((r) => r.json()).then((r) => { announcement = r.announcement; renderAnnouncement(); }).catch(() => {});

// ---------- Teclado ----------
// Esc: cierra la ventana abierta o, si no hay ninguna, pasa a la siguiente persona
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (anyModalOpen()) {
    $$('.overlay').forEach((o) => { if (o.id !== 'ageGate' && o.id !== 'callModal') o.hidden = true; });
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
  document.querySelectorAll('.trial-note').forEach((n) => { n.hidden = freeMode || trialOff; });
  document.querySelectorAll('.invite-note').forEach((n) => { n.hidden = freeMode; });
  $('paidBox').hidden = freeMode;
  setPremium(premium);
  renderDynamicTexts();
}).catch(() => {});

fetch('/api/config').then((r) => r.json()).then((c) => {
  translateEnabled = !!c.translate;
  trialOff = !c.trialDays;
  document.querySelectorAll('.trial-note').forEach((n) => { n.hidden = freeMode || trialOff; });
  turnstileKey = c.turnstile || null;
  const providers = c.providers || [];
  $$('.social-btn').forEach((a) => { a.hidden = !providers.includes(a.dataset.provider); });
  $('socialLogin').hidden = providers.length === 0;
}).catch(() => {});

(async () => {
  await refreshMe();
  const params = new URLSearchParams(location.search);
  if (['order', 'reset', 'age', 'verify', 'social', 'login_error', 'emailchange', 'contacts'].some((k) => params.has(k))) history.replaceState(null, '', location.pathname);
  // Enlace del email para confirmar el cambio de email
  if (params.get('emailchange')) {
    const res = await api('/api/email/change', { method: 'POST', body: { token: params.get('emailchange') } });
    if (res.ok) { await refreshMe(); toast(t('set.emailChanged')); } else toast(errorText(res));
  }
  // Desde una notificación: abre amigos o solicitudes
  if (params.get('contacts') && token) openContacts(params.get('contacts') === 'requests' ? 'requests' : 'friends');
  if (params.get('social')) {
    if (!load('age-ok')) { save('age-ok', '1'); closeModal('ageGate'); }
    finishSocial(params.get('social'));
  }
  if (params.get('login_error')) toast(t(`soc.e_${params.get('login_error')}`));
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

// Guindilla, el asistente, como botón flotante en la portada (no sale durante el videochat)
if (window.Guindilla) window.Guindilla.launcher();
