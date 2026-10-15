// Iniciar sesión con Google, Apple o Facebook.
//
// Cada botón aparece solo si su proveedor está configurado:
// - Google:   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
// - Apple:    APPLE_CLIENT_ID (el "Services ID"), APPLE_TEAM_ID, APPLE_KEY_ID y la
//             clave privada .p8 en APPLE_PRIVATE_KEY (o su ruta en APPLE_PRIVATE_KEY_FILE)
// - Facebook: FACEBOOK_APP_ID, FACEBOOK_APP_SECRET
// URL de vuelta que hay que dar de alta en cada proveedor: {BASE_URL}/auth/{proveedor}/callback
//
// Flujo: /auth/google → página del proveedor → /auth/google/callback → la web
// recibe un código de un solo uso (?social=…) y lo canjea por la sesión. Si la
// cuenta es nueva, antes se pide qué eres y aceptar las normas (mayor de 18).
// Iniciar sesión con un proveedor NO verifica la edad: se aplica la misma regla
// que al registrarse con email.
// Si ya existe una cuenta con ese email (confirmado por el proveedor), se vinculan.

const crypto = require('crypto');
const fs = require('fs');
const express = require('express');
const store = require('./store');
const auth = require('./auth');

const env = process.env;
const b64url = (buf) => Buffer.from(buf).toString('base64url');
const random = () => crypto.randomBytes(24).toString('base64url');

function applePrivateKey() {
  if (env.APPLE_PRIVATE_KEY) return env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  if (env.APPLE_PRIVATE_KEY_FILE) return fs.readFileSync(env.APPLE_PRIVATE_KEY_FILE, 'utf8');
  return '';
}

// Las URL se pueden cambiar por variables (solo para pruebas)
const PROVIDERS = {
  google: {
    enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    clientId: env.GOOGLE_CLIENT_ID,
    authUrl: env.GOOGLE_AUTH_URL || 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: env.GOOGLE_TOKEN_URL || 'https://oauth2.googleapis.com/token',
    issuers: ['https://accounts.google.com', 'accounts.google.com'],
    scope: 'openid email',
    pkce: true,
    extra: { prompt: 'select_account' },
  },
  apple: {
    enabled: !!(env.APPLE_CLIENT_ID && env.APPLE_TEAM_ID && env.APPLE_KEY_ID && applePrivateKey()),
    clientId: env.APPLE_CLIENT_ID,
    authUrl: env.APPLE_AUTH_URL || 'https://appleid.apple.com/auth/authorize',
    tokenUrl: env.APPLE_TOKEN_URL || 'https://appleid.apple.com/auth/token',
    issuers: ['https://appleid.apple.com'],
    scope: 'email',
    formPost: true, // Apple devuelve el resultado con un POST
  },
  facebook: {
    enabled: !!(env.FACEBOOK_APP_ID && env.FACEBOOK_APP_SECRET),
    clientId: env.FACEBOOK_APP_ID,
    authUrl: env.FACEBOOK_AUTH_URL || 'https://www.facebook.com/v21.0/dialog/oauth',
    tokenUrl: env.FACEBOOK_TOKEN_URL || 'https://graph.facebook.com/v21.0/oauth/access_token',
    meUrl: env.FACEBOOK_ME_URL || 'https://graph.facebook.com/v21.0/me',
    scope: 'email',
  },
};
const enabled = Object.keys(PROVIDERS).filter((k) => PROVIDERS[k].enabled);
if (enabled.length) console.log(`[cuentas] Inicio de sesión con: ${enabled.join(', ')}`);

// ---- Estados pendientes (10 min) y códigos de un solo uso (10 min) ----
const TTL = 10 * 60 * 1000;
const pending = new Map(); // state -> { provider, nonce, verifier, lang, expires }
const codes = new Map();   // código -> { type: 'login' | 'signup', ..., expires }
setInterval(() => {
  const now = Date.now();
  for (const m of [pending, codes]) for (const [k, v] of m) if (v.expires < now) m.delete(k);
}, 60 * 1000).unref();

function newCode(data) {
  const code = random();
  codes.set(code, { ...data, expires: Date.now() + TTL });
  return code;
}
function readCode(code) {
  const c = codes.get(String(code || ''));
  return c && c.expires > Date.now() ? c : null;
}

