// Juegos, piropos y «¿Volverías a hablar?» durante el videochat.
//
// - Modo picante: cada persona lo activa en su cuenta (viene apagado). Los piropos y los
//   niveles Picante y Muy picante solo funcionan si lo tienen activado las dos personas.
// - Juegos entre las dos personas de la conversación, siempre con invitación aceptada:
//   Verdad o reto (Suave / Picante / Muy picante), ¿Qué prefieres? y Piedra, papel o tijera.
//   El servidor hace de árbitro (sortea las cartas y guarda las elecciones hasta que
//   eligen los dos) para que nadie haga trampas.
// - Invitar a jugar y enviar piropos es de Premium; quien no lo tiene puede aceptar
//   invitaciones y recibir piropos (y ve lo que se pierde).
// - Piropos: mensajes ya hechos, solo positivos. Suman al perfil de quien los recibe, que
//   decide si los demás los ven.
// - «¿Volverías a hablar con esa persona?»: respuesta privada que nadie ve; las personas
//   con muchas respuestas negativas pasan al final de la cola de emparejamiento.
const fs = require('fs');
const path = require('path');

const LEVELS = ['soft', 'hot', 'xxx'];
const GAMES = ['truth', 'wyr', 'rps'];
const RPS = ['r', 'p', 's'];
const BEATS = { r: 's', p: 'r', s: 'p' };
const INVITE_MS = 30 * 1000;
const RATE_WINDOW_MS = 3 * 60 * 1000;
const MIN_TALK_MS = 20 * 1000;

// Contenido (cartas y piropos) desde el mismo archivo que usa la web
let data = null;
function content() {
  if (data) return data;
  try {
    const win = {};
    new Function('window', fs.readFileSync(path.join(__dirname, 'public', 'games-data.js'), 'utf8'))(win);
    data = win.GAMES;
  } catch { data = { piropos: [], truth: {}, wyr: {} }; }
  return data;
}

