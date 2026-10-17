// Juegos, piropos y «¿Volverías a hablar?» en el videochat (la parte del servidor está en play.js).
// Todo aparece sobre el vídeo de la otra persona, en tarjetas pequeñas, y Guindilla hace
// de presentadora. Los niveles Picante y Muy picante y los piropos solo funcionan si las dos
// personas tienen el modo picante activado; Muy picante, además, necesita Premium.
(function () {
  const { t } = window.I18N;
  const A = window.App;
  const $ = (id) => document.getElementById(id);
  const tx = (o) => o?.[window.I18N.lang] ?? o?.en ?? '';
  const layer = $('playLayer');
  const LEVEL_ICON = { soft: '😇', hot: '🌶️', xxx: '🌶️🌶️' };
  const GAME_ICON = { truth: '🔥', wyr: '🤔', rps: '✊' };
  const RPS_ICON = { r: '✊', p: '✋', s: '✌️' };

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
  let invite = null;      // invitación recibida { game, level }
  let waiting = null;     // invitación enviada
  let open = null;        // 'games' | 'piropos' | null
  let rateTimer = null;
  let waitTimer = null;

  const mySpicy = () => !!A.me?.user?.prefs?.spicy;
  const partnerSpicy = () => !!A.partner?.spicy;
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const btn = (cls, text, on) => { const b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', on); return b; };
  const gameName = (g) => t(`pl.${g}`);
  const levelName = (l) => `${LEVEL_ICON[l]} ${t(`pl.${l}`)}`;

  // ---------- Tarjetas sobre el vídeo ----------
  function card(cls) {
    const c = el('section', `play-card ${cls || ''}`);
    c.setAttribute('role', 'dialog');
    return c;
  }
  function host(c, title) {
    const head = el('header', 'play-head');
    const m = el('span', 'play-host');
    m.setAttribute('aria-hidden', 'true');
    m.innerHTML = window.Mascot ? window.Mascot.make() : '🌶️';
    head.append(m, el('b', '', title), btn('play-x', '✕', () => {
      if (game) { socket?.emit('game:end'); game = null; }
      if (invite) { socket?.emit('game:reply', { accept: false }); invite = null; }
      open = null; rerender();
    }));
    head.lastChild.setAttribute('aria-label', t('btn.close'));
    c.appendChild(head);
    return m;
  }
  const talk = (m) => window.Mascot?.gesture(m, 'talk', 1400);

  // La animación de entrada solo cuando aparece una tarjeta nueva, no en cada jugada
  let shown = '';
  function rerender() {
    layer.replaceChildren();
    if (!A.partner) { shown = ''; return; }
    let c = null;
    if (invite) c = inviteCard();
    else if (game) c = gameCard();
    else if (open === 'games') c = gamesMenu();
    else if (open === 'piropos') c = piropoTray();
    const key = invite ? 'invite' : game ? `game-${game.game}` : open || '';
    if (c) { if (key === shown) c.classList.add('still'); layer.appendChild(c); }
    shown = key;
    $('gamesBtn').classList.toggle('active', open === 'games' || !!game);
    $('piropoBtn').classList.toggle('active', open === 'piropos');
  }

  // Motivo por el que un nivel no está disponible (o null)
  function lockOf(level) {
    if (level === 'soft') return null;
    if (level === 'xxx' && !A.premium) return 'premium';
    if (!mySpicy()) return 'spicyMe';
    if (!partnerSpicy()) return 'spicyThem';
    return null;
  }
  const lockText = (code) => t({ premium: 'pl.premiumOnly', spicyMe: 'pl.needSpicyMe', spicyThem: 'pl.partnerNoSpicy' }[code] || 'err.generic');

  function invite_(gameId, level) {
    socket.emit('game:invite', { game: gameId, level }, (res) => {
      if (res?.ok) {
        waiting = { game: gameId, level };
        open = null; rerender();
        A.toast(t('pl.waiting'));
        clearTimeout(waitTimer);
        waitTimer = setTimeout(() => { waiting = null; }, 30000);
      } else if (res?.code === 'premium') A.openPremium();
      else A.toast(res?.code === 'busy' || res?.code === 'pending' ? t('pl.busy') : lockText(res?.code));
    });
  }

  function gamesMenu() {
    const c = card('play-menu');
    host(c, t('pl.games'));
    for (const g of ['truth', 'wyr', 'rps']) {
      const row = el('div', 'play-game');
      row.appendChild(el('span', 'play-game-name', `${GAME_ICON[g]} ${gameName(g)}`));
      const levels = el('div', 'play-levels');
      for (const l of g === 'rps' ? ['soft'] : ['soft', 'hot', 'xxx']) {
        const lock = lockOf(l);
        const label = g === 'rps' ? t('pl.play') : levelName(l);
        const b = btn(`chip lvl-${l}${lock ? ' locked' : ''}`, label, () => (lock === 'premium' ? A.openPremium() : lock ? A.toast(lockText(lock)) : invite_(g, l)));
        if (lock === 'premium') b.appendChild(el('span', 'lvl-gold', '★ Premium'));
        if (lock) b.title = lockText(lock);
        levels.appendChild(b);
      }
      row.appendChild(levels);
      c.appendChild(row);
    }
    if (!mySpicy() || !partnerSpicy()) c.appendChild(el('p', 'play-note', !mySpicy() ? t('pl.needSpicyMe') : t('pl.partnerNoSpicy')));
    if (!A.premium) {
      const up = btn('btn gold sm play-upsell', t('pl.premiumUpsell'), () => A.openPremium());
      c.appendChild(up);
    }
    return c;
  }

  function piropoTray() {
    const c = card('play-tray');
    host(c, t('pl.piropos'));
    const ok = mySpicy() && partnerSpicy();
    if (!ok) c.appendChild(el('p', 'play-note', !mySpicy() ? t('pl.needSpicyMe') : t('pl.partnerNoSpicy')));
    const grid = el('div', 'piropo-grid');
    for (const p of G?.piropos || []) {
      const b = btn('piropo', '', () => sendPiropo(p));
      b.append(el('span', 'piropo-e', p.e), el('span', 'piropo-t', tx(p.t)));
      b.disabled = !ok;
      grid.appendChild(b);
    }
    c.appendChild(grid);
    if (!mySpicy()) c.appendChild(btn('btn primary sm', t('pl.turnOn'), () => setSpicy(true)));
    return c;
  }

  function sendPiropo(p) {
    socket.emit('piropo', p.id, (res) => {
      if (res?.ok) { popPiropo(p, true); open = null; rerender(); } else if (res?.code !== 'slow') A.toast(lockText(res?.code));
    });
  }

  // Piropo en grande sobre el vídeo (con una lluvia de su emoji)
  function popPiropo(p, mine) {
    const box = el('div', `piropo-pop${mine ? ' mine' : ''}`);
    box.append(el('span', 'pp-e', p.e), el('span', 'pp-t', mine ? `${t('pl.sent')}: ${tx(p.t)}` : tx(p.t)));
    $('remote').appendChild(box);
    for (let i = 0; i < 14; i += 1) {
      const s = el('span', 'pp-rain', p.e);
      s.style.left = `${5 + Math.random() * 90}%`;
      s.style.animationDelay = `${Math.random() * 0.6}s`;
      s.style.fontSize = `${1.4 + Math.random() * 1.4}rem`;
      box.appendChild(s);
    }
    setTimeout(() => box.remove(), 3200);
  }

  function inviteCard() {
    const c = card('play-invite');
    const m = host(c, gameName(invite.game));
    talk(m);
    const who = A.partner?.name || t('pl.someone');
    c.appendChild(el('p', 'play-q', t('pl.invite', { name: who, game: gameName(invite.game) })));
    if (invite.game !== 'rps') c.appendChild(el('p', `play-level lvl-${invite.level}`, levelName(invite.level)));
    const row = el('div', 'play-actions');
    row.append(
      btn('btn ghost', t('pl.noThanks'), () => { socket.emit('game:reply', { accept: false }); invite = null; rerender(); }),
      btn('btn primary', t('pl.play'), () => { socket.emit('game:reply', { accept: true }); invite = null; rerender(); }),
    );
    c.appendChild(row);
    return c;
  }

  function gameCard() {
    const g = game;
    const c = card(`play-game-card g-${g.game}`);
    const m = host(c, `${gameName(g.game)}${g.game !== 'rps' ? ` · ${levelName(g.level)}` : ''}`);
    const actions = el('div', 'play-actions');
    if (g.game === 'truth') {
      if (g.phase === 'choose') {
        c.appendChild(el('p', 'play-q', g.myTurn ? t('pl.yourTurn') : t('pl.theirTurn')));
        if (g.myTurn) actions.append(btn('btn ghost', `🙊 ${t('pl.truthBtn')}`, () => socket.emit('game:choose', { kind: 't' })), btn('btn primary', `😈 ${t('pl.dareBtn')}`, () => socket.emit('game:choose', { kind: 'd' })));
      } else {
        const cardData = G?.truth[g.level]?.[g.card.i];
        c.appendChild(el('p', 'play-kind', `${g.card.k === 't' ? t('pl.truthBtn') : t('pl.dareBtn')} · ${g.myTurn ? t('pl.forYou') : t('pl.forThem')}`));
        c.appendChild(el('p', 'play-text', tx(cardData?.t)));
        talk(m);
        if (g.myTurn) actions.append(btn('btn ghost', t('pl.skip'), () => socket.emit('game:next')), btn('btn primary', t('pl.done'), () => socket.emit('game:next')));
        else actions.append(btn('btn primary', t('pl.nextCard'), () => socket.emit('game:next')));
      }
    } else if (g.game === 'wyr') {
      const q = G?.wyr[g.level]?.[g.q];
      c.appendChild(el('p', 'play-q', t('pl.wyrQ')));
      const opts = el('div', 'wyr-opts');
      for (const k of ['a', 'b']) {
        const b = btn(`wyr-opt${g.mine === k ? ' picked' : ''}${g.phase === 'reveal' && g.theirs === k ? ' theirs' : ''}`, tx(q?.[k]), () => socket.emit('game:pick', { option: k }));
        b.disabled = !!g.mine;
        opts.appendChild(b);
      }
      c.appendChild(opts);
      if (g.phase === 'pick') c.appendChild(el('p', 'play-note', g.mine ? t('pl.waitingPick') : (g.otherPicked ? t('pl.otherPicked') : t('pl.chooseOne'))));
      else {
        const same = g.mine === g.theirs;
        c.appendChild(el('p', `play-result ${same ? 'win' : ''}`, same ? t('pl.match') : t('pl.noMatch')));
        if (same) talk(m);
        actions.append(btn('btn primary', t('pl.next'), () => socket.emit('game:next')));
      }
      if (g.matches) c.appendChild(el('p', 'play-note', t('pl.matches', { n: g.matches })));
    } else {
      c.appendChild(el('p', 'play-score', t('pl.score', { a: g.me, b: g.them })));
      if (g.phase === 'pick') {
        c.appendChild(el('p', 'play-q', g.mine ? t('pl.waitingPick') : t('pl.chooseOne')));
        const opts = el('div', 'rps-opts');
        for (const k of ['r', 'p', 's']) {
          const b = btn(`rps-opt${g.mine === k ? ' picked' : ''}`, RPS_ICON[k], () => socket.emit('game:pick', { option: k }));
          b.setAttribute('aria-label', t(`pl.rps_${k}`));
          b.disabled = !!g.mine;
          opts.appendChild(b);
        }
        c.appendChild(opts);
      } else {
        c.appendChild(el('p', 'rps-vs', `${RPS_ICON[g.myLast]}  vs  ${RPS_ICON[g.theirs]}`));
        const msg = g.phase === 'done' ? (g.winner === 'me' ? t('pl.youWin') : t('pl.youLose'))
          : g.roundWinner === 'draw' ? t('pl.draw') : g.roundWinner === 'me' ? t('pl.roundWin') : t('pl.roundLose');
        c.appendChild(el('p', `play-result ${g.roundWinner === 'me' || g.winner === 'me' ? 'win' : ''}`, msg));
        talk(m);
        if (g.phase === 'done') {
          actions.append(btn('btn ghost', t('pl.end'), () => socket.emit('game:end')));
          if (g.winner === 'me') actions.append(btn('btn primary', `🔥 ${t('pl.truth')}`, () => { socket.emit('game:end'); setTimeout(() => invite_('truth', partnerSpicy() && mySpicy() ? 'hot' : 'soft'), 300); }));
        } else actions.append(btn('btn primary', t('pl.next'), () => socket.emit('game:next')));
      }
    }
    if (actions.children.length) c.appendChild(actions);
    return c;
  }

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
    if (mp) mp.textContent = mine.length && G ? `${t('pl.yourPiropos')}: ${mine.map(([id, n]) => `${G.piropos.find((p) => p.id === id)?.e || ''} ${n}`).join(' · ')}` : '';
  }
  $('spicyToggle').addEventListener('change', (e) => {
    if (!A.me?.user) { e.target.checked = false; return; }
    setSpicy(e.target.checked);
  });
  $('prefSpicy')?.addEventListener('change', (e) => setSpicy(e.target.checked));
  $('prefShowPiropos')?.addEventListener('change', async (e) => { await A.savePrefs({ showPiropos: e.target.checked }); socket?.emit('prefs-changed'); });

  $('gamesBtn').addEventListener('click', () => { if (game) return; open = open === 'games' ? null : 'games'; loadGames().then(rerender); });
  $('piropoBtn').addEventListener('click', () => { open = open === 'piropos' ? null : 'piropos'; loadGames().then(rerender); });

  // ---------- «¿Volverías a hablar con esa persona?» (privado) ----------
  function askRate() {
    const old = document.querySelector('.rate-ask');
    old?.remove();
    const box = el('div', 'rate-ask');
    box.appendChild(el('span', '', t('pl.rate')));
    const done = (up) => { socket?.emit('rate', { up }); box.remove(); A.toast(t('pl.rateThanks')); };
    box.append(btn('rate-btn', '👍', () => done(true)), btn('rate-btn', '👎', () => done(false)));
    box.children[1].setAttribute('aria-label', t('pl.rateYes'));
    box.children[2].setAttribute('aria-label', t('pl.rateNo'));
    $('remote').appendChild(box);
    clearTimeout(rateTimer);
    rateTimer = setTimeout(() => box.remove(), 12000);
  }

  // ---------- Conexión con el servidor ----------
  function attach(s) {
    socket = s;
    s.on('piropo', ({ id }) => loadGames().then(() => {
      const p = G?.piropos.find((x) => x.id === id);
      if (p) popPiropo(p, false);
    }));
    s.on('game:invited', (inv) => { invite = inv; open = null; loadGames().then(rerender); });
    s.on('game:declined', () => { waiting = null; A.toast(t('pl.declined')); });
    s.on('game', (state) => {
      if (state?.ended) {
        game = null;
        if (state.ended === 'ended' && state.by === 'them') A.toast(t('pl.endedByThem'));
        if (state.ended === 'spicyOff') A.toast(t('pl.endedSpicy'));
      } else { game = state; waiting = null; invite = null; open = null; }
      loadGames().then(rerender);
    });
    s.on('partner-flags', ({ spicy }) => { if (A.partner) { A.partner.spicy = spicy; rerender(); } });
    s.on('rate-ask', askRate);
  }

  // Al conectar con alguien nuevo / al irse
  function matched() { game = null; invite = null; waiting = null; open = null; loadGames().then(() => { rerender(); sync(); }); }
  function left() { game = null; invite = null; waiting = null; open = null; rerender(); }

  // Piropos que la otra persona ha decidido mostrar: «🍑 23 · 🔥 41»
  function badges(p) {
    if (!p?.piropos?.length || !G) return '';
    return p.piropos.map(({ id, n }) => `${G.piropos.find((x) => x.id === id)?.e || ''} ${n}`).join(' · ');
  }

  document.addEventListener('langchange', () => { rerender(); sync(); });
  window.Play = { attach, matched, left, badges, sync, loadGames };
  if (A.socket) attach(A.socket);
  sync();
})();