function cookieValue(req, name) {
  for (const part of String(req.headers.cookie || '').split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return '';
}

const COOKIE = 'lrc_oauth';
const redirectUri = (req, provider) => `${env.BASE_URL || `${req.protocol}://${req.get('host')}`}/auth/${provider}/callback`;

// Contenido de un id_token. Se recibe directamente del proveedor por HTTPS con
// nuestra clave secreta, así que basta con comprobar emisor, destinatario,
// caducidad y nonce (OpenID Connect, apartado 3.1.3.7).
function idTokenClaims(idToken, p, nonce) {
  const part = String(idToken || '').split('.')[1];
  if (!part) throw new Error('sin id_token');
  const c = JSON.parse(Buffer.from(part, 'base64url').toString());
  if (!p.issuers.includes(c.iss)) throw new Error('emisor incorrecto');
  const aud = Array.isArray(c.aud) ? c.aud : [c.aud];
  if (!aud.includes(p.clientId)) throw new Error('destinatario incorrecto');
  if (!c.exp || c.exp * 1000 < Date.now()) throw new Error('caducado');
  if (nonce && c.nonce && c.nonce !== nonce) throw new Error('nonce incorrecto');
  return c;
}

// Clave secreta de Apple: un JWT firmado con la clave .p8 (ES256)
function appleClientSecret() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'ES256', kid: env.APPLE_KEY_ID }));
  const payload = b64url(JSON.stringify({ iss: env.APPLE_TEAM_ID, iat: now, exp: now + 3600, aud: 'https://appleid.apple.com', sub: env.APPLE_CLIENT_ID }));
  const sig = crypto.sign('sha256', Buffer.from(`${header}.${payload}`), { key: applePrivateKey(), dsaEncoding: 'ieee-p1363' });
  return `${header}.${payload}.${b64url(sig)}`;
}

async function postForm(url, data) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: new URLSearchParams(data) });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(json.error_description || json.error?.message || json.error || `HTTP ${r.status}`);
  return json;
}

// Canjea el código del proveedor por los datos de la persona: { sub, email, verified }
async function profileFrom(name, code, st, req) {
  const p = PROVIDERS[name];
  const redirect_uri = redirectUri(req, name);
  if (name === 'google') {
    const t = await postForm(p.tokenUrl, { grant_type: 'authorization_code', code, redirect_uri, client_id: p.clientId, client_secret: env.GOOGLE_CLIENT_SECRET, code_verifier: st.verifier });
    const c = idTokenClaims(t.id_token, p, st.nonce);
    return { sub: c.sub, email: c.email, verified: c.email_verified === true || c.email_verified === 'true' };
  }
  if (name === 'apple') {
    const t = await postForm(p.tokenUrl, { grant_type: 'authorization_code', code, redirect_uri, client_id: p.clientId, client_secret: appleClientSecret() });
    const c = idTokenClaims(t.id_token, p, st.nonce);
    return { sub: c.sub, email: c.email, verified: c.email_verified === true || c.email_verified === 'true' };
  }
  // Facebook
  const q = new URLSearchParams({ client_id: p.clientId, client_secret: env.FACEBOOK_APP_SECRET, redirect_uri, code });
  const tr = await fetch(`${p.tokenUrl}?${q}`);
  const t = await tr.json().catch(() => ({}));
  if (!tr.ok || !t.access_token) throw new Error(t.error?.message || `HTTP ${tr.status}`);
  const proof = crypto.createHmac('sha256', env.FACEBOOK_APP_SECRET).update(t.access_token).digest('hex');
  const mr = await fetch(`${p.meUrl}?${new URLSearchParams({ fields: 'id,email', access_token: t.access_token, appsecret_proof: proof })}`);
  const me = await mr.json().catch(() => ({}));
  if (!mr.ok || !me.id) throw new Error(me.error?.message || `HTTP ${mr.status}`);
  // Facebook solo devuelve emails confirmados
  return { sub: me.id, email: me.email, verified: !!me.email };
}

function findByProvider(name, sub) {
  return store.listUsers().find((u) => u.oauth?.[name] === sub);
}

