// Guindilla 🌶️: el asistente automático del centro de ayuda.
// Responde con las preguntas frecuentes de faq-data.js (6 idiomas), buscando las
// palabras clave de lo que escribe la persona. No es una persona ni usa IA:
// si no encuentra respuesta, sugiere otras preguntas o la página de contacto.
(function () {
  const { t } = window.I18N;
  const lang = () => window.I18N.lang;
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s+]/g, ' ').replace(/\s+/g, ' ').trim();
  const GREET = ['hola', 'buenas', 'hey', 'hi', 'hello', 'ola', 'oi', 'salut', 'bonjour', 'hallo', 'ciao', 'buongiorno', 'buenos dias'];
  const THANKS = ['gracias', 'thanks', 'thank you', 'thx', 'obrigad', 'merci', 'danke', 'grazie', 'genial', 'perfecto', 'ok gracias'];
  const POPULAR = ['how-start', 'camera-not-working', 'premium-includes', 'cancel-subscription', 'report-in-chat', 'switch-camera'];

  // Guindilla dibujada: una guindilla con cara y brazos. Se anima con CSS (sin sonido):
  // aparece con un rebote, saluda con la mano, parpadea y mueve la boca al responder.
  const MASCOT = `
<svg class="gl-mascot" viewBox="0 0 120 140" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="glBody" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5a5f"/><stop offset=".55" stop-color="#e8283f"/><stop offset="1" stop-color="#b3122f"/></linearGradient>
    <linearGradient id="glLeaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7be06a"/><stop offset="1" stop-color="#2f9e44"/></linearGradient>
  </defs>
  <g class="gl-all">
    <path d="M33 66 Q20 72 24 84" fill="none" stroke="#b3122f" stroke-width="6" stroke-linecap="round"/>
    <circle cx="24" cy="85" r="5" fill="#e8283f"/>
    <path d="M34 36 C44 26 76 26 86 38 C96 54 92 84 80 104 C70 122 54 132 40 130 C34 129 34 123 40 121 C56 116 60 100 56 88 C40 80 26 56 34 36 Z" fill="url(#glBody)"/>
    <path d="M44 40 C50 36 58 35 64 37" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/>
    <path d="M40 34 C46 24 74 24 80 34 C72 38 66 34 60 36 C54 34 48 38 40 34 Z" fill="url(#glLeaf)"/>
    <path d="M60 30 C60 20 64 12 74 8" fill="none" stroke="#2f9e44" stroke-width="5" stroke-linecap="round"/>
    <g class="gl-eyes">
      <ellipse cx="50" cy="56" rx="7" ry="8" fill="#fff"/><ellipse cx="72" cy="56" rx="7" ry="8" fill="#fff"/>
      <g class="gl-pupils"><circle cx="52" cy="57" r="3.6" fill="#2a1420"/><circle cx="74" cy="57" r="3.6" fill="#2a1420"/>
      <circle cx="53.4" cy="55.4" r="1.2" fill="#fff"/><circle cx="75.4" cy="55.4" r="1.2" fill="#fff"/></g>
    </g>
    <path class="gl-brows" d="M44 45 Q50 42 55 45 M67 45 Q72 42 78 45" fill="none" stroke="#7a0f22" stroke-width="2.2" stroke-linecap="round"/>
    <ellipse cx="44" cy="68" rx="5" ry="3" fill="#ff9aa8" opacity=".7"/><ellipse cx="80" cy="68" rx="5" ry="3" fill="#ff9aa8" opacity=".7"/>
    <path class="gl-smile" d="M53 68 Q61 77 70 68" fill="none" stroke="#5a0b1b" stroke-width="3" stroke-linecap="round"/>
    <path class="gl-talk" d="M54 68 Q61 81 69 68 Z" fill="#5a0b1b"/>
    <g class="gl-arm-r">
      <path d="M86 58 Q98 50 100 38" fill="none" stroke="#b3122f" stroke-width="6" stroke-linecap="round"/>
      <circle cx="100" cy="36" r="5.5" fill="#e8283f"/>
    </g>
  </g>
</svg>`;
  // Gestos: wave (saludar), talk (hablar) y pop (aparecer). Se quitan solos al terminar.
  function gesture(el, name, ms) {
    if (!el) return;
    el.classList.remove(name);
    void el.getBoundingClientRect(); // reinicia la animación si ya estaba
    el.classList.add(name);
    clearTimeout(el[`_${name}`]);
    el[`_${name}`] = setTimeout(() => el.classList.remove(name), ms);
  }

  let faq = window.FAQ || null;
  function loadFaq() {
    if (faq) return Promise.resolve(faq);
    return new Promise((resolve) => {
      const sc = document.createElement('script');
      sc.src = '/faq-data.js';
      sc.onload = () => { faq = window.FAQ; resolve(faq); };
      sc.onerror = () => resolve(null);
      document.head.appendChild(sc);
    });
  }

  const pick = (obj) => obj?.[lang()] ?? obj?.en ?? '';

  // Puntuación de cada pregunta: palabras clave que aparecen (en cualquier idioma,
  // con más peso las del idioma de la web; cada palabra cuenta una sola vez aunque
  // se repita en varios idiomas) y palabras compartidas con la pregunta
  const stem = (w) => w.slice(0, Math.max(4, w.length - 2));
  // Palabras demasiado comunes para fijarse en ellas
  const STOP = new Set(['como', 'cuando', 'donde', 'quiero', 'puedo', 'tengo', 'para', 'pero', 'porque', 'esta', 'este', 'what', 'when', 'where', 'want', 'have', 'with', 'that', 'this', 'from', 'your', 'como', 'quero', 'posso', 'tenho', 'comment', 'quand', 'veux', 'peux', 'avec', 'pour', 'dans', 'wie', 'wann', 'kann', 'mein', 'meine', 'ich', 'nicht', 'habe', 'come', 'quando', 'voglio', 'posso', 'perche', 'sono', 'della']);
  function search(text) {
    const q = ` ${norm(text)} `;
    const all = q.trim().split(' ');
    const words = new Set(all.filter((w) => w.length >= 4 && !STOP.has(w)));
    // Palabra parecida (plurales, verbos conjugados): «camaras» ~ «camara», «borro» ~ «borrar»
    const like = (k) => k.length >= 4 && [...words].some((w) => w.length >= 4 && (w.startsWith(stem(k)) || k.startsWith(stem(w))));
    return faq.items.map((it) => {
      const best = new Map();
      for (const [l, keys] of Object.entries(it.k)) {
        for (const k of keys) {
          const nk = norm(k);
          if (!nk) continue;
          const multi = nk.includes(' ');
          let pts = 0;
          if (q.includes(` ${nk} `) || (nk.length >= 5 && q.includes(nk))) pts = (l === lang() ? 3 : 2) + (multi ? 1 : 0);
          else if (multi ? nk.split(' ').filter((w) => w.length >= 4).every(like) && nk.split(' ').some((w) => w.length >= 4) : like(nk)) pts = l === lang() ? 2 : 1;
          if (pts > (best.get(nk) || 0)) best.set(nk, pts);
        }
      }
      let score = [...best.values()].reduce((a, b) => a + b, 0);
      for (const w of norm(pick(it.q)).split(' ')) if (w.length >= 4 && words.has(w)) score += 1;
      return { it, score };
    }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
  }

  function linkify(text) {
    const frag = document.createDocumentFragment();
    String(text).split(/(\/[a-z-]+(?:\?[a-z=]+)?)/g).forEach((part) => {
      if (/^\/[a-z-]+/.test(part)) {
        const a = document.createElement('a');
        a.href = window.I18N.href(part); a.className = 'link'; a.textContent = a.getAttribute('href').split('#')[0];
        frag.appendChild(a);
      } else frag.appendChild(document.createTextNode(part));
    });
    return frag;
  }

  function mount(root, { floating = false } = {}) {
    root.classList.add('guindilla', floating ? 'floating' : 'embedded');
    root.innerHTML = `
      <div class="g-head"><span class="g-avatar" aria-hidden="true">${MASCOT}</span><div><b>Guindilla</b><span class="g-sub"></span></div>
        ${floating ? '<button type="button" class="g-close" aria-label="Close">✕</button>' : ''}</div>
      <div class="g-log" aria-live="polite"></div>
      <div class="g-chips"></div>
      <form class="g-form"><input class="g-input" maxlength="300" autocomplete="off"><button type="submit" class="btn primary g-send">➤</button></form>`;
    const log = root.querySelector('.g-log');
    const chips = root.querySelector('.g-chips');
    const input = root.querySelector('.g-input');

    const avatar = root.querySelector('.g-avatar');
    const say = (who, content) => {
      if (who === 'bot') gesture(avatar, 'talk', Math.min(2600, 500 + String(content.textContent ?? content).length * 18));
      const p = document.createElement('div');
      p.className = `g-msg ${who}`;
      if (typeof content === 'string') p.appendChild(linkify(content)); else p.appendChild(content);
      log.appendChild(p);
      log.scrollTop = log.scrollHeight;
    };
    const setChips = (ids) => {
      chips.replaceChildren(...ids.map((id) => faq.items.find((x) => x.id === id)).filter(Boolean).map((it) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'chip g-chip'; b.textContent = pick(it.q);
        b.addEventListener('click', () => ask(pick(it.q), it));
        return b;
      }));
    };
    const texts = () => {
      root.querySelector('.g-sub').textContent = t('gd.sub');
      input.placeholder = t('gd.placeholder');
      root.querySelector('.g-send').setAttribute('aria-label', t('chat.send'));
    };

    function ask(text, direct) {
      say('me', text);
      const n = ` ${norm(text)} `;
      setTimeout(() => {
        if (direct) { say('bot', pick(direct.a)); setChips(related(direct)); return; }
        const found = search(text);
        const best = found[0];
        if (best && best.score >= 3) {
          say('bot', pick(best.it.a));
          setChips(found.slice(1, 4).filter((r) => r.score >= 2).map((r) => r.it.id).concat(related(best.it)).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3));
          return;
        }
        if (THANKS.some((w) => n.includes(` ${w}`))) { say('bot', pick(faq.bot).thanks); setChips(POPULAR.slice(0, 3)); return; }
        if (GREET.some((w) => n.includes(` ${w} `)) && n.trim().split(' ').length <= 4) { say('bot', pick(faq.bot).hi); gesture(avatar, 'wave', 2200); setChips(POPULAR.slice(0, 4)); return; }
        say('bot', pick(faq.bot).fallback);
        setChips(found.length ? found.slice(0, 3).map((r) => r.it.id) : POPULAR.slice(0, 4));
      }, 350);
    }
    const related = (it) => faq.items.filter((x) => x.cat === it.cat && x.id !== it.id).slice(0, 3).map((x) => x.id);

    root.querySelector('.g-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      ask(text);
    });
    root.querySelector('.g-close')?.addEventListener('click', () => { root.hidden = true; document.getElementById('guindillaLauncher')?.focus(); });

    // Al desplegarse: aparece con un rebote y saluda
    const greet = () => { gesture(avatar, 'pop', 700); gesture(avatar, 'wave', 2400); };
    greet();
    loadFaq().then(() => {
      if (!faq) { say('bot', t('err.generic')); return; }
      texts();
      say('bot', pick(faq.bot).hello);
      setChips(POPULAR.slice(0, 4));
    });
    document.addEventListener('langchange', () => {
      if (!faq) return;
      texts();
      log.replaceChildren();
      say('bot', pick(faq.bot).hello);
      setChips(POPULAR.slice(0, 4));
    });
    return { open: () => { root.hidden = false; greet(); input.focus(); } };
  }

  // Botón flotante (portada): abre Guindilla en una ventanita
  function launcher() {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'guindillaLauncher';
    btn.className = 'guindilla-launcher';
    btn.innerHTML = MASCOT;
    // Un saludo discreto al cargar la página, y luego quieta
    setTimeout(() => gesture(btn, 'wave', 2000), 2500);
    const label = () => { btn.setAttribute('aria-label', t('gd.open')); btn.title = t('gd.open'); };
    label();
    document.addEventListener('langchange', label);
    let panel = null;
    let chat = null;
    btn.addEventListener('click', () => {
      if (!panel) {
        panel = document.createElement('section');
        panel.setAttribute('aria-label', 'Guindilla');
        document.body.appendChild(panel);
        chat = mount(panel, { floating: true });
        chat.open();
        return;
      }
      if (panel.hidden) { panel.hidden = false; chat.open(); } else panel.hidden = true;
    });
    document.body.appendChild(btn);
    return btn;
  }

  window.Guindilla = { mount, launcher, search: (text) => (faq ? search(text) : []) };
})();
