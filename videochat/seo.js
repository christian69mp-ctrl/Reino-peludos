// Posicionamiento en buscadores: cada página tiene su dirección en cada idioma
// (/es/ayuda, /en/help, /fr/aide…) y el servidor la entrega ya traducida, con
// título, descripción, enlaces a las otras versiones (hreflang) y datos para Google.
// Las direcciones antiguas sin idioma (/ayuda) llevan a la del idioma del navegador.
const fs = require('fs');
const path = require('path');
const I18N = require('./public/i18n.js');
const stats = require('./stats');

const { STRINGS, PAGES, SUPPORTED, urlOf } = I18N;
const PUBLIC = path.join(__dirname, 'public');
const SITE = 'La Ruleta Caliente';

// Descripción para los resultados de búsqueda (máx. ~155 caracteres)
const DESCRIPTIONS = {
  home: {
    es: 'Videochat en vivo 1 a 1 con gente nueva de todo el mundo. Gratis, sin descargas, con chat traducido y comunidad moderada. Solo mayores de 18.',
    en: 'Live 1-on-1 video chat with new people from all over the world. Free, no downloads, translated chat and a moderated community. Adults 18+ only.',
    pt: 'Videochat ao vivo 1 a 1 com pessoas novas do mundo todo. Grátis, sem downloads, com chat traduzido e comunidade moderada. Só para maiores de 18.',
    fr: 'Chat vidéo en direct 1 à 1 avec de nouvelles personnes du monde entier. Gratuit, sans téléchargement, chat traduit et communauté modérée. Réservé aux 18+.',
    de: 'Live-Videochat 1:1 mit neuen Leuten aus aller Welt. Kostenlos, ohne Download, mit übersetztem Chat und moderierter Community. Nur ab 18.',
    it: 'Videochat dal vivo 1 a 1 con persone nuove da tutto il mondo. Gratis, senza download, chat tradotta e community moderata. Solo maggiorenni.',
  },
  help: {
    es: 'Centro de ayuda de La Ruleta Caliente: preguntas frecuentes sobre cámara, Premium, pagos, seguridad y cuenta, y Guindilla, el asistente que responde al momento.',
    en: 'La Ruleta Caliente help center: frequent questions about camera, Premium, payments, safety and your account, plus Guindilla, the assistant that answers at once.',
    pt: 'Central de ajuda da La Ruleta Caliente: perguntas frequentes sobre câmera, Premium, pagamentos, segurança e conta, e o Guindilla, o assistente que responde na hora.',
    fr: 'Centre d’aide de La Ruleta Caliente : questions fréquentes sur la caméra, Premium, les paiements, la sécurité et le compte, et Guindilla, l’assistant qui répond tout de suite.',
    de: 'Hilfe-Center von La Ruleta Caliente: häufige Fragen zu Kamera, Premium, Zahlungen, Sicherheit und Konto, dazu Guindilla, der Assistent, der sofort antwortet.',
    it: 'Centro assistenza di La Ruleta Caliente: domande frequenti su videocamera, Premium, pagamenti, sicurezza e account, e Guindilla, l’assistente che risponde subito.',
  },
  contact: {
    es: 'Escribe al equipo de La Ruleta Caliente: soporte, cuenta, pagos, privacidad, prensa o autoridades. Respondemos en unas 48 horas laborables.',
    en: 'Write to the La Ruleta Caliente team: support, account, billing, privacy, press or authorities. We reply within about 48 working hours.',
    pt: 'Escreva para a equipe da La Ruleta Caliente: suporte, conta, pagamentos, privacidade, imprensa ou autoridades. Respondemos em cerca de 48 horas úteis.',
    fr: 'Écrivez à l’équipe de La Ruleta Caliente : assistance, compte, paiements, confidentialité, presse ou autorités. Réponse sous 48 heures ouvrées environ.',
    de: 'Schreib dem Team von La Ruleta Caliente: Support, Konto, Zahlungen, Datenschutz, Presse oder Behörden. Wir antworten in etwa 48 Arbeitsstunden.',
    it: 'Scrivi al team di La Ruleta Caliente: assistenza, account, pagamenti, privacy, stampa o autorità. Rispondiamo in circa 48 ore lavorative.',
  },
  rules: {
    es: 'Normas de la comunidad de La Ruleta Caliente: qué está permitido, qué no, y qué pasa si alguien las incumple.',
    en: 'La Ruleta Caliente community rules: what is allowed, what is not, and what happens when someone breaks them.',
    pt: 'Regras da comunidade da La Ruleta Caliente: o que é permitido, o que não é e o que acontece se alguém as descumprir.',
    fr: 'Règles de la communauté de La Ruleta Caliente : ce qui est permis, ce qui ne l’est pas et ce qui se passe en cas de manquement.',
    de: 'Community-Regeln von La Ruleta Caliente: was erlaubt ist, was nicht und was bei Verstößen passiert.',
    it: 'Regole della community di La Ruleta Caliente: cosa è permesso, cosa no e cosa succede a chi non le rispetta.',
  },
  terms: {
    es: 'Términos y condiciones de uso de La Ruleta Caliente: cuenta, Premium, pagos, moderación y responsabilidades.',
    en: 'La Ruleta Caliente terms of use: account, Premium, payments, moderation and responsibilities.',
    pt: 'Termos de uso da La Ruleta Caliente: conta, Premium, pagamentos, moderação e responsabilidades.',
    fr: 'Conditions d’utilisation de La Ruleta Caliente : compte, Premium, paiements, modération et responsabilités.',
    de: 'Nutzungsbedingungen von La Ruleta Caliente: Konto, Premium, Zahlungen, Moderation und Verantwortung.',
    it: 'Termini di utilizzo di La Ruleta Caliente: account, Premium, pagamenti, moderazione e responsabilità.',
  },
  privacy: {
    es: 'Política de privacidad de La Ruleta Caliente: qué datos tratamos, para qué, cuánto tiempo y cómo ejercer tus derechos.',
    en: 'La Ruleta Caliente privacy policy: what data we process, why, for how long and how to exercise your rights.',
    pt: 'Política de privacidade da La Ruleta Caliente: que dados tratamos, para quê, por quanto tempo e como exercer seus direitos.',
    fr: 'Politique de confidentialité de La Ruleta Caliente : quelles données, pourquoi, combien de temps et comment exercer vos droits.',
    de: 'Datenschutzerklärung von La Ruleta Caliente: welche Daten, wofür, wie lange und wie du deine Rechte ausübst.',
    it: 'Informativa privacy di La Ruleta Caliente: quali dati trattiamo, perché, per quanto tempo e come esercitare i tuoi diritti.',
  },
  legal: {
    es: 'Aviso legal de La Ruleta Caliente: titular, contacto, punto de contacto para autoridades y avisos de contenido ilegal (DSA).',
    en: 'La Ruleta Caliente legal notice: owner, contact, point of contact for authorities and notices of illegal content (DSA).',
    pt: 'Aviso legal da La Ruleta Caliente: titular, contato, ponto de contato para autoridades e avisos de conteúdo ilegal (DSA).',
    fr: 'Mentions légales de La Ruleta Caliente : éditeur, contact, point de contact pour les autorités et signalements de contenus illicites (DSA).',
    de: 'Impressum von La Ruleta Caliente: Betreiber, Kontakt, Kontaktstelle für Behörden und Meldungen rechtswidriger Inhalte (DSA).',
    it: 'Note legali di La Ruleta Caliente: titolare, contatti, punto di contatto per le autorità e segnalazioni di contenuti illegali (DSA).',
  },
  refunds: {
    es: 'Política de cancelación y reembolsos de La Ruleta Caliente: cómo cancelar Premium y cuándo devolvemos el dinero.',
    en: 'La Ruleta Caliente cancellation and refund policy: how to cancel Premium and when we give your money back.',
    pt: 'Política de cancelamento e reembolso da La Ruleta Caliente: como cancelar o Premium e quando devolvemos o dinheiro.',
    fr: 'Politique d’annulation et de remboursement de La Ruleta Caliente : comment annuler Premium et quand nous remboursons.',
    de: 'Kündigungs- und Erstattungsrichtlinie von La Ruleta Caliente: wie du Premium kündigst und wann wir Geld zurückzahlen.',
    it: 'Politica di cancellazione e rimborso di La Ruleta Caliente: come annullare Premium e quando restituiamo i soldi.',
  },
  report: {
    es: 'Denuncia contenido ilegal en La Ruleta Caliente, aunque no tengas cuenta. Revisamos cada aviso y te informamos de la decisión.',
    en: 'Report illegal content on La Ruleta Caliente, even without an account. We review every notice and tell you what we decided.',
    pt: 'Denuncie conteúdo ilegal na La Ruleta Caliente, mesmo sem conta. Analisamos cada aviso e informamos a decisão.',
    fr: 'Signalez un contenu illicite sur La Ruleta Caliente, même sans compte. Nous examinons chaque signalement et vous informons de la décision.',
    de: 'Melde rechtswidrige Inhalte auf La Ruleta Caliente, auch ohne Konto. Wir prüfen jede Meldung und teilen dir die Entscheidung mit.',
    it: 'Segnala contenuti illegali su La Ruleta Caliente, anche senza account. Esaminiamo ogni segnalazione e ti comunichiamo la decisione.',
  },
  cookies: {
    es: 'Política de cookies de La Ruleta Caliente: solo usamos cookies y almacenamiento imprescindibles, sin publicidad ni rastreo. Lista completa y cómo borrarlos.',
    en: 'La Ruleta Caliente cookie policy: we only use strictly necessary cookies and storage, no ads or tracking. Full list and how to delete them.',
    pt: 'Política de cookies da La Ruleta Caliente: usamos apenas cookies e armazenamento indispensáveis, sem publicidade nem rastreamento. Lista completa e como apagá-los.',
    fr: 'Politique de cookies de La Ruleta Caliente : uniquement des cookies et du stockage indispensables, sans publicité ni pistage. Liste complète et suppression.',
    de: 'Cookie-Richtlinie von La Ruleta Caliente: nur unbedingt notwendige Cookies und Speicher, keine Werbung, kein Tracking. Vollständige Liste und Löschen.',
    it: 'Cookie policy di La Ruleta Caliente: solo cookie e memoria indispensabili, niente pubblicità né tracciamento. Elenco completo e come cancellarli.',
  },
  about: {
    es: 'Quiénes somos y cómo funciona La Ruleta Caliente: un videochat para adultos pensado para la privacidad, la seguridad y el respeto.',
    en: 'Who we are and how La Ruleta Caliente works: an adult video chat built around privacy, safety and respect.',
    pt: 'Quem somos e como funciona a La Ruleta Caliente: um videochat para adultos pensado para privacidade, segurança e respeito.',
    fr: 'Qui nous sommes et comment fonctionne La Ruleta Caliente : un chat vidéo pour adultes pensé pour la confidentialité, la sécurité et le respect.',
    de: 'Wer wir sind und wie La Ruleta Caliente funktioniert: ein Videochat für Erwachsene mit Fokus auf Privatsphäre, Sicherheit und Respekt.',
    it: 'Chi siamo e come funziona La Ruleta Caliente: una videochat per adulti pensata per privacy, sicurezza e rispetto.',
  },
};