function routes(app) {
  // Empieza: guarda el estado y manda a la página del proveedor
  app.get('/auth/:provider', (req, res) => {
    const name = req.params.provider;
    const p = PROVIDERS[name];
    if (!p?.enabled) return res.redirect('/?login_error=unavailable');
    if (pending.size > 20000) return res.redirect('/?login_error=failed');
    const state = random();
    const st = { provider: name, nonce: random(), lang: auth.cleanLang(req.query.lang), expires: Date.now() + TTL };
    const params = { client_id: p.clientId, redirect_uri: redirectUri(req, name), response_type: 'code', scope: p.scope, state, ...(p.extra || {}) };
    if (name !== 'facebook') params.nonce = st.nonce;
    if (p.pkce) {
      st.verifier = random() + random();
      params.code_challenge = b64url(crypto.createHash('sha256').update(st.verifier).digest());
      params.code_challenge_method = 'S256';
    }
    if (p.formPost) params.response_mode = 'form_post';
    pending.set(state, st);
    // La cookie ata el inicio de sesión a este navegador. SameSite=None porque
    // Apple vuelve con un POST desde su dominio.
    res.cookie(COOKIE, state, { httpOnly: true, secure: true, sameSite: 'none', path: '/auth', maxAge: TTL });
    res.redirect(`${p.authUrl}?${new URLSearchParams(params)}`);
  });

  const callback = async (req, res) => {
    const name = req.params.provider;
    const p = PROVIDERS[name];
    const q = req.method === 'POST' ? req.body || {} : req.query;
    const state = String(q.state || '');
    const st = pending.get(state);
    pending.delete(state);
    res.clearCookie(COOKIE, { path: '/auth', secure: true, sameSite: 'none' });
    if (!p?.enabled || !st || st.provider !== name || st.expires < Date.now() || cookieValue(req, COOKIE) !== state) {
      return res.redirect('/?login_error=failed');
    }
    if (q.error || !q.code) return res.redirect('/?login_error=cancelled');
    let profile;
    try {
      profile = await profileFrom(name, String(q.code), st, req);
    } catch (err) {
      console.error(`[cuentas] inicio de sesión con ${name} fallido:`, err.message);
      return res.redirect('/?login_error=failed');
    }
    const email = String(profile.email || '').trim().toLowerCase();
    if (!email || !auth.EMAIL_RE.test(email)) return res.redirect('/?login_error=noemail');
    if (!profile.verified) return res.redirect('/?login_error=unverified');
    if (store.isEmailHashBanned(auth.sha256(email))) return res.redirect('/?login_error=bannedEmail');

    let user = findByProvider(name, profile.sub) || store.getUserByEmail(email);
    if (user) {
      // Se vincula el proveedor a la cuenta y el email queda confirmado
      const fields = {};
      if (user.oauth?.[name] !== profile.sub) fields.oauth = { ...(user.oauth || {}), [name]: profile.sub };
      if (!user.emailVerified && user.email === email) Object.assign(fields, { emailVerified: true, emailVerifiedAt: Date.now(), verify: null });
      if (Object.keys(fields).length) user = store.updateUser(user.id, fields);
      return res.redirect(`/?social=${newCode({ type: 'login', uid: user.id })}`);
    }
    res.redirect(`/?social=${newCode({ type: 'signup', provider: name, sub: profile.sub, email, lang: st.lang })}`);
  };
  app.get('/auth/:provider/callback', callback);
  app.post('/auth/:provider/callback', express.urlencoded({ extended: false, limit: '20kb' }), callback);

  // La web canjea el código: o inicia sesión, o pide completar el registro
  app.post('/api/social/finish', (req, res) => {
    const c = readCode(req.body?.code);
    if (!c) return res.status(400).json({ code: 'socialExpired' });
    if (c.type === 'signup') return res.json({ signup: true, email: c.email, provider: c.provider });
    codes.delete(req.body.code);
    const user = store.getUser(c.uid);
    if (!user) return res.status(400).json({ code: 'socialExpired' });
    res.json({ token: auth.sessionToken(user), user: auth.publicUser(user) });
  });

  // Cuenta nueva: qué eres y aceptar las normas (mayor de 18)
  app.post('/api/social/complete', (req, res) => {
    if (auth.rateLimited(req.ip)) return res.status(429).json({ code: 'tooMany' });
    const c = readCode(req.body?.code);
    if (!c || c.type !== 'signup') return res.status(400).json({ code: 'socialExpired' });
    const { gender, adult, terms } = req.body || {};
    if (!auth.GENDERS.includes(gender)) return res.status(400).json({ code: 'gender' });
    if (adult !== true || terms !== true) return res.status(400).json({ code: 'terms' });
    const birthDate = req.body?.birthDate ? String(req.body.birthDate) : null;
    if (birthDate && auth.birthError(birthDate)) return res.status(400).json({ code: auth.birthError(birthDate) });
    codes.delete(req.body.code);
    let user = store.getUserByEmail(c.email);
    if (user) {
      user = store.updateUser(user.id, { oauth: { ...(user.oauth || {}), [c.provider]: c.sub } });
    } else {
      user = store.createUser({
        email: c.email,
        passHash: null,
        oauth: { [c.provider]: c.sub },
        gender,
        birthDate,
        status: 'active',
        tokenVersion: 0,
        acceptedTermsAt: Date.now(),
        registerIp: req.ip,
        likes: { like: 0, love: 0 },
        lang: auth.cleanLang(req.body?.lang || c.lang),
        emailVerified: true,
        emailVerifiedAt: Date.now(),
      });
    }
    res.json({ token: auth.sessionToken(user), user: auth.publicUser(user) });
  });
}

module.exports = { routes, enabled };
