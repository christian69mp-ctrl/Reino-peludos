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
// Fecha de las guías para Google (súbela cuando se revisen los textos)
const GUIDES_DATE = '2026-10-27';

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
  games: {
    es: 'Guía de juegos de La Ruleta Caliente: Verdad o reto, Dibujo y adivina, piropos, termómetro de química, guindillas, insignias y superpoderes.',
    en: 'La Ruleta Caliente games guide: Truth or dare, Draw & guess, compliments, chemistry meter, chilis, badges and superpowers.',
    pt: 'Guia de jogos da La Ruleta Caliente: Verdade ou desafio, Desenhe e adivinhe, cantadas, termômetro de química, pimentas, insígnias e superpoderes.',
    fr: 'Guide des jeux de La Ruleta Caliente : Action ou vérité, Dessine et devine, mots doux, thermomètre, piments, badges et superpouvoirs.',
    de: 'Spiele-Guide von La Ruleta Caliente: Wahrheit oder Pflicht, Zeichnen & Raten, Komplimente, Chemie-Thermometer, Chilis, Abzeichen und Superkräfte.',
    it: 'Guida ai giochi di La Ruleta Caliente: Obbligo o verità, Disegna e indovina, complimenti, termometro dell’intesa, peperoncini, badge e superpoteri.',
  },
  how: {
    es: 'Cómo funciona La Ruleta Caliente: empieza gratis en 3 pasos, chat traducido, juegos, guindillas, superpoderes, Gratis o Premium y seguridad.',
    en: 'How La Ruleta Caliente works: start free in 3 steps, translated chat, games, chilis, superpowers, Free vs Premium and safety.',
    pt: 'Como funciona a La Ruleta Caliente: comece grátis em 3 passos, chat traduzido, jogos, pimentas, superpoderes, Grátis ou Premium e segurança.',
    fr: 'Comment marche La Ruleta Caliente : commence gratuitement en 3 étapes, chat traduit, jeux, piments, superpouvoirs, Gratuit ou Premium et sécurité.',
    de: 'So funktioniert La Ruleta Caliente: kostenlos starten in 3 Schritten, übersetzter Chat, Spiele, Chilis, Superkräfte, Kostenlos vs. Premium, Sicherheit.',
    it: 'Come funziona La Ruleta Caliente: inizia gratis in 3 passi, chat tradotta, giochi, peperoncini, superpoteri, Gratis o Premium e sicurezza.',
  },
  safety: {
    es: 'Consejos de seguridad en La Ruleta Caliente: protege tu identidad, evita la sextorsión y las estafas, denuncia a menores y usa tus herramientas.',
    en: 'Safety tips for La Ruleta Caliente: protect your identity, avoid sextortion and scams, report minors and use your safety tools.',
    pt: 'Dicas de segurança na La Ruleta Caliente: proteja sua identidade, evite sextorsão e golpes, denuncie menores e use suas ferramentas.',
    fr: 'Conseils de sécurité sur La Ruleta Caliente : protège ton identité, évite la sextorsion et les arnaques, signale les mineurs et utilise tes outils.',
    de: 'Sicherheitstipps für La Ruleta Caliente: schütze deine Identität, erkenne Sextortion und Betrug, melde Minderjährige und nutze deine Werkzeuge.',
    it: 'Consigli di sicurezza su La Ruleta Caliente: proteggi la tua identità, evita sextortion e truffe, segnala i minori e usa i tuoi strumenti.',
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

// ===================== Páginas de aterrizaje (estrategia «tipo Booking») =====================
// Índices por tema (videochat gratis, alternativas) y páginas concretas por búsqueda (país, tema,
// «alternativa a…»), todas enlazadas entre sí, con migas de pan, preguntas frecuentes y datos
// estructurados. Textos en seo/content/<idioma>.js (ver seo/CONTENT-SPEC.md).
const LANDINGS = require('./seo/landings');
const LANDING_TPL = path.join(__dirname, 'seo', 'landing.html');
const LINK_PAGES = { home: 'home', help: 'help', how: 'how', games: 'games', safety: 'safety', rules: 'rules' };

const content = {};
for (const l of SUPPORTED) {
  try { content[l] = require(`./seo/content/${l}.js`); } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') console.warn(`[seo] seo/content/${l}.js no se pudo cargar: ${e.message}`);
  }
}
const landing = (key) => LANDINGS.PAGES.find((p) => p.key === key);
const has = (key, l) => !!content[l]?.pages?.[key] && landing(key)?.langs.includes(l);
const landingUrl = (key, l) => `/${l}/${content[l].pages[key].slug}`;
const landingLangs = (key) => SUPPORTED.filter((l) => has(key, l));
const bySlug = (l, slug) => Object.keys(content[l]?.pages || {}).find((k) => has(k, l) && content[l].pages[k].slug === slug);

