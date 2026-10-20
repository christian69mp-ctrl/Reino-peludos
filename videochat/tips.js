// Propinas durante la videollamada y retirada de lo ganado.
//
// - Las monedas 🪙 se compran en paquetes (pago único con Segpay; en modo DEMO se simula).
// - Durante una llamada se puede dar una propina en monedas a la otra persona.
// - Quien la recibe gana su valor en euros (COIN_VALUE_EUR por moneda) menos la comisión de la
//   web (TIP_FEE_PCT %). Lo ganado queda retenido TIP_HOLD_DAYS días (por si el pago de quien la
//   dio se devuelve o es un contracargo) y después se puede retirar.
// - Retirar: a partir de PAYOUT_MIN_EUR, con la identidad verificada (Veriff) y los datos
//   fiscales que exige la normativa de plataformas (DAC7). El administrador hace la transferencia
//   y la marca como pagada en /admin.
//
// Todo está APAGADO por defecto: TIPS=on activa monedas y propinas; PAYOUTS=on activa las
// retiradas. Antes de activarlo hace falta asesoría legal y fiscal (ver docs/propinas.md).
const crypto = require('crypto');
const store = require('./store');
const payments = require('./payments');
const { requireUser, needsEmail } = require('./auth');

const num = (v, def, min, max) => Math.min(max, Math.max(min, Number.isFinite(Number(v)) && v !== '' && v != null ? Number(v) : def));
const ENABLED = process.env.TIPS === 'on';
const PAYOUTS = ENABLED && process.env.PAYOUTS === 'on';
const FEE_PCT = num(process.env.TIP_FEE_PCT, 40, 0, 90);
const COIN_EUR = num(process.env.COIN_VALUE_EUR, 0.1, 0.01, 10);
const PAYOUT_MIN = num(process.env.PAYOUT_MIN_EUR, 50, 1, 100000);
const HOLD_DAYS = num(process.env.TIP_HOLD_DAYS, 14, 0, 180);
const DAILY_SEND_MAX = num(process.env.TIP_DAILY_MAX, 2000, 10, 1000000);
const DAY = 24 * 3600 * 1000;

const PACKS = {
  s: { coins: 50, price: 5.99, eticket: process.env.SEGPAY_ETICKET_COINS_S },
  m: { coins: 120, price: 12.99, eticket: process.env.SEGPAY_ETICKET_COINS_M },
  l: { coins: 300, price: 29.99, eticket: process.env.SEGPAY_ETICKET_COINS_L },
};
const AMOUNTS = [10, 25, 50, 100];
const MAX_TIP = 1000;
const DEMO = payments.DEMO;

if (ENABLED) console.warn(`[propinas] Activadas (comisión ${FEE_PCT} %, retención ${HOLD_DAYS} días, retiradas ${PAYOUTS ? 'activadas' : 'desactivadas'}${DEMO ? ', pagos de monedas SIMULADOS' : ''}).`);

const cents = (eur) => Math.round(eur * 100);
const eur = (c) => Math.round(c) / 100;
const IBAN = /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/;

