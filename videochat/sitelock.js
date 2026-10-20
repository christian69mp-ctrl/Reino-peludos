// Cierre temporal de la web con contraseña (antes de abrir al público).
// Con SITE_PASSWORD en .env, el navegador pide usuario y contraseña antes de mostrar nada:
// el usuario puede ser cualquiera; la contraseña tiene que ser SITE_PASSWORD.
// Quedan fuera los avisos automáticos de Segpay y Veriff y la comprobación de salud de Docker.
const crypto = require('crypto');

const PASSWORD = process.env.SITE_PASSWORD || '';
const OPEN_PATHS = new Set(['/api/age/webhook', '/api/segpay/postback']);

const sameText = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};

// ¿La petición trae la contraseña correcta (o no necesita traerla)?
function allowed(req) {
  if (!PASSWORD) return true;
  const url = (req.originalUrl || req.url || '').split('?')[0];
  if (OPEN_PATHS.has(url)) return true;
  // Comprobación de salud de Docker: llega directa desde la propia máquina, sin pasar por Caddy
  const remote = req.socket?.remoteAddress || '';
  if (!req.headers['x-forwarded-for'] && /^(::1|127\.|::ffff:127\.)/.test(remote)) return true;
  const [scheme, value] = String(req.headers.authorization || '').split(' ');
  if (scheme !== 'Basic' || !value) return false;
  const decoded = Buffer.from(value, 'base64').toString();
  return sameText(decoded.slice(decoded.indexOf(':') + 1), PASSWORD);
}

function middleware(req, res, next) {
  if (allowed(req)) {
    if (PASSWORD) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return next();
  }
  res.setHeader('WWW-Authenticate', 'Basic realm="La Ruleta Caliente", charset="UTF-8"');
  res.status(401).type('text/plain; charset=utf-8').send('La Ruleta Caliente abrirá muy pronto. 🌶️');
}

if (PASSWORD) console.warn('[sitelock] Web cerrada con SITE_PASSWORD: solo entra quien tenga la contraseña.');

module.exports = { enabled: !!PASSWORD, allowed, middleware };
