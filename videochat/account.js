// Ajustes de la cuenta: contraseña, email, personas bloqueadas y preferencias.

const crypto = require('crypto');
const store = require('./store');
const mailer = require('./mailer');
const auth = require('./auth');
const friends = require('./friends');

const CHANGE_MS = 48 * 3600 * 1000;
let onUnblock = () => {};
let onPasswordChanged = () => {};

// Confirma la identidad: contraseña, o el email actual en cuentas sin contraseña (Google/Apple/Facebook)
async function confirmed(user, given) {
  const value = String(given || '');
  return user.passHash ? auth.checkPassword(value, user.passHash) : value.trim().toLowerCase() === user.email;
}

const CHANGE_TEXT = {
  es: ['Confirma tu nuevo email', 'Pulsa el enlace para usar este email en tu cuenta de La Ruleta Caliente (caduca en 48 horas). Si no lo has pedido tú, ignora este mensaje.'],
  en: ['Confirm your new email', 'Open the link to use this email for your La Ruleta Caliente account (it expires in 48 hours). If you did not request it, ignore this message.'],
  pt: ['Confirme seu novo e-mail', 'Abra o link para usar este e-mail na sua conta do La Ruleta Caliente (expira em 48 horas). Se não foi você, ignore esta mensagem.'],
  fr: ['Confirmez votre nouvel e-mail', 'Ouvrez le lien pour utiliser cet e-mail sur votre compte La Ruleta Caliente (il expire dans 48 heures). Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.'],
  de: ['Bestätige deine neue E-Mail', 'Öffne den Link, um diese E-Mail für dein Konto bei La Ruleta Caliente zu verwenden (gültig 48 Stunden). Wenn du das nicht angefordert hast, ignoriere diese Nachricht.'],
  it: ['Conferma la tua nuova email', 'Apri il link per usare questa email nel tuo account di La Ruleta Caliente (scade tra 48 ore). Se non sei stato tu, ignora questo messaggio.'],
};

function routes(app) {
  // Cambiar (o crear) la contraseña. Cierra la sesión en los demás dispositivos.
  app.post('/api/me/password', auth.requireUser, async (req, res) => {
    const user = req.user;
    if (auth.rateLimited(req.ip)) return res.status(429).json({ code: 'tooMany' });
    if (user.passHash && !(await auth.checkPassword(String(req.body?.current || ''), user.passHash))) {
      return res.status(401).json({ code: 'badPassword' });
    }
    const password = String(req.body?.password || '');
    if (password.length < 8 || password.length > 200) return res.status(400).json({ code: 'password' });
    const updated = store.updateUser(user.id, { passHash: await auth.hashPassword(password), tokenVersion: (user.tokenVersion || 0) + 1 });
    onPasswordChanged(user.id);
    res.json({ ok: true, token: auth.sessionToken(updated) });
  });

  // Cambiar el email: se confirma con un enlace enviado al email nuevo
  app.post('/api/me/email', auth.requireUser, async (req, res) => {
    const user = req.user;
    if (auth.rateLimited(req.ip)) return res.status(429).json({ code: 'tooMany' });
    if (!(await confirmed(user, req.body?.password))) return res.status(401).json({ code: user.passHash ? 'badPassword' : 'badConfirmEmail' });
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!auth.EMAIL_RE.test(email) || email.length > 200) return res.status(400).json({ code: 'email' });
    if (email === user.email) return res.status(400).json({ code: 'sameEmail' });
    if (store.getUserByEmail(email)) return res.status(409).json({ code: 'exists' });
    if (store.isEmailHashBanned(auth.sha256(email))) return res.status(403).json({ code: 'bannedEmail' });
    if (!auth.EMAIL_VERIFY) {
      store.changeEmail(user.id, email);
      return res.json({ ok: true, changed: true, email });
    }
    const token = crypto.randomBytes(24).toString('base64url');
    store.updateUser(user.id, { emailChange: { email, hash: auth.sha256(token), expires: Date.now() + CHANGE_MS } });
    const [subject, body] = CHANGE_TEXT[user.lang] || CHANGE_TEXT.en;
    mailer.sendText(email, subject, `${body}\n\n${auth.baseUrl(req)}/?emailchange=${token}`).catch((err) => console.error('[email]', err.message));
    res.json({ ok: true, pending: true, email });
  });

  app.post('/api/email/change', (req, res) => {
    const hash = auth.sha256(String(req.body?.token || ''));
    const user = req.body?.token && store.listUsers().find((u) => u.emailChange?.hash === hash);
    if (!user || user.emailChange.expires < Date.now()) return res.status(400).json({ code: 'verifyInvalid' });
    const { email } = user.emailChange;
    if (!store.changeEmail(user.id, email)) return res.status(409).json({ code: 'exists' });
    store.updateUser(user.id, { emailChange: null, emailVerified: true, emailVerifiedAt: Date.now() });
    res.json({ ok: true, email });
  });

  // Personas bloqueadas (se identifican con un código distinto para cada quien mira)
  app.get('/api/me/blocked', auth.requireUser, (req, res) => {
    const list = (req.user.blocked || []).slice().reverse()
      .map((id) => friends.contactInfo(req.user.id, id))
      .filter(Boolean);
    res.json({ blocked: list });
  });

  app.post('/api/me/unblock', auth.requireUser, (req, res) => {
    const user = req.user;
    const other = (user.blocked || []).find((id) => friends.handle(user.id, id) === req.body?.handle);
    if (!other) return res.status(404).json({ code: 'contact' });
    store.updateUser(user.id, { blocked: user.blocked.filter((id) => id !== other) });
    onUnblock(user.id, other);
    res.json({ ok: true });
  });

  // Preferencias
  app.post('/api/me/prefs', auth.requireUser, (req, res) => {
    const cur = auth.prefsOf(req.user);
    const b = req.body || {};
    const n = b.notify || {};
    const prefs = {
      mirror: typeof b.mirror === 'boolean' ? b.mirror : cur.mirror,
      spicy: typeof b.spicy === 'boolean' ? b.spicy : cur.spicy,
      showPiropos: typeof b.showPiropos === 'boolean' ? b.showPiropos : cur.showPiropos,
      notify: {
        calls: typeof n.calls === 'boolean' ? n.calls : cur.notify.calls,
        requests: typeof n.requests === 'boolean' ? n.requests : cur.notify.requests,
        online: typeof n.online === 'boolean' ? n.online : cur.notify.online,
      },
    };
    store.updateUser(req.user.id, { prefs });
    res.json({ ok: true, prefs });
  });
}

module.exports = {
  routes,
  setHooks: (h) => { if (h.onUnblock) onUnblock = h.onUnblock; if (h.onPasswordChanged) onPasswordChanged = h.onPasswordChanged; },
};
