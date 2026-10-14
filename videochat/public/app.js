const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);
const localVideo = $('localVideo');
const remoteVideo = $('remoteVideo');
const messages = $('messages');
const chatInput = $('chatInput');

const LABELS = { mujer: 'Mujer', hombre: 'Hombre', trans: 'Transexual', pareja: 'Pareja' };
const PLURALS = { mujer: 'mujeres', hombre: 'hombres', trans: 'transexuales', pareja: 'parejas' };

let socket = null;
let localStream = null;
let pc = null;
let iceConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
let pendingCandidates = [];
let running = false;
let connected = false;

let token = load('session');
let me = null;           // respuesta de /api/me
let premium = false;
let want = '';           // '' = todos
let pendingAction = null; // lo que quería hacer antes de iniciar sesión

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
    return { status: 0, error: 'Sin conexión. Inténtalo de nuevo.' };
  }
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
function closeModal(id) { $(id).hidden = true; }
function anyModalOpen() { return [...$$('.overlay')].some((o) => !o.hidden); }

$$('.overlay').forEach((overlay) => {
  overlay.addEventListener('click', (e) => {
    if (overlay.id === 'ageGate') return;
    if (e.target === overlay || e.target.closest('[data-close]')) overlay.hidden = true;
  });
});

const money = (n) => `${n.toFixed(2).replace('.', ',')} €`;
const dateEs = (ms) => new Date(ms).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

// ---------- Aviso de edad ----------
if (!load('age-ok')) openModal('ageGate');
$('ageYes').addEventListener('click', () => { save('age-ok', '1'); closeModal('ageGate'); });

// ---------- Cuenta ----------
let authMode = 'register';
let myGender = '';

function setAuthMode(mode) {
  authMode = mode;
  $$('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === mode));
  $('authForm').classList.toggle('login', mode === 'login');
  $('authSubmit').textContent = mode === 'login' ? 'Entrar' : 'Crear cuenta gratis';
  $('authPassword').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  $('authError').hidden = true;
}

function openAuth(mode = 'register', action = null) {
  pendingAction = action;
  setAuthMode(mode);
  openModal('authModal');
  setTimeout(() => $('authEmail').focus(), 50);
}

$$('[data-open-auth]').forEach((b) => b.addEventListener('click', () => openAuth(b.dataset.openAuth)));
$$('.tab').forEach((t) => t.addEventListener('click', () => setAuthMode(t.dataset.tab)));
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
  if (!email || !password) return showError('Escribe tu email y tu contraseña');

  let res;
  if (authMode === 'register') {
    if (!myGender) return showError('Elige qué eres: mujer, hombre, transexual o pareja');
    if (!$('authTerms').checked) return showError('Debes confirmar que eres mayor de edad y aceptar las normas');
    $('authSubmit').disabled = true;
    res = await api('/api/register', { method: 'POST', body: { email, password, gender: myGender, adult: true, terms: true } });
  } else {
    $('authSubmit').disabled = true;
    res = await api('/api/login', { method: 'POST', body: { email, password } });
  }
  $('authSubmit').disabled = false;
  if (!res.token) return showError(res.error || 'No se pudo completar. Inténtalo de nuevo.');

  token = res.token;
  save('session', token);
  $('authPassword').value = '';
  closeModal('authModal');
  await refreshMe();
  toast(authMode === 'register' ? '¡Bienvenido/a a La Ruleta Caliente! 🔥' : '¡Hola de nuevo! 🔥');
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
  if (data?.restriction) showRestricted(data.restriction);
}

function logout(notify = true) {
  stop();
  if (socket) { socket.disconnect(); socket = null; }
  token = '';
  save('session', '');
  applyMe(null);
  showLanding();
  if (notify) toast('Has cerrado sesión');
}
$('logoutBtn').addEventListener('click', () => logout());