const OG_LOCALE = { es: 'es_ES', en: 'en_US', pt: 'pt_BR', fr: 'fr_FR', de: 'de_DE', it: 'it_IT' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const t = (lang, key) => STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
const base = (req) => (process.env.BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/+$/, '');

// Sustituye el contenido de cada elemento que tiene el atributo indicado,
// teniendo en cuenta elementos del mismo tipo anidados dentro
function replaceInner(html, attr, fn) {
  const re = new RegExp(`<([a-zA-Z0-9]+)\\b[^>]*\\s${attr}="([^"]+)"[^>]*>`, 'g');
  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[1].toLowerCase();
    const start = m.index + m[0].length;
    const open = new RegExp(`<${tag}\\b|</${tag}\\s*>`, 'gi');
    open.lastIndex = start;
    let depth = 1;
    let o;
    while (depth && (o = open.exec(html))) depth += o[0][1] === '/' ? -1 : 1;
    if (!o) continue;
    out += html.slice(last, start) + fn(m[2]);
    last = o.index;
    re.lastIndex = o.index;
  }
  return out + html.slice(last);
}

function setAttr(tagHtml, name, value) {
  const re = new RegExp(`\\s${name}="[^"]*"`);
  const attr = ` ${name}="${esc(value)}"`;
  return re.test(tagHtml) ? tagHtml.replace(re, attr) : tagHtml.replace(/\s*\/?>$/, (end) => `${attr}${end}`);
}

