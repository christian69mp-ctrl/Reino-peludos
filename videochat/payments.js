// Premium: permite elegir a quién ver. Cobro con Segpay. Dos planes:
// - Semanal: 7,99 € cada 7 días.
// - Mensual: 19,99 € cada 30 días.
//
// Cada plan y método es un "payment package" de Segpay con su x-eticketid:
//                          Semanal                       Mensual
// Tarjeta/Google/Apple Pay SEGPAY_ETICKET_CARD_WEEK     SEGPAY_ETICKET_CARD
// Criptomonedas            SEGPAY_ETICKET_CRYPTO_WEEK   SEGPAY_ETICKET_CRYPTO
// Con tarjeta se renueva solo; con cripto es un pago único por el periodo
// (Segpay no permite suscripciones recurrentes con cripto).
//
// Flujo:
// 1. El usuario (con sesión iniciada) elige método; el servidor crea un pedido a su
//    nombre y le manda a la página de pago de Segpay con el id del pedido (orderid).
// 2. Segpay avisa al servidor (postback) de cada cobro, renovación, reembolso o baja,
//    y el servidor actualiza hasta cuándo dura el Premium de ese pedido.
// 3. El Premium va ligado a la cuenta, así que funciona en cualquier dispositivo.
//
// Si falta la configuración de Segpay funciona en modo DEMO: el pago se simula.

const crypto = require('crypto');
const express = require('express');
const store = require('./store');
const { safeEqual } = require('./tokens');
const { requireUser } = require('./auth');

const CURRENCY = 'eur';
const PLANS = {
  week: { price: 7.99, days: 7 },
  month: { price: 19.99, days: 30 },
};
const DAY = 24 * 3600 * 1000;
const GRACE_MS = DAY; // margen por si la renovación llega con retraso

const PAY_URL = 'https://secure2.segpay.com/billing/poset.cgi';
const ETICKETS = {
  week: { card: process.env.SEGPAY_ETICKET_CARD_WEEK, crypto: process.env.SEGPAY_ETICKET_CRYPTO_WEEK },
  month: { card: process.env.SEGPAY_ETICKET_CARD, crypto: process.env.SEGPAY_ETICKET_CRYPTO },
};
const POSTBACK_KEY = process.env.SEGPAY_POSTBACK_KEY;
const CANCEL_URL = process.env.SEGPAY_CANCEL_URL || 'https://cs.segpay.com';
const DEMO = !Object.values(ETICKETS).some((m) => m.card || m.crypto);

if (DEMO) console.warn('[pagos] Modo DEMO: los pagos se simulan. Configura los SEGPAY_ETICKET_* para cobrar de verdad.');
if (!DEMO && !POSTBACK_KEY) console.warn('[pagos] Falta SEGPAY_POSTBACK_KEY: no se aceptarán los avisos de Segpay.');

// Pedido Premium activo de un usuario (el que dura más), o null
function activeOrder(userId) {
  const now = Date.now();
  return store.ordersForUser(userId)
    .filter((o) => o.status === 'active' && o.expires > now)
    .sort((a, b) => b.expires - a.expires)[0] || null;
}

function isPremium(userId) {
  return !!activeOrder(userId);
}

function premiumInfo(userId) {
  const order = activeOrder(userId);
  if (!order) return { premium: false };
  return {
    premium: true,
    method: order.method,
    plan: order.plan || 'month',
    expires: order.expires - (order.demo ? 0 : GRACE_MS),
    cancelUrl: order.method === 'card' && !order.demo ? CANCEL_URL : null,
  };
}

function originOf(req, baseUrl) {
  return baseUrl || `${req.protocol}://${req.get('host')}`;
}

