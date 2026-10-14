// Plan Premium (19,99 €) que permite elegir a quién ver.
//
// Métodos de pago:
// - Tarjeta, Google Pay y Apple Pay → Stripe Checkout, suscripción mensual.
//   Stripe muestra Google Pay / Apple Pay automáticamente en los dispositivos
//   compatibles (actívalos en el panel de Stripe).
// - Criptomonedas → NOWPayments, pago único que da 30 días de Premium
//   (las cripto no permiten cobros automáticos cada mes).
//
// Si falta la clave de un proveedor, ese método funciona en modo DEMO: el pago
// se simula para poder probar la web.
//
// No hay base de datos: tras pagar, el servidor entrega un token firmado.
// - Tarjeta: el token lleva el id de cliente de Stripe y en cada conexión se
//   comprueba en Stripe que la suscripción sigue activa.
// - Cripto: el token lleva la fecha de caducidad (30 días).

const crypto = require('crypto');

const PRICE = 19.99;
const CURRENCY = 'eur';
const PASS_DAYS = 30;
const PASS_MS = PASS_DAYS * 24 * 3600 * 1000;

const CARD_DEMO = !process.env.STRIPE_SECRET_KEY;
const stripe = CARD_DEMO ? null : require('stripe')(process.env.STRIPE_SECRET_KEY);

const CRYPTO_DEMO = !process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_API = process.env.NOWPAYMENTS_SANDBOX
  ? 'https://api-sandbox.nowpayments.io/v1'
  : 'https://api.nowpayments.io/v1';

const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.SESSION_SECRET) {
  console.warn('[pagos] SESSION_SECRET no definido: los suscriptores tendrán que volver a activar su acceso tras reiniciar el servidor.');
}
if (CARD_DEMO) console.warn('[pagos] Tarjeta/Google Pay/Apple Pay en modo DEMO. Define STRIPE_SECRET_KEY para cobrar de verdad.');
if (CRYPTO_DEMO) console.warn('[pagos] Criptomonedas en modo DEMO. Define NOWPAYMENTS_API_KEY y NOWPAYMENTS_IPN_SECRET para cobrar de verdad.');

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

function passToken(extra = {}) {
  return sign({ pass: true, exp: Date.now() + PASS_MS, ...extra });
}

function originOf(req, baseUrl) {
  return baseUrl || `${req.protocol}://${req.get('host')}`;
}

function bearer(req) {
  return req.get('authorization')?.replace(/^Bearer /, '');
}

// Caché del estado de suscripción para no consultar Stripe en cada conexión
const cache = new Map(); // customerId -> { active, at }
const CACHE_MS = 10 * 60 * 1000;

async function isPremium(token) {
  const data = verify(token);
  if (!data) return false;
  // Pase de 30 días (cripto o demo)
  if (data.pass) {
    if (data.demo && !(CARD_DEMO || CRYPTO_DEMO)) return false;
    return data.exp > Date.now();
  }
  // Suscripción de Stripe
  if (CARD_DEMO || !data.cid) return false;
  const hit = cache.get(data.cid);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.active;
  try {
    const subs = await stripe.subscriptions.list({ customer: data.cid, status: 'active', limit: 1 });
    const active = subs.data.length > 0;
    cache.set(data.cid, { active, at: Date.now() });
    return active;
  } catch (err) {
    console.error('[pagos] error consultando Stripe:', err.message);
    return false;
  }
}

// ---- Criptomonedas (NOWPayments) ----

// Pedidos cripto: orderId -> { paid, at }. En memoria: tras pagar, el usuario
// recoge su token al volver a la web. Los pedidos sin recoger caducan en 24 h.
const cryptoOrders = new Map();
setInterval(() => {
  const limit = Date.now() - 24 * 3600 * 1000;
  for (const [id, o] of cryptoOrders) if (o.at < limit) cryptoOrders.delete(id);
}, 3600 * 1000).unref();

// Firma de NOWPayments: HMAC-SHA512 del JSON con las claves ordenadas
function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((acc, k) => { acc[k] = sortKeys(value[k]); return acc; }, {});
  }
  return value;
}

