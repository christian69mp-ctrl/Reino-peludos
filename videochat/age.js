// Verificación de edad con Veriff (documento de identidad + selfie).
//
// Cuándo se pide (AGE_VERIFICATION):
// - reports (por defecto): al registrarse basta con confirmar «Soy mayor de 18».
//   Solo si alguien denuncia a una cuenta por «Menor de edad», o el administrador
//   lo pide, esa cuenta tiene que verificarse con documento para seguir.
// - all: todo el mundo se verifica una vez antes del primer videochat.
// - off: nunca se pide.
// Con VERIFF_API_KEY y VERIFF_SECRET la verificación es real; sin ellas, modo
// DEMO (se simula al pulsar el botón).
//
// Flujo: el servidor crea una sesión en Veriff y manda al usuario a su página.
// Veriff avisa del resultado por webhook (y, por si falla, la web también lo
// consulta). No guardamos el documento ni la fecha de nacimiento: solo si está
// aprobado y cuándo. Si resulta ser menor de edad, la cuenta queda expulsada.

const crypto = require('crypto');
const store = require('./store');
const { requireUser, needsEmail } = require('./auth');

const API_KEY = process.env.VERIFF_API_KEY;
const SECRET = process.env.VERIFF_SECRET;
const BASE = (process.env.VERIFF_BASE_URL || 'https://stationapi.veriff.com').replace(/\/$/, '');
const DEMO = !API_KEY || !SECRET;
const MODE = ['off', 'all'].includes(process.env.AGE_VERIFICATION) ? process.env.AGE_VERIFICATION : 'reports';
const REQUIRED = MODE !== 'off';
const MIN_AGE = 18;
const PUBLIC = (process.env.BASE_URL || '').startsWith('https://');

if (!REQUIRED) console.warn('[edad] AGE_VERIFICATION=off: no se pide verificación de edad.');
else if (MODE === 'reports') console.log('[edad] Verificación con documento solo para cuentas denunciadas por «menor de edad» (AGE_VERIFICATION=all para pedirla a todos).');
else if (DEMO && (process.env.BASE_URL || '').startsWith('https://')) {
  console.warn('[edad] ⚠️  ATENCIÓN: la web está publicada pero la verificación de edad es SIMULADA. Define VERIFF_API_KEY y VERIFF_SECRET antes de abrir al público.');
} else if (DEMO) console.warn('[edad] Modo DEMO: la verificación de edad se simula. Define VERIFF_API_KEY y VERIFF_SECRET para la real.');

let onRestrict = () => {};
let onRequire = () => {};

const hmac = (data) => crypto.createHmac('sha256', SECRET).update(data).digest('hex');

function safeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a.toLowerCase()), Buffer.from(b.toLowerCase()));
}

function ageStatus(user) {
  return user?.age?.status || 'none';
}

// ¿Tiene que verificarse esta cuenta? (según el modo y si se le ha pedido)
function mustVerify(user) {
  if (MODE === 'off') return false;
  return MODE === 'all' || !!user?.ageCheck;
}

// true si tiene que verificarse antes de usar el chat
function needsVerification(user) {
  return mustVerify(user) && ageStatus(user) !== 'approved';
}

// Pide la verificación a una cuenta (denuncia por menor o decisión del administrador)
// y la saca del chat hasta que se verifique
function requireCheck(userId, reason) {
  const user = store.getUser(userId);
  if (!user || MODE !== 'reports' || ageStatus(user) === 'approved') return false;
  if (!user.ageCheck) store.updateUser(userId, { ageCheck: { reason, at: Date.now() } });
  onRequire(userId);
  return true;
}

function yearsSince(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let years = now.getUTCFullYear() - d.getUTCFullYear();
  const m = now.getUTCMonth() - d.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) years -= 1;
  return years;
}

// Aplica una decisión de Veriff (del webhook o de la consulta) a la cuenta
function applyDecision(verification) {
  const userId = verification?.vendorData;
  const user = userId && store.getUser(userId);
  if (!user) return 'unknown-user';
  if (user.age?.sessionId && verification.id && user.age.sessionId !== verification.id) return 'old-session';

  const status = String(verification.status || '').toLowerCase();
  const now = Date.now();
  if (status === 'approved') {
    const years = yearsSince(verification.person?.dateOfBirth);
    if (years !== null && years < MIN_AGE) {
      store.updateUser(user.id, { age: { ...user.age, status: 'underage', updatedAt: now }, status: 'banned', bannedAt: now, bannedReason: 'Menor de edad (verificación)', restrictionCode: 'underage' });
      onRestrict(user.id, { type: 'banned', reason: 'underage' });
      console.warn(`[edad] cuenta ${user.email} expulsada: menor de edad según la verificación`);
      require('./moderation').alertAdmin('⛔ Menor de edad detectado', `La verificación de edad indica que ${user.email} es menor. La cuenta se ha expulsado automáticamente.`);
      return 'underage';
    }
    store.updateUser(user.id, { age: { ...user.age, status: 'approved', updatedAt: now, verifiedAt: now } });
    return 'approved';
  }
  const map = { declined: 'declined', resubmission_requested: 'retry', expired: 'none', abandoned: 'none', review: 'pending' };
  const next = map[status];
  if (!next) return 'ignored';
  store.updateUser(user.id, { age: { ...user.age, status: next, updatedAt: now } });
  return next;
}