// Aplica un aviso de Segpay. Los nombres y valores pueden venir en cualquier
// combinación de mayúsculas/minúsculas.
function applyPostback(raw) {
  const p = {};
  for (const [k, v] of Object.entries(raw)) p[k.toLowerCase()] = String(v ?? '').trim();
  const lower = (k) => (p[k] || '').toLowerCase();

  const purchaseId = p.purchaseid;
  const orderId = p.orderid || store.orderIdForPurchase(purchaseId);
  const order = orderId && store.getOrder(orderId);
  if (!order) return 'unknown-order';

  // Baja por fin de suscripción (postback "Disable")
  if (lower('type') === 'disable') {
    store.updateOrder(orderId, { status: 'revoked', revokedAt: Date.now() });
    return 'revoked';
  }

  const trantype = lower('trantype');
  const action = lower('action');
  const approved = lower('approved') === 'yes';

  // Reembolso, contracargo o anulación: se quita el acceso
  if (trantype === 'credit' || trantype === 'charge' || action === 'void') {
    store.updateOrder(orderId, { status: 'revoked', revokedAt: Date.now() });
    return 'revoked';
  }

  // Cobro aprobado: alta inicial o renovación
  if (trantype === 'sale' && action === 'auth' && approved) {
    const stage = lower('stage');
    const days = Number(stage === 'initial' ? (p.iint || p.rint) : p.rint) || PLANS[order.plan || 'month'].days;
    store.updateOrder(orderId, {
      status: 'active',
      purchaseId: purchaseId || order.purchaseId,
      expires: Date.now() + days * DAY + GRACE_MS,
      lastPayment: Date.now(),
    });
    return 'active';
  }
  return 'ignored';
}

function routes(app, baseUrl) {
  app.get('/api/plan', (_req, res) => {
    res.json({
      currency: CURRENCY,
      demo: DEMO,
      plans: Object.fromEntries(Object.entries(PLANS).map(([id, plan]) => [id, {
        ...plan,
        methods: { card: DEMO || !!ETICKETS[id].card, crypto: DEMO || !!ETICKETS[id].crypto },
      }])),
    });
  });

  // Empieza el pago: crea el pedido y devuelve la URL de Segpay
  app.post('/api/checkout', requireUser, (req, res) => {
    const method = req.body?.method === 'crypto' ? 'crypto' : 'card';
    const plan = PLANS[req.body?.plan] ? req.body.plan : 'month';
    // Segpay: variables propias de máx. 32 caracteres y sin empezar por número
    const orderId = `o${crypto.randomBytes(12).toString('hex')}`;

    if (DEMO) {
      store.createOrder(orderId, { method, plan, userId: req.user.id, demo: true });
      store.updateOrder(orderId, { status: 'active', expires: Date.now() + PLANS[plan].days * DAY });
      return res.json({ activated: true });
    }
    if (!ETICKETS[plan][method]) return res.status(400).json({ code: 'payUnavailable', error: 'Método de pago no disponible' });

    store.createOrder(orderId, { method, plan, userId: req.user.id });
    const origin = originOf(req, baseUrl);
    const params = new URLSearchParams({
      'x-eticketid': ETICKETS[plan][method],
      orderid: orderId,
      'x-billemail': req.user.email,
      'x-auth-link': `${origin}/?order=${orderId}`,
      'x-auth-text': 'Volver y activar Premium',
      'x-decl-link': `${origin}/`,
      'x-decl-text': 'Volver',
    });
    res.json({ url: `${PAY_URL}?${params}` });
  });

  // Avisos de Segpay (Merchant Portal → Manage Postbacks). Pueden llegar por GET o POST.
  app.all('/api/segpay/postback', express.urlencoded({ extended: false }), (req, res) => {
    const params = { ...req.query, ...(typeof req.body === 'object' ? req.body : {}) };
    if (!POSTBACK_KEY || !safeEqual(String(params.key || ''), POSTBACK_KEY)) {
      return res.status(403).type('text').send('FORBIDDEN');
    }
    delete params.key;
    const result = applyPostback(params);
    console.log(`[pagos] postback Segpay: ${result}`, params.purchaseid || params.purchaseID || '');
    res.type('text').send('OK');
  });

  // El usuario vuelve de Segpay: la web pregunta hasta que el pago se confirma
  app.get('/api/checkout/confirm', requireUser, (req, res) => {
    const order = store.getOrder(String(req.query.order || ''));
    if (!order || order.userId !== req.user.id) return res.status(404).json({ code: 'payFailed', error: 'Pedido no encontrado' });
    if (order.status === 'pending') return res.json({ pending: true });
    if (order.status !== 'active') return res.status(402).json({ code: 'payFailed', error: 'Pago no completado' });
    res.json({ activated: true });
  });
}

module.exports = { routes, isPremium, premiumInfo, _test: { applyPostback } };