function validIpn(body, signature) {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret || typeof signature !== 'string') return false;
  const expected = crypto.createHmac('sha512', secret).update(JSON.stringify(sortKeys(body))).digest('hex');
  return signature.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function routes(app, baseUrl) {
  app.get('/api/plan', (_req, res) => {
    res.json({
      price: PRICE,
      currency: CURRENCY,
      passDays: PASS_DAYS,
      demo: { card: CARD_DEMO, crypto: CRYPTO_DEMO },
    });
  });

  // ---- Tarjeta / Google Pay / Apple Pay ----
  app.post('/api/checkout/card', async (req, res) => {
    if (CARD_DEMO) return res.json({ token: passToken({ demo: true }) });
    try {
      const origin = originOf(req, baseUrl);
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: Math.round(PRICE * 100),
            recurring: { interval: 'month' },
            product_data: { name: 'Premium – Elige a quién ver' },
          },
        }],
        success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/`,
      });
      res.json({ url: session.url });
    } catch (err) {
      console.error('[pagos] checkout tarjeta:', err.message);
      res.status(500).json({ error: 'No se pudo iniciar el pago' });
    }
  });

  // Vuelta desde Stripe: comprueba el pago y entrega el token Premium
  app.get('/api/checkout/card/confirm', async (req, res) => {
    if (CARD_DEMO) return res.status(400).json({ error: 'Modo demo' });
    try {
      const session = await stripe.checkout.sessions.retrieve(String(req.query.session_id || ''));
      if (session.status !== 'complete' || !session.customer) {
        return res.status(402).json({ error: 'Pago no completado' });
      }
      cache.delete(session.customer);
      res.json({ token: sign({ cid: session.customer }) });
    } catch {
      res.status(400).json({ error: 'Sesión de pago no válida' });
    }
  });

  // Portal de Stripe para gestionar o cancelar la suscripción
  app.post('/api/portal', async (req, res) => {
    const data = verify(bearer(req));
    if (CARD_DEMO || !data?.cid) return res.status(400).json({ error: 'No disponible' });
    try {
      const portal = await stripe.billingPortal.sessions.create({
        customer: data.cid, return_url: `${originOf(req, baseUrl)}/`,
      });
      res.json({ url: portal.url });
    } catch (err) {
      console.error('[pagos] portal:', err.message);
      res.status(500).json({ error: 'No se pudo abrir el portal' });
    }
  });

  // ---- Criptomonedas ----
  app.post('/api/checkout/crypto', async (req, res) => {
    if (CRYPTO_DEMO) return res.json({ token: passToken({ demo: true }) });
    const orderId = crypto.randomUUID();
    const origin = originOf(req, baseUrl);
    try {
      const r = await fetch(`${NOWPAYMENTS_API}/invoice`, {
        method: 'POST',
        headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price_amount: PRICE,
          price_currency: CURRENCY,
          order_id: orderId,
          order_description: `Premium ${PASS_DAYS} días – Elige a quién ver`,
          ipn_callback_url: `${origin}/api/crypto/ipn`,
          success_url: `${origin}/?crypto_order=${orderId}`,
          cancel_url: `${origin}/`,
        }),
      });
      const invoice = await r.json();
      if (!r.ok || !invoice.invoice_url) throw new Error(invoice.message || `HTTP ${r.status}`);
      cryptoOrders.set(orderId, { paid: false, at: Date.now() });
      res.json({ url: invoice.invoice_url });
    } catch (err) {
      console.error('[pagos] checkout cripto:', err.message);
      res.status(500).json({ error: 'No se pudo iniciar el pago con criptomonedas' });
    }
  });

  // Aviso de NOWPayments cuando cambia el estado de un pago
  app.post('/api/crypto/ipn', (req, res) => {
    if (!validIpn(req.body, req.get('x-nowpayments-sig'))) return res.status(401).end();
    const { order_id: orderId, payment_status: status } = req.body;
    const order = cryptoOrders.get(orderId);
    if (order && status === 'finished') {
      order.paid = true;
      console.log(`[pagos] pago cripto completado: ${orderId}`);
    }
    res.end();
  });

  // El usuario vuelve a la web y recoge su token (la web lo consulta hasta que se confirme)
  app.get('/api/checkout/crypto/confirm', (req, res) => {
    const orderId = String(req.query.order || '');
    const order = cryptoOrders.get(orderId);
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
    if (!order.paid) return res.json({ pending: true });
    cryptoOrders.delete(orderId); // cada pedido entrega un solo token
    res.json({ token: passToken() });
  });

  app.get('/api/me', async (req, res) => {
    const token = bearer(req);
    const data = verify(token);
    res.json({
      premium: await isPremium(token),
      type: data?.cid ? 'subscription' : data?.pass ? 'pass' : null,
      expires: data?.pass ? data.exp : null,
    });
  });
}

module.exports = { routes, isPremium, _test: { validIpn, sortKeys } };
