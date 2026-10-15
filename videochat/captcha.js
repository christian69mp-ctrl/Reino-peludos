// Protección contra bots con Cloudflare Turnstile (gratis, normalmente invisible).
// Se usa al registrarse y al pedir recuperar contraseña.
// Sin TURNSTILE_SITE_KEY y TURNSTILE_SECRET está desactivado.

const SITE_KEY = process.env.TURNSTILE_SITE_KEY || '';
const SECRET = process.env.TURNSTILE_SECRET || '';
const VERIFY_URL = process.env.TURNSTILE_VERIFY_URL || 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const ENABLED = !!(SITE_KEY && SECRET);
if (!ENABLED) console.warn('[antibots] Turnstile desactivado: define TURNSTILE_SITE_KEY y TURNSTILE_SECRET.');

async function verifyHuman(req) {
  if (!ENABLED) return true;
  const token = String(req.body?.captcha || '');
  if (!token) return false;
  try {
    const r = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: SECRET, response: token, remoteip: req.ip || '' }),
    });
    const data = await r.json();
    return data.success === true;
  } catch (err) {
    console.error('[antibots] no se pudo comprobar:', err.message);
    return false;
  }
}

module.exports = { verifyHuman, ENABLED, SITE_KEY };
