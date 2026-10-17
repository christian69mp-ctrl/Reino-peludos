// Juegos, piropos y «¿Volverías a hablar?» durante el videochat.
//
// - Modo picante: cada persona lo activa en su cuenta (viene apagado). Los piropos y los
//   niveles Picante y Muy picante solo funcionan si lo tienen activado las dos personas.
// - Juegos entre las dos personas de la conversación, siempre con invitación aceptada:
//   Verdad o reto (Suave / Picante / Muy picante), ¿Qué prefieres?, Piedra, papel o tijera
//   y Dibujo y adivina (una persona dibuja una palabra secreta y la otra la escribe).
//   El servidor hace de árbitro (sortea las cartas y guarda las elecciones hasta que
//   eligen los dos) para que nadie haga trampas.
// - Invitar a jugar y enviar piropos es de Premium; quien no lo tiene puede aceptar
//   invitaciones y recibir piropos (y ve lo que se pierde).
// - Piropos: mensajes ya hechos, solo positivos. Suman al perfil de quien los recibe, que
//   decide si los demás los ven.
// - Termómetro de química: sube con el tiempo hablando, ❤️, piropos, juegos, coincidencias y
//   mensajes. Al llegar a 100 las dos personas ganan 5 guindillas (una vez por conversación).
// - «¿Volverías a hablar con esa persona?»: respuesta privada que nadie ve; las personas
//   con muchas respuestas negativas pasan al final de la cola de emparejamiento.
const fs = require('fs');
const path = require('path');

const LEVELS = ['soft', 'hot', 'xxx'];
const GAMES = ['truth', 'wyr', 'rps', 'draw'];
const RPS = ['r', 'p', 's'];
const BEATS = { r: 's', p: 'r', s: 'p' };
const INVITE_MS = 30 * 1000;
const RATE_WINDOW_MS = 3 * 60 * 1000;
const MIN_TALK_MS = 20 * 1000;
const DRAW_MS = 80 * 1000;          // tiempo para adivinar cada dibujo
const DRAW_LANGS = ['es', 'en', 'pt', 'fr', 'de', 'it'];
// Puntos del termómetro de química por cada cosa que pasa en la conversación
const HEAT = { love: 10, like: 4, piropo: 6, game: 8, match: 6, solved: 8, msg: 1 };
const HEAT_MSG_MAX = 20;            // los mensajes suman como mucho 20
const HEAT_TIME_MAX = 40;           // el tiempo hablando suma 1 cada 6 s, hasta 40 (4 min)

// Para comparar lo que escribe quien adivina: sin mayúsculas, tildes ni signos
const norm = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, ' ').trim();
function distance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const cur = [i];
    for (let j = 1; j <= b.length; j += 1) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

