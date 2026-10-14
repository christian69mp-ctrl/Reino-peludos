const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;
const REPORTS_TO_BAN = 3;

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

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
const reports = new Map();    // ip -> nº de reportes recibidos
const banned = new Set();     // ips bloqueadas (en memoria)

function ipOf(socket) {
  return (socket.handshake.headers['x-forwarded-for'] || socket.handshake.address || '')
    .split(',')[0].trim();
}

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

function findMatch(socket) {
  removeFromQueue(socket.id);
  const avoid = lastPartner.get(socket.id);
  const idx = queue.findIndex((id) => id !== avoid && io.sockets.sockets.has(id));
  if (idx === -1) {
    queue.push(socket.id);
    socket.emit('waiting');
    return;
  }
  const partnerId = queue.splice(idx, 1)[0];
  partners.set(socket.id, partnerId);
  partners.set(partnerId, socket.id);
  lastPartner.set(socket.id, partnerId);
  lastPartner.set(partnerId, socket.id);
  // El que acaba de llegar inicia la oferta WebRTC
  socket.emit('matched', { initiator: true });
  io.to(partnerId).emit('matched', { initiator: false });
}

io.use((socket, next) => {
  if (banned.has(ipOf(socket))) return next(new Error('banned'));
  next();
});

io.on('connection', (socket) => {
  socket.on('find', () => {
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

  socket.on('report', () => {
    const partnerId = partners.get(socket.id);
    const partner = partnerId && io.sockets.sockets.get(partnerId);
    if (!partner) return;
    const ip = ipOf(partner);
    const count = (reports.get(ip) || 0) + 1;
    reports.set(ip, count);
    console.log(`[report] ${ip} -> ${count}`);
    unpair(socket);
    if (count >= REPORTS_TO_BAN) {
      banned.add(ip);
      partner.emit('banned');
      partner.disconnect(true);
    }
    findMatch(socket);
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
