// Suscripción Premium (19,99 €/mes) que permite elegir a quién ver.
//
// - Con STRIPE_SECRET_KEY: cobro real con Stripe Checkout (suscripción mensual).
// - Sin STRIPE_SECRET_KEY: modo DEMO, el "pago" se simula para poder probar la web.
//
// No hay base de datos: tras pagar, el servidor entrega un token firmado con el
// id de cliente de Stripe, y en cada conexión se comprueba en Stripe que la
// suscripción sigue activa.

const crypto = require('crypto');

const PRICE_CENTS = 1999;
const CURRENCY = 'eur';
const DEMO = !process.env.STRIPE_SECRET_KEY;
const stripe = DEMO ? null : require('stripe')(process.env.STRIPE_SECRET_KEY);

const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
if (!process.env.SESSION_SECRET) {
  console.warn('[pagos] SESSION_SECRET no definido: los suscriptores tendrán que volver a activar su acceso tras reiniciar el servidor.');
}
if (DEMO) console.warn('[pagos] Modo DEMO: los pagos se simulan. Define STRIPE_SECRET_KEY para cobrar de verdad.');

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

// Caché del estado de suscripción para no consultar Stripe en cada conexión
const cache = new Map(); // customerId -> { active, at }
const CACHE_MS = 10 * 60 * 1000;

async function isPremium(token) {
  const data = verify(token);
  if (!data) return false;
  if (data.demo) return DEMO && data.exp > Date.now();
  if (DEMO || !data.cid) return false;
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

function routes(app, baseUrl) {
  app.get('/api/plan', (_req, res) => {
    res.json({ price: PRICE_CENTS / 100, currency: CURRENCY, demo: DEMO });
  });

  // Empieza el pago
  app.post('/api/checkout', async (req, res) => {
    if (DEMO) {
      return res.json({ token: sign({ demo: true, exp: Date.now() + 30 * 24 * 3600 * 1000 }) });
    }
    try {
      const origin = baseUrl || `${req.protocol}://${req.get('host')}`;
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: PRICE_CENTS,
            recurring: { interval: 'month' },
            product_data: { name: 'Premium – Elige a quién ver' },
          },
        }],
        success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/`,
      });
      res.json({ url: session.url });
    } catch (err) {
      console.error('[pagos] checkout:', err.message);
      res.status(500).json({ error: 'No se pudo iniciar el pago' });
    }
  });

  // Vuelta desde Stripe: comprueba el pago y entrega el token Premium
  app.get('/api/checkout/confirm', async (req, res) => {
    if (DEMO) return res.status(400).json({ error: 'Modo demo' });
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
    const data = verify(req.get('authorization')?.replace(/^Bearer /, ''));
    if (DEMO || !data?.cid) return res.status(400).json({ error: 'No disponible' });
    try {
      const origin = baseUrl || `${req.protocol}://${req.get('host')}`;
      const portal = await stripe.billingPortal.sessions.create({ customer: data.cid, return_url: `${origin}/` });
      res.json({ url: portal.url });
    } catch (err) {
      console.error('[pagos] portal:', err.message);
      res.status(500).json({ error: 'No se pudo abrir el portal' });
    }
  });

  app.get('/api/me', async (req, res) => {
    const token = req.get('authorization')?.replace(/^Bearer /, '');
    res.json({ premium: await isPremium(token) });
  });
}

module.exports = { routes, isPremium };