function translate(html, lang) {
  html = html.replace(/<html lang="[^"]*"/, `<html lang="${lang}"`);
  html = replaceInner(html, 'data-i18n', (k) => esc(t(lang, k)));
  html = replaceInner(html, 'data-i18n-html', (k) => t(lang, k));
  html = html.replace(/<[a-z]+\b[^>]*\sdata-i18n-ph="([^"]+)"[^>]*>/g, (tag, k) => setAttr(tag, 'placeholder', t(lang, k)));
  html = html.replace(/<[a-z]+\b[^>]*\sdata-i18n-aria="([^"]+)"[^>]*>/g, (tag, k) => setAttr(setAttr(tag, 'aria-label', t(lang, k)), 'title', t(lang, k)));
  // Textos legales: solo se muestra el artículo del idioma
  html = html.replace(/<article class="doc-lang" lang="([a-z]+)"( hidden)?/g, (_x, l) => `<article class="doc-lang" lang="${l}"${l === lang ? '' : ' hidden'}`);
  // Enlaces internos a la versión del mismo idioma
  html = html.replace(/href="(\/[^"#?]*)([^"]*)"/g, (all, p, rest) => {
    const f = I18N.pageOf(p);
    if (!f) return all;
    return `href="${f.page === 'home' ? `/${lang}/` : urlOf(f.page, lang)}${rest}"`;
  });
  return html;
}

