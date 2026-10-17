// Seguridad del panel /admin:
// - Se entra con ADMIN_PASSWORD y, si se activa, un código de 6 cifras de una app
//   de autenticación (Google Authenticator, Authy, 1Password…): verificación en dos pasos.
// - La sesión dura 12 horas; «Cerrar todas las sesiones» las invalida todas.
// - 5 intentos fallidos en 15 minutos bloquean esa IP y avisan por email.
// - Registro de actividad: entradas, fallos y acciones importantes.

const crypto = require('crypto');
const QRCode = require('qrcode');
const store = require('./store');
const tokens = require('./tokens');
const mailer = require('./mailer');

const PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_MS = 12 * 3600 * 1000;
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// ---- Códigos de un solo uso (TOTP, RFC 6238) ----
function base32Encode(buf) {
  let bits = 0; let value = 0; let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte; bits += 8;
    while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}
function base32Decode(str) {
  let bits = 0; let value = 0; const out = [];
  for (const c of String(str).replace(/=+$/, '').toUpperCase()) {
    const i = B32.indexOf(c);
    if (i < 0) continue;
    value = (value << 5) | i; bits += 5;
    if (bits >= 8) { out.push((value >>> (bits - 8)) & 255); bits -= 8; }
  }
  return Buffer.from(out);
}
function totp(secret, step) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(step));
  const h = crypto.createHmac('sha1', base32Decode(secret)).update(msg).digest();
  const o = h[h.length - 1] & 15;
  return String(((h.readUInt32BE(o) & 0x7fffffff) % 1e6)).padStart(6, '0');
}
// Acepta el código actual y los de 30 s antes y después (relojes desajustados)
function checkTotp(secret, code) {
  const c = String(code || '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(c)) return false;
  const step = Math.floor(Date.now() / 30000);
  return [-1, 0, 1].some((d) => crypto.timingSafeEqual(Buffer.from(totp(secret, step + d)), Buffer.from(c)));
}

const security = () => store.get('settings', 'adminSecurity') || { id: 'adminSecurity', version: 1, totp: null, pending: null };
const saveSecurity = (s) => store.put('settings', s);

// ---- Registro de actividad (últimas 500 entradas) ----
function audit(req, action, detail = '') {
  const log = store.get('settings', 'auditLog') || { id: 'auditLog', entries: [] };
  log.entries.unshift({ at: Date.now(), ip: req?.ip || '', action, detail: String(detail).slice(0, 300) });
  log.entries = log.entries.slice(0, 500);
  store.put('settings', log);
}

// ---- Intentos fallidos ----
const fails = new Map();
const blocked = (ip) => (fails.get(ip) || []).filter((t) => t > Date.now() - 15 * 60000).length >= 5;
function failed(req) {
  const list = (fails.get(req.ip) || []).filter((t) => t > Date.now() - 15 * 60000);
  list.push(Date.now());
  fails.set(req.ip, list);
  if (list.length === 5) {
    mailer.sendAdminAlert('Intentos fallidos en el panel', `5 intentos fallidos de entrar en /admin desde la IP ${req.ip}. Queda bloqueada 15 minutos.`).catch(() => {});
  }
}

function requireAdmin(req, res, next) {
  if (!PASSWORD) return res.status(403).json({ error: 'Panel desactivado: falta ADMIN_PASSWORD' });
  const token = String(req.get('x-admin-token') || '');
  const data = token && tokens.verify(token);
  if (data?.admin && data.v === security().version) return next();
  // Acceso directo con la contraseña (scripts): solo si no hay verificación en dos pasos
  const key = String(req.get('x-admin-key') || '');
  if (key && !security().totp && tokens.safeEqual(key, PASSWORD)) return next();
  return res.status(403).json({ error: 'Acceso no autorizado' });
}

function routes(app) {
  // Si pierdes el móvil: arrancar una vez con ADMIN_RESET_2FA=1 quita la verificación en dos pasos
  if (process.env.ADMIN_RESET_2FA === '1' && security().totp) {
    const sec = security();
    sec.totp = null; sec.pending = null; sec.version += 1;
    saveSecurity(sec);
    audit({ ip: 'servidor' }, 'Verificación en dos pasos quitada', 'ADMIN_RESET_2FA');
    console.warn('[panel] verificación en dos pasos desactivada con ADMIN_RESET_2FA: quita esa línea del .env');
  }
  app.post('/api/admin/login', (req, res) => {
    if (!PASSWORD) return res.status(403).json({ error: 'Panel desactivado: falta ADMIN_PASSWORD' });
    if (blocked(req.ip)) return res.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos.' });
    const sec = security();
    const okPass = tokens.safeEqual(String(req.body?.password || ''), PASSWORD);
    if (!okPass) { failed(req); audit(req, 'Entrada fallida', 'contraseña incorrecta'); return res.status(401).json({ error: 'Contraseña incorrecta' }); }
    if (sec.totp) {
      if (!req.body?.code) return res.status(401).json({ error: 'Falta el código', needCode: true });
      if (!checkTotp(sec.totp, req.body.code)) { failed(req); audit(req, 'Entrada fallida', 'código incorrecto'); return res.status(401).json({ error: 'Código incorrecto', needCode: true }); }
    }
    fails.delete(req.ip);
    audit(req, 'Entrada al panel');
    res.json({ token: tokens.sign({ admin: true, v: sec.version, exp: Date.now() + SESSION_MS }), twoFactor: !!sec.totp });
  });

  app.get('/api/admin/security', requireAdmin, (_req, res) => {
    const log = store.get('settings', 'auditLog');
    res.json({ twoFactor: !!security().totp, log: (log?.entries || []).slice(0, 100) });
  });

  // Activar la verificación en dos pasos: 1) se genera el secreto y el QR, 2) se confirma con un código
  app.post('/api/admin/2fa/setup', requireAdmin, async (req, res) => {
    const sec = security();
    if (sec.totp) return res.status(409).json({ error: 'Ya está activada' });
    sec.pending = base32Encode(crypto.randomBytes(20));
    saveSecurity(sec);
    const uri = `otpauth://totp/${encodeURIComponent('La Ruleta Caliente:admin')}?secret=${sec.pending}&issuer=${encodeURIComponent('La Ruleta Caliente')}`;
    const qr = await QRCode.toString(uri, { type: 'svg', margin: 1, width: 220 });
    res.json({ secret: sec.pending.replace(/(.{4})/g, '$1 ').trim(), uri, qr });
  });

  app.post('/api/admin/2fa/enable', requireAdmin, (req, res) => {
    const sec = security();
    if (!sec.pending || !checkTotp(sec.pending, req.body?.code)) return res.status(400).json({ error: 'Código incorrecto' });
    sec.totp = sec.pending; sec.pending = null; sec.version += 1;
    saveSecurity(sec);
    audit(req, 'Verificación en dos pasos activada');
    res.json({ ok: true, token: tokens.sign({ admin: true, v: sec.version, exp: Date.now() + SESSION_MS }) });
  });

  app.post('/api/admin/2fa/disable', requireAdmin, (req, res) => {
    const sec = security();
    if (!sec.totp || !checkTotp(sec.totp, req.body?.code)) return res.status(400).json({ error: 'Código incorrecto' });
    sec.totp = null; sec.version += 1;
    saveSecurity(sec);
    audit(req, 'Verificación en dos pasos desactivada');
    res.json({ ok: true, token: tokens.sign({ admin: true, v: sec.version, exp: Date.now() + SESSION_MS }) });
  });

  // Cierra todas las sesiones del panel (también esta)
  app.post('/api/admin/logout-all', requireAdmin, (req, res) => {
    const sec = security();
    sec.version += 1;
    saveSecurity(sec);
    audit(req, 'Cerradas todas las sesiones del panel');
    res.json({ ok: true });
  });
}

module.exports = { routes, requireAdmin, audit, _test: { totp, base32Decode, base32Encode, checkTotp } };
