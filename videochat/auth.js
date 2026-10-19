// Cuentas de usuario: registro, inicio de sesión y sesión actual.

const crypto = require('crypto');
const { promisify } = require('util');
const store = require('./store');
const tokens = require('./tokens');
const mailer = require('./mailer');
const captcha = require('./captcha');

const scrypt = promisify(crypto.scrypt);
const GENDERS = ['mujer', 'hombre', 'trans', 'pareja'];
const SESSION_DAYS = 90;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LANG_RE = /^[a-z]{2,3}$/;
const RESET_MS = 3600 * 1000; // el enlace para cambiar la contraseña dura 1 hora
const VERIFY_MS = 48 * 3600 * 1000; // el enlace para confirmar el email dura 48 horas
// Confirmar el email es obligatorio si hay envío de emails (SMTP). Se puede forzar
// con EMAIL_VERIFICATION=required u off.
const EMAIL_VERIFY = process.env.EMAIL_VERIFICATION
  ? process.env.EMAIL_VERIFICATION !== 'off'
  : mailer.enabled;
if (!EMAIL_VERIFY) console.warn('[cuentas] Confirmación de email desactivada (sin SMTP o EMAIL_VERIFICATION=off).');

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
// Incluye el motivo (código) para explicárselo a la persona (art. 17 DSA)
function restriction(user) {
  const reason = user.restrictionCode || 'moderation';
  if (user.status === 'banned') return { type: 'banned', reason };
  if (user.suspendedUntil && user.suspendedUntil > Date.now()) {
    return { type: 'suspended', until: user.suspendedUntil, reason };
  }
  return null;
}

function requireUser(req, res, next) {
  const user = userFromToken(bearer(req));
  if (!user) return res.status(401).json({ code: 'auth', error: 'Inicia sesión para continuar' });
  req.user = user;
  next();
}

// Límites de intentos (contra fuerza bruta y bots). Muchas personas pueden compartir
// IP (redes móviles, universidades), así que el límite por IP es amplio y el
// importante es el de contraseñas fallidas por cada email.
const limits = new Map();
function hit(key, max, windowMs) {
  const now = Date.now();
  const a = limits.get(key);
  if (!a || a.reset < now) { limits.set(key, { count: 1, reset: now + windowMs }); return false; }
  a.count += 1;
  return a.count > max;
}
function peek(key, max) {
  const a = limits.get(key);
  return !!a && a.reset > Date.now() && a.count >= max;
}
const WINDOW = 15 * 60000;
const rateLimited = (ip) => hit(`ip:${ip}`, 120, WINDOW);                 // registro, recuperar…
const loginBlocked = (email) => peek(`login:${email}`, 10);                // 10 fallos por email
const loginFailed = (ip, email) => { hit(`login:${email}`, 10, WINDOW); hit(`loginip:${ip}`, 100, WINDOW); };
const loginIpBlocked = (ip) => peek(`loginip:${ip}`, 100);
setInterval(() => {
  const now = Date.now();
  for (const [k, a] of limits) if (a.reset < now) limits.delete(k);
}, WINDOW).unref();

// Fecha de nacimiento AAAA-MM-DD → edad en años (o null si no es válida)
function ageFrom(birthDate) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(birthDate || ''));
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  if (d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null; // p. ej. 31 de febrero
  const now = new Date();
  let age = now.getUTCFullYear() - d.getUTCFullYear();
  if (now.getUTCMonth() < d.getUTCMonth() || (now.getUTCMonth() === d.getUTCMonth() && now.getUTCDate() < d.getUTCDate())) age -= 1;
  return age >= 0 && age <= 120 ? age : null;
}

// Comprueba la fecha de nacimiento declarada: código de error o null si vale
function birthError(birthDate) {
  const age = ageFrom(birthDate);
  if (age === null || age > 100) return 'birth';
  if (age < 18) return 'underage';
  return null;
}

// Preferencias: espejo de la cámara y qué notificaciones recibir
function prefsOf(user) {
  const p = user.prefs || {};
  const n = p.notify || {};
  return { mirror: p.mirror !== false, spicy: !!p.spicy, showPiropos: !!p.showPiropos, hideRanking: !!p.hideRanking, notify: { calls: n.calls !== false, requests: n.requests !== false, online: !!n.online } };
}

function likesOf(user) {
  return { like: user.likes?.like || 0, love: user.likes?.love || 0 };
}

function publicUser(user) {
  return { id: user.id, email: user.email, nick: user.nick || '', hasPassword: !!user.passHash, birthDate: user.birthDate || null, prefs: prefsOf(user), pendingEmail: user.emailChange?.email || null, gender: user.gender, createdAt: user.createdAt, likes: likesOf(user), piropos: user.piropos || {}, emailVerified: !!user.emailVerified };
}

// true si la cuenta todavía tiene que confirmar su email
function needsEmail(user) {
  return EMAIL_VERIFY && !user.emailVerified;
}

function baseUrl(req) {
  return process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
}

// Envía (o reenvía) el enlace para confirmar el email
function sendVerification(user, req) {
  const token = crypto.randomBytes(32).toString('base64url');
  store.updateUser(user.id, { verify: { hash: sha256(token), expires: Date.now() + VERIFY_MS, sentAt: Date.now() } });
  mailer.sendVerifyEmail(user.email, `${baseUrl(req)}/?verify=${token}`, cleanLang(req.body?.lang || user.lang))
    .catch((err) => console.error('[email] no se pudo enviar:', err.message));
}

