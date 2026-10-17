// Protección de datos (RGPD) y de la imagen.
//
// - Cabeceras de seguridad (CSP, HSTS…): la web solo carga código propio.
// - Derechos del usuario sin tener que escribirnos: descargar sus datos
//   (acceso y portabilidad) y borrar su cuenta (supresión).
// - Conservación limitada: se borran solos los datos que ya no hacen falta.
// - Código de marca de agua: un código corto y seudónimo de cada cuenta que se
//   pinta sobre el vídeo que ve esa persona. Si graba y lo difunde, la grabación
//   lleva su código y se puede identificar la cuenta (búsqueda en /admin).

const crypto = require('crypto');
const store = require('./store');
const { requireUser, checkPassword, likesOf } = require('./auth');
const captcha = require('./captcha');

// Turnstile (antibots) necesita cargar su script y su iframe desde Cloudflare
const CF = captcha.ENABLED ? ' https://challenges.cloudflare.com' : '';

const DAY = 24 * 3600 * 1000;
const KEEP_REPORT_CHAT_DAYS = 180; // pruebas de denuncias resueltas
const KEEP_REGISTER_IP_DAYS = 90;  // IP de registro (seguridad y fraude)
const HTTPS = (process.env.BASE_URL || '').startsWith('https://');

const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function watermarkCode(user) {
  return user.id.slice(1, 9).toUpperCase().replace(/^(.{4})/, '$1-');
}

function securityHeaders(_req, res, next) {
  res.set({
    'Content-Security-Policy': [
      "default-src 'self'",
      `script-src 'self'${CF}`,
      `frame-src 'self'${CF}`, // 'self': huecos de publicidad de redes externas (aislados, ver ads.js)
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "media-src 'self' blob: mediastream:",
      `connect-src 'self' ws: wss:${CF}`,
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Cross-Origin-Opener-Policy': 'same-origin',
    // La web no puede compartir ni capturar la pantalla, ni usar otras APIs que no necesita
    'Permissions-Policy': 'camera=(self), microphone=(self), display-capture=(), geolocation=(), payment=()',
  });
  if (HTTPS) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}

// Datos de la cuenta en un JSON descargable (derecho de acceso y portabilidad)
function exportData(user) {
  const reports = store.listReports();
  return {
    exportedAt: new Date().toISOString(),
    account: {
      email: user.email,
      nick: user.nick || '',
      birthDate: user.birthDate || null,
      signInWith: [...(user.passHash ? ['password'] : []), ...Object.keys(user.oauth || {})],
      gender: user.gender,
      language: user.lang,
      createdAt: new Date(user.createdAt).toISOString(),
      acceptedTermsAt: user.acceptedTermsAt ? new Date(user.acceptedTermsAt).toISOString() : null,
      registerIp: user.registerIp || null,
      watermarkCode: watermarkCode(user),
      likes: likesOf(user),
      complimentsReceived: user.piropos || {},
      wouldTalkAgain: { yes: user.rep?.up || 0, no: user.rep?.down || 0 },
      preferences: user.prefs || {},
      guindillas: user.game || {},
      superpowers: {
        boostUntil: user.boostUntil ? new Date(user.boostUntil).toISOString() : null,
        incognitoUntil: user.incognitoUntil ? new Date(user.incognitoUntil).toISOString() : null,
        pendingSuperGreeting: user.superMsg || '',
        heartsLast24h: (user.lovedBy || []).filter((l) => l.at > Date.now() - 24 * 3600 * 1000).length,
      },
      status: user.status,
      suspendedUntil: user.suspendedUntil ? new Date(user.suspendedUntil).toISOString() : null,
    },
    ageVerification: {
      status: user.age?.status || 'none',
      verifiedAt: user.age?.verifiedAt ? new Date(user.age.verifiedAt).toISOString() : null,
    },
    premium: store.ordersForUser(user.id).map((o) => ({
      plan: o.plan || 'month',
      method: o.method,
      status: o.status,
      createdAt: new Date(o.createdAt).toISOString(),
      expires: o.expires ? new Date(o.expires).toISOString() : null,
    })),
    // Denuncias hechas y recibidas, sin datos de las otras personas
    reportsMade: reports.filter((r) => r.reporterId === user.id)
      .map((r) => ({ reason: r.reason, comment: r.comment, createdAt: new Date(r.createdAt).toISOString() })),
    reportsReceived: reports.filter((r) => r.reportedId === user.id)
      .map((r) => ({ reason: r.reason, status: r.status, createdAt: new Date(r.createdAt).toISOString() })),
    captureAttempts: user.captureAttempts || 0,
    // Historial y amigos: fechas y duración, sin datos de las otras personas
    chatHistory: store.listHistory(user.id).map((h) => ({
      lastChat: new Date(h.lastAt).toISOString(), durationSeconds: h.duration, times: h.times,
    })),
    friends: store.listFriendships(user.id).filter((f) => f.status === 'accepted')
      .map((f) => ({ since: new Date(f.updatedAt).toISOString() })),
    blockedPeople: (user.blocked || []).length,
    notStored: 'Video, audio and chat messages are not stored, except the last messages of a reported conversation.',
  };
}

// Borra datos que ya no hacen falta (se ejecuta al arrancar y cada día)
function retention() {
  const now = Date.now();
  let changed = 0;
  for (const r of store.listReports()) {
    if (r.status !== 'open' && r.chat?.length && (r.resolvedAt || r.createdAt) < now - KEEP_REPORT_CHAT_DAYS * DAY) {
      r.chat = [];
      changed++;
    }
  }
  for (const u of store.listUsers()) {
    if (u.registerIp && u.createdAt < now - KEEP_REGISTER_IP_DAYS * DAY) { delete u.registerIp; changed++; }
    if (u.reset && u.reset.expires < now) { u.reset = null; changed++; }
  }
  if (changed) {
    store.save();
    console.log(`[privacidad] limpieza de datos antiguos: ${changed} cambios`);
  }
}
retention();
setInterval(retention, DAY).unref();

let onDeleted = () => {};

function routes(app) {
  app.get('/api/me/export', requireUser, (req, res) => {
    res.set('Content-Disposition', 'attachment; filename="la-ruleta-caliente-mis-datos.json"');
    res.json(exportData(req.user));
  });

  // Borrar la cuenta: pide la contraseña para evitar borrados por error o ajenos
  app.post('/api/me/delete', requireUser, async (req, res) => {
    const user = req.user;
    // Cuentas creadas con Google/Apple/Facebook no tienen contraseña: se confirma escribiendo el email
    const given = String(req.body?.password || '');
    const ok = user.passHash
      ? await checkPassword(given, user.passHash)
      : given.trim().toLowerCase() === user.email;
    if (!ok) return res.status(401).json({ code: user.passHash ? 'badPassword' : 'badConfirmEmail' });
    // Si estaba expulsada, se guarda solo un hash del email para que no pueda volver a registrarse
    if (user.status === 'banned') store.banEmailHash(sha256(user.email));
    store.deleteUser(user.id);
    onDeleted(user.id);
    console.log(`[privacidad] cuenta borrada por su titular: ${user.id}`);
    res.json({ ok: true });
  });
}

module.exports = {
  routes,
  securityHeaders,
  watermarkCode,
  sha256,
  setOnDeleted: (fn) => { onDeleted = fn; },
};
