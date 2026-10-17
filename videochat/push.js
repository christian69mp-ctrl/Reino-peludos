// Notificaciones del navegador (Web Push), siempre con permiso de la persona.
// Avisan aunque la web esté cerrada: llamadas de amigos, solicitudes de amistad y
// (si se activa) cuando un amigo se conecta. Se eligen en Mi cuenta → Notificaciones.
// Las claves VAPID se crean solas la primera vez (o VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY).

const crypto = require('crypto');
const webpush = require('web-push');
const store = require('./store');
const auth = require('./auth');

const SUBJECT = process.env.VAPID_SUBJECT || 'mailto:soporte@laruletacaliente.com';
let keys = process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
  ? { publicKey: process.env.VAPID_PUBLIC_KEY, privateKey: process.env.VAPID_PRIVATE_KEY }
  : store.get('settings', 'vapid');
if (!keys) {
  keys = webpush.generateVAPIDKeys();
  store.put('settings', { id: 'vapid', ...keys });
}
webpush.setVapidDetails(SUBJECT, keys.publicKey, keys.privateKey);

const TEXTS = {
  call: { es: '📞 {name} quiere hablar contigo', en: '📞 {name} wants to talk to you', pt: '📞 {name} quer falar com você', fr: '📞 {name} veut vous parler', de: '📞 {name} möchte mit dir sprechen', it: '📞 {name} vuole parlare con te' },
  callBody: { es: 'Entra para devolverle la llamada.', en: 'Come in to call back.', pt: 'Entre para retornar a chamada.', fr: 'Entrez pour le rappeler.', de: 'Komm rein, um zurückzurufen.', it: 'Entra per richiamare.' },
  request: { es: '{name} quiere ser tu amigo/a', en: '{name} wants to be your friend', pt: '{name} quer ser seu amigo/a', fr: '{name} veut être votre ami(e)', de: '{name} möchte mit dir befreundet sein', it: '{name} vuole essere tuo amico/a' },
  online: { es: '🟢 {name} está en línea', en: '🟢 {name} is online', pt: '🟢 {name} está online', fr: '🟢 {name} est en ligne', de: '🟢 {name} ist online', it: '🟢 {name} è online' },
  someone: { es: 'Alguien', en: 'Someone', pt: 'Alguém', fr: 'Quelqu’un', de: 'Jemand', it: 'Qualcuno' },
};
const tr = (key, lang, vars = {}) => {
  let s = TEXTS[key][lang] || TEXTS[key].en;
  for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
  return s;
};

const subId = (endpoint) => crypto.createHash('sha256').update(endpoint).digest('hex').slice(0, 32);
const subsOf = (userId) => store.list('pushsubs').filter((s) => s.userId === userId);
const hasPush = (userId) => subsOf(userId).length > 0;

async function send(userId, payload) {
  const subs = subsOf(userId);
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, JSON.stringify(payload), { TTL: 3600, urgency: 'high' });
    } catch (err) {
      // 404/410: la suscripción ya no existe (permiso retirado, navegador borrado…)
      if (err.statusCode === 404 || err.statusCode === 410) store.remove('pushsubs', s.id);
      else console.error('[avisos] no se pudo enviar:', err.statusCode || err.message);
    }
  }));
  return subs.length;
}

// Aviso de un tipo concreto, si la persona lo tiene activado
function notify(userId, type, fromUserId) {
  const user = store.getUser(userId);
  if (!user || !hasPush(userId)) return false;
  const prefs = auth.prefsOf(user).notify;
  const pref = { call: prefs.calls, request: prefs.requests, online: prefs.online }[type];
  if (!pref) return false;
  const from = store.getUser(fromUserId);
  const lang = user.lang || 'en';
  const name = from?.nick || tr('someone', lang);
  send(userId, {
    title: tr(type, lang, { name }),
    body: type === 'call' ? tr('callBody', lang) : '',
    url: type === 'online' || type === 'call' ? '/?contacts=friends' : '/?contacts=requests',
    tag: `${type}-${fromUserId}`,
  });
  return true;
}

// «X está en línea»: como mucho una vez cada 6 horas por amigo
const onlineSent = new Map();
function notifyOnline(userId, friendId) {
  const key = `${userId}:${friendId}`;
  const last = onlineSent.get(key) || 0;
  if (Date.now() - last < 6 * 3600 * 1000) return;
  if (notify(userId, 'online', friendId)) onlineSent.set(key, Date.now());
}

function routes(app) {
  app.get('/api/push/key', (_req, res) => res.json({ key: keys.publicKey }));

  app.post('/api/push/subscribe', auth.requireUser, (req, res) => {
    const sub = req.body?.subscription;
    const endpoint = String(sub?.endpoint || '');
    if (!/^https:\/\//.test(endpoint) || !sub.keys?.p256dh || !sub.keys?.auth) return res.status(400).json({ code: 'pushInvalid' });
    store.put('pushsubs', {
      id: subId(endpoint), userId: req.user.id, endpoint,
      keys: { p256dh: String(sub.keys.p256dh).slice(0, 200), auth: String(sub.keys.auth).slice(0, 100) },
      createdAt: Date.now(),
    });
    res.json({ ok: true });
  });

  app.post('/api/push/unsubscribe', auth.requireUser, (req, res) => {
    const id = subId(String(req.body?.endpoint || ''));
    const s = store.get('pushsubs', id);
    if (s && s.userId === req.user.id) store.remove('pushsubs', id);
    res.json({ ok: true });
  });

  // Prueba: el usuario se manda un aviso a sí mismo
  app.post('/api/push/test', auth.requireUser, async (req, res) => {
    const n = await send(req.user.id, { title: '🌶️ La Ruleta Caliente', body: '✅', url: '/', tag: 'test' });
    res.json({ ok: n > 0, devices: n });
  });
}

module.exports = { routes, notify, notifyOnline, hasPush, send };
