// Páginas de aterrizaje para buscadores (estrategia «tipo Booking»): un índice por tema y,
// colgando de él, páginas concretas para cada búsqueda real (por país, por tema y
// «alternativa a…»), enlazadas entre sí. El texto de cada página está en seo/content/<idioma>.js.
const COUNTRIES = {
  es: ['es', 'mx', 'ar', 'co', 'cl', 'pe', 've', 'ec'],
  en: ['us', 'gb', 'ca', 'au', 'ie', 'nz'],
  pt: ['br', 'pt'],
  fr: ['fr', 'be', 'ch', 'ca'],
  de: ['de', 'at', 'ch'],
  it: ['it', 'ch'],
};

// Marcas de otras webs: solo se nombran para comparar (aviso de marca en la página)
const BRANDS = {
  'alt-omegle': 'Omegle',
  'alt-chatroulette': 'Chatroulette',
  'alt-dirtyroulette': 'DirtyRoulette',
  'alt-coomeet': 'CooMeet',
  'alt-ometv': 'OmeTV',
  'alt-chatrandom': 'Chatrandom',
};

const BASE = [
  { key: 'free-video-chat', type: 'hub' },
  { key: 'random-video-chat', type: 'topic', parent: 'free-video-chat' },
  { key: 'adult-video-chat', type: 'topic', parent: 'free-video-chat' },
  { key: 'talk-to-strangers', type: 'topic', parent: 'free-video-chat' },
  { key: 'video-chat-women', type: 'topic', parent: 'free-video-chat' },
  { key: 'mobile-video-chat', type: 'topic', parent: 'free-video-chat' },
  { key: 'alternatives', type: 'hub' },
  ...Object.keys(BRANDS).map((key) => ({ key, type: 'alternative', parent: 'alternatives', brand: BRANDS[key] })),
];

// Lista completa de páginas con los idiomas en que existe cada una
const LANGS = Object.keys(COUNTRIES);
const PAGES = [
  ...BASE.map((p) => ({ ...p, langs: LANGS })),
  ...[...new Set(Object.values(COUNTRIES).flat())].map((cc) => ({
    key: `country-${cc}`, type: 'country', parent: 'free-video-chat', country: cc,
    langs: LANGS.filter((l) => COUNTRIES[l].includes(cc)),
  })),
];

module.exports = { COUNTRIES, BRANDS, PAGES, LANGS };
