// Comprueba un archivo de seo/content/<idioma>.js:  node seo/check-content.js es
const path = require('path');
const I18N = require('../public/i18n.js');
const { PAGES } = require('./landings');

const lang = process.argv[2];
if (!lang) { console.error('Uso: node seo/check-content.js <idioma>'); process.exit(1); }
const file = path.join(__dirname, 'content', `${lang}.js`);
const data = require(file);
const errors = [];
const warns = [];
const err = (m) => errors.push(m);

const COMMON = ['home', 'related', 'countries', 'topics', 'alternatives', 'faq', 'ctaTitle', 'ctaText', 'ctaButton', 'adultNote', 'disclaimer', 'footerTitle', 'guides'];
for (const k of COMMON) if (!data.common?.[k]) err(`common.${k} falta`);
if (PAGES.some((p) => p.type === 'city' && p.langs.includes(lang)) && !data.common?.cities) err('common.cities falta');
if (data.common?.disclaimer && !data.common.disclaimer.includes('{brand}')) err('common.disclaimer debe incluir {brand}');

const expected = PAGES.filter((p) => p.langs.includes(lang)).map((p) => p.key);
const got = Object.keys(data.pages || {});
for (const k of expected) if (!got.includes(k)) err(`falta la página ${k}`);
for (const k of got) if (!expected.includes(k)) err(`página que no está en la lista: ${k}`);

const reserved = new Set(Object.keys(I18N.PAGES).map((p) => I18N.PAGES[p][lang]).filter(Boolean));
const slugs = new Map();
const LINKS = new Set(['home', 'help', 'how', 'games', 'safety', 'rules', ...expected]);
const ALLOWED = new Set(['p', 'ul', 'ol', 'li', 'strong', 'em', 'h3', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'br']);
const words = (html) => html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const sentences = new Map();

for (const [key, p] of Object.entries(data.pages || {})) {
  const at = (m) => err(`${key}: ${m}`);
  for (const f of ['slug', 'anchor', 'title', 'description', 'h1', 'intro']) if (!p[f]) at(`falta ${f}`);
  if (p.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) at(`slug no válido: ${p.slug}`);
  if (reserved.has(p.slug)) at(`slug ocupado: ${p.slug}`);
  if (slugs.has(p.slug)) at(`slug repetido con ${slugs.get(p.slug)}`);
  slugs.set(p.slug, key);
  if (p.title && p.title.length > 60) at(`title de ${p.title.length} caracteres (máx. 60)`);
  if (p.description && (p.description.length < 120 || p.description.length > 160)) at(`description de ${p.description.length} caracteres (120-160)`);
  if (!Array.isArray(p.sections) || p.sections.length < 3 || p.sections.length > 7) at('sections: entre 3 y 7');
  if (!Array.isArray(p.faq) || p.faq.length < 3 || p.faq.length > 6) at('faq: entre 3 y 6');
  for (const q of p.faq || []) { if (!q.q || !q.a) at('pregunta sin q o a'); if (/<[a-z]/i.test(q.a || '')) at('respuesta de la FAQ con HTML'); }
  const html = [p.intro || '', ...(p.sections || []).map((s) => { if (!s.h2 || !s.html) at('sección sin h2 o html'); return s.html || ''; })].join(' ');
  for (const m of html.matchAll(/<\/?([a-z0-9]+)([^>]*)>/gi)) {
    const tag = m[1].toLowerCase();
    if (!ALLOWED.has(tag)) at(`etiqueta no permitida <${tag}>`);
    if (tag === 'a' && !m[0].startsWith('</')) {
      const href = (m[2].match(/href="([^"]*)"/) || [])[1];
      if (!href || !href.startsWith('@') || !LINKS.has(href.slice(1))) at(`enlace no válido: ${href}`);
      if (/\s(?!href=)[a-z-]+=/.test(m[2])) at('el enlace solo puede llevar href');
    } else if (m[2].trim() && !m[0].startsWith('</')) at(`atributos no permitidos en <${tag}>`);
  }
  const n = words(html);
  const guide = PAGES.find((x) => x.key === key)?.type === 'guide';
  // Las páginas principales (videochat gratis / con chicas) pueden ser más largas
  const main = ['free-video-chat', 'video-chat-women'].includes(key);
  const [min, lo, hi] = guide ? [800, 900, 1900] : main ? [400, 450, 1300] : [400, 450, 850];
  if (n < min) at(`solo ${n} palabras (mínimo ${lo})`);
  else if (n < lo || n > hi) warns.push(`${key}: ${n} palabras (objetivo ${lo}-${hi})`);
  for (const s of html.replace(/<[^>]+>/g, ' ').split(/(?<=[.!?])\s+/)) {
    const t = s.trim();
    if (t.length < 90) continue;
    if (sentences.has(t) && sentences.get(t) !== key) warns.push(`frase repetida en ${key} y ${sentences.get(t)}: «${t.slice(0, 60)}…»`);
    else sentences.set(t, key);
  }
}

warns.forEach((w) => console.log('AVISO', w));
errors.forEach((e) => console.log('ERROR', e));
console.log(errors.length ? `${errors.length} errores` : `OK: ${got.length} páginas`);
process.exit(errors.length ? 1 : 0);
