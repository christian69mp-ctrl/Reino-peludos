// 🪙 Propinas durante la videollamada y «Monedero» en Mi cuenta (servidor: tips.js).
// Solo aparece si el servidor tiene las propinas activadas (TIPS=on).
(function () {
  const { t } = window.I18N;
  const A = window.App;
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const btn = (cls, text, on) => { const b = el('button', cls, text); b.type = 'button'; b.addEventListener('click', on); return b; };
  const money = (n) => new Intl.NumberFormat(window.I18N.lang, { style: 'currency', currency: 'EUR' }).format(n || 0);

  let enabled = false;
  let W = null;          // /api/wallet
  let amount = 25;

  // ---------- Ventana «Dar una propina» ----------
  const modal = el('div', 'overlay tip-overlay');
  modal.id = 'tipModal';
  modal.hidden = true;
  const box = el('div', 'modal tip-modal');
  modal.appendChild(box);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) close(); });
  document.body.appendChild(modal);
  function close() { modal.hidden = true; }

  async function loadWallet() {
    if (!A.me?.user) return null;
    const w = await A.api('/api/wallet');
    if (w?.enabled !== undefined) W = w;
    return W;
  }

  function packs(onBought) {
    const wrap = el('div', 'tip-packs');
    for (const [id, p] of Object.entries(W.packs)) {
      if (!p.available) continue;
      const b = btn('tip-pack', '', async () => {
        b.disabled = true;
        const res = await A.api('/api/coins/checkout', { method: 'POST', body: { pack: id } });
        b.disabled = false;
        if (res.url) { location.href = res.url; return; }
        if (res.coins !== undefined) { W.coins = res.coins; A.toast(t('tip.bought', { n: res.coins })); onBought(); return; }
        A.toast(A.errorText(res));
      });
      b.append(el('b', null, t('tip.pack', { n: p.coins })), el('span', null, t('tip.buy', { price: money(p.price) })));
      wrap.appendChild(b);
    }
    return wrap;
  }

  function renderTip() {
    box.innerHTML = '';
    const x = btn('close', '', close);
    x.innerHTML = '<svg class="i"><use href="#i-x"/></svg>';
    x.setAttribute('aria-label', t('btn.close'));
    box.append(x, el('h2', null, `🪙 ${t('tip.title')}`), el('p', 'tip-balance', t('tip.balance', { n: W.coins })));
    const chips = el('div', 'chips tip-amounts');
    for (const n of W.amounts) {
      const c = btn(`chip${n === amount ? ' active' : ''}`, `${n} 🪙`, () => { amount = n; custom.value = ''; renderTip(); });
      chips.appendChild(c);
    }
    const custom = el('input', 'tip-custom');
    Object.assign(custom, { type: 'number', min: 1, max: W.max, inputMode: 'numeric', placeholder: t('tip.custom') });
    if (!W.amounts.includes(amount)) custom.value = amount;
    custom.addEventListener('input', () => { amount = Math.floor(Number(custom.value)) || 0; send.textContent = t('tip.send', { n: amount || '…' }); chips.querySelectorAll('.chip').forEach((c) => c.classList.remove('active')); });
    const send = btn('btn primary wide', t('tip.send', { n: amount }), async () => {
      if (!A.connected) { A.toast(t('err.tipInvalid')); return; }
      if (amount > W.coins) { A.toast(t('err.noCoins')); return; }
      send.disabled = true;
      const res = await new Promise((r) => A.socket.emit('tip', amount, r));
      send.disabled = false;
      if (res?.ok) {
        W.coins = res.left;
        A.burst('tip', `+${res.coins} 🪙`);
        A.sysMsg(t('tip.sent', { n: res.coins }));
        close();
      } else A.toast(A.errorText(res));
    });
    box.append(chips, custom, send, el('p', 'hint tip-note', t('tip.note')));
    if (W.coins < Math.max(1, amount) || W.coins < 10) {
      box.append(el('h3', 'tip-buy-title', t('tip.buyTitle')), packs(renderTip));
      if (W.demo) box.append(el('p', 'hint', t('tip.demo')));
    }
  }

  async function openTip() {
    if (!A.me?.user) return;
    await loadWallet();
    if (!W?.enabled) return;
    renderTip();
    modal.hidden = false;
  }

  // ---------- Pestaña «Monedero» de Mi cuenta ----------
  async function renderWallet() {
    const panel = $('walletPanel');
    if (!panel) return;
    await loadWallet();
    if (!W?.enabled) { panel.innerHTML = ''; return; }
    panel.innerHTML = '';
    const sec = (title) => { const s = el('div', 'wallet-sec'); s.appendChild(el('h3', 'acc-section', title)); panel.appendChild(s); return s; };

    const coins = sec(t('tip.coinsTitle'));
    coins.append(el('p', 'wallet-big', `${W.coins} 🪙`), el('p', 'muted', t('tip.coinsText')), packs(renderWallet));
    if (W.demo) coins.appendChild(el('p', 'hint', t('tip.demo')));

    const earn = sec(t('tip.earnTitle'));
    const perCoin = W.coinEur * (1 - W.feePct / 100);
    earn.appendChild(el('p', 'muted', t('tip.earnText', { eur: money(perCoin), fee: W.feePct, days: W.holdDays })));
    const grid = el('dl', 'wallet-grid');
    for (const k of ['held', 'available', 'requested', 'paid']) {
      const d = el('div', `wallet-cell ${k}`);
      d.append(el('dt', null, t(`tip.${k}`)), el('dd', null, money(W.earnings[k])));
      grid.appendChild(d);
    }
    earn.appendChild(grid);
    const accept = el('label', 'check switch-row');
    const cb = el('input');
    cb.type = 'checkbox';
    cb.checked = !W.tipsOff;
    cb.addEventListener('change', async () => { W = await A.api('/api/wallet/prefs', { method: 'POST', body: { tipsOff: !cb.checked } }); });
    accept.append(cb, el('span', null, t('tip.accept')));
    earn.appendChild(accept);

    const out = sec(t('tip.payoutTitle'));
    if (!W.payouts) {
      out.appendChild(el('p', 'notice', t('tip.payoutsSoon')));
    } else if (!W.verified) {
      out.appendChild(el('p', 'muted', t('tip.verifyText')));
      out.appendChild(btn('btn primary wide', t('tip.verifyBtn'), async () => {
        const res = await A.api('/api/age/start', { method: 'POST', body: { purpose: 'payout' } });
        if (res.url) { location.href = res.url; return; }
        if (res.age?.status === 'approved') renderWallet(); else A.toast(A.errorText(res));
      }));
    } else {
      out.appendChild(el('p', 'muted', `${t('tip.payoutMin', { min: money(W.minPayout) })} ${t('tip.formText')}`));
      const form = el('form', 'wallet-form');
      const field = (name, label, type = 'text', value = '') => {
        const l = el('label', 'field');
        const i = el('input');
        Object.assign(i, { name, type, required: true, value });
        if (name === 'iban') i.autocomplete = 'off';
        l.append(label, i);
        form.appendChild(l);
      };
      const pd = W.payoutData || {};
      field('holder', t('tip.holder'), 'text', pd.holder || '');
      field('iban', t('tip.iban'));
      field('address', t('tip.address'));
      field('country', t('tip.country'), 'text', pd.country || '');
      field('taxId', t('tip.taxId'));
      field('birthDate', t('tip.birth'), 'date', A.me?.user?.birthDate || '');
      const err = el('p', 'form-error');
      err.hidden = true;
      const submit = el('button', 'btn primary wide', t('tip.request', { eur: money(W.earnings.available) }));
      submit.type = 'submit';
      submit.disabled = W.earnings.available < W.minPayout || W.payoutRequests.some((p) => p.status === 'requested');
      form.append(err, submit);
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submit.disabled = true;
        const body = Object.fromEntries(new FormData(form));
        const res = await A.api('/api/payouts', { method: 'POST', body });
        if (res.enabled !== undefined && !res.code) { W = res; A.toast(t('tip.requestedOk')); renderWallet(); return; }
        submit.disabled = false;
        err.textContent = A.errorText(res);
        err.hidden = false;
      });
      out.appendChild(form);
    }
    if (W.payoutRequests.length) {
      const list = sec(t('tip.reqTitle'));
      const ul = el('ul', 'wallet-reqs');
      for (const p of W.payoutRequests) {
        const li = el('li', `st-${p.status}`);
        li.append(el('span', null, new Date(p.at).toLocaleDateString(window.I18N.lang)), el('b', null, money(p.amount)), el('span', 'wallet-st', t(`tip.st_${p.status}`)));
        if (p.note) li.appendChild(el('small', null, p.note));
        ul.appendChild(li);
      }
      list.appendChild(ul);
    }
  }

  // ---------- Conexión ----------
  function attach(s) {
    s.on('tip', ({ coins, net }) => {
      A.burst('tip', `+${coins} 🪙`);
      const msg = t('tip.got', { n: coins, eur: money(net) });
      A.sysMsg(msg);
      A.toast(msg);
    });
    s.on('wallet', (d) => {
      if (W && d?.coins !== undefined) W.coins = d.coins;
      if (!$('walletPanel')?.hidden) renderWallet();
    });
  }
  function onConnected(on) { $('tipBtn').hidden = !(on && enabled); if (!on) close(); }

  $('tipBtn').addEventListener('click', openTip);

  fetch('/api/config').then((r) => r.json()).then((c) => {
    enabled = !!c.tips;
    $('walletTab').hidden = !enabled;
    $('tipBtn').hidden = !(enabled && A.connected);
  }).catch(() => {});

  // Vuelta de la página de pago de monedas (?coins=pedido)
  const order = new URLSearchParams(location.search).get('coins');
  if (order) {
    history.replaceState(history.state, '', location.pathname);
    let tries = 0;
    const poll = async () => {
      const res = await A.api(`/api/coins/confirm?order=${encodeURIComponent(order)}`);
      if (res.coins !== undefined) { A.toast(t('tip.bought', { n: res.coins })); return; }
      if (res.pending && tries++ < 20) { if (tries === 1) A.toast(t('tip.payPending')); setTimeout(poll, 3000); return; }
      if (!res.pending) A.toast(A.errorText(res));
    };
    setTimeout(poll, 1500);
  }

  window.Tips = { attach, renderWallet, onConnected, open: openTip };
  if (A.socket) attach(A.socket);
})();