// Consulta la decisión en Veriff (por si el webhook no ha llegado)
async function pollDecision(user) {
  const sessionId = user.age?.sessionId;
  if (DEMO || !sessionId || ageStatus(user) !== 'pending') return;
  try {
    const r = await fetch(`${BASE}/v1/sessions/${encodeURIComponent(sessionId)}/decision`, {
      headers: { 'X-AUTH-CLIENT': API_KEY, 'X-HMAC-SIGNATURE': hmac(sessionId) },
    });
    if (!r.ok) return;
    const data = await r.json();
    if (data.verification) applyDecision({ vendorData: user.id, ...data.verification });
  } catch (err) {
    console.error('[edad] consulta de decisión:', err.message);
  }
}

function publicAge(user) {
  return { required: mustVerify(user), mode: MODE, status: ageStatus(user), demo: DEMO };
}

function routes(app, baseUrl) {
  // Empieza la verificación: devuelve la URL de Veriff (o la aprueba en modo demo)
  app.post('/api/age/start', requireUser, async (req, res) => {
    const user = req.user;
    if (needsEmail(user)) return res.status(403).json({ code: 'emailUnverified' });
    // También la pide quien quiere retirar lo ganado con propinas (tips.js), aunque no se le exija para chatear
    const forPayout = req.body?.purpose === 'payout' && process.env.TIPS === 'on' && process.env.PAYOUTS === 'on';
    if ((!mustVerify(user) && !forPayout) || ageStatus(user) === 'approved') return res.json({ age: publicAge(user) });
    // Sin Veriff en la web publicada no se aprueba a nadie con un clic: la cuenta queda en revisión
    // y el administrador decide en /admin («Ya no pedir verificación» o expulsar)
    if (DEMO && PUBLIC) return res.status(409).json({ code: 'ageReview' });
    if (DEMO) {
      store.updateUser(user.id, { age: { status: 'approved', demo: true, verifiedAt: Date.now(), updatedAt: Date.now() } });
      return res.json({ age: publicAge(store.getUser(user.id)) });
    }
    const origin = baseUrl || `${req.protocol}://${req.get('host')}`;
    const body = JSON.stringify({
      verification: {
        callback: `${origin}/?age=done${forPayout ? '&for=payout' : ''}`,
        vendorData: user.id,
      },
    });
    try {
      const r = await fetch(`${BASE}/v1/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-AUTH-CLIENT': API_KEY, 'X-HMAC-SIGNATURE': hmac(body) },
        body,
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.verification?.url) throw new Error(data.message || `HTTP ${r.status}`);
      store.updateUser(user.id, { age: { status: 'pending', sessionId: data.verification.id, startedAt: Date.now(), updatedAt: Date.now() } });
      res.json({ url: data.verification.url });
    } catch (err) {
      console.error('[edad] no se pudo crear la sesión de Veriff:', err.message);
      res.status(502).json({ code: 'ageFailed' });
    }
  });

  // Estado actual (la web lo consulta al volver de Veriff)
  app.get('/api/age/status', requireUser, async (req, res) => {
    await pollDecision(req.user);
    res.json({ age: publicAge(store.getUser(req.user.id)) });
  });

  // Webhook de decisión de Veriff (configúralo en el panel de Veriff)
  app.post('/api/age/webhook', (req, res) => {
    if (DEMO) return res.status(404).end();
    const raw = req.rawBody;
    const okClient = req.get('x-auth-client') === API_KEY;
    const okSig = raw && safeEqualHex(String(req.get('x-hmac-signature') || ''), hmac(raw));
    if (!okClient || !okSig) return res.status(401).end();
    // Los webhooks de evento (empezado, enviado…) no traen decisión: se ignoran
    if (req.body?.verification) {
      const result = applyDecision(req.body.verification);
      console.log(`[edad] decisión de Veriff: ${result}`);
    }
    res.json({ ok: true });
  });
}

module.exports = {
  routes,
  needsVerification,
  publicAge,
  requireCheck,
  MODE,
  setOnRestrict: (fn) => { onRestrict = fn; },
  setOnRequire: (fn) => { onRequire = fn; },
  _test: { applyDecision, yearsSince },
};
