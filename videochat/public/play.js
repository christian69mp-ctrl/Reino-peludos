// Juegos, piropos y «¿Volverías a hablar?» en el videochat (la parte del servidor está en play.js).
// Nada tapa a la otra persona: todo va en una franja debajo del vídeo («dock»), con Guindilla
// de presentadora y animaciones. Sobre el vídeo solo aparecen, un instante y por los bordes,
// los emojis de un piropo.
// Invitar a jugar y enviar piropos es de Premium; sin Premium se puede aceptar y recibir.
// Los niveles Picante y Muy picante y los piropos necesitan el modo picante en las dos personas.
// Termómetro de química: una barra fina entre el vídeo y la franja que se calienta sola.
(function () {
  const { t } = window.I18N;
  const A = window.App;
  const $ = (id) => document.getElementById(id);
  const tx = (o) => o?.[window.I18N.lang] ?? o?.en ?? '';
  const dock = $('playDock');
  const LEVEL_ICON = { soft: '😇', hot: '🌶️', xxx: '🌶️🌶️' };
  const GAME_ICON = { truth: '🔥', wyr: '🤔', rps: '✊', draw: '🎨' };
  const INK = ['#1b1420', '#e8283f', '#ff8a3d', '#f2b705', '#2bb673', '#2f80ed', '#9b51e0', '#ff5fa2'];
  const DRAW_MS = 80 * 1000;
  const RPS_ICON = { r: '✊', p: '✋', s: '✌️' };
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Contenido: se carga al empezar a chatear (≈70 KB)
  let G = window.GAMES || null;
  function loadGames() {
    if (G) return Promise.resolve(G);
    return new Promise((resolve) => {
      const sc = document.createElement('script');
      sc.src = '/games-data.js';
      sc.onload = () => { G = window.GAMES; resolve(G); rerender(); };
      sc.onerror = () => resolve(null);
      document.head.appendChild(sc);
    });
  }

  let socket = null;
  let game = null;        // estado del juego según el servidor
  let prev = null;        // estado anterior (para saber qué animar)
  let invite = null;      // invitación recibida { game, level, at }
  let open = null;        // 'games' | 'piropos' | null
  let streak = 0;         // coincidencias seguidas en ¿Qué prefieres?
  let rateTimer = null;
  let rpsAnim = 0;        // cuenta atrás de piedra, papel o tijera en curso
  let board = null;       // pizarra de Dibujo y adivina (se conserva entre repintados)
  let tick = 0;           // reloj del dibujo

  const mySpicy = () => !!A.me?.user?.prefs?.spicy;
  const partnerSpicy = () => !!A.partner?.spicy;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const btn = (cls, text, on) => { const b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', on); return b; };
  const gameName = (g) => t(`pl.${g}`);
  const levelName = (l) => `${LEVEL_ICON[l]} ${t(`pl.${l}`)}`;
  const gesture = (m, g, ms) => window.Mascot?.gesture(m, g, ms);

  // ---------- Efectos ----------
  // Confeti dentro de la franja (no sube al vídeo)
  function confetti(target, emojis = ['🔥', '✨', '🌶️', '💥', '❤️']) {
    if (reduced() || !target) return;
    const box = el('div', 'fx-confetti');
    for (let i = 0; i < 22; i += 1) {
      const s = el('span', 'fx-bit', emojis[i % emojis.length]);
      s.style.left = `${Math.random() * 100}%`;
      s.style.setProperty('--dx', `${(Math.random() - 0.5) * 120}px`);
      s.style.setProperty('--rot', `${(Math.random() - 0.5) * 540}deg`);
      s.style.animationDelay = `${Math.random() * 0.25}s`;
      box.appendChild(s);
    }
    target.appendChild(box);
    setTimeout(() => box.remove(), 1600);
  }
  // Emojis que suben por los bordes del vídeo, sin pasar por el centro
  function edgeRain(emoji) {
    if (reduced()) return;
    const fx = $('edgeFx');
    for (let i = 0; i < 12; i += 1) {
      const s = el('span', 'fx-edge', emoji);
      s.style[i % 2 === 0 ? 'left' : 'right'] = `${2 + Math.random() * 7}%`;
      s.style.animationDelay = `${Math.random() * 0.9}s`;
      s.style.fontSize = `${1.1 + Math.random() * 0.9}rem`;
      fx.appendChild(s);
      setTimeout(() => s.remove(), 2600);
    }
  }
  // Aviso corto entre el vídeo y la franja (piropos recibidos, invitaciones enviadas…)
  function playToast(content, { cls = '', ms = 2800, action } = {}) {
    const box = el('div', `pt ${cls}`);
    if (typeof content === 'string') box.textContent = content; else box.append(...content);
    if (action) box.appendChild(btn('pt-action', action.label, () => { box.remove(); action.on(); }));
    $('playToast').replaceChildren(box);
    setTimeout(() => box.classList.add('out'), ms);
    setTimeout(() => box.remove(), ms + 400);
  }

  // ---------- Franja de juego ----------
  function frame(title, { tone = '' } = {}) {
    const c = el('div', `dock-card ${tone}`);
    const host = el('span', 'dock-host');
    host.setAttribute('aria-hidden', 'true');
    host.innerHTML = window.Mascot ? window.Mascot.make() : '🌶️';
    const body = el('div', 'dock-body');
    const head = el('div', 'dock-head');
    head.append(el('b', '', title));
    const x = btn('dock-x', '✕', () => {
      if (game) { socket?.emit('game:end'); game = null; }
      if (invite) { socket?.emit('game:reply', { accept: false }); invite = null; }
      open = null; rerender();
    });
    x.setAttribute('aria-label', t('btn.close'));
    head.appendChild(x);
    body.appendChild(head);
    c.append(host, body);
    return { c, host, body };
  }

  let shownKey = '';
  function rerender() {
    if (!A.partner) { dock.hidden = true; dock.replaceChildren(); shownKey = ''; syncButtons(); return; }
    let view = null;
    if (invite) view = inviteView();
    else if (game) view = gameView();
    else if (open === 'games') view = gamesMenu();
    else if (open === 'piropos') view = piropoTray();
    const key = invite ? 'invite' : game ? `game-${game.game}` : open || '';
    dock.replaceChildren();
    dock.hidden = !view;
    if (view) {
      if (key !== shownKey) { dock.classList.remove('dock-in'); void dock.offsetWidth; dock.classList.add('dock-in'); }
      dock.appendChild(view);
    }
    shownKey = key;
    syncButtons();
  }
  function syncButtons() {
    $('gamesBtn').classList.toggle('active', open === 'games' || !!game);
    $('piropoBtn').classList.toggle('active', open === 'piropos');
  }

  // Motivo por el que no se puede iniciar (o null)
  function lockOf(level) {
    if (!A.premium) return 'premium';
    if (level === 'soft') return null;
    if (!mySpicy()) return 'spicyMe';
    if (!partnerSpicy()) return 'spicyThem';
    return null;
  }
  const lockText = (code) => t({ premium: 'pl.premiumOnly', spicyMe: 'pl.needSpicyMe', spicyThem: 'pl.partnerNoSpicy', points: 'pw.noPoints' }[code] || 'err.generic');

  function sendInvite(gameId, level) {
    socket.emit('game:invite', { game: gameId, level }, (res) => {
      if (res?.ok) { open = null; rerender(); playToast(`${GAME_ICON[gameId]} ${t('pl.waiting')}`, { cls: 'wait', ms: 6000 }); } else if (res?.code === 'premium') A.openPremium();
      else playToast(res?.code === 'busy' || res?.code === 'pending' ? t('pl.busy') : lockText(res?.code));
    });
  }

  function gamesMenu() {
    const { c, host, body } = frame(t('pl.games'));
    gesture(host, 'wave', 1800);
    const grid = el('div', 'game-tiles');
    for (const g of ['truth', 'wyr', 'rps', 'draw']) {
      const tile = el('div', `game-tile t-${g}`);
      tile.appendChild(el('span', 'gt-icon', GAME_ICON[g]));
      tile.appendChild(el('span', 'gt-name', gameName(g)));
      const levels = el('div', 'gt-levels');
      for (const l of g === 'rps' ? ['soft'] : ['soft', 'hot', 'xxx']) {
        const lock = lockOf(l);
        const b = btn(`lvl lvl-${l}${lock ? ' locked' : ''}`, g === 'rps' ? `▶ ${t('pl.play')}` : levelName(l), () => (lock === 'premium' ? A.openPremium() : lock ? playToast(lockText(lock)) : sendInvite(g, l)));
        if (lock) b.title = lockText(lock);
        levels.appendChild(b);
      }
      tile.appendChild(levels);
      grid.appendChild(tile);
    }
    body.appendChild(grid);
    if (!A.premium) body.appendChild(btn('btn gold sm dock-upsell', t('pl.premiumUpsell'), () => A.openPremium()));
    else if (!mySpicy() || !partnerSpicy()) body.appendChild(el('p', 'dock-note', !mySpicy() ? t('pl.needSpicyMe') : t('pl.partnerNoSpicy')));
    return c;
  }

  function piropoTray() {
    const { c, host, body } = frame(t('pl.piropos'), { tone: 'hot' });
    gesture(host, 'wave', 1600);
    const lock = !A.premium ? 'premium' : !mySpicy() ? 'spicyMe' : !partnerSpicy() ? 'spicyThem' : null;
    const row = el('div', 'piropo-row');
    for (const p of G?.piropos || []) {
      const b = btn(`piropo${lock ? ' locked' : ''}`, '', () => (lock === 'premium' ? A.openPremium() : lock ? playToast(lockText(lock)) : sendPiropo(p)));
      b.append(el('span', 'piropo-e', p.e), el('span', 'piropo-t', tx(p.t)));
      row.appendChild(b);
    }
    body.appendChild(row);
    if (lock === 'premium') body.appendChild(btn('btn gold sm dock-upsell', t('pl.piroposUpsell'), () => A.openPremium()));
    else if (lock === 'spicyMe') body.appendChild(btn('btn primary sm dock-upsell', t('pl.turnOn'), () => setSpicy(true)));
    else if (lock) body.appendChild(el('p', 'dock-note', lockText(lock)));
    return c;
  }

  function sendPiropo(p) {
    socket.emit('piropo', p.id, (res) => {
      if (res?.ok) {
        open = null; rerender();
        playToast([el('span', 'pt-e', p.e), el('span', '', `${t('pl.sent')}: ${tx(p.t)}`)], { cls: 'sent' });
      } else if (res?.code === 'premium') A.openPremium();
      else if (res?.code !== 'slow') playToast(lockText(res?.code));
    });
  }

  function inviteView() {
    const { c, host, body } = frame(gameName(invite.game), { tone: 'invite' });
    gesture(host, 'wave', 3000);
    const who = A.partner?.name || t('pl.someone');
    body.appendChild(el('p', 'dock-q', t('pl.invite', { name: who, game: gameName(invite.game) })));
    if (invite.game !== 'rps') body.appendChild(el('span', `lvl-badge lvl-${invite.level}`, levelName(invite.level)));
    const bar = el('div', 'dock-timer');
    const fill = el('span');
    fill.style.animationDuration = `${Math.max(1, 30 - (Date.now() - invite.at) / 1000)}s`;
    bar.appendChild(fill);
    body.appendChild(bar);
    const row = el('div', 'dock-actions');
    row.append(
      btn('btn ghost sm', t('pl.noThanks'), () => { socket.emit('game:reply', { accept: false }); invite = null; rerender(); }),
      btn('btn primary sm pulse', `${GAME_ICON[invite.game]} ${t('pl.play')}`, () => { socket.emit('game:reply', { accept: true }); invite = null; rerender(); }),
    );
    body.appendChild(row);
    return c;
  }

  function gameView() {
    const g = game;
    const p = prev && prev.game === g.game ? prev : null;
    const { c, host, body } = frame(`${GAME_ICON[g.game]} ${gameName(g.game)}${g.game !== 'rps' ? ` · ${levelName(g.level)}` : ''}`, { tone: `${g.level === 'soft' ? '' : 'hot'}${g.game === 'draw' ? ' draw' : ''}` });
    const actions = el('div', 'dock-actions');
    if (g.game === 'truth') {
      if (g.phase === 'choose') {
        body.appendChild(el('p', `dock-q${g.myTurn ? ' my-turn' : ''}`, g.myTurn ? t('pl.yourTurn') : t('pl.theirTurn')));
        if (g.myTurn) {
          gesture(host, 'wave', 1500);
          actions.append(btn('btn ghost sm choice', `🙊 ${t('pl.truthBtn')}`, () => socket.emit('game:choose', { kind: 't' })), btn('btn primary sm choice', `😈 ${t('pl.dareBtn')}`, () => socket.emit('game:choose', { kind: 'd' })));
        } else body.appendChild(el('span', 'dots', '•••'));
      } else {
        const cardData = G?.truth[g.level]?.[g.card.i];
        const fresh = !p || p.phase !== 'card' || p.card?.i !== g.card.i;
        const card = el('div', `tcard k-${g.card.k}${fresh && !reduced() ? ' flip' : ''}`);
        card.append(el('span', 'tcard-kind', `${g.card.k === 't' ? `🙊 ${t('pl.truthBtn')}` : `😈 ${t('pl.dareBtn')}`} · ${g.myTurn ? t('pl.forYou') : t('pl.forThem')}`), el('p', 'tcard-text', tx(cardData?.t)));
        if (fresh && !reduced()) {
          const deck = el('div', 'tdeck');
          for (let i = 0; i < 3; i += 1) deck.appendChild(el('span', 'tdeck-card'));
          body.appendChild(deck);
          setTimeout(() => deck.remove(), 650);
        }
        body.appendChild(card);
        if (fresh) gesture(host, 'talk', 1600);
        if (g.myTurn) actions.append(btn('btn ghost sm', t('pl.skip'), () => socket.emit('game:next')), btn('btn primary sm', t('pl.done'), () => socket.emit('game:next')));
        else actions.append(btn('btn primary sm', t('pl.nextCard'), () => socket.emit('game:next')));
      }
      body.appendChild(el('span', 'dock-round', `#${g.round}`));
    } else if (g.game === 'draw') {
      drawView(g, p, body, host, c, actions);
    } else if (g.game === 'wyr') {
      const q = G?.wyr[g.level]?.[g.q];
      body.appendChild(el('p', 'dock-q', t('pl.wyrQ')));
      const opts = el('div', 'wyr-opts');
      for (const k of ['a', 'b']) {
        const cls = `wyr-opt${g.mine === k ? ' picked' : ''}${g.phase === 'reveal' && g.theirs === k ? ' theirs' : ''}${g.phase === 'reveal' && g.mine === k && g.theirs === k ? ' both' : ''}`;
        const b = btn(cls, tx(q?.[k]), () => socket.emit('game:pick', { option: k }));
        b.disabled = !!g.mine;
        if (g.phase === 'reveal' && g.theirs === k) b.appendChild(el('span', 'wyr-them', '👤'));
        opts.appendChild(b);
      }
      body.appendChild(opts);
      if (g.phase === 'pick') body.appendChild(el('p', 'dock-note', g.mine ? `${t('pl.waitingPick')} •••` : (g.otherPicked ? t('pl.otherPicked') : t('pl.chooseOne'))));
      else {
        const same = g.mine === g.theirs;
        const isNew = !p || p.phase !== 'reveal' || p.q !== g.q;
        if (isNew) streak = same ? streak + 1 : 0;
        body.appendChild(el('p', `dock-result ${same ? 'win' : ''}`, same ? `${t('pl.match')}${streak > 1 ? ` · 🔥×${streak}` : ''}` : t('pl.noMatch')));
        if (same && isNew) { gesture(host, 'jump', 700); confetti(c); }
        actions.append(btn('btn primary sm', `${t('pl.next')} →`, () => socket.emit('game:next')));
      }
      if (g.matches) body.appendChild(el('span', 'dock-round', `💞 ${g.matches}`));
    } else {
      body.appendChild(el('p', 'dock-score', t('pl.score', { a: g.me, b: g.them })));
      if (g.phase === 'pick') {
        body.appendChild(el('p', 'dock-q', g.mine ? `${t('pl.waitingPick')} •••` : t('pl.chooseOne')));
        const opts = el('div', 'rps-opts');
        for (const k of ['r', 'p', 's']) {
          const b = btn(`rps-opt${g.mine === k ? ' picked' : ''}`, RPS_ICON[k], () => socket.emit('game:pick', { option: k }));
          b.setAttribute('aria-label', t(`pl.rps_${k}`));
          b.disabled = !!g.mine;
          opts.appendChild(b);
        }
        body.appendChild(opts);
      } else {
        const isNew = !p || p.round !== g.round || p.phase === 'pick';
        const result = () => {
          const vs = el('p', 'rps-vs');
          vs.append(el('span', `rps-hand me${g.roundWinner === 'me' ? ' won' : ''}`, RPS_ICON[g.myLast]), el('span', 'rps-x', 'vs'), el('span', `rps-hand them${g.roundWinner === 'them' ? ' won' : ''}`, RPS_ICON[g.theirs]));
          const msg = g.phase === 'done' ? (g.winner === 'me' ? t('pl.youWin') : t('pl.youLose'))
            : g.roundWinner === 'draw' ? t('pl.draw') : g.roundWinner === 'me' ? t('pl.roundWin') : t('pl.roundLose');
          return [vs, el('p', `dock-result ${g.roundWinner === 'me' || g.winner === 'me' ? 'win' : ''}`, msg)];
        };
        if (isNew && !reduced()) {
          // Cuenta atrás: «Piedra… Papel… ¡Tijera!» con los puños moviéndose
          const anim = ++rpsAnim;
          const shake = el('p', 'rps-shake');
          shake.append(el('span', 'rps-hand me', '✊'), el('span', 'rps-count', t('pl.rps_r')), el('span', 'rps-hand them', '✊'));
          body.appendChild(shake);
          const words = [t('pl.rps_r'), t('pl.rps_p'), `${t('pl.rps_s')}!`];
          words.forEach((w, i) => setTimeout(() => { if (anim === rpsAnim) shake.querySelector('.rps-count').textContent = w; }, i * 380));
          setTimeout(() => {
            if (anim !== rpsAnim || !shake.isConnected) return;
            shake.replaceWith(...result());
            if (g.roundWinner === 'me' || g.winner === 'me') { gesture(host, 'jump', 700); confetti(c, g.phase === 'done' ? ['🏆', '✨', '🔥', '🎉'] : ['✨', '🔥']); }
          }, 1150);
        } else body.append(...result());
        if (g.phase === 'done') {
          actions.append(btn('btn ghost sm', t('pl.end'), () => socket.emit('game:end')));
          if (g.winner === 'me' && A.premium) actions.append(btn('btn primary sm', `🔥 ${t('pl.truth')}`, () => { socket.emit('game:end'); setTimeout(() => sendInvite('truth', partnerSpicy() && mySpicy() ? 'hot' : 'soft'), 300); }));
        } else actions.append(btn('btn primary sm', `${t('pl.next')} →`, () => socket.emit('game:next')));
      }
    }
    if (actions.children.length && !actions.parentNode) body.appendChild(actions);
    return c;
  }

  // ---------- Dibujo y adivina ----------
  const wordOf = (g) => { const w = G?.draw?.[g.level]?.[g.word]; return (w?.[window.I18N.lang] || w?.en || [''])[0]; };
  function makeBoard(round) {
    const canvas = el('canvas', 'board');
    const b = { round, canvas, strokes: [], ink: 0, size: 2, drawing: false, buf: [], fresh: false };
    const ctx = canvas.getContext('2d');
    b.fit = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.round(r.width * dpr)) { canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); b.redraw(); }
    };
    b.line = (st, from) => {
      const W = canvas.width; const H = canvas.height;
      ctx.strokeStyle = INK[st.c] || INK[0];
      ctx.lineWidth = (st.w * 2 + 1) * (W / 400);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      const pts = st.p.slice(Math.max(0, from - 1));
      ctx.moveTo(pts[0][0] * W, pts[0][1] * H);
      if (pts.length === 1) ctx.lineTo(pts[0][0] * W + 0.1, pts[0][1] * H);
      for (const [x, y] of pts.slice(1)) ctx.lineTo(x * W, y * H);
      ctx.stroke();
    };
    b.redraw = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); for (const st of b.strokes) b.line(st, 0); };
    b.add = ({ p: pts, c, w, n }) => {
      let st = b.strokes[b.strokes.length - 1];
      if (n || !st) { st = { c, w, p: [] }; b.strokes.push(st); }
      const from = st.p.length;
      st.p.push(...pts);
      b.fit(); b.line(st, from);
    };
    b.clear = () => { b.strokes = []; ctx.clearRect(0, 0, canvas.width, canvas.height); };
    // Quien dibuja: se pinta al momento y se envía en trocitos cada 40 ms
    const pos = (e) => { const r = canvas.getBoundingClientRect(); return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))]; };
    const flush = () => {
      if (!b.buf.length) return;
      socket?.emit('game:stroke', { p: b.buf, c: b.ink, w: b.size, n: b.fresh });
      b.buf = []; b.fresh = false;
    };
    canvas.addEventListener('pointerdown', (e) => {
      if (!game || game.game !== 'draw' || !game.myTurn || game.phase !== 'draw') return;
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      b.drawing = true; b.fresh = true;
      const pt = pos(e);
      b.add({ p: [pt], c: b.ink, w: b.size, n: true });
      b.buf.push(pt);
      b.timer = setInterval(flush, 40);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!b.drawing) return;
      const pt = pos(e);
      b.add({ p: [pt], c: b.ink, w: b.size, n: false });
      b.buf.push(pt);
      if (b.buf.length >= 60) flush();
    });
    const up = () => { if (!b.drawing) return; b.drawing = false; flush(); clearInterval(b.timer); };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    return b;
  }

  function drawView(g, p, body, host, c, actions) {
    if (!board || board.round !== g.round) board = makeBoard(g.round);
    const fresh = !p || p.round !== g.round || p.phase !== g.phase;
    // Pizarra a la izquierda y controles a la derecha (en el móvil, uno debajo del otro)
    const grid = el('div', 'draw-grid');
    const side = el('div', 'draw-side');
    const outer = body;
    body = side;
    body.appendChild(el('p', 'dock-score', t('pl.score', { a: g.me, b: g.them })));
    if (g.phase === 'draw') {
      if (g.myTurn) {
        const q = el('p', 'dock-q draw-word');
        q.append(`✏️ ${t('pl.drawThis')} `, el('b', 'word-chip', wordOf(g)));
        body.appendChild(q);
        if (fresh) gesture(host, 'talk', 1400);
      } else {
        body.appendChild(el('p', 'dock-q', `🤔 ${t('pl.whatIsIt')}`));
        const hint = el('p', 'draw-hint');
        for (const ch of g.hint || '') hint.appendChild(el('span', ch === ' ' ? 'gap' : ch === '_' ? 'slot' : 'slot on', ch === '_' ? '' : ch));
        body.appendChild(hint);
      }
    }
    const wrap = el('div', `board-wrap${g.myTurn && g.phase === 'draw' ? ' can-draw' : ''}`);
    wrap.appendChild(board.canvas);
    if (g.phase === 'draw') {
      const bar = el('div', 'dock-timer draw-timer');
      const fill = el('span');
      fill.style.animationDuration = `${DRAW_MS / 1000}s`;
      fill.style.animationDelay = `-${(DRAW_MS - Math.max(0, g.deadline - Date.now())) / 1000}s`;
      bar.appendChild(fill);
      const secs = el('b', 'draw-secs');
      const upd = () => { const left = Math.max(0, Math.ceil((g.deadline - Date.now()) / 1000)); secs.textContent = `${left}s`; secs.classList.toggle('hurry', left <= 10); };
      upd(); clearInterval(tick); tick = setInterval(upd, 500);
      wrap.append(bar, secs);
    } else clearInterval(tick);
    grid.append(wrap, side);
    outer.appendChild(grid);
    requestAnimationFrame(() => board?.fit());
    if (g.phase === 'draw' && g.myTurn) {
      const tools = el('div', 'draw-tools');
      INK.forEach((col, i) => {
        const sw = btn(`ink${board.ink === i ? ' on' : ''}`, '', () => { board.ink = i; tools.querySelectorAll('.ink').forEach((x, k) => x.classList.toggle('on', k === i)); });
        sw.style.setProperty('--ink', col);
        sw.setAttribute('aria-label', col);
        tools.appendChild(sw);
      });
      [1, 2, 3].forEach((w) => {
        const b = btn(`pen${board.size === w ? ' on' : ''}`, '', () => { board.size = w; tools.querySelectorAll('.pen').forEach((x, k) => x.classList.toggle('on', k === w - 1)); });
        b.appendChild(el('i', '', ''));
        b.style.setProperty('--pen', `${w * 4 + 2}px`);
        b.setAttribute('aria-label', `${w}`);
        tools.appendChild(b);
      });
      const clr = btn('pen clear', '🗑️', () => { board.clear(); socket?.emit('game:clear'); });
      clr.setAttribute('aria-label', t('pl.clear'));
      tools.appendChild(clr);
      body.appendChild(tools);
    } else if (g.phase === 'draw') {
      const form = el('form', 'guess-form');
      const input = el('input');
      input.type = 'text'; input.maxLength = 40; input.autocomplete = 'off';
      input.placeholder = t('pl.guessPh');
      input.setAttribute('aria-label', t('pl.guessPh'));
      form.append(input, el('button', 'btn primary sm', t('pl.guessBtn')));
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        socket.emit('game:guess', { text }, (res) => {
          if (res?.ok) return;
          input.value = '';
          form.classList.remove('nope'); void form.offsetWidth; form.classList.add('nope');
          if (res?.close) playToast(`🔥 ${t('pl.close')}`, { cls: 'got', ms: 1600 });
        });
      });
      body.appendChild(form);
      if (fresh) setTimeout(() => input.focus({ preventScroll: true }), 50);
    } else {
      const res = el('p', `dock-result ${g.solved ? 'win' : ''}`);
      res.append(g.solved ? `${t('pl.solved')} ` : `${t('pl.timeUp')} `, el('b', 'word-chip pop', wordOf(g)));
      body.appendChild(res);
      if (g.solved && fresh) { gesture(host, 'jump', 700); confetti(c, ['🎨', '✨', '🔥', '🎉']); }
      actions.append(btn('btn primary sm', `🔄 ${t('pl.swap')}`, () => socket.emit('game:next')));
      side.appendChild(actions);
    }
  }
  // Lo que se va escribiendo, para quien dibuja (burbujas que suben y se van)
  function guessSeen(text) {
    const wrap = dock.querySelector('.board-wrap');
    if (!wrap) return;
    const b = el('span', 'guess-bubble', text);
    b.style.left = `${10 + Math.random() * 60}%`;
    wrap.appendChild(b);
    setTimeout(() => b.remove(), 2600);
  }

  // ---------- Termómetro de química ----------
  let chemTop = 0;
  function chem(v) {
    const bar = $('chemBar');
    if (!bar) return;
    bar.hidden = v < 3;
    $('chemFill').style.width = `${v}%`;
    $('chemNum').textContent = `${v}°`;
    bar.setAttribute('aria-valuenow', v);
    bar.classList.toggle('warm', v >= 50);
    bar.classList.toggle('hot', v >= 80);
    bar.classList.toggle('max', v >= 100);
    for (const [step, key] of [[50, 'pl.chem50'], [80, 'pl.chem80'], [100, 'pl.chem100']]) {
      if (v >= step && chemTop < step) {
        $('chemLabel').textContent = t(key);
        bar.classList.remove('bump'); void bar.offsetWidth; bar.classList.add('bump');
        if (step === 100) { confetti(bar, ['🔥', '🌡️', '💥', '❤️', '✨']); playToast([el('span', 'pt-e big', '💥'), el('span', 'pt-text', t('pl.chemBoom'))], { cls: 'got', ms: 3600 }); }
      }
    }
    chemTop = Math.max(chemTop, v);
  }
  function chemReset() { chemTop = 0; $('chemLabel').textContent = ''; chem(0); }

  // ---------- Modo picante ----------
  async function setSpicy(on) {
    if (!A.me?.user) return;
    await A.savePrefs({ spicy: on });
    socket?.emit('prefs-changed');
    sync();
    A.toast(on ? t('pl.spicyOn') : t('pl.spicyOff'));
    rerender();
  }
  function sync() {
    const on = mySpicy();
    $('spicyToggle').checked = on;
    if ($('prefSpicy')) $('prefSpicy').checked = on;
    if ($('prefShowPiropos')) $('prefShowPiropos').checked = !!A.me?.user?.prefs?.showPiropos;
    document.body.classList.toggle('spicy-on', on);
    const mine = Object.entries(A.me?.user?.piropos || {}).sort((a, b) => b[1] - a[1]);
    const mp = $('myPiropos');
    if (mp) mp.textContent = mine.length && G ? `${t('pl.yourPiropos')}: ${mine.map(([id, n]) => `${G.piropos.find((x) => x.id === id)?.e || ''} ${n}`).join(' · ')}` : '';
  }
  $('spicyToggle').addEventListener('change', (e) => {
    if (!A.me?.user) { e.target.checked = false; return; }
    setSpicy(e.target.checked);
  });
  $('prefSpicy')?.addEventListener('change', (e) => setSpicy(e.target.checked));
  $('prefShowPiropos')?.addEventListener('change', async (e) => { await A.savePrefs({ showPiropos: e.target.checked }); socket?.emit('prefs-changed'); });

  $('gamesBtn').addEventListener('click', () => { if (game || invite) return; open = open === 'games' ? null : 'games'; loadGames().then(rerender); });
  $('piropoBtn').addEventListener('click', () => { if (game || invite) return; open = open === 'piropos' ? null : 'piropos'; loadGames().then(rerender); });

  // ---------- «¿Volverías a hablar con esa persona?» (privado) ----------
  function askRate() {
    document.querySelector('.rate-ask')?.remove();
    const box = el('div', 'rate-ask');
    box.appendChild(el('span', '', t('pl.rate')));
    const done = (up) => { socket?.emit('rate', { up }); box.remove(); A.toast(t('pl.rateThanks')); };
    const yes = btn('rate-btn', '👍', () => done(true));
    const no = btn('rate-btn', '👎', () => done(false));
    yes.setAttribute('aria-label', t('pl.rateYes'));
    no.setAttribute('aria-label', t('pl.rateNo'));
    box.append(yes, no);
    $('remote').appendChild(box);
    clearTimeout(rateTimer);
    rateTimer = setTimeout(() => box.remove(), 12000);
  }

  // ---------- Conexión con el servidor ----------
  function attach(s) {
    socket = s;
    s.on('piropo', ({ id }) => loadGames().then(() => {
      const p = G?.piropos.find((x) => x.id === id);
      if (!p) return;
      edgeRain(p.e);
      const action = A.premium ? { label: `🌶️ ${t('pl.reply')}`, on: () => { open = 'piropos'; rerender(); } } : { label: `★ ${t('pl.replyPremium')}`, on: () => A.openPremium() };
      playToast([el('span', 'pt-e big', p.e), el('span', 'pt-text', tx(p.t))], { cls: 'got', ms: 3600, action });
    }));
    s.on('game:invited', (inv) => {
      invite = { ...inv, at: Date.now() }; open = null;
      loadGames().then(rerender);
      setTimeout(() => { if (invite && Date.now() - invite.at >= 29000) { invite = null; rerender(); } }, 30000);
    });
    s.on('game:declined', () => playToast(t('pl.declined')));
    s.on('game', (state) => {
      if (state?.ended) {
        prev = null; game = null; streak = 0; board = null; clearInterval(tick);
        if (state.ended === 'ended' && state.by === 'them') playToast(t('pl.endedByThem'));
        if (state.ended === 'spicyOff') playToast(t('pl.endedSpicy'));
      } else {
        prev = game; game = state; invite = null; open = null;
        if (state.game === 'draw') state.deadline = Date.now() + (state.left || 0);
        if (!prev) { $('playToast').replaceChildren(); streak = 0; }
      }
      loadGames().then(rerender);
    });
    s.on('game:stroke', (d) => { if (game?.game === 'draw' && board) board.add(d); });
    s.on('game:clear', () => board?.clear());
    s.on('game:guess-seen', ({ text }) => guessSeen(text));
    s.on('chem', ({ v }) => { if (A.partner) chem(v); });
    s.on('partner-flags', ({ spicy }) => { if (A.partner) { A.partner.spicy = spicy; rerender(); } });
    s.on('rate-ask', askRate);
  }

  // Al conectar con alguien nuevo / al irse
  function matched() { game = null; prev = null; invite = null; open = null; streak = 0; board = null; chemReset(); loadGames().then(() => { rerender(); sync(); }); }
  function left() { game = null; prev = null; invite = null; open = null; streak = 0; board = null; clearInterval(tick); chemReset(); rerender(); }

  // Piropos que la otra persona ha decidido mostrar: «🍑 23 · 🔥 41»
  function badges(p) {
    if (!p?.piropos?.length || !G) return '';
    return p.piropos.map(({ id, n }) => `${G.piropos.find((x) => x.id === id)?.e || ''} ${n}`).join(' · ');
  }

  document.addEventListener('langchange', () => { rerender(); sync(); });
  window.Play = { attach, matched, left, badges, sync, loadGames, confetti, playToast };
  if (A.socket) attach(A.socket);
  sync();
})();