// Quien quiera enterarse de las cuentas nuevas (p. ej. la prueba de Premium de gifts.js)
const signupHooks = [];
const onSignup = (fn) => signupHooks.push(fn);
function signedUp(user) { for (const fn of signupHooks) { try { fn(user); } catch (err) { console.error('[alta]', err.message); } } }

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
    // La fecha de nacimiento la pide la web (las cuentas antiguas pueden no tenerla)
    const birthDate = req.body?.birthDate ? String(req.body.birthDate) : null;
    if (birthDate && birthError(birthDate)) return res.status(400).json({ code: birthError(birthDate) });
    if (store.getUserByEmail(email)) return res.status(409).json({ code: 'exists', error: 'Ya existe una cuenta con ese email' });
    if (store.isEmailHashBanned(sha256(email))) return res.status(403).json({ code: 'bannedEmail' });
    if (!(await captcha.verifyHuman(req))) return res.status(400).json({ code: 'captcha' });

    const user = store.createUser({
      email,
      passHash: await hashPassword(password),
      gender,
      birthDate,
      status: 'active',
      tokenVersion: 0,
      acceptedTermsAt: Date.now(),
      registerIp: req.ip,
      likes: { like: 0, love: 0 },
      lang: cleanLang(req.body?.lang),
      emailVerified: false,
    });
    if (EMAIL_VERIFY) sendVerification(user, req);
    require('./stats').signup('email');
    signedUp(user);
    res.json({ token: sessionToken(user), user: publicUser(user) });
  });

  app.post('/api/login', async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (loginBlocked(email) || loginIpBlocked(req.ip)) return res.status(429).json({ code: 'tooMany', error: 'Demasiados intentos. Prueba en unos minutos.' });
    const user = store.getUserByEmail(email);
    const ok = user && await checkPassword(String(req.body?.password || ''), user.passHash);
    if (!ok) {
      loginFailed(req.ip, email);
      return res.status(401).json({ code: 'badLogin', error: 'Email o contraseña incorrectos' });
    }
    res.json({ token: sessionToken(user), user: publicUser(user) });
  });

  // Cuentas sin fecha de nacimiento: se puede añadir una vez (después, solo soporte)
  app.post('/api/me/birth', requireUser, (req, res) => {
    if (req.user.birthDate) return res.status(409).json({ code: 'birthSet' });
    const birthDate = String(req.body?.birthDate || '');
    const err = birthError(birthDate);
    if (err) return res.status(400).json({ code: err });
    store.updateUser(req.user.id, { birthDate });
    res.json({ ok: true, birthDate });
  });

  // Recuperar contraseña: envía un enlace por email. Siempre responde lo mismo,
  // exista o no la cuenta, para no revelar qué emails están registrados.
  app.post('/api/password/forgot', async (req, res) => {
    if (rateLimited(req.ip)) return res.status(429).json({ code: 'tooMany' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ code: 'email' });
    if (!(await captcha.verifyHuman(req))) return res.status(400).json({ code: 'captcha' });
    const user = store.getUserByEmail(email);
    const recent = user?.reset && user.reset.sentAt > Date.now() - 60000;
    if (user && !recent) {
      const token = crypto.randomBytes(32).toString('base64url');
      const lang = cleanLang(req.body?.lang || user.lang);
      store.updateUser(user.id, { reset: { hash: sha256(token), expires: Date.now() + RESET_MS, sentAt: Date.now() } });
      mailer.sendPasswordReset(email, `${baseUrl(req)}/?reset=${token}`, lang)
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
      emailVerified: true, // ha abierto un enlace enviado a su email
    });
    res.json({ token: sessionToken(updated), user: publicUser(updated) });
  });

  // Confirmar el email con el enlace recibido
  app.post('/api/email/verify', (req, res) => {
    const hash = sha256(String(req.body?.token || ''));
    const user = req.body?.token && store.listUsers().find((u) => u.verify?.hash === hash);
    if (!user || user.verify.expires < Date.now()) return res.status(400).json({ code: 'verifyInvalid' });
    store.updateUser(user.id, { emailVerified: true, emailVerifiedAt: Date.now(), verify: null });
    res.json({ ok: true });
  });

  // Reenviar el email de confirmación (como mucho uno por minuto)
  app.post('/api/email/resend', requireUser, (req, res) => {
    if (req.user.emailVerified) return res.json({ ok: true, verified: true });
    if (req.user.verify?.sentAt > Date.now() - 60000) return res.status(429).json({ code: 'tooMany' });
    sendVerification(req.user, req);
    res.json({ ok: true });
  });

  // Cierra la sesión en todos los dispositivos
  app.post('/api/logout-all', requireUser, (req, res) => {
    store.updateUser(req.user.id, { tokenVersion: (req.user.tokenVersion || 0) + 1 });
    res.json({ ok: true });
  });
}

module.exports = {
  routes, onSignup, signedUp, requireUser, userFromToken, prefsOf, restriction, publicUser, likesOf, checkPassword, bearer, needsEmail,
  sessionToken, cleanLang, rateLimited, sha256, ageFrom, birthError, hashPassword, baseUrl, EMAIL_RE, EMAIL_VERIFY, GENDERS,
};