function titleOf(html, page, lang) {
  const key = (html.match(/<body[^>]*data-title-key="([^"]+)"/) || [])[1];
  if (key) return t(lang, key);
  const art = html.match(new RegExp(`<article class="doc-lang" lang="${lang}"[^>]*>[\\s\\S]*?<h1[^>]*>([\\s\\S]*?)</h1>`));
  return art ? `${art[1].replace(/<[^>]+>/g, '').trim()} · ${SITE}` : SITE;
}

function head(req, page, lang, title) {
  const b = base(req);
  const own = lang ? (page === 'home' ? `/${lang}/` : urlOf(page, lang)) : '/';
  const desc = DESCRIPTIONS[page][lang || 'en'];
  const alts = SUPPORTED.map((l) => `<link rel="alternate" hreflang="${l}" href="${b}${page === 'home' ? `/${l}/` : urlOf(page, l)}">`);
  alts.push(`<link rel="alternate" hreflang="x-default" href="${b}${page === 'home' ? '/' : urlOf(page, 'en')}">`);
  const ld = page === 'home'
    ? [{ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE, url: `${b}/`, inLanguage: SUPPORTED, description: desc },
      { '@context': 'https://schema.org', '@type': 'Organization', name: SITE, url: `${b}/`, logo: `${b}/icon-512.png`,
        contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer support', email: 'soporte@laruletacaliente.com', url: `${b}${urlOf('contact', lang || 'en')}`, availableLanguage: ['es', 'en'] }] }]
    : [{ '@context': 'https://schema.org', '@type': page === 'help' ? 'FAQPage' : 'WebPage', name: title, url: `${b}${own}`, inLanguage: lang || 'en',
      isPartOf: { '@type': 'WebSite', name: SITE, url: `${b}/` }, ...(page === 'help' ? { mainEntity: faqEntities(lang || 'en') } : {}) }];
  return [
    `<link rel="canonical" href="${b}${own}">`,
    ...alts,
    `<meta property="og:url" content="${b}${own}">`,
    `<meta property="og:locale" content="${OG_LOCALE[lang || 'en']}">`,
    ...SUPPORTED.filter((l) => l !== (lang || 'en')).map((l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}">`),
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
  ].join('\n  ');
}

// Preguntas frecuentes para Google (datos estructurados de la página de ayuda)
let faqCache = null;
function faqEntities(lang) {
  if (!faqCache) {
    const sandbox = { window: {} };
    try {
      new Function('window', fs.readFileSync(path.join(PUBLIC, 'faq-data.js'), 'utf8'))(sandbox.window);
      faqCache = sandbox.window.FAQ;
    } catch { faqCache = { items: [] }; }
  }
  return faqCache.items.map((it) => ({
    '@type': 'Question', name: it.q[lang] || it.q.en,
    acceptedAnswer: { '@type': 'Answer', text: it.a[lang] || it.a.en },
  }));
}

const cache = new Map();
function render(req, page, lang) {
  const k = `${page}|${lang}|${base(req)}`;
  if (cache.has(k) && process.env.NODE_ENV === 'production') return cache.get(k);
  let html = fs.readFileSync(path.join(PUBLIC, `${PAGES[page].file}.html`), 'utf8');
  if (lang) html = translate(html, lang);
  const title = titleOf(html, page, lang || 'en');
  const desc = DESCRIPTIONS[page][lang || 'en'];
  if (lang) {
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
    html = html.replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(title)}"`);
    html = html.replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(desc)}"`);
  }
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`);
  html = html.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g, '');
  html = html.replace('</head>', `  ${head(req, page, lang, title)}\n</head>`);
  cache.set(k, html);
  return html;
}

function preferred(req) {
  return (req.get('accept-language') && req.acceptsLanguages(...SUPPORTED)) || 'en';
}

function send(req, res, page, lang) {
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.set('Cache-Control', 'no-cache');
  if (req.method === 'GET') stats.pageView(req, page, lang || preferred(req));
  res.send(render(req, page, lang));
}

function register(app) {
  const langs = SUPPORTED.join('|');
  // Portada sin idioma: la web elige el idioma del navegador
  app.get(['/', '/index.html'], (req, res) => send(req, res, 'home', null));
  app.get(new RegExp(`^/(${langs})/?$`), (req, res) => {
    if (!req.path.endsWith('/')) return res.redirect(301, `/${req.params[0]}/${req.url.slice(req.path.length)}`);
    send(req, res, 'home', req.params[0]);
  });
  app.get(new RegExp(`^/(${langs})/([a-z-]+)/?$`), (req, res, next) => {
    const lang = req.params[0];
    const page = Object.keys(PAGES).find((p) => p !== 'home' && PAGES[p][lang] === req.params[1]);
    if (!page) return next();
    send(req, res, page, lang);
  });
  // Direcciones antiguas sin idioma (/ayuda, /terminos.html): a la del idioma del navegador
  const legacy = Object.keys(PAGES).filter((p) => p !== 'home');
  app.get(legacy.flatMap((p) => [`/${PAGES[p].file}`, `/${PAGES[p].file}.html`]), (req, res) => {
    const page = legacy.find((p) => req.path.replace(/\.html$/, '') === `/${PAGES[p].file}`);
    res.set('Vary', 'Accept-Language');
    res.redirect(302, urlOf(page, preferred(req)) + req.url.slice(req.path.length));
  });

  app.get('/sitemap.xml', (req, res) => {
    const b = base(req);
    const urls = Object.keys(PAGES).flatMap((page) => SUPPORTED.map((l) => {
      const loc = page === 'home' ? `/${l}/` : urlOf(page, l);
      const alts = SUPPORTED.map((x) => `<xhtml:link rel="alternate" hreflang="${x}" href="${b}${page === 'home' ? `/${x}/` : urlOf(page, x)}"/>`).join('');
      return `<url><loc>${b}${loc}</loc>${alts}<changefreq>${page === 'home' || page === 'help' ? 'weekly' : 'monthly'}</changefreq><priority>${page === 'home' ? '1.0' : page === 'help' ? '0.8' : '0.5'}</priority></url>`;
    }));
    res.type('application/xml').set('Cache-Control', 'public, max-age=3600')
      .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);
  });
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /api/\nDisallow: /auth/\n\nSitemap: ${base(req)}/sitemap.xml\n`);
  });
}

module.exports = { register, render, DESCRIPTIONS };
