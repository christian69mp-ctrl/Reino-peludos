// Páginas legales: muestran el texto en el idioma de la web (inglés por defecto)
(function () {
  const { apply, setLang, SUPPORTED, NAMES } = window.I18N;

  function show() {
    const lang = window.I18N.lang;
    let shown = null;
    document.querySelectorAll('.doc-lang').forEach((a) => {
      const match = a.lang === lang;
      a.hidden = !match;
      if (match) shown = a;
    });
    if (!shown) { shown = document.querySelector('.doc-lang[lang="en"]'); shown.hidden = false; }
    document.title = `${shown.querySelector('h1').textContent} · La Ruleta Caliente`;
  }

  apply();
  document.querySelectorAll('[data-lang-select]').forEach((sel) => {
    sel.innerHTML = SUPPORTED.map((l) => `<option value="${l}">${NAMES[l]}</option>`).join('');
    sel.value = window.I18N.lang;
    sel.onchange = () => setLang(sel.value);
  });
  show();
  document.addEventListener('langchange', () => {
    document.querySelectorAll('[data-lang-select]').forEach((sel) => { sel.value = window.I18N.lang; });
    show();
  });
})();
