// Traducción de mensajes del chat.
//
// Proveedores (el primero que esté configurado):
// - DeepL:          DEEPL_API_KEY (las claves gratuitas terminan en ":fx")
// - LibreTranslate: LIBRETRANSLATE_URL (+ LIBRETRANSLATE_API_KEY si hace falta)
// Sin ninguno, el botón «Traducir» no aparece.

const { requireUser } = require('./auth');

const DEEPL_KEY = process.env.DEEPL_API_KEY;
const LIBRE_URL = process.env.LIBRETRANSLATE_URL?.replace(/\/$/, '');
const PROVIDER = DEEPL_KEY ? 'deepl' : LIBRE_URL ? 'libre' : null;
if (!PROVIDER) console.warn('[traducción] Sin DEEPL_API_KEY ni LIBRETRANSLATE_URL: la traducción del chat está desactivada.');

const MAX_LEN = 500;
const LANG_RE = /^[a-z]{2,3}$/;

// Variantes que pide DeepL para algunos idiomas
const DEEPL_TARGET = { en: 'EN-US', pt: 'PT-BR', zh: 'ZH-HANS' };

async function deepl(text, target) {
  const host = DEEPL_KEY.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com';
  const r = await fetch(`${host}/v2/translate`, {
    method: 'POST',
    headers: { Authorization: `DeepL-Auth-Key ${DEEPL_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: [text], target_lang: DEEPL_TARGET[target] || target.toUpperCase() }),
  });
  if (!r.ok) throw new Error(`DeepL HTTP ${r.status}`);
  const data = await r.json();
  return data.translations?.[0]?.text;
}

async function libre(text, target) {
  const r = await fetch(`${LIBRE_URL}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source: 'auto', target, format: 'text', api_key: process.env.LIBRETRANSLATE_API_KEY || undefined }),
  });
  if (!r.ok) throw new Error(`LibreTranslate HTTP ${r.status}`);
  return (await r.json()).translatedText;
}

// Caché pequeña: los mismos saludos se repiten mucho
const cache = new Map();
function remember(key, value) {
  cache.set(key, value);
  if (cache.size > 2000) cache.delete(cache.keys().next().value);
}

// Límite por usuario: 40 traducciones por minuto
const usage = new Map();
function limited(userId) {
  const now = Date.now();
  const u = usage.get(userId);
  if (!u || u.reset < now) { usage.set(userId, { n: 1, reset: now + 60000 }); return false; }
  u.n += 1;
  return u.n > 40;
}
setInterval(() => {
  const now = Date.now();
  for (const [id, u] of usage) if (u.reset < now) usage.delete(id);
}, 60000).unref();

function routes(app) {
  app.post('/api/translate', requireUser, async (req, res) => {
    if (!PROVIDER) return res.status(503).json({ code: 'translateOff' });
    const text = String(req.body?.text || '').trim().slice(0, MAX_LEN);
    const target = String(req.body?.target || '').toLowerCase();
    if (!text || !LANG_RE.test(target)) return res.status(400).json({ code: 'translateFailed' });
    if (limited(req.user.id)) return res.status(429).json({ code: 'tooMany' });

    const key = `${target}:${text}`;
    if (cache.has(key)) return res.json({ text: cache.get(key) });
    try {
      const translated = PROVIDER === 'deepl' ? await deepl(text, target) : await libre(text, target);
      if (!translated) throw new Error('respuesta vacía');
      remember(key, translated);
      res.json({ text: translated });
    } catch (err) {
      console.error('[traducción]', err.message);
      res.status(502).json({ code: 'translateFailed' });
    }
  });
}

module.exports = { routes, enabled: !!PROVIDER };
