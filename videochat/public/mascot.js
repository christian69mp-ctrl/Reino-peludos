// Guindilla dibujada (la mascota): la usan la asistente, el aviso de cookies y la
// política de cookies. Se anima con CSS (sin sonido).
// Gestos: aparece con un rebote, saluda con la mano, parpadea y mueve la boca al hablar.
(function () {
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

  // Cada copia lleva sus propios id de degradado: si dos guindillas compartieran id y la
  // primera estuviera oculta (display: none), las demás se quedarían sin color.
  let n = 0;
  const make = () => { n += 1; return MASCOT.replace(/gl(Body|Leaf)/g, `gl$1${n}`); };

  // Cualquier <span data-mascot> de la página lleva la guindilla; data-mascot="still" = quieta
  function fill(root = document) {
    root.querySelectorAll('[data-mascot]:empty').forEach((el) => {
      el.innerHTML = make();
      if (el.dataset.mascot === 'still') { el.classList.add('gl-still'); return; }
      gesture(el, 'pop', 700);
      setTimeout(() => gesture(el, 'wave', 2400), 300);
    });
  }
  fill();

  window.Mascot = { make, gesture, fill, get svg() { return make(); } };
})();