// Enlaces del texto: href="@clave" → dirección del idioma
const linkOf = (ref, l) => {
  if (LINK_PAGES[ref]) return ref === 'home' ? `/${l}/` : urlOf(LINK_PAGES[ref], l);
  return has(ref, l) ? landingUrl(ref, l) : null;
};
const resolveLinks = (html, l) => html.replace(/href="@([a-z0-9-]+)"/g, (all, ref) => `href="${linkOf(ref, l) || `/${l}/`}"`);

function landingLinks(keys, l) {
  const items = keys.filter((k) => has(k, l)).map((k) => `<li><a href="${landingUrl(k, l)}">${esc(content[l].pages[k].anchor)}</a></li>`);
  return items.length ? `<ul class="lp-links">${items.join('')}</ul>` : '';
}
const childrenOf = (parent, type) => LANDINGS.PAGES.filter((p) => p.parent === parent && (!type || p.type === type)).map((p) => p.key);

function landingBody(key, l) {
  const c = content[l].common;
  const p = content[l].pages[key];
  const meta = landing(key);
  const crumbs = [[c.home, `/${l}/`]];
  if (meta.parent && has(meta.parent, l)) crumbs.push([content[l].pages[meta.parent].anchor, landingUrl(meta.parent, l)]);
  const out = [];
  out.push(`<nav class="lp-crumbs" aria-label="breadcrumb"><ol>${crumbs.map(([n, u]) => `<li><a href="${u}">${esc(n)}</a></li>`).join('')}<li aria-current="page">${esc(p.anchor)}</li></ol></nav>`);
  out.push(`<h1>${esc(p.h1)}</h1>`, `<div class="lp-intro">${resolveLinks(p.intro, l)}</div>`);
  const cta = `<div class="lp-cta"><div><strong>${esc(c.ctaTitle)}</strong><p>${esc(c.ctaText)}</p></div><a class="btn primary" href="/${l}/">${esc(c.ctaButton)}</a><small>🔞 ${esc(c.adultNote)}</small></div>`;
  out.push(cta);
  for (const s of p.sections || []) out.push(`<h2>${esc(s.h2)}</h2>`, resolveLinks(s.html, l));
  // Índices: todas las páginas que cuelgan de ellos
  if (meta.type === 'hub') {
    if (key === 'free-video-chat') {
      out.push(`<h2>${esc(c.topics)}</h2>`, landingLinks(childrenOf(key, 'topic'), l));
      out.push(`<h2>${esc(c.countries)}</h2>`, landingLinks(childrenOf(key, 'country'), l));
    } else out.push(`<h2>${esc(key === 'guides' ? c.guides : c.alternatives)}</h2>`, landingLinks(childrenOf(key), l));
  }
  if (p.faq?.length) {
    out.push(`<h2>${esc(c.faq)}</h2>`, `<div class="lp-faq">${p.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div>`);
  }
  out.push(cta.replace('lp-cta', 'lp-cta end'));
  // Enlaces relacionados: hermanas, índice y el otro índice
  if (meta.type !== 'hub') {
    const siblings = childrenOf(meta.parent, meta.type).filter((k) => k !== key);
    const extra = meta.type === 'alternative' ? ['free-video-chat', 'random-video-chat'] : meta.type === 'country' ? ['random-video-chat', 'alternatives'] : meta.type === 'guide' ? ['free-video-chat', 'no-signup-video-chat'] : ['alternatives', 'guides', ...childrenOf('free-video-chat', 'country').slice(0, 3)];
    out.push(`<aside class="lp-related"><h2>${esc(c.related)}</h2>${landingLinks([meta.parent, ...siblings, ...extra], l)}</aside>`);
  } else {
    const other = { alternatives: ['free-video-chat', 'guides'], guides: ['free-video-chat', 'alternatives'] }[key] || ['alternatives', 'guides'];
    out.push(`<aside class="lp-related"><h2>${esc(c.related)}</h2>${landingLinks(other, l)}</aside>`);
  }
  if (meta.brand) out.push(`<p class="lp-disclaimer">${esc(c.disclaimer.replace(/\{brand\}/g, meta.brand))}</p>`);
  return { html: out.join('\n'), crumbs };
}

