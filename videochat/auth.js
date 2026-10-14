// Cuentas de usuario: registro, inicio de sesión y sesión actual.

const crypto = require('crypto');
const { promisify } = require('util');
const store = require('./store');
const tokens = require('./tokens');

const scrypt = promisify(crypto.scrypt);
const GENDERS = ['mujer', 'hombre', 'trans', 'pareja'];
const SESSION_DAYS = 90;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

async function checkPassword(password, stored) {
  const [saltHex, hashHex] = String(stored).split(':');
  if (!saltHex || !hashHex) return false;
  const hash = await scrypt(password, Buffer.from(saltHex, 'hex'), 64);
  return crypto.timingSafeEqual(hash, Buffer.from(hashHex, 'hex'));
}

function sessionToken(user) {
  return tokens.sign({ uid: user.id, v: user.tokenVersion || 0, exp: Date.now() + SESSION_DAYS * 86400000 });
}

// Devuelve el usuario de un token válido (aunque esté suspendido)
function userFromToken(token) {
  const data = tokens.verify(token);
  const user = data?.uid && store.getUser(data.uid);
  if (!user || (user.tokenVersion || 0) !== data.v) return null;
  return user;
}

function bearer(req) {
  return req.get('authorization')?.replace(/^Bearer /, '') || '';
}

// Estado de acceso: null si puede usar el chat, o el motivo si no
function restriction(user) {
  if (user.status === 'banned') return { type: 'banned' };
  if (user.suspendedUntil && user.suspendedUntil > Date.now()) {
    return { type: 'suspended', until: user.suspendedUntil };
  }
  return null;
}

function requireUser(req, res, next) {
  const user = userFromToken(bearer(req));
  if (!user) return res.status(401).json({ error: 'Inicia sesión para continuar' });
  req.user = user;
  next();
}

// Límite sencillo de intentos por IP (registro e inicio de sesión)
const attempts = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || a.reset < now) { attempts.set(ip, { count: 1, reset: now + 15 * 60000 }); return false; }
  a.count += 1;
  return a.count > 20;
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, a] of attempts) if (a.reset < now) attempts.delete(ip);
}, 15 * 60000).unref();

function publicUser(user) {
  return { id: user.id, email: user.email, gender: user.gender, createdAt: user.createdAt };
}

function routes(app) {
  app.post('/api/register', async (req, res) => {
    if (rateLimited(req.ip)) return res.status(429).json({ error: 'Demasiados intentos. Prueba en unos minutos.' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const { gender, adult, terms } = req.body || {};
    if (!EMAIL_RE.test(email) || email.length > 200) return res.status(400).json({ error: 'Escribe un email válido' });
    if (password.length < 8 || password.length > 200) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
    if (!GENDERS.includes(gender)) return res.status(400).json({ error: 'Elige qué eres: mujer, hombre, transexual o pareja' });
    if (adult !== true || terms !== true) return res.status(400).json({ error: 'Debes confirmar que eres mayor de edad y aceptar las normas' });
    if (store.getUserByEmail(email)) return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });

    const user = store.createUser({
      email,
      passHash: await hashPassword(password),
      gender,
      status: 'active',
      tokenVersion: 0,
      acceptedTermsAt: Date.now(),
      registerIp: req.ip,
    });
    res.json({ token: sessionToken(user), user: publicUser(user) });
  });

  app.post('/api/login', async (req, res) => {
    if (rateLimited(req.ip)) return res.status(429).json({ error: 'Demasiados intentos. Prueba en unos minutos.' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    const user = store.getUserByEmail(email);
    const ok = user && await checkPassword(String(req.body?.password || ''), user.passHash);
    if (!ok) return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    res.json({ token: sessionToken(user), user: publicUser(user) });
  });

  // Cierra la sesión en todos los dispositivos
  app.post('/api/logout-all', requireUser, (req, res) => {
    store.updateUser(req.user.id, { tokenVersion: (req.user.tokenVersion || 0) + 1 });
    res.json({ ok: true });
  });
}

module.exports = { routes, requireUser, userFromToken, restriction, publicUser, bearer, GENDERS };
