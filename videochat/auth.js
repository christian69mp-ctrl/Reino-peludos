// Cuentas de usuario: registro, inicio de sesión y sesión actual.

const crypto = require('crypto');
const { promisify } = require('util');
const store = require('./store');
const tokens = require('./tokens');
const mailer = require('./mailer');

const scrypt = promisify(crypto.scrypt);
const GENDERS = ['mujer', 'hombre', 'trans', 'pareja'];
const SESSION_DAYS = 90;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LANG_RE = /^[a-z]{2,3}$/;
const RESET_MS = 3600 * 1000; // el enlace para cambiar la contraseña dura 1 hora

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const cleanLang = (l) => (LANG_RE.test(String(l || '')) ? String(l) : 'en');

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
  if (!user) return res.status(401).json({ code: 'auth', error: 'Inicia sesión para continuar' });
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

function likesOf(user) {
  return { like: user.likes?.like || 0, love: user.likes?.love || 0 };
}

function publicUser(user) {
  return { id: user.id, email: user.email, gender: user.gender, createdAt: user.createdAt, likes: likesOf(user) };
}

function routes(app) {
  app.post('/api/register', async (req, res) => {
    if (rateLimited(req.ip)) return res.status(429).json({ code: 'tooMany', error: 'Demasiados intentos. Prueba en unos minutos.' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const { gender, adult, terms } = req.body || {};
    if (!EMAIL_RE.test(email) || email.length > 200) return res.status(400).json({ code: 'email', error: 'Escribe un email válido' });
    if (password.length < 8 || password.length > 200) return res.status(400).json({ code: 'password', error: 'La contraseña debe tener al menos 8 caracteres' });
    if (!GENDERS.includes(gender)) return res.status(400).json({ code: 'gender', error: 'Elige qué eres: mujer, hombre, transexual o pareja' });
    if (adult !== true || terms !== true) return res.status(400).json({ code: 'terms', error: 'Debes confirmar que eres mayor de edad y aceptar las normas' });
    if (store.getUserByEmail(email)) return res.status(409).json({ code: 'exists', error: 'Ya existe una cuenta con ese email' });
    if (store.isEmailHashBanned(sha256(email))) return res.status(403).json({ code: 'bannedEmail' });

    const user = store.createUser({
      email,
      passHash: await hashPassword(password),
      gender,
      status: 'active',
      tokenVersion: 0,
      acceptedTermsAt: Date.now(),
      registerIp: req.ip,
      likes: { like: 0, love: 0 },
      lang: cleanLang(req.body?.lang),
    });
    res.json({ token: sessionToken(user), user: publicUser(user) });
  });

  app.post('/api/login', async (req, res) => {
    if (rateLimited(req.ip)) return res.status(429).json({ code: 'tooMany', error: 'Demasiados intentos. Prueba en unos minutos.' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    const user = store.getUserByEmail(email);
    const ok = user && await checkPassword(String(req.body?.password || ''), user.passHash);
    if (!ok) return res.status(401).json({ code: 'badLogin', error: 'Email o contraseña incorrectos' });
    res.json({ token: sessionToken(user), user: publicUser(user) });
  });

  // Recuperar contraseña: envía un enlace por email. Siempre responde lo mismo,
  // exista o no la cuenta, para no revelar qué emails están registrados.
  app.post('/api/password/forgot', async (req, res) => {
    if (rateLimited(req.ip)) return res.status(429).json({ code: 'tooMany' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ code: 'email' });
    const user = store.getUserByEmail(email);
    const recent = user?.reset && user.reset.sentAt > Date.now() - 60000;
    if (user && !recent) {
      const token = crypto.randomBytes(32).toString('base64url');
      const lang = cleanLang(req.body?.lang || user.lang);
      store.updateUser(user.id, { reset: { hash: sha256(token), expires: Date.now() + RESET_MS, sentAt: Date.now() } });
      const base = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      mailer.sendPasswordReset(email, `${base}/?reset=${token}`, lang)
        .catch((err) => console.error('[email] no se pudo enviar:', err.message));
    }
    res.json({ ok: true });
  });

  // Cambiar la contraseña con el enlace del email. Cierra las demás sesiones.
  app.post('/api/password/reset', async (req, res) => {
    if (rateLimited(req.ip)) return res.status(429).json({ code: 'tooMany' });
    const token = String(req.body?.token || '');
    const password = String(req.body?.password || '');
    if (password.length < 8 || password.length > 200) return res.status(400).json({ code: 'password' });
    const hash = sha256(token);
    const user = token && store.listUsers().find((u) => u.reset?.hash === hash);
    if (!user || user.reset.expires < Date.now()) return res.status(400).json({ code: 'resetInvalid' });
    const updated = store.updateUser(user.id, {
      passHash: await hashPassword(password),
      tokenVersion: (user.tokenVersion || 0) + 1,
      reset: null,
    });
    res.json({ token: sessionToken(updated), user: publicUser(updated) });
  });

  // Cierra la sesión en todos los dispositivos
  app.post('/api/logout-all', requireUser, (req, res) => {
    store.updateUser(req.user.id, { tokenVersion: (req.user.tokenVersion || 0) + 1 });
    res.json({ ok: true });
  });
}

module.exports = { routes, requireUser, userFromToken, restriction, publicUser, likesOf, checkPassword, bearer, GENDERS };
