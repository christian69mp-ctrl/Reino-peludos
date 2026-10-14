// Plan Premium (19,99 €) que permite elegir a quién ver. Cobro con Segpay.
//
// Métodos (cada uno es un "payment package" de Segpay con su x-eticketid):
// - Tarjeta / Google Pay / Apple Pay → SEGPAY_ETICKET_CARD: 19,99 € cada 30 días.
// - Criptomonedas                    → SEGPAY_ETICKET_CRYPTO: 19,99 € una vez, 30 días
//   (Segpay no permite suscripciones recurrentes con cripto).
//
// Flujo:
// 1. El servidor crea un pedido y manda al usuario a la página de pago de Segpay
//    con el id del pedido como variable propia (orderid).
// 2. Segpay avisa al servidor (postback) de cada cobro, renovación, reembolso o baja,
//    y el servidor actualiza hasta cuándo dura el Premium de ese pedido.
// 3. Al volver a la web, el navegador recoge un token firmado con el id del pedido.
//    En cada conexión se comprueba que el pedido sigue activo.
//
// Si falta la configuración de Segpay funciona en modo DEMO: el pago se simula.

const crypto = require('crypto');
const express = require('express');
const store = require('./store');

const PRICE = 19.99;
const CURRENCY = 'eur';
const PERIOD_DAYS = 30;
const DAY = 24 * 3600 * 1000;
const GRACE_MS = DAY; // margen por si la renovación llega con retraso

const PAY_URL = 'https://secure2.segpay.com/billing/poset.cgi';
const ETICKETS = {
  card: process.env.SEGPAY_ETICKET_CARD,
  crypto: process.env.SEGPAY_ETICKET_CRYPTO,
};
const POSTBACK_KEY = process.env.SEGPAY_POSTBACK_KEY;
const CANCEL_URL = process.env.SEGPAY_CANCEL_URL || 'https://cs.segpay.com';
const DEMO = !ETICKETS.card && !ETICKETS.crypto;

const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.SESSION_SECRET) {
  console.warn('[pagos] SESSION_SECRET no definido: los usuarios Premium tendrán que volver a entrar tras reiniciar el servidor.');
}
if (DEMO) console.warn('[pagos] Modo DEMO: los pagos se simulan. Configura SEGPAY_ETICKET_CARD / SEGPAY_ETICKET_CRYPTO para cobrar de verdad.');
if (!DEMO && !POSTBACK_KEY) console.warn('[pagos] Falta SEGPAY_POSTBACK_KEY: no se aceptarán los avisos de Segpay.');

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${mac}`;
}

function verify(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (mac.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try { return JSON.parse(Buffer.from(body, 'base64url').toString()); } catch { return null; }
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function activeOrder(token) {
  const data = verify(token);
  const order = data?.oid && store.getOrder(data.oid);
  if (!order || order.status !== 'active' || order.expires <= Date.now()) return null;
  return order;
}

async function isPremium(token) {
  return !!activeOrder(token);
}

function originOf(req, baseUrl) {
  return baseUrl || `${req.protocol}://${req.get('host')}`;
}

// Segpay: variables propias de máx. 32 caracteres y sin empezar por número
function newOrderId() {
  return `o${crypto.randomBytes(12).toString('hex')}`;
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
    const days = Number(stage === 'initial' ? (p.iint || p.rint) : p.rint) || PERIOD_DAYS;
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
      price: PRICE,
      currency: CURRENCY,
      passDays: PERIOD_DAYS,
      demo: DEMO,
      methods: { card: DEMO || !!ETICKETS.card, crypto: DEMO || !!ETICKETS.crypto },
    });
  });

  // Empieza el pago: crea el pedido y devuelve la URL de Segpay
  app.post('/api/checkout', (req, res) => {
    const method = req.body?.method === 'crypto' ? 'crypto' : 'card';
    const orderId = newOrderId();

    if (DEMO) {
      store.createOrder(orderId, { method, demo: true });
      store.updateOrder(orderId, { status: 'active', expires: Date.now() + PERIOD_DAYS * DAY });
      return res.json({ token: sign({ oid: orderId }) });
    }
    if (!ETICKETS[method]) return res.status(400).json({ error: 'Método de pago no disponible' });

    store.createOrder(orderId, { method });
    const origin = originOf(req, baseUrl);
    const params = new URLSearchParams({
      'x-eticketid': ETICKETS[method],
      orderid: orderId,
      'x-auth-link': `${origin}/?order=${orderId}`,
      'x-auth-text': 'Volver y activar Premium',
      'x-decl-link': `${origin}/`,
      'x-decl-text': 'Volver',
    });
    res.json({ url: `${PAY_URL}?${params}` });
  });

  // Avisos de Segpay (configurados en el Merchant Portal → Manage Postbacks)
  // Segpay puede enviar los avisos por GET o por POST (formulario)
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
  app.get('/api/checkout/confirm', (req, res) => {
    const orderId = String(req.query.order || '');
    const order = store.getOrder(orderId);
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
    if (order.status === 'pending') return res.json({ pending: true });
    if (order.status !== 'active') return res.status(402).json({ error: 'Pago no completado' });
    res.json({ token: sign({ oid: orderId }) });
  });

  app.get('/api/me', (req, res) => {
    const order = activeOrder(req.get('authorization')?.replace(/^Bearer /, ''));
    res.json({
      premium: !!order,
      method: order?.method || null,
      expires: order ? order.expires - (order.demo ? 0 : GRACE_MS) : null,
      cancelUrl: order?.method === 'card' && !order.demo ? CANCEL_URL : null,
    });
  });
}

module.exports = { routes, isPremium, _test: { applyPostback } };