module.exports = function createTips({ notify }) {
  // ---------- Saldo de monedas ----------
  const coinsOf = (uid) => store.getUser(uid)?.coins || 0;
  function addCoins(uid, n) {
    const user = store.getUser(uid);
    if (!user) return 0;
    const coins = (user.coins || 0) + n;
    store.updateUser(uid, { coins });
    notify(uid, 'wallet', { coins });
    return coins;
  }

  // ---------- Ganancias ----------
  const tipsTo = (uid) => store.list('tips').filter((t) => t.to === uid);
  function earnings(uid) {
    const now = Date.now();
    const sum = { held: 0, available: 0, requested: 0, paid: 0 };
    for (const t of tipsTo(uid)) {
      if (t.status === 'reversed') continue;
      if (t.status === 'paid') sum.paid += t.netCents;
      else if (t.status === 'payout') sum.requested += t.netCents;
      else if (t.availableAt > now) sum.held += t.netCents;
      else sum.available += t.netCents;
    }
    return Object.fromEntries(Object.entries(sum).map(([k, v]) => [k, eur(v)]));
  }

  // ---------- Dar una propina (desde server.js, durante una llamada) ----------
  function tip(fromUid, toUid, amount) {
    if (!ENABLED) return { code: 'off' };
    const coins = Math.floor(Number(amount));
    if (!(coins >= 1 && coins <= MAX_TIP)) return { code: 'tipAmount' };
    const from = store.getUser(fromUid);
    const to = store.getUser(toUid);
    if (!from || !to || fromUid === toUid) return { code: 'tipInvalid' };
    if (to.status === 'banned' || from.status === 'banned') return { code: 'tipInvalid' };
    if (to.tipsOff) return { code: 'tipsOff' };
    if (from.tipsBlocked) return { code: 'tipBlocked' };
    // Misma conexión: no cuenta (evita darse propinas a uno mismo con otra cuenta)
    if (from.registerIp && from.registerIp === to.registerIp) return { code: 'sameNetwork' };
    if ((from.coins || 0) < coins) return { code: 'noCoins', coins: from.coins || 0 };
    const today = Date.now() - DAY;
    const sentToday = store.list('tips').filter((t) => t.from === fromUid && t.at > today).reduce((s, t) => s + t.coins, 0);
    if (sentToday + coins > DAILY_SEND_MAX) return { code: 'tipLimit' };

    const grossCents = cents(coins * COIN_EUR);
    const feeCents = Math.round(grossCents * FEE_PCT / 100);
    const now = Date.now();
    const t = {
      id: store.newId('t'), from: fromUid, to: toUid, coins, at: now,
      grossCents, feeCents, netCents: grossCents - feeCents,
      availableAt: now + HOLD_DAYS * DAY, status: 'held',
    };
    const left = from.coins - coins;
    store.put('tips', t);
    store.updateUser(fromUid, { coins: left });
    notify(fromUid, 'wallet', { coins: left });
    return { ok: true, coins, left, net: eur(t.netCents) };
  }

  // Pago de monedas devuelto o contracargo: se quitan las monedas y, si ya se gastaron, se
  // anulan las propinas que esa persona dio y que aún estaban retenidas
  function reverse(uid, coins) {
    const user = store.getUser(uid);
    if (!user) return;
    let left = coins - Math.max(0, user.coins || 0);
    store.updateUser(uid, { coins: Math.max(0, (user.coins || 0) - coins), tipsBlocked: left > 0 || undefined });
    if (left <= 0) return;
    const held = store.list('tips').filter((t) => t.from === uid && t.status === 'held').sort((a, b) => b.at - a.at);
    for (const t of held) {
      if (left <= 0) break;
      store.patch('tips', t.id, { status: 'reversed', reversedAt: Date.now() });
      left -= t.coins;
    }
  }

  // Avisos de Segpay de los paquetes de monedas (ver payments.js)
  payments.onCoins((order, e) => {
    const base = { orderId: order.id, userId: order.userId, plan: `coins-${order.pack}`, method: order.method };
    if (e.trantype === 'credit' || e.trantype === 'charge' || e.action === 'void') {
      if (order.status === 'paid') reverse(order.userId, order.coins);
      store.updateOrder(order.id, { status: 'revoked', revokedAt: Date.now() });
      payments.ledger({ ...base, type: e.trantype === 'charge' ? 'chargeback' : 'refund', amount: -Math.abs(e.amount) }, e.key);
      return 'revoked';
    }
    if (e.trantype === 'sale' && e.action === 'auth' && e.approved) {
      if (order.status !== 'paid') {
        store.updateOrder(order.id, { status: 'paid', purchaseId: e.purchaseId, paidAt: Date.now() });
        addCoins(order.userId, order.coins);
      }
      payments.ledger({ ...base, type: 'coins', amount: e.amount }, e.key);
      return 'paid';
    }
    return 'ignored';
  });

  function verified(user) { return user?.age?.status === 'approved'; }

  function wallet(user) {
    return {
      enabled: ENABLED, payouts: PAYOUTS, demo: DEMO,
      coins: user.coins || 0, blocked: !!user.tipsBlocked, tipsOff: !!user.tipsOff,
      packs: Object.fromEntries(Object.entries(PACKS).map(([id, p]) => [id, { coins: p.coins, price: p.price, available: DEMO || !!p.eticket }])),
      amounts: AMOUNTS, max: MAX_TIP, feePct: FEE_PCT, coinEur: COIN_EUR, minPayout: PAYOUT_MIN, holdDays: HOLD_DAYS,
      earnings: earnings(user.id), verified: verified(user),
      payoutData: user.payout ? { holder: user.payout.holder, ibanEnd: user.payout.iban.slice(-4), country: user.payout.country } : null,
      payoutRequests: store.list('payouts').filter((p) => p.uid === user.id).sort((a, b) => b.at - a.at).slice(0, 20)
        .map((p) => ({ id: p.id, at: p.at, amount: eur(p.amountCents), status: p.status, decidedAt: p.decidedAt || null, note: p.status === 'rejected' ? p.note || '' : '' })),
    };
  }

  function routes(app, { requireAdmin, audit, baseUrl }) {
    app.get('/api/wallet', requireUser, (req, res) => res.json(wallet(req.user)));

    app.post('/api/wallet/prefs', requireUser, (req, res) => {
      store.updateUser(req.user.id, { tipsOff: req.body?.tipsOff ? true : undefined });
      res.json(wallet(store.getUser(req.user.id)));
    });

    // Comprar monedas
    app.post('/api/coins/checkout', requireUser, (req, res) => {
      if (!ENABLED) return res.status(409).json({ code: 'off' });
      if (needsEmail(req.user)) return res.status(403).json({ code: 'emailUnverified' });
      const pack = PACKS[req.body?.pack] ? req.body.pack : null;
      if (!pack) return res.status(400).json({ code: 'payUnavailable' });
      const p = PACKS[pack];
      const orderId = `o${crypto.randomBytes(12).toString('hex')}`;
      const order = { kind: 'coins', pack, coins: p.coins, price: p.price, method: 'card', userId: req.user.id };
      if (DEMO) {
        store.createOrder(orderId, { ...order, demo: true });
        store.updateOrder(orderId, { status: 'paid', paidAt: Date.now() });
        payments.ledger({ orderId, userId: req.user.id, plan: `coins-${pack}`, method: 'card', type: 'coins', amount: p.price, demo: true }, orderId);
        return res.json({ coins: addCoins(req.user.id, p.coins) });
      }
      if (!p.eticket) return res.status(400).json({ code: 'payUnavailable' });
      store.createOrder(orderId, order);
      const origin = payments.originOf(req, baseUrl);
      res.json({ url: payments.segpayUrl({ eticket: p.eticket, orderId, email: req.user.email, origin, back: `${origin}/?coins=${orderId}`, text: 'Volver a La Ruleta Caliente' }) });
    });
    app.get('/api/coins/confirm', requireUser, (req, res) => {
      const order = store.getOrder(String(req.query.order || ''));
      if (!order || order.userId !== req.user.id || order.kind !== 'coins') return res.status(404).json({ code: 'payFailed' });
      if (order.status === 'pending') return res.json({ pending: true });
      if (order.status !== 'paid') return res.status(402).json({ code: 'payFailed' });
      res.json({ coins: coinsOf(req.user.id) });
    });

    // Pedir la retirada de lo ganado
    app.post('/api/payouts', requireUser, (req, res) => {
      if (!PAYOUTS) return res.status(409).json({ code: 'payoutsOff' });
      const user = req.user;
      // Cuenta expulsada: lo ganado queda congelado (el administrador decide)
      if (user.status === 'banned') return res.status(403).json({ code: 'payoutBanned' });
      if (!verified(user)) return res.status(403).json({ code: 'payoutVerify' });
      if (store.list('payouts').some((p) => p.uid === user.id && p.status === 'requested')) return res.status(409).json({ code: 'payoutPending' });
      const b = req.body || {};
      const clean = (v, max = 120) => String(v || '').trim().slice(0, max);
      const iban = clean(b.iban, 40).replace(/\s+/g, '').toUpperCase();
      const data = {
        holder: clean(b.holder), iban, address: clean(b.address, 200), country: clean(b.country, 2).toUpperCase(),
        taxId: clean(b.taxId, 30), birthDate: clean(b.birthDate, 10),
      };
      if (!data.holder || !IBAN.test(iban) || !data.address || !/^[A-Z]{2}$/.test(data.country) || !data.taxId || !/^\d{4}-\d{2}-\d{2}$/.test(data.birthDate)) {
        return res.status(400).json({ code: 'payoutData' });
      }
      const now = Date.now();
      const ready = tipsTo(user.id).filter((t) => t.status === 'held' && t.availableAt <= now);
      const amountCents = ready.reduce((s, t) => s + t.netCents, 0);
      if (amountCents < cents(PAYOUT_MIN)) return res.status(400).json({ code: 'payoutMin', min: PAYOUT_MIN });
      const p = { id: store.newId('p'), uid: user.id, email: user.email, at: now, amountCents, tipIds: ready.map((t) => t.id), status: 'requested', ...data };
      store.put('payouts', p);
      for (const t of ready) store.patch('tips', t.id, { status: 'payout', payoutId: p.id });
      store.updateUser(user.id, { payout: data });
      res.json(wallet(store.getUser(user.id)));
    });

    // ---------- Panel de administración ----------
    app.get('/api/admin/tips', requireAdmin, (_req, res) => {
      const tips = store.list('tips');
      const ok = tips.filter((t) => t.status !== 'reversed');
      const coinOrders = store.list('ledger').filter((l) => l.type === 'coins' && !l.demo);
      res.json({
        enabled: ENABLED, payouts: PAYOUTS, demo: DEMO, feePct: FEE_PCT, coinEur: COIN_EUR, minPayout: PAYOUT_MIN, holdDays: HOLD_DAYS,
        totals: {
          coinSales: Math.round(coinOrders.reduce((s, l) => s + (l.amount || 0), 0) * 100) / 100,
          tips: ok.length, coins: ok.reduce((s, t) => s + t.coins, 0),
          fees: eur(ok.reduce((s, t) => s + t.feeCents, 0)),
          owed: eur(ok.filter((t) => t.status === 'held' || t.status === 'payout').reduce((s, t) => s + t.netCents, 0)),
          paid: eur(ok.filter((t) => t.status === 'paid').reduce((s, t) => s + t.netCents, 0)),
        },
        payouts: store.list('payouts').sort((a, b) => (a.status === 'requested' ? -1 : 0) - (b.status === 'requested' ? -1 : 0) || b.at - a.at).slice(0, 100)
          .map((p) => ({ ...p, amount: eur(p.amountCents), tipIds: undefined, tips: p.tipIds.length, verified: verified(store.getUser(p.uid)), banned: store.getUser(p.uid)?.status === 'banned' })),
      });
    });

    app.post('/api/admin/payouts/:id', requireAdmin, (req, res) => {
      const p = store.get('payouts', req.params.id);
      if (!p || p.status !== 'requested') return res.status(404).json({ error: 'Solicitud no encontrada o ya resuelta' });
      const action = req.body?.action;
      const note = String(req.body?.note || '').trim().slice(0, 300);
      if (action === 'paid') {
        if (!note) return res.status(400).json({ error: 'Pon la referencia de la transferencia' });
        store.patch('payouts', p.id, { status: 'paid', decidedAt: Date.now(), note });
        for (const id of p.tipIds) store.patch('tips', id, { status: 'paid' });
        audit(req, 'Retirada pagada', `${p.id} ${eur(p.amountCents)} € ${note}`);
        notify(p.uid, 'wallet', { payout: 'paid' });
      } else if (action === 'reject') {
        if (!note) return res.status(400).json({ error: 'Explica el motivo (lo verá la persona)' });
        store.patch('payouts', p.id, { status: 'rejected', decidedAt: Date.now(), note });
        for (const id of p.tipIds) store.patch('tips', id, { status: 'held', payoutId: undefined });
        audit(req, 'Retirada rechazada', `${p.id} ${note}`);
        notify(p.uid, 'wallet', { payout: 'rejected' });
      } else return res.status(400).json({ error: 'Acción no válida' });
      res.json({ ok: true });
    });

    // Resumen anual por persona para la declaración de plataformas (DAC7, modelo 238 en España)
    app.get('/api/admin/payouts/export', requireAdmin, (req, res) => {
      const year = Number(req.query.year) || new Date().getFullYear();
      const rows = new Map();
      for (const p of store.list('payouts')) {
        if (p.status !== 'paid' || new Date(p.decidedAt).getFullYear() !== year) continue;
        const r = rows.get(p.uid) || { uid: p.uid, email: p.email, holder: p.holder, taxId: p.taxId, birthDate: p.birthDate, address: p.address, country: p.country, iban: p.iban, payouts: 0, cents: 0 };
        r.payouts += 1; r.cents += p.amountCents;
        Object.assign(r, { holder: p.holder, taxId: p.taxId, birthDate: p.birthDate, address: p.address, country: p.country, iban: p.iban });
        rows.set(p.uid, r);
      }
      const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
      const csv = [['usuario', 'email', 'titular', 'nif', 'nacimiento', 'direccion', 'pais', 'iban', 'retiradas', 'importe_eur'].join(';'),
        ...[...rows.values()].map((r) => [r.uid, r.email, r.holder, r.taxId, r.birthDate, r.address, r.country, r.iban, r.payouts, eur(r.cents).toFixed(2)].map(q).join(';'))].join('\n');
      audit(req, 'Exportación de retiradas', String(year));
      res.type('text/csv; charset=utf-8').set('Content-Disposition', `attachment; filename="retiradas-${year}.csv"`).send(`﻿${csv}\n`);
    });
  }

  // Ficha del usuario en el panel
  function adminCard(uid) {
    const user = store.getUser(uid);
    return { coins: user?.coins || 0, earnings: earnings(uid), tipsBlocked: !!user?.tipsBlocked };
  }

  return { ENABLED, PAYOUTS, AMOUNTS, MAX_TIP, tip, wallet, routes, adminCard, coinsOf };
};
