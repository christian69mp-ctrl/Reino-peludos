// Guindillas, racha diaria, retos de la semana, insignias y superpoderes (servidor: rewards.js).
// La pastilla «🌶️ 120 🔥3» de la cabecera abre el panel; al entrar cada día se celebra la
// racha, y los poderes se usan desde el panel (↩️ Rebobinar aparece al pulsar Siguiente).
// 🔥 Hora caliente (guindillas ×2) y 🏆 ranking de la semana también viven aquí.
(function () {
  const { t } = window.I18N;
  const A = window.App;
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const btn = (cls, text, on) => { const b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', on); return b; };
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const POWERS = [['flame', '🔥'], ['rewind', '↩️'], ['super', '💌'], ['incognito', '🕶️'], ['second', '👀']];

  let G = null;            // resumen de /api/game
  let tab = 'powers';
  let second = null;       // lista de 👀 Segunda oportunidad
  let rewindTimer = null;
  let rank = null;         // ranking de la semana (/api/ranking)
  let hotTimer = null;

  // ---------- Pastilla de la cabecera ----------
  async function refresh() {
    if (!A.me?.user) { $('pointsPill').hidden = true; return; }
    const res = await A.api('/api/game');
    if (res?.points === undefined) return;
    G = res;
    paintPill();
    if (!modal.hidden) render();
  }
  function paintPill() {
    $('pointsPill').hidden = !A.me?.user;
    $('pointsNum').textContent = G?.points ?? 0;
    $('streakBox').hidden = !G?.streak;
    $('streakNum').textContent = G?.streak || 0;
    // Hora caliente: la pastilla arde y lleva «×2»
    const hot = !!G?.hot?.active;
    $('pointsPill').classList.toggle('hot', hot);
    let x2 = $('hotX2');
    if (hot && !x2) { x2 = el('span', 'pp-hot', '×2'); x2.id = 'hotX2'; $('pointsPill').appendChild(x2); } else if (!hot && x2) x2.remove();
    // Se vuelve a pedir el resumen justo cuando empieza o acaba
    clearTimeout(hotTimer);
    const next = G?.hot?.active ? G.hot.endsAt : G?.hot?.startsAt;
    if (next && next - Date.now() < 6 * 3600 * 1000) hotTimer = setTimeout(refresh, Math.max(1000, next - Date.now() + 1500));
  }
  function floatPoints(n, hot) {
    if (!n || reduced()) return;
    const f = el('span', `pts-float${n < 0 ? ' neg' : ''}${hot ? ' hot' : ''}`, `${n > 0 ? '+' : ''}${n} 🌶️${hot && n > 0 ? ' ×2' : ''}`);
    $('pointsPill').appendChild(f);
    $('pointsPill').classList.remove('bump'); void $('pointsPill').offsetWidth; $('pointsPill').classList.add('bump');
    setTimeout(() => f.remove(), 1400);
  }

  // ---------- Panel ----------
  const modal = el('div', 'overlay powers-overlay');
  modal.hidden = true;
  modal.innerHTML = '<div class="modal powers-modal" role="dialog" aria-modal="true" aria-labelledby="pwTitle"></div>';
  document.body.appendChild(modal);
  const box = modal.firstChild;
  const close = () => { modal.hidden = true; };
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) { e.stopImmediatePropagation(); close(); } }, true);

  function openPanel(which = 'powers') { tab = which; modal.hidden = false; render(); refresh(); if (which === 'ranking') loadRank(); }
  async function loadRank() {
    const r = await A.api('/api/ranking');
    if (r?.top) { rank = r; if (!modal.hidden && tab === 'ranking') render(); }
  }
  $('pointsPill').addEventListener('click', () => openPanel());

  function price(p) {
    if (G?.free?.[p] > 0) return G.free[p] === Infinity || G.free[p] > 50 ? t('pw.free') : t('pw.freeLeft', { n: G.free[p] });
    return t('pw.cost', { n: G?.prices?.[p] ?? '' });
  }
  async function power(p, body = {}) {
    const res = await A.api(`/api/powers/${p}`, { method: 'POST', body });
    if (res?.code === 'points') { A.toast(t('pw.noPoints')); return null; }
    if (res?.game) { G = res.game; paintPill(); }
    return res;
  }

  function render() {
    box.replaceChildren();
    const head = el('div', 'pw-head');
    const m = el('span', 'pw-mascot');
    m.innerHTML = window.Mascot ? window.Mascot.make() : '🌶️';
    const title = el('div', 'pw-title');
    const h = el('h2', '', t('pw.title')); h.id = 'pwTitle';
    title.append(h, el('p', 'pw-balance', t('pw.balance', { n: G?.points ?? 0 })));
    const x = btn('close', '✕', close); x.setAttribute('aria-label', t('btn.close'));
    head.append(m, title, x);
    box.appendChild(head);
    window.Mascot?.gesture(m, 'wave', 1600);
    if (G?.hot && !G.hot.off) box.appendChild(hotBanner());
    const tabs = el('div', 'tabs pw-tabs');
    for (const [id, key] of [['powers', 'pw.tabPowers'], ['challenges', 'pw.tabChallenges'], ['badges', 'pw.tabBadges'], ['ranking', 'pw.tabRanking']]) {
      const b = btn(`tab${tab === id ? ' active' : ''}`, t(key), () => { tab = id; render(); if (id === 'ranking') loadRank(); });
      tabs.appendChild(b);
    }
    box.appendChild(tabs);
    if (!G) { box.appendChild(el('p', 'muted', '…')); return; }
    if (tab === 'powers') renderPowers(); else if (tab === 'challenges') renderChallenges(); else if (tab === 'ranking') renderRanking(); else renderBadges();
    box.appendChild(el('p', 'pw-earn', t('pw.howEarn')));
    if (!G.premium) box.appendChild(btn('btn gold wide', t('pw.premiumPitch'), () => { close(); A.openPremium(); }));
  }

  function card(p, icon) {
    const c = el('article', `pw-card p-${p}`);
    const top = el('div', 'pw-card-top');
    top.append(el('span', 'pw-icon', icon), el('b', '', t(`pw.${p}`)), el('span', `pw-price${G.free?.[p] > 0 ? ' free' : ''}`, price(p)));
    c.append(top, el('p', 'pw-desc', t(`pw.${p}Desc`)));
    return c;
  }

  function renderPowers() {
    const list = el('div', 'pw-list');
    const now = Date.now();
    for (const [p, icon] of POWERS) {
      const c = card(p, icon);
      if (p === 'flame') {
        if (G.boostUntil > now) c.append(el('p', 'pw-active', t('pw.flameActive', { m: Math.ceil((G.boostUntil - now) / 60000) })));
        else c.append(btn('btn primary sm', `🔥 ${t('pw.use')}`, async () => { if (await power('flame')) { A.toast(t('pw.flameOn')); burstIn(c); render(); } }));
      } else if (p === 'rewind') {
        c.append(el('p', 'pw-hint', t('pw.rewindWhere')));
      } else if (p === 'super') {
        if (G.superMsg) {
          c.append(el('p', 'pw-active', `💌 «${G.superMsg}»`), el('p', 'pw-hint', t('pw.superArmed')), btn('btn ghost sm', t('pw.superRemove'), async () => { await power('super', { text: '' }); render(); }));
        } else {
          const f = el('form', 'pw-super');
          const input = el('input');
          input.maxLength = 140; input.placeholder = t('pw.superPh');
          f.append(input, btn('btn primary sm', t('pw.superArm'), () => {}));
          f.addEventListener('submit', async (e) => { e.preventDefault(); if (input.value.trim() && await power('super', { text: input.value })) { A.toast(t('pw.superArmed')); render(); } });
          f.lastChild.type = 'submit';
          c.append(f);
        }
      } else if (p === 'incognito') {
        if (G.incognitoUntil > now) {
          const time = new Date(G.incognitoUntil).toLocaleTimeString(window.I18N.lang, { hour: '2-digit', minute: '2-digit' });
          c.append(el('p', 'pw-active', t('pw.incognitoOn', { time })), btn('btn ghost sm', t('pw.off'), async () => { await power('incognito', { on: false }); render(); }));
        } else c.append(btn('btn primary sm', `🕶️ ${t('pw.use')}`, async () => { if (await power('incognito', { on: true })) { A.toast(t('pw.incognitoTag')); render(); } }));
      } else if (p === 'second') {
        c.append(btn('btn primary sm', `👀 ${t('pw.use')}`, async () => {
          const res = await power('second');
          if (!res?.ok) return;
          second = res.people;
          render();
        }));
        if (second) {
          const ul = el('ul', 'pw-people');
          if (!second.length) ul.appendChild(el('li', 'muted', t('pw.secondEmpty')));
          for (const s of second) {
            const li = el('li');
            li.append(el('span', 'avatar sm', (s.name || t(`g.${s.gender}`) || '?').slice(0, 1).toUpperCase()), el('span', 'pw-person', `${s.name || t(`g.${s.gender}`)} · ❤️`));
            const add = btn('btn ghost sm', t('pw.addFriend'), async () => {
              const r = await A.api('/api/friends/request', { method: 'POST', body: { handle: s.handle } });
              if (r?.code === 'premium') A.openPremium(); else { add.disabled = true; add.textContent = t('pw.requestSent'); }
            });
            li.appendChild(add);
            ul.appendChild(li);
          }
          c.appendChild(ul);
        }
      }
      list.appendChild(c);
    }
    box.appendChild(list);
  }

  function renderChallenges() {
    const s = el('section', 'pw-streak');
    const n = G.streak || 0;
    s.append(el('span', 'pw-streak-num', `🔥 ${t('pw.streakDays', { n })}`));
    const dots = el('div', 'pw-dots');
    for (let i = 1; i <= 7; i += 1) {
      const d = el('span', `pw-dot${i <= (n % 7 || (n ? 7 : 0)) ? ' on' : ''}`, i === 7 ? '🎁' : '🌶️');
      d.style.animationDelay = `${i * 70}ms`;
      dots.appendChild(d);
    }
    s.append(dots, el('p', 'pw-hint', t('pw.streakHint')));
    box.appendChild(s);
    const days = Math.max(1, Math.ceil((G.weekEnds - Date.now()) / 86400000));
    const wk = el('section', 'pw-week');
    wk.append(el('h3', '', t('pw.weekly')), el('p', 'pw-hint', t('pw.weekEnds', { d: days })));
    for (const c of G.challenges) {
      const row = el('div', `pw-ch${c.done ? ' done' : ''}`);
      const bar = el('div', 'pw-bar');
      const fill = el('span');
      fill.style.width = `${Math.round((100 * c.progress) / c.goal)}%`;
      bar.appendChild(fill);
      row.append(el('span', 'pw-ch-name', t(`ch.${c.id}`)), el('span', 'pw-ch-reward', c.done ? `✅ ${t('pw.done')}` : t('pw.reward', { n: c.reward })), bar, el('span', 'pw-ch-prog', `${c.progress}/${c.goal}`));
      wk.appendChild(row);
    }
    box.appendChild(wk);
  }

  function renderBadges() {
    const grid = el('div', 'pw-badges');
    for (const b of G.badges) {
      const c = el('div', `pw-badge${b.have ? ' have' : ''}`);
      c.append(el('span', 'pw-badge-e', b.e), el('b', '', t(`bd.${b.id}`)), el('span', 'pw-hint', t(`bdd.${b.id}`)));
      if (!b.have) {
        const bar = el('div', 'pw-bar');
        const fill = el('span');
        fill.style.width = `${Math.round((100 * b.progress) / b.goal)}%`;
        bar.appendChild(fill);
        c.append(bar, el('span', 'pw-ch-prog', `${b.progress}/${b.goal}`));
      }
      grid.appendChild(c);
    }
    box.appendChild(grid);
  }

  // 🔥 Hora caliente: activa (con los minutos que quedan) o cuándo es la próxima
  function hotBanner() {
    const h = G.hot;
    const b = el('div', `pw-hot${h.active ? ' on' : ''}`);
    if (h.active) b.textContent = t('pw.hotOn', { m: Math.max(1, Math.ceil((h.endsAt - Date.now()) / 60000)) });
    else b.textContent = t('pw.hotNext', { time: new Date(h.startsAt).toLocaleTimeString(window.I18N.lang, { hour: '2-digit', minute: '2-digit' }) });
    return b;
  }

  // 🏆 Ranking de la semana
  function renderRanking() {
    const sec = el('section', 'pw-rank');
    sec.append(el('h3', '', `🏆 ${t('pw.rankTitle')}`), el('p', 'pw-hint', t('pw.rankHint')));
    if (rank?.prizes && !A.me?.free) sec.appendChild(el('p', 'pw-rank-prizes', t('gf.rankPrizes', { a: rank.prizes[0], b: rank.prizes[1], c: rank.prizes[2] })));
    if (!rank) { sec.appendChild(el('p', 'muted', '…')); box.appendChild(sec); return; }
    const ol = el('ol', 'pw-rank-list');
    if (!rank.top.length) ol.appendChild(el('li', 'muted', t('pw.rankEmpty')));
    rank.top.forEach((r, i) => {
      const li = el('li', `${r.me ? 'me' : ''}${i < 3 ? ` top${i + 1}` : ''}`);
      li.style.animationDelay = `${i * 60}ms`;
      li.append(el('span', 'pw-rank-pos', ['🥇', '🥈', '🥉'][i] || `${i + 1}`), el('span', 'pw-rank-name', `${r.name || t('pw.anon')} ${(r.badges || []).join('')}`), el('b', 'pw-rank-pts', `${r.earned} 🌶️`));
      ol.appendChild(li);
    });
    sec.appendChild(ol);
    sec.appendChild(el('p', 'pw-rank-me', rank.me ? t('pw.rankMe', { pos: rank.me.pos, total: rank.players, n: rank.me.earned }) : t('pw.rankNone')));
    // Quien no quiera salir, se oculta (sigue viendo su posición)
    const lab = el('label', 'pw-rank-hide');
    const cb = el('input');
    cb.type = 'checkbox';
    cb.checked = !!A.me?.user?.prefs?.hideRanking;
    cb.addEventListener('change', async () => { await A.savePrefs({ hideRanking: cb.checked }); rank = null; loadRank(); });
    lab.append(cb, el('span', '', t('pw.rankHide')));
    sec.appendChild(lab);
    box.appendChild(sec);
  }

  function burstIn(target) { window.Play?.confetti(target, ['🔥', '✨', '🌶️']); }

  // ---------- Celebraciones ----------
  // En plena conversación no se abre ventana: sale un aviso pequeño debajo del vídeo
  function celebrate({ icon, title, text, button = t('pw.dailyBtn'), emojis }) {
    if (A.partner && window.Play) {
      window.Play.playToast([el('span', 'pt-e big', icon), el('span', 'pt-text', `${title} · ${text}`)], { cls: 'got', ms: 4200 });
      return;
    }
    document.querySelector('.overlay.celebrate')?.remove();
    const o = el('div', 'overlay celebrate');
    const m = el('div', 'modal center-text celebrate-modal');
    const mascot = el('span', 'celebrate-mascot');
    mascot.innerHTML = window.Mascot ? window.Mascot.make() : '🌶️';
    m.append(mascot, el('div', 'celebrate-icon', icon), el('h2', '', title), el('p', 'celebrate-text', text));
    const ok = btn('btn primary wide', button, () => o.remove());
    m.appendChild(ok);
    o.appendChild(m);
    o.addEventListener('click', (e) => { if (e.target === o) o.remove(); });
    document.body.appendChild(o);
    window.Mascot?.gesture(mascot, 'jump', 800);
    setTimeout(() => window.Mascot?.gesture(mascot, 'wave', 2400), 600);
    window.Play?.confetti(m, emojis);
    ok.focus();
    setTimeout(() => o.remove(), 6000);
  }

  // ---------- ↩️ Rebobinar ----------
  // Al pulsar Siguiente (o si la otra persona se va), el botón aparece 15 segundos
  function offerRewind() {
    if (!A.me?.user) return;
    const b = $('rewindBtn');
    b.hidden = false;
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    clearTimeout(rewindTimer);
    rewindTimer = setTimeout(() => { b.hidden = true; }, 15000);
  }
  $('rewindBtn').addEventListener('click', () => {
    $('rewindBtn').hidden = true;
    A.socket?.emit('power:rewind', null, (res) => {
      if (res?.ok) A.toast(t('pw.rewindSent'));
      else if (res?.code === 'points') { A.toast(t('pw.noPoints')); openPanel('powers'); } else A.toast(t('pw.rewindNo'));
    });
  });

  function ask(text, onYes, onNo) {
    document.querySelector('.rewind-ask')?.remove();
    const b = el('div', 'rewind-ask');
    b.appendChild(el('span', '', text));
    b.append(btn('btn ghost sm', t('pw.no'), () => { b.remove(); onNo(); }), btn('btn primary sm', t('pw.yes'), () => { b.remove(); onYes(); }));
    $('remote').appendChild(b);
    setTimeout(() => { if (b.isConnected) { b.remove(); onNo(); } }, 15000);
  }

  // ---------- Conexión con el servidor ----------
  function attach(s) {
    s.on('points', ({ points, added, hot }) => { if (G) G.points = points; else G = { points }; paintPill(); floatPoints(added, hot); });
    // 🎁 Premium de regalo: prueba, invitación o premio del ranking
    s.on('gift', ({ days, reason }) => {
      const icon = { trial: '🎁', invited: '🤝', inviter: '🤝', rank1: '🥇', rank2: '🥈', rank3: '🥉' }[reason] || '🎁';
      celebrate({ icon, title: t(days === 1 ? 'gf.title1' : 'gf.title', { n: days }), text: t(`gf.msg_${reason}`, { n: days }), button: t('gf.cta'), emojis: [icon, '⭐', '✨', '🌶️'] });
    });
    s.on('hot-hour', (h) => {
      if (G) G.hot = h;
      paintPill();
      if (!modal.hidden) render();
      if (h.active) celebrate({ icon: '🔥×2', title: t('pw.hotTitle'), text: t('pw.hotStart'), button: t('pw.dailyBtn'), emojis: ['🔥', '🌶️', '✨'] });
      else A.toast(t('pw.hotEnd'));
    });
    s.on('daily', ({ streak, reward, points }) => {
      if (G) { G.points = points; G.streak = streak; } else G = { points, streak };
      paintPill();
      celebrate({ icon: '🔥'.repeat(Math.min(streak, 5)), title: t('pw.daily', { n: streak }), text: t('pw.dailyGot', { n: reward }), emojis: ['🌶️', '🔥', '✨'] });
    });
    s.on('badge', ({ id, e }) => celebrate({ icon: e, title: t('pw.newBadge'), text: t(`bd.${id}`), button: t('btn.close'), emojis: [e, '✨', '🏆'] }));
    s.on('challenge', ({ id, reward }) => A.toast(`${t('pw.challengeDone', { n: reward })} · ${t(`ch.${id}`)}`));
    s.on('rewind-request', () => ask(t('pw.rewindAsk'), () => s.emit('rewind-reply', { accept: true }), () => s.emit('rewind-reply', { accept: false })));
    s.on('rewind-result', (r) => { if (r?.ok) A.toast(t('pw.rewindOk')); else A.toast(r?.code === 'points' ? t('pw.noPoints') : t('pw.rewindNo')); });
    s.on('super-msg', ({ text }) => {
      const msgs = $('messages');
      const p = el('div', 'super-msg');
      p.append(el('span', 'super-tag', t('pw.superGot')), el('p', '', text));
      msgs.prepend(p);
      window.Play?.playToast([el('span', 'pt-e', '💌'), el('span', '', t('pw.superGot'))], { cls: 'got', ms: 3000 });
    });
    s.on('super-sent', () => { A.toast(t('pw.superSent')); if (G) G.superMsg = ''; });
    s.on('super-off', () => A.toast(t('pw.superOff')));
    s.on('connect', refresh);
  }

  // Insignias e incógnito de la otra persona, junto a su nombre
  function partnerBadges(p) {
    return [p?.incognito ? t('pw.incognitoTag') : '', ...(p?.badges || [])].filter(Boolean).join(' ');
  }

  document.addEventListener('langchange', () => { if (!modal.hidden) render(); });
  window.Powers = { attach, refresh, offerRewind, partnerBadges, openPanel };
  if (A.socket) attach(A.socket);
  refresh();
})();
