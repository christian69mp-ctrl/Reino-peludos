const $ = (id) => document.getElementById(id);
const localVideo = $('localVideo');
const remoteVideo = $('remoteVideo');
const statusEl = $('status');
const messages = $('messages');
const chatInput = $('chatInput');

let socket = null;
let localStream = null;
let pc = null;
let iceConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
let pendingCandidates = [];

// ---- Verificación de edad ----
$('ageCheck').addEventListener('change', (e) => { $('enterBtn').disabled = !e.target.checked; });
$('enterBtn').addEventListener('click', () => {
  sessionStorage.setItem('age-ok', '1');
  $('gate').classList.add('hidden');
});
if (sessionStorage.getItem('age-ok')) $('gate').classList.add('hidden');

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
  $('reportBtn').disabled = !connected;
}

function setRunning(running) {
  $('startBtn').disabled = running;
  $('nextBtn').disabled = !running;
  $('stopBtn').disabled = !running;
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
function connectSocket() {
  socket = io();

  socket.on('connect_error', (err) => {
    if (err.message === 'banned') setStatus('Tu acceso ha sido bloqueado por reportes de otros usuarios.');
  });

  socket.on('waiting', () => setStatus('Buscando a alguien…'));

  socket.on('matched', async ({ initiator }) => {
    messages.innerHTML = '';
    setStatus('');
    addMsg('¡Conectado! Saluda 👋', 'sys');
    createPeer();
    setConnected(true);
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
    socket.emit('find');
  });

  socket.on('banned', () => {
    stop();
    setStatus('Tu acceso ha sido bloqueado por reportes de otros usuarios.');
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
  if (!socket) connectSocket();
  setRunning(true);
  refreshOnline();
  socket.emit('find');
}

function next() {
  closePeer();
  messages.innerHTML = '';
  setStatus('Buscando a alguien…');
  socket.emit('find');
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
$('reportBtn').addEventListener('click', () => {
  if (!confirm('¿Reportar a este usuario por comportamiento inadecuado?')) return;
  closePeer();
  addMsg('Usuario reportado. Buscando a otra persona…', 'sys');
  setStatus('Buscando a alguien…');
  socket.emit('report');
});

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