function showRestricted(r) {
  stop();
  if (r.type === 'banned') {
    $('restrictedTitle').textContent = 'Cuenta expulsada';
    $('restrictedText').textContent = 'Tu cuenta ha sido expulsada por no respetar las normas de la comunidad.';
  } else {
    $('restrictedTitle').textContent = 'Cuenta suspendida';
    $('restrictedText').textContent = `Tu cuenta está suspendida hasta el ${new Date(r.until).toLocaleString('es-ES')} por denuncias de otros usuarios.`;
  }
  openModal('restrictedModal');
}

// ---------- Vistas ----------
function showLanding() {
  document.body.classList.remove('in-chat');
  $('landing').hidden = false;
  $('chatView').hidden = true;
}

function enterChat() {
  if (!token) { openAuth('register', 'start'); return; }
  if (me?.restriction) { showRestricted(me.restriction); return; }
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
async function refreshOnline() {
  try {
    const { online } = await (await fetch('/stats')).json();
    $('onlineCount').textContent = online;
    $('onlinePill').hidden = online < 1;
  } catch { /* sin estadísticas */ }
}
setInterval(refreshOnline, 15000);
refreshOnline();

// ---------- Premium ----------
function setPremium(value) {
  premium = value;
  const logged = !!me;
  $('premiumBtn').hidden = !logged || premium;
  $('manageBtn').hidden = !logged || !premium;
  $('lockNote').hidden = premium;
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

fetch('/api/plan').then((r) => r.json()).then((plan) => {
  $$('.priceText').forEach((el) => { el.textContent = money(plan.price); });
  $$('.passDays').forEach((el) => { el.textContent = plan.passDays; });
  $('payCard').hidden = !plan.methods.card;
  $('payCrypto').hidden = !plan.methods.crypto;
  $('demoNote').hidden = !plan.demo;
}).catch(() => {});

async function premiumActivated() {
  closeModal('premiumModal');
  $('payWait').hidden = true;
  await refreshMe();
  toast('⭐ ¡Ya eres Premium! Elige a quién quieres ver.');
  // Reconecta para que el servidor reconozca la suscripción
  if (socket) {
    socket.disconnect().connect();
    if (running) { closePeer(); setStatus('Buscando a alguien…', true); }
  }
}

// method: 'card' (tarjeta, Google Pay, Apple Pay) o 'crypto'
async function pay(method) {
  const buttons = [$('payCard'), $('payCrypto')];
  buttons.forEach((b) => { b.disabled = true; });
  const res = await api('/api/checkout', { method: 'POST', body: { method } });
  buttons.forEach((b) => { b.disabled = false; });
  if (res.activated) premiumActivated();              // modo demo
  else if (res.url) location.href = res.url;          // página de pago de Segpay
  else toast(res.error || 'No se pudo iniciar el pago');
}
$('payCard').addEventListener('click', () => pay('card'));
$('payCrypto').addEventListener('click', () => pay('crypto'));

function manage() {
  if (!me?.premium) return;
  const until = dateEs(me.expires);
  if (me.cancelUrl) {
    if (confirm(`Tu Premium se renueva el ${until}.\n\n¿Quieres gestionar o cancelar la suscripción?`)) {
      window.open(me.cancelUrl, '_blank', 'noopener');
    }
  } else {
    toast(`⭐ Tu Premium está activo hasta el ${until}`);
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
  toast('No se ha podido confirmar el pago. Si has pagado, escríbenos a soporte.');
}

// ---------- WebRTC ----------
function setStatus(text, searching = false) {
  $('status').hidden = !text;
  $('status').classList.toggle('searching', searching);
  $('statusText').textContent = text;
}

function addMsg(text, who) {
  const p = document.createElement('p');
  p.className = `msg ${who}`;
  p.textContent = text;
  messages.appendChild(p);
  messages.scrollTop = messages.scrollHeight;
}

function resetMessages() {
  messages.innerHTML = '';
  addMsg('Sé amable 💛 Las burlas, el acoso y la homofobia o transfobia están prohibidos.', 'sys');
}
resetMessages();

function setConnected(value) {
  connected = value;
  chatInput.disabled = !value;
  $('sendBtn').disabled = !value;
  $('reportBtn').hidden = !value;
  if (!value) $('partnerTag').hidden = true;
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
  localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
  pc.ontrack = (e) => { remoteVideo.srcObject = e.streams[0]; };
  pc.onicecandidate = (e) => { if (e.candidate) socket.emit('signal', { candidate: e.candidate }); };
  pc.onconnectionstatechange = () => {
    if (pc && pc.connectionState === 'failed') {
      addMsg('No se pudo conectar. Buscando otra persona…', 'sys');
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

function searchingText() {
  return want ? `Buscando ${PLURALS[want]}…` : 'Buscando a alguien…';
}

function connectSocket() {
  socket = io({ auth: (cb) => cb({ token }) });

  socket.on('connect', () => { refreshOnline(); if (running) find(); });

  socket.on('connect_error', (err) => {
    if (err.message === 'auth') { socket.disconnect(); logout(false); openAuth('login'); }
    if (err.message === 'restricted') { socket.disconnect(); showRestricted(err.data); }
  });

  socket.on('account', (acc) => { if (acc.premium !== premium) refreshMe(); });

  socket.on('waiting', () => setStatus(searchingText(), true));

  socket.on('matched', async ({ initiator, gender }) => {
    resetMessages();
    setStatus('');
    addMsg('¡Conectado! Saluda 👋', 'sys');
    createPeer();
    setConnected(true);
    if (gender) {
      $('partnerTag').textContent = LABELS[gender];
      $('partnerTag').hidden = false;
    }
    if (initiator) {
      await pc.setLocalDescription(await pc.createOffer());
      socket.emit('signal', { sdp: pc.localDescription });
    }
  });

  socket.on('signal', (data) => handleSignal(data).catch(console.error));
  socket.on('chat', (text) => addMsg(text, 'them'));

  socket.on('partner-left', () => {
    closePeer();
    addMsg('La otra persona se ha ido.', 'sys');
    setStatus(searchingText(), true);
    find();
  });

  socket.on('restricted', (r) => showRestricted(r));
}

async function start() {
  setStatus('Activando tu cámara…');
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  } catch {
    setStatus('Necesitamos acceso a tu cámara y micrófono para empezar. Revisa los permisos del navegador.');
    return;
  }
  localVideo.srcObject = localStream;
  try {
    iceConfig = await (await fetch('/ice')).json();
  } catch { /* se usa la configuración por defecto */ }
  setRunning(true);
  setStatus(searchingText(), true);
  if (!socket) connectSocket();   // al conectar emite 'find'
  else if (!socket.connected) socket.connect();
  else find();
}

function next() {
  closePeer();
  resetMessages();
  setStatus(searchingText(), true);
  find();
}

function stop() {
  closePeer();
  if (socket?.connected) socket.emit('stop');
  if (localStream) localStream.getTracks().forEach((t) => t.stop());
  localStream = null;
  localVideo.srcObject = null;
  setRunning(false);
  setStatus('Pulsa «Empezar» para conocer a alguien');
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
  if (!reason) { $('reportError').textContent = 'Elige un motivo'; $('reportError').hidden = false; return; }
  if (!connected) { closeModal('reportModal'); toast('La conversación ya ha terminado.'); return; }
  socket.emit('report', { reason, comment: $('reportComment').value }, (res) => {
    if (res?.error) { $('reportError').textContent = res.error; $('reportError').hidden = false; return; }
    closeModal('reportModal');
    toast('Gracias por avisar. Revisaremos la denuncia y no volveréis a coincidir.');
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

// ---------- Arranque ----------
(async () => {
  await refreshMe();
  const order = new URLSearchParams(location.search).get('order');
  if (order) {
    history.replaceState(null, '', '/');
    if (token) waitPayment(order);
  }
})();