function landingHead(req, key, l, crumbs) {
  const b = base(req);
  const p = content[l].pages[key];
  const meta = landing(key);
  const own = `${b}${landingUrl(key, l)}`;
  const langs = landingLangs(key);
  const alts = langs.map((x) => `<link rel="alternate" hreflang="${x}" href="${b}${landingUrl(key, x)}">`);
  const def = langs.includes('en') ? 'en' : langs[0];
  alts.push(`<link rel="alternate" hreflang="x-default" href="${b}${landingUrl(key, def)}">`);
  const ld = [
    { '@context': 'https://schema.org', '@type': meta.type === 'hub' ? 'CollectionPage' : 'WebPage', name: p.title, description: p.description, url: own, inLanguage: l,
      isPartOf: { '@type': 'WebSite', name: SITE, url: `${b}/` } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [...crumbs, [p.anchor, landingUrl(key, l)]].map(([name, u], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${b}${u}` })) },
  ];
  if (meta.type === 'guide') {
    ld.push({ '@context': 'https://schema.org', '@type': 'Article', headline: p.h1, description: p.description, inLanguage: l, url: own,
      image: `${b}/og-image.jpg`, datePublished: GUIDES_DATE, dateModified: GUIDES_DATE,
      author: { '@type': 'Organization', name: SITE, url: `${b}/` }, publisher: { '@type': 'Organization', name: SITE, logo: { '@type': 'ImageObject', url: `${b}/logo-full.png` } },
      mainEntityOfPage: own });
  }
  if (p.faq?.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: p.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });
  return [
    `<link rel="canonical" href="${own}">`, ...alts,
    `<meta property="og:type" content="${meta.type === 'guide' ? 'article' : 'website'}">`,
    `<meta property="og:title" content="${esc(p.title)}">`, `<meta property="og:description" content="${esc(p.description)}">`,
    `<meta property="og:url" content="${own}">`, `<meta property="og:image" content="${b}/og-image.jpg">`,
    '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">',
    `<meta property="og:site_name" content="${SITE}">`, `<meta property="og:locale" content="${OG_LOCALE[l]}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
  ].join('\n  ');
}

function renderLanding(req, key, l) {
  const k = `landing|${key}|${l}|${base(req)}`;
  if (cache.has(k) && process.env.NODE_ENV === 'production') return cache.get(k);
  const p = content[l].pages[key];
  const { html: body, crumbs } = landingBody(key, l);
  let html = translate(fs.readFileSync(LANDING_TPL, 'utf8'), l).replace('<!--LANDING-->', body);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(p.title)}</title>`)
    .replace('<meta name="description" content="">', `<meta name="description" content="${esc(p.description)}">`);
  html = html.replace('</head>', `  <meta name="rating" content="adult">\n  <meta name="RATING" content="RTA-5042-1996-1400-1577-RTA">\n  ${landingHead(req, key, l, crumbs)}\n</head>`);
  html = addFooterLinks(html, l);
  cache.set(k, html);
  return html;
}

// Bloque de enlaces al pie de TODAS las páginas: así Google llega a todas las de aterrizaje
function addFooterLinks(html, l) {
  const c = content[l]?.common;
  if (!c || !html.includes('<p class="footer-legal">')) return html;
  const groups = [
    ['free-video-chat', ...childrenOf('free-video-chat', 'topic')],
    childrenOf('free-video-chat', 'country'),
    ['alternatives', ...childrenOf('alternatives')],
    ['guides', ...childrenOf('guides')],
  ].map((keys) => keys.filter((k) => has(k, l)).map((k) => `<a href="${landingUrl(k, l)}">${esc(content[l].pages[k].anchor)}</a>`).join(''));
  const block = `<nav class="footer-seo" aria-label="${esc(c.footerTitle)}"><p class="footer-seo-title">${esc(c.footerTitle)}</p>${groups.filter(Boolean).map((g) => `<div>${g}</div>`).join('')}</nav>\n    `;
  return html.replace('<p class="footer-legal">', `${block}<p class="footer-legal">`);
}
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
  // Vista previa al compartir el enlace (WhatsApp, Telegram, X…) en todas las páginas
  if (!html.includes('og:image')) {
    html = html.replace('</head>', [
      '<meta property="og:type" content="website">',
      `<meta property="og:title" content="${esc(title)}">`,
      `<meta property="og:description" content="${esc(desc)}">`,
      `<meta property="og:image" content="${base(req)}/og-image.jpg">`,
      '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">',
      `<meta property="og:site_name" content="${SITE}">`, '<meta name="twitter:card" content="summary_large_image">',
    ].map((m) => `  ${m}\n`).join('') + '</head>');
  }
  // Aviso a Google (SafeSearch) y a los filtros parentales de que es una web para adultos, y verificación de Search Console / Bing
  const extra = [];
  if (!html.includes('name="rating"')) extra.push('<meta name="rating" content="adult">');
  // Etiqueta RTA («Restricted To Adults»): la reconocen los filtros parentales
  if (!html.includes('RTA-5042')) extra.push('<meta name="RATING" content="RTA-5042-1996-1400-1577-RTA">');
  if (process.env.GOOGLE_SITE_VERIFICATION) extra.push(`<meta name="google-site-verification" content="${esc(process.env.GOOGLE_SITE_VERIFICATION)}">`);
  if (process.env.BING_SITE_VERIFICATION) extra.push(`<meta name="msvalidate.01" content="${esc(process.env.BING_SITE_VERIFICATION)}">`);
  if (extra.length) html = html.replace('</head>', `  ${extra.join('\n  ')}\n</head>`);
  html = html.replace('</head>', `  ${head(req, page, lang, title)}\n</head>`);
  html = addFooterLinks(html, lang || 'en');
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
  // Páginas de aterrizaje (/es/videochat-gratis, /en/omegle-alternative…)
  app.get(new RegExp(`^/(${langs})/([a-z0-9-]+)/?$`), (req, res, next) => {
    const lang = req.params[0];
    const key = bySlug(lang, req.params[1]);
    if (!key) return next();
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'no-cache');
    if (req.method === 'GET') stats.pageView(req, 'landing', lang);
    res.send(renderLanding(req, key, lang));
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
    for (const p of LANDINGS.PAGES) {
      const langs = landingLangs(p.key);
      const alts = langs.map((x) => `<xhtml:link rel="alternate" hreflang="${x}" href="${b}${landingUrl(p.key, x)}"/>`).join('');
      for (const l of langs) urls.push(`<url><loc>${b}${landingUrl(p.key, l)}</loc>${alts}<changefreq>monthly</changefreq><priority>${p.type === 'hub' ? '0.9' : '0.7'}</priority></url>`);
    }
    res.type('application/xml').set('Cache-Control', 'public, max-age=3600')
      .send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`);
  });
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /api/\nDisallow: /auth/\n\nSitemap: ${base(req)}/sitemap.xml\n`);
  });
}

// Todas las direcciones públicas (las mismas del sitemap), para avisar a Bing con IndexNow
function allUrls(b) {
  const out = Object.keys(PAGES).flatMap((page) => SUPPORTED.map((l) => `${b}${page === 'home' ? `/${l}/` : urlOf(page, l)}`));
  for (const p of LANDINGS.PAGES) for (const l of landingLangs(p.key)) out.push(`${b}${landingUrl(p.key, l)}`);
  return out;
}

module.exports = { register, render, renderLanding, allUrls, DESCRIPTIONS };