module.exports = function createPlay({ io, partners, store, rewards }) {
  const rooms = new Map();    // socketId -> estado compartido de la conversación
  const lastMet = new Map();  // socketId -> { uid, at, rated } de la conversación anterior

  const partnerOf = (socket) => {
    const id = partners.get(socket.id);
    return id && io.sockets.sockets.get(id);
  };
  function room(socket, partner) {
    let r = rooms.get(socket.id);
    if (!r) {
      r = { invite: null, game: null, piropos: new Map(), used: new Set() };
      rooms.set(socket.id, r);
      rooms.set(partner.id, r);
    }
    return r;
  }

  const prefs = (uid) => store.getUser(uid)?.prefs || {};
  const loadFlags = (socket) => { socket.data.spicy = !!prefs(socket.data.uid).spicy; };

  // Nivel permitido para quien invita
  function levelError(socket, partner, level) {
    if (!socket.data.premium) return 'premium';
    if (level === 'soft') return null;
    if (!socket.data.spicy) return 'spicyMe';
    if (!partner.data.spicy) return 'spicyThem';
    return null;
  }

  // Carta al azar de un tipo que no haya salido todavía en esta conversación
  function draw(r, level, kind) {
    const cards = content().truth[level] || [];
    let pool = cards.map((c, i) => i).filter((i) => cards[i].k === kind && !r.used.has(`t${level}${i}`));
    if (!pool.length) {
      for (const k of [...r.used]) if (k.startsWith(`t${level}`)) r.used.delete(k);
      pool = cards.map((c, i) => i).filter((i) => cards[i].k === kind);
    }
    const i = pool[Math.floor(Math.random() * pool.length)];
    r.used.add(`t${level}${i}`);
    return i;
  }
  function question(r, level) {
    const list = content().wyr[level] || [];
    let pool = list.map((q, i) => i).filter((i) => !r.used.has(`w${level}${i}`));
    if (!pool.length) {
      for (const k of [...r.used]) if (k.startsWith(`w${level}`)) r.used.delete(k);
      pool = list.map((q, i) => i);
    }
    const i = pool[Math.floor(Math.random() * pool.length)];
    r.used.add(`w${level}${i}`);
    return i;
  }

  // Estado del juego tal como lo ve cada persona
  function view(g, id) {
    if (!g) return null;
    const other = g.players.find((p) => p !== id);
    const base = { game: g.game, level: g.level, phase: g.phase, round: g.round };
    if (g.game === 'truth') return { ...base, myTurn: g.turn === id, card: g.card };
    if (g.game === 'wyr') {
      return { ...base, q: g.q, mine: g.picks[id] || null, theirs: g.phase === 'reveal' ? g.picks[other] : null, otherPicked: !!g.picks[other], matches: g.matches };
    }
    return {
      ...base, mine: g.picks[id] || null, theirs: g.phase !== 'pick' ? g.last[other] : null, myLast: g.last[id] || null,
      otherPicked: !!g.picks[other], me: g.score[id], them: g.score[other], winner: g.winner ? (g.winner === id ? 'me' : 'them') : null, roundWinner: g.roundWinner ? (g.roundWinner === id ? 'me' : g.roundWinner === 'draw' ? 'draw' : 'them') : null,
    };
  }
  function send(r, ended) {
    const g = r.game;
    for (const id of g ? g.players : ended?.players || []) io.to(id).emit('game', g ? view(g, id) : { ended: ended.reason, by: ended.by === id ? 'me' : 'them' });
  }

  function start(r, inviter, invitee) {
    const players = [inviter.id, invitee.id];
    const { game, level } = r.invite;
    r.invite = null;
    if (game === 'truth') r.game = { game, level, players, phase: 'choose', turn: invitee.id, card: null, round: 1 };
    else if (game === 'wyr') r.game = { game, level, players, phase: 'pick', q: question(r, level), picks: {}, matches: 0, round: 1 };
    else r.game = { game, level: 'soft', players, phase: 'pick', picks: {}, last: {}, score: { [inviter.id]: 0, [invitee.id]: 0 }, round: 1, winner: null, roundWinner: null };
    send(r);
    // Cada partida suma 2 guindillas y cuenta para insignias y retos
    for (const s of [inviter, invitee]) { rewards.count(s.data.uid, 'games'); rewards.award(s.data.uid, 2, 'game'); }
  }

  function endGame(r, by, reason = 'ended') {
    if (!r?.game) return;
    const players = r.game.players;
    r.game = null;
    send(r, { players, by, reason });
  }

  const throttled = (socket, ms = 300) => {
    const now = Date.now();
    if (now - (socket.data.lastPlay || 0) < ms) return true;
    socket.data.lastPlay = now;
    return false;
  };

  function bind(socket) {
    loadFlags(socket);

    // La persona ha cambiado el modo picante en su cuenta: se recarga y se avisa a la pareja
    socket.on('prefs-changed', () => {
      loadFlags(socket);
      const partner = partnerOf(socket);
      if (partner) partner.emit('partner-flags', { spicy: socket.data.spicy });
      // Si se apaga en mitad de un juego subido de tono, se termina
      const r = rooms.get(socket.id);
      if (!socket.data.spicy && r?.game && r.game.level !== 'soft') endGame(r, socket.id, 'spicyOff');
    });

    socket.on('piropo', (id, ack = () => {}) => {
      const partner = partnerOf(socket);
      if (!partner || typeof ack !== 'function') return;
      if (!content().piropos.some((p) => p.id === id)) return ack({ code: 'invalid' });
      if (!socket.data.premium) return ack({ code: 'premium' });
      if (!socket.data.spicy) return ack({ code: 'spicyMe' });
      if (!partner.data.spicy) return ack({ code: 'spicyThem' });
      if (throttled(socket, 800)) return ack({ code: 'slow' });
      const r = room(socket, partner);
      const sent = r.piropos.get(socket.id) || new Set();
      r.piropos.set(socket.id, sent);
      // Cada piropo suma una vez por conversación (se puede volver a enviar, pero no infla)
      if (!sent.has(id)) {
        sent.add(id);
        const user = store.getUser(partner.data.uid);
        if (user) {
          store.updateUser(user.id, { piropos: { ...(user.piropos || {}), [id]: ((user.piropos || {})[id] || 0) + 1 } });
          rewards.count(user.id, 'piropos');
          rewards.award(user.id, 2, 'piropo');
        }
      }
      partner.emit('piropo', { id });
      ack({ ok: true });
    });

    socket.on('game:invite', ({ game, level } = {}, ack = () => {}) => {
      const partner = partnerOf(socket);
      if (!partner || typeof ack !== 'function') return;
      if (!GAMES.includes(game)) return ack({ code: 'invalid' });
      const lvl = game === 'rps' ? 'soft' : (LEVELS.includes(level) ? level : 'soft');
      const err = levelError(socket, partner, lvl);
      if (err) return ack({ code: err });
      const r = room(socket, partner);
      if (r.game) return ack({ code: 'busy' });
      if (r.invite && Date.now() - r.invite.at < INVITE_MS) return ack({ code: 'pending' });
      if (throttled(socket, 1500)) return ack({ code: 'slow' });
      r.invite = { from: socket.id, game, level: lvl, at: Date.now() };
      partner.emit('game:invited', { game, level: lvl });
      ack({ ok: true });
    });

    socket.on('game:reply', ({ accept } = {}) => {
      const partner = partnerOf(socket);
      const r = partner && rooms.get(socket.id);
      if (!r?.invite || r.invite.from !== partner.id) return;
      if (Date.now() - r.invite.at > INVITE_MS) { r.invite = null; return; }
      if (!accept) { r.invite = null; partner.emit('game:declined'); return; }
      // Comprobación final por si alguien apagó el modo picante mientras tanto
      if (levelError(partner, socket, r.invite.level)) { r.invite = null; partner.emit('game:declined'); return; }
      start(r, partner, socket);
    });

    // Verdad o reto: a quien le toca elige verdad o reto
    socket.on('game:choose', ({ kind } = {}) => {
      const g = rooms.get(socket.id)?.game;
      if (!g || g.game !== 'truth' || g.phase !== 'choose' || g.turn !== socket.id || !['t', 'd'].includes(kind)) return;
      g.card = { k: kind, i: draw(rooms.get(socket.id), g.level, kind) };
      g.phase = 'card';
      send(rooms.get(socket.id));
    });

    // ¿Qué prefieres? (a/b) y piedra, papel o tijera (r/p/s): se guarda hasta que eligen los dos
    socket.on('game:pick', ({ option } = {}) => {
      const r = rooms.get(socket.id);
      const g = r?.game;
      if (!g || g.phase !== 'pick' || g.picks[socket.id]) return;
      if (g.game === 'wyr' && ['a', 'b'].includes(option)) {
        g.picks[socket.id] = option;
        if (Object.keys(g.picks).length === 2) {
          g.phase = 'reveal';
          const [x, y] = g.players.map((p) => g.picks[p]);
          if (x === y) {
            g.matches += 1;
            for (const id of g.players) { const p = io.sockets.sockets.get(id); if (p) { rewards.count(p.data.uid, 'wyrMatches'); rewards.award(p.data.uid, 1, 'match'); } }
          }
        }
        send(r);
      } else if (g.game === 'rps' && RPS.includes(option)) {
        g.picks[socket.id] = option;
        if (Object.keys(g.picks).length === 2) {
          const [a, b] = g.players;
          const pa = g.picks[a]; const pb = g.picks[b];
          g.roundWinner = pa === pb ? 'draw' : (BEATS[pa] === pb ? a : b);
          if (g.roundWinner !== 'draw') g.score[g.roundWinner] += 1;
          g.last = { ...g.picks };
          g.phase = Object.values(g.score).some((s) => s >= 2) ? 'done' : 'reveal';
          if (g.phase === 'done') {
            g.winner = g.roundWinner;
            const w = io.sockets.sockets.get(g.winner);
            if (w) { rewards.count(w.data.uid, 'rpsWins'); rewards.award(w.data.uid, 3, 'win'); }
          }
        }
        send(r);
      }
    });

    // Siguiente carta / pregunta / ronda (cualquiera de los dos)
    socket.on('game:next', () => {
      const r = rooms.get(socket.id);
      const g = r?.game;
      if (!g || throttled(socket)) return;
      if (g.game === 'truth' && g.phase === 'card') {
        g.turn = g.players.find((p) => p !== g.turn);
        g.phase = 'choose'; g.card = null; g.round += 1;
      } else if (g.game === 'wyr' && g.phase === 'reveal') {
        g.q = question(r, g.level); g.picks = {}; g.phase = 'pick'; g.round += 1;
      } else if (g.game === 'rps' && g.phase === 'reveal') {
        g.picks = {}; g.phase = 'pick'; g.round += 1; g.roundWinner = null;
      } else return;
      send(r);
    });

    socket.on('game:end', () => endGame(rooms.get(socket.id), socket.id));

    // «¿Volverías a hablar con esa persona?»: privado, solo para la conversación anterior
    socket.on('rate', ({ up } = {}) => {
      const m = lastMet.get(socket.id);
      if (!m || m.rated || Date.now() - m.at > RATE_WINDOW_MS || typeof up !== 'boolean') return;
      m.rated = true;
      const user = store.getUser(m.uid);
      if (!user) return;
      const rep = { up: user.rep?.up || 0, down: user.rep?.down || 0 };
      rep[up ? 'up' : 'down'] += 1;
      store.updateUser(user.id, { rep });
    });
  }

  // Fin de la conversación: se cierra el juego y se pregunta «¿Volverías a hablar?»
  function ended(aId, bId, meet) {
    const r = rooms.get(aId);
    if (r?.game) {
      const players = r.game.players;
      r.game = null;
      for (const id of players) io.to(id).emit('game', { ended: 'left' });
    }
    rooms.delete(aId);
    rooms.delete(bId);
    if (!meet) return;
    const talked = Date.now() - meet.at >= MIN_TALK_MS;
    const a = io.sockets.sockets.get(aId);
    const b = io.sockets.sockets.get(bId);
    for (const [s, other] of [[a, b], [b, a]]) {
      if (!s || !other) continue;
      lastMet.set(s.id, { uid: other.data.uid, at: Date.now(), rated: false });
      if (talked) s.emit('rate-ask');
    }
  }

  function forget(socketId) {
    lastMet.delete(socketId);
    rooms.delete(socketId);
  }

  // Lo que la otra persona ve de ti: si tienes el modo picante y, si quieres, tus piropos
  function info(s) {
    const user = store.getUser(s.data.uid) || {};
    const top = user.prefs?.showPiropos
      ? Object.entries(user.piropos || {}).sort((x, y) => y[1] - x[1]).slice(0, 4).map(([id, n]) => ({ id, n }))
      : [];
    return { spicy: !!s.data.spicy, piropos: top };
  }

  // Personas con muchas respuestas «no volvería a hablar» (para emparejarlas al final)
  function lowRated(uid) {
    const rep = store.getUser(uid)?.rep;
    if (!rep) return false;
    const total = rep.up + rep.down;
    return total >= 10 && rep.down / total > 0.6;
  }

  const lastMetOf = (socketId) => {
    const m = lastMet.get(socketId);
    return m && Date.now() - m.at < RATE_WINDOW_MS ? m : null;
  };

  return { bind, ended, forget, info, lowRated, content, lastMetOf };
};