// Contenido (cartas y piropos) desde el mismo archivo que usa la web
let data = null;
function content() {
  if (data) return data;
  try {
    const win = {};
    new Function('window', fs.readFileSync(path.join(__dirname, 'public', 'games-data.js'), 'utf8'))(win);
    data = win.GAMES;
  } catch { data = { piropos: [], truth: {}, wyr: {}, draw: {} }; }
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
      r = { invite: null, game: null, piropos: new Map(), used: new Set(), chem: { at: Date.now(), pts: 0, msgs: 0, sent: 0, boom: false, players: [socket.id, partner.id] } };
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
  function word(r, level) {
    const list = content().draw?.[level] || [];
    let pool = list.map((w, i) => i).filter((i) => !r.used.has(`d${level}${i}`));
    if (!pool.length) {
      for (const k of [...r.used]) if (k.startsWith(`d${level}`)) r.used.delete(k);
      pool = list.map((w, i) => i);
    }
    const i = pool[Math.floor(Math.random() * pool.length)];
    r.used.add(`d${level}${i}`);
    return i;
  }
  // Huecos de la palabra en el idioma de quien adivina («_ _ _ _»); a mitad de tiempo, la primera letra
  function pattern(g, lang) {
    const w = content().draw?.[g.level]?.[g.w];
    const text = (w?.[lang] || w?.en || [''])[0];
    const hint = Date.now() - g.startedAt >= DRAW_MS / 2;
    return [...text].map((ch, i) => (/\s/.test(ch) ? ' ' : (hint && i === 0) || /[^\p{L}\p{N}]/u.test(ch) ? ch : '_')).join('');
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
    if (g.game === 'draw') {
      const sock = io.sockets.sockets.get(id);
      const mine = g.drawer === id;
      return {
        ...base, myTurn: mine, word: mine || g.phase === 'reveal' ? g.w : null, hint: mine ? null : pattern(g, sock?.data.lang),
        left: Math.max(0, g.startedAt + DRAW_MS - Date.now()), solved: g.solved, me: g.score[id], them: g.score[other],
      };
    }
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
    else if (game === 'draw') {
      r.game = { game, level, players, phase: 'draw', drawer: invitee.id, round: 1, score: { [inviter.id]: 0, [invitee.id]: 0 } };
      newDrawing(r);
    } else r.game = { game, level: 'soft', players, phase: 'pick', picks: {}, last: {}, score: { [inviter.id]: 0, [invitee.id]: 0 }, round: 1, winner: null, roundWinner: null };
    send(r);
    // Cada partida suma 2 guindillas y cuenta para insignias y retos
    for (const s of [inviter, invitee]) { rewards.count(s.data.uid, 'games'); rewards.award(s.data.uid, 2, 'game'); }
    heatRoom(r, 'game');
  }

  // Dibujo y adivina: palabra nueva y reloj de 80 s (con pista a mitad de tiempo)
  function newDrawing(r) {
    const g = r.game;
    clearTimers(g);
    g.w = word(r, g.level);
    g.phase = 'draw';
    g.solved = false;
    g.startedAt = Date.now();
    g.timers = [
      setTimeout(() => { if (r.game === g && g.phase === 'draw') send(r); }, DRAW_MS / 2),
      setTimeout(() => { if (r.game === g && g.phase === 'draw') { g.phase = 'reveal'; send(r); } }, DRAW_MS),
    ];
  }
  function clearTimers(g) { for (const t of g?.timers || []) clearTimeout(t); if (g) g.timers = []; }

  function endGame(r, by, reason = 'ended') {
    if (!r?.game) return;
    const players = r.game.players;
    clearTimers(r.game);
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
      heatRoom(r, 'piropo');
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
            heatRoom(r, 'match');
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
      } else if (g.game === 'draw' && g.phase === 'reveal') {
        g.drawer = g.players.find((p) => p !== g.drawer);
        g.round += 1;
        newDrawing(r);
        for (const id of g.players) io.to(id).emit('game:clear');
      } else if (g.game === 'rps' && g.phase === 'reveal') {
        g.picks = {}; g.phase = 'pick'; g.round += 1; g.roundWinner = null;
      } else return;
      send(r);
    });

    socket.on('game:end', () => endGame(rooms.get(socket.id), socket.id));

    // Dibujo y adivina: los trazos van tal cual a la otra persona (coordenadas de 0 a 1)
    const drawing = () => {
      const r = rooms.get(socket.id);
      const g = r?.game;
      return g?.game === 'draw' && g.phase === 'draw' && g.drawer === socket.id ? g : null;
    };
    socket.on('game:stroke', (d) => {
      if (!drawing() || !d || !Array.isArray(d.p) || d.p.length > 80) return;
      // Como mucho ~40 envíos por segundo
      const now = Date.now();
      if (now - (socket.data.strokeWin || 0) > 1000) { socket.data.strokeWin = now; socket.data.strokes = 0; }
      if ((socket.data.strokes = (socket.data.strokes || 0) + 1) > 40) return;
      const p = d.p.filter((pt) => Array.isArray(pt) && pt.length === 2 && pt.every((v) => typeof v === 'number' && v >= 0 && v <= 1))
        .map(([x, y]) => [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]);
      if (!p.length) return;
      partnerOf(socket)?.emit('game:stroke', { p, c: Number.isInteger(d.c) && d.c >= 0 && d.c < 8 ? d.c : 0, w: [1, 2, 3].includes(d.w) ? d.w : 2, n: !!d.n });
    });
    socket.on('game:clear', () => { if (drawing()) partnerOf(socket)?.emit('game:clear'); });
    socket.on('game:guess', ({ text } = {}, ack = () => {}) => {
      const r = rooms.get(socket.id);
      const g = r?.game;
      if (typeof ack !== 'function' || !g || g.game !== 'draw' || g.phase !== 'draw' || g.drawer === socket.id) return;
      const guess = norm(String(text || '').slice(0, 40));
      if (!guess) return ack({ code: 'invalid' });
      if (throttled(socket, 400)) return ack({ code: 'slow' });
      const w = content().draw?.[g.level]?.[g.w] || {};
      const answers = DRAW_LANGS.flatMap((l) => w[l] || []).map(norm).filter(Boolean);
      const drawer = io.sockets.sockets.get(g.drawer);
      if (answers.includes(guess)) {
        clearTimers(g);
        g.phase = 'reveal';
        g.solved = true;
        g.score[socket.id] += 1;
        g.score[g.drawer] += 1;
        for (const s of [socket, drawer]) if (s) { rewards.count(s.data.uid, 'drawSolved'); rewards.award(s.data.uid, 2, 'draw'); }
        heatRoom(r, 'solved');
        send(r);
        return ack({ ok: true });
      }
      const close = answers.some((a) => a.length >= 4 && distance(a, guess) <= (a.length >= 7 ? 2 : 1));
      drawer?.emit('game:guess-seen', { text: String(text).slice(0, 40) });
      ack({ ok: false, close });
    });

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
      clearTimers(r.game);
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

  // ---------- Termómetro de química ----------
  function chemValue(c) {
    const time = Math.min(HEAT_TIME_MAX, Math.floor((Date.now() - c.at) / 6000));
    return Math.min(100, time + c.pts + Math.min(HEAT_MSG_MAX, c.msgs));
  }
  function pushChem(r) {
    const c = r?.chem;
    if (!c) return;
    const v = chemValue(c);
    if (v === c.sent) return;
    c.sent = v;
    for (const id of c.players) io.to(id).emit('chem', { v });
    // ¡Explosión de química! 5 guindillas para las dos personas, una vez por conversación
    if (v >= 100 && !c.boom) {
      c.boom = true;
      for (const id of c.players) {
        const s = io.sockets.sockets.get(id);
        if (s) { rewards.count(s.data.uid, 'hotChem'); rewards.award(s.data.uid, 5, 'chem', { uncapped: true }); }
      }
    }
  }
  function heatRoom(r, kind) {
    if (!r?.chem) return;
    if (kind === 'msg') r.chem.msgs += HEAT.msg; else r.chem.pts += HEAT[kind] || 0;
    pushChem(r);
  }
  // Desde server.js: ❤️, 👍 y mensajes de la conversación
  function heat(socket, kind) {
    const partner = partnerOf(socket);
    if (partner) heatRoom(room(socket, partner), kind);
  }
  // Al conectar dos personas empieza el termómetro
  function paired(a, b) {
    rooms.delete(a.id); rooms.delete(b.id);
    room(a, b);
  }
  // El tiempo hablando también calienta: se revisa cada 6 segundos
  setInterval(() => { for (const r of new Set(rooms.values())) pushChem(r); }, 6000).unref();

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

  return { bind, ended, forget, info, lowRated, content, lastMetOf, heat, paired };
};
