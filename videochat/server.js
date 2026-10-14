const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const payments = require('./payments');

const PORT = process.env.PORT || 3000;
const GENDERS = ['mujer', 'hombre', 'trans', 'pareja'];

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
payments.routes(app, process.env.BASE_URL);

// Configuración ICE para el cliente. En producción añade un servidor TURN
// (p. ej. coturn) mediante variables de entorno, si no muchas conexiones fallan.
app.get('/ice', (_req, res) => {
  const iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];
  if (process.env.TURN_URL) {
    iceServers.push({
      urls: process.env.TURN_URL,
      username: process.env.TURN_USER,
      credential: process.env.TURN_PASS,
    });
  }
  res.json({ iceServers });
});

app.get('/stats', (_req, res) => {
  res.json({ online: io.engine.clientsCount, waiting: queue.length });
});

const server = http.createServer(app);
const io = new Server(server);

// Cola de espera y emparejamientos activos
let queue = [];               // ids de socket esperando pareja
const partners = new Map();   // socketId -> socketId de su pareja
const lastPartner = new Map();// evita volver a emparejar con el anterior al instante

function removeFromQueue(id) {
  queue = queue.filter((q) => q !== id);
}

function unpair(socket, notify = true) {
  const partnerId = partners.get(socket.id);
  if (!partnerId) return;
  partners.delete(socket.id);
  partners.delete(partnerId);
  if (notify) io.to(partnerId).emit('partner-left');
}

// a quiere ver a b? (sin filtro = cualquiera)
function wants(a, b) {
  return a.data.want.length === 0 || a.data.want.includes(b.data.gender);
}

function findMatch(socket) {
  removeFromQueue(socket.id);
  const avoid = lastPartner.get(socket.id);
  const idx = queue.findIndex((id) => {
    const other = io.sockets.sockets.get(id);
    return other && id !== avoid && wants(socket, other) && wants(other, socket);
  });
  if (idx === -1) {
    queue.push(socket.id);
    socket.emit('waiting');
    return;
  }
  const partnerId = queue.splice(idx, 1)[0];
  const partner = io.sockets.sockets.get(partnerId);
  partners.set(socket.id, partnerId);
  partners.set(partnerId, socket.id);
  lastPartner.set(socket.id, partnerId);
  lastPartner.set(partnerId, socket.id);
  // El que acaba de llegar inicia la oferta WebRTC
  socket.emit('matched', { initiator: true, gender: partner.data.gender });
  partner.emit('matched', { initiator: false, gender: socket.data.gender });
}

io.use(async (socket, next) => {
  const { gender, token } = socket.handshake.auth || {};
  socket.data.gender = GENDERS.includes(gender) ? gender : null;
  socket.data.premium = await payments.isPremium(token);
  socket.data.want = [];
  next();
});

io.on('connection', (socket) => {
  socket.emit('account', { premium: socket.data.premium });

  socket.on('find', (opts = {}) => {
    // El filtro solo se aplica a usuarios Premium; el resto, siempre al azar
    const want = Array.isArray(opts.want) ? opts.want.filter((g) => GENDERS.includes(g)) : [];
    socket.data.want = socket.data.premium ? want : [];
    unpair(socket);
    findMatch(socket);
  });

  socket.on('stop', () => {
    removeFromQueue(socket.id);
    unpair(socket);
  });

  // Reenvío de señalización WebRTC (offer/answer/ice) solo a la pareja actual
  socket.on('signal', (data) => {
    const partnerId = partners.get(socket.id);
    if (partnerId) io.to(partnerId).emit('signal', data);
  });

  socket.on('chat', (text) => {
    const partnerId = partners.get(socket.id);
    if (!partnerId || typeof text !== 'string') return;
    const clean = text.trim().slice(0, 500);
    if (clean) io.to(partnerId).emit('chat', clean);
  });

  socket.on('disconnect', () => {
    removeFromQueue(socket.id);
    unpair(socket);
    lastPartner.delete(socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Videochat escuchando en http://localhost:${PORT}`);
});
