const $ = (id) => document.getElementById(id);
const localVideo = $('localVideo');
const remoteVideo = $('remoteVideo');
const statusEl = $('status');
const messages = $('messages');
const chatInput = $('chatInput');

const LABELS = { chica: 'Chica', chico: 'Chico', trans: 'Trans' };
const PLURALS = { chica: 'chicas', chico: 'chicos', trans: 'personas trans' };

let socket = null;
let localStream = null;
let pc = null;
let iceConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
let pendingCandidates = [];
let running = false;

let myGender = sessionStorage.getItem('gender') || '';
let want = '';           // '' = todos
let premium = false;

function getToken() {
  try { return localStorage.getItem('premium-token') || ''; } catch { return ''; }
}
function setToken(t) {
  try { localStorage.setItem('premium-token', t); } catch { /* sin almacenamiento */ }
}

// ---- Entrada: edad + género ----
function updateEnter() {
  $('enterBtn').disabled = !($('ageCheck').checked && myGender);
}
$('myGender').addEventListener('click', (e) => {
  const g = e.target.dataset?.g;
  if (!g) return;
  myGender = g;
  for (const c of $('myGender').children) c.classList.toggle('active', c.dataset.g === g);
  updateEnter();
});
$('ageCheck').addEventListener('change', updateEnter);
$('enterBtn').addEventListener('click', () => {
  sessionStorage.setItem('age-ok', '1');
  sessionStorage.setItem('gender', myGender);
  $('gate').classList.add('hidden');
});
if (sessionStorage.getItem('age-ok') && myGender) $('gate').classList.add('hidden');

// ---- Utilidades de interfaz ----
function setStatus(text) { statusEl.textContent = text; }

function addMsg(text, who) {
  const div = document.createElement('div');
  div.className = `msg ${who}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function setConnected(connected) {
  chatInput.disabled = !connected;
  $('sendBtn').disabled = !connected;
  if (!connected) $('partnerTag').classList.add('hidden');
}

function setRunning(on) {
  running = on;
  $('startBtn').disabled = on;
  $('nextBtn').disabled = !on;
  $('stopBtn').disabled = !on;
}

async function refreshOnline() {
  try {
    const r = await fetch('/stats');
    const { online } = await r.json();
    $('online').textContent = `${online} conectados`;
  } catch { /* sin estadísticas */ }
}
setInterval(refreshOnline, 10000);
refreshOnline();

// ---- Premium ----
function setPremium(value) {
  premium = value;
  $('premiumBtn').classList.toggle('hidden', premium);
  $('manageBtn').classList.toggle('hidden', !premium);
  $('lockNote').classList.toggle('hidden', premium);
  document.querySelector('.filter').classList.toggle('locked', !premium);
  if (!premium) selectWant('');
}

function selectWant(g) {
  want = g;
  for (const c of $('wantGender').children) c.classList.toggle('active', c.dataset.g === g);
}

$('wantGender').addEventListener('click', (e) => {
  const g = e.target.dataset?.g;
  if (g === undefined) return;
  if (g && !premium) { openPremium(); return; }
  if (g === want) return;
  selectWant(g);
  if (running) next();
});

function openPremium() { $('premiumModal').classList.remove('hidden'); }
$('premiumBtn').addEventListener('click', openPremium);
$('closePremium').addEventListener('click', () => $('premiumModal').classList.add('hidden'));

fetch('/api/plan').then((r) => r.json()).then((plan) => {
  $('priceText').textContent = `${plan.price.toFixed(2).replace('.', ',')} €`;
  $('demoNote').classList.toggle('hidden', !plan.demo);
}).catch(() => {});

function activatePremium(token) {
  setToken(token);
  setPremium(true);
  $('premiumModal').classList.add('hidden');
  addMsg('⭐ ¡Ya eres Premium! Elige a quién quieres ver.', 'sys');
  // Reconecta para que el servidor reconozca la suscripción
  if (socket) {
    socket.auth.token = token;
    socket.disconnect().connect();
    if (running) { closePeer(); setStatus('Buscando a alguien…'); }
  }
}

$('subscribeBtn').addEventListener('click', async () => {
  $('subscribeBtn').disabled = true;
  try {
    const res = await (await fetch('/api/checkout', { method: 'POST' })).json();
    if (res.token) activatePremium(res.token);          // modo demo
    else if (res.url) { location.href = res.url; return; } // Stripe Checkout
    else alert(res.error || 'No se pudo iniciar el pago');
  } catch {
    alert('No se pudo iniciar el pago');
  }
  $('subscribeBtn').disabled = false;
});

$('manageBtn').addEventListener('click', async () => {
  const res = await (await fetch('/api/portal', {
    method: 'POST', headers: { Authorization: `Bearer ${getToken()}` },
  })).json().catch(() => ({}));
  if (res.url) location.href = res.url;
  else alert('Tu suscripción Premium está activa.');
});

// Vuelta desde Stripe tras pagar, o comprobación de una suscripción guardada
(async () => {
  const sessionId = new URLSearchParams(location.search).get('session_id');
  if (sessionId) {
    history.replaceState(null, '', '/');
    const res = await (await fetch(`/api/checkout/confirm?session_id=${encodeURIComponent(sessionId)}`)).json().catch(() => ({}));
    if (res.token) { activatePremium(res.token); return; }
    alert(res.error || 'No se pudo confirmar el pago');
  }
  const token = getToken();
  if (!token) { setPremium(false); return; }
  const me = await (await fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })).json().catch(() => ({}));
  setPremium(!!me.premium);
})();

// ---- WebRTC ----
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

// ---- Socket / emparejamiento ----
function find() {
  // Si está reconectando, el evento 'connect' buscará con el filtro actual
  if (socket.connected) socket.emit('find', { want: want ? [want] : [] });
}

function connectSocket() {
  socket = io({ auth: { gender: myGender, token: getToken() } });

  // Tras (re)conectar, si estaba buscando vuelve a la cola
  socket.on('connect', () => { refreshOnline(); if (running) find(); });

  socket.on('account', (acc) => setPremium(acc.premium));

  socket.on('waiting', () => setStatus(
    want ? `Buscando ${PLURALS[want]}…` : 'Buscando a alguien…'));

  socket.on('matched', async ({ initiator, gender }) => {
    messages.innerHTML = '';
    setStatus('');
    addMsg('¡Conectado! Saluda 👋', 'sys');
    createPeer();
    setConnected(true);
    if (gender) {
      $('partnerTag').textContent = LABELS[gender];
      $('partnerTag').classList.remove('hidden');
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
    find();
  });
}

async function start() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  } catch {
    setStatus('Necesitamos acceso a tu cámara y micrófono para empezar.');
    return;
  }
  localVideo.srcObject = localStream;
  try {
    iceConfig = await (await fetch('/ice')).json();
  } catch { /* se usa la configuración por defecto */ }
  setRunning(true);
  refreshOnline();
  setStatus('Buscando a alguien…');
  if (!socket) connectSocket();   // al conectar emite 'find'
  else find();
}

function next() {
  closePeer();
  messages.innerHTML = '';
  setStatus('Buscando a alguien…');
  find();
}

function stop() {
  closePeer();
  if (socket) socket.emit('stop');
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
  if (!text || !pc) return;
  socket.emit('chat', text);
  addMsg(text, 'me');
  chatInput.value = '';
});

// Tecla Esc = siguiente (como en las webs de chat aleatorio)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !$('nextBtn').disabled) next();
});
