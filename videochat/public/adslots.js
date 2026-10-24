// Huecos de publicidad y consentimiento de cookies de publicidad.
// - Banners de anunciantes propios: imagen servida por nuestra web, sin cookies.
// - Redes publicitarias: solo si la persona acepta. Van en un iframe aislado
//   (sandbox sin allow-same-origin): no pueden leer la sesión ni nada de la web.
// - El hueco lateral solo existe en pantallas anchas, fuera del vídeo; con Premium
//   de pago no hay anuncios (lo decide el servidor).
(function () {
  const { t } = window.I18N;
  const KEY = 'cookie-consent';
  const YEAR = 365 * 24 * 3600 * 1000;

  // La elección se guarda un año; después se vuelve a preguntar
  function consent() {
    try {
      const c = JSON.parse(localStorage.getItem(KEY) || 'null');
      return c && c.at > Date.now() - YEAR ? c : null;
    } catch { return null; }
  }
  function saveConsent(ads) {
    try { localStorage.setItem(KEY, JSON.stringify({ ads, at: Date.now(), v: 1 })); } catch { /* sin almacenamiento */ }
  }
  const ageOk = () => { try { return !!localStorage.getItem('age-ok'); } catch { return true; } };
  const session = () => { try { return localStorage.getItem('session') || ''; } catch { return ''; } };

  // ---- Aviso de cookies (Aceptar y Rechazar con el mismo peso) ----
  let bar = null;
  function openConsent() {
    if (bar) { bar.hidden = false; window.Mascot?.gesture(bar.querySelector('.consent-mascot'), 'wave', 2000); return; }
    bar = document.createElement('section');
    bar.className = 'consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-labelledby', 'consentTitle');
    bar.innerHTML = `<span class="consent-mascot" aria-hidden="true">${window.Mascot?.svg || '🌶️'}</span>
      <div class="consent-text"><span class="consent-eyebrow"></span><b id="consentTitle"></b><p><span class="ck-text"></span> <a class="link" href="/cookies"></a></p></div>
      <div class="consent-actions"><button type="button" class="btn ghost" data-c="no"></button><button type="button" class="btn ghost" data-c="yes"></button></div>`;
    const texts = () => {
      bar.querySelector('.consent-eyebrow').textContent = t('ck.title');
      bar.querySelector('#consentTitle').textContent = t('ck.fun');
      bar.querySelector('.ck-text').textContent = t('ck.text');
      const a = bar.querySelector('a');
      a.textContent = t('footer.cookies');
      a.href = window.I18N.href('/cookies');
      bar.querySelector('[data-c=no]').textContent = t('ck.reject');
      bar.querySelector('[data-c=yes]').textContent = t('ck.accept');
    };
    texts();
    document.addEventListener('langchange', texts);
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('[data-c]');
      if (!b) return;
      saveConsent(b.dataset.c === 'yes');
      bar.hidden = true;
      render();
    });
    document.body.appendChild(bar);
    // La guindilla saluda al aparecer el aviso (sin sonido)
    const m = bar.querySelector('.consent-mascot');
    window.Mascot?.gesture(m, 'pop', 700);
    setTimeout(() => window.Mascot?.gesture(m, 'wave', 2400), 350);
  }

  // ---- Huecos ----
  let data = {};
  const wide = () => window.innerWidth >= 1400;
  const mobile = () => window.innerWidth < 760;

  function wanted() {
    const out = [];
    document.querySelectorAll('[data-ad]').forEach((el) => {
      if (el.dataset.ad === 'side' && wide()) out.push('side');
      if (el.dataset.ad === 'top') out.push(mobile() ? 'top-mobile' : 'top');
      if (el.dataset.ad === 'wait') out.push('wait');
    });
    return out;
  }

  const seen = new Set();
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const id = e.target.dataset.adId;
      observer.unobserve(e.target);
      if (seen.has(id)) continue;
      seen.add(id);
      fetch('/api/ads/seen', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).catch(() => {});
    }
  }, { threshold: 0.5 }) : null;

  function fill(el, slot) {
    const box = el.querySelector('.ad-box');
    const d = data[slot];
    const ok = consent()?.ads === true;
    box.replaceChildren();
    if (d?.frame && ok) {
      const f = document.createElement('iframe');
      f.src = d.frame;
      f.width = d.w; f.height = d.h;
      f.title = t('ad.label');
      f.loading = 'lazy';
      f.setAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox');
      f.setAttribute('referrerpolicy', 'no-referrer');
      box.appendChild(f);
    } else if (d?.banner) {
      const a = document.createElement('a');
      a.href = `/ads/click/${d.banner.id}`;
      a.target = '_blank';
      a.rel = 'sponsored noopener';
      const img = document.createElement('img');
      img.src = d.banner.img; img.width = d.w; img.height = d.h; img.alt = d.banner.alt || t('ad.label');
      img.loading = 'lazy';
      a.appendChild(img);
      a.dataset.adId = d.banner.id;
      box.appendChild(a);
      observer?.observe(a);
    }
    box.style.setProperty('--ad-w', `${d?.w || 0}px`);
    box.style.setProperty('--ad-h', `${d?.h || 0}px`);
    el.hidden = !box.firstChild;
  }

  function render() {
    document.querySelectorAll('[data-ad]').forEach((el) => {
      if (el.dataset.ad === 'wait') { showWait(waiting); return; }
      const slot = el.dataset.ad === 'top' ? (mobile() ? 'top-mobile' : 'top') : el.dataset.ad;
      if (slot === 'side' && !wide()) { el.hidden = true; return; }
      fill(el, slot);
    });
    // Solo se pregunta si de verdad hay una red publicitaria y la persona ya ha entrado
    const needs = Object.values(data).some((d) => d.frame);
    if (needs && !consent()) {
      if (ageOk()) openConsent();
      else document.getElementById('ageYes')?.addEventListener('click', () => setTimeout(openConsent, 400), { once: true });
    }
  }

  // Hueco «mientras busca»: se rellena al empezar a buscar y se vacía al conectar, así el
  // anuncio solo se carga (y cuenta) cuando de verdad se ve. Si el vídeo es pequeño, no sale.
  let waiting = false;
  function showWait(on) {
    waiting = on;
    const el = document.querySelector('[data-ad="wait"]');
    if (!el) return;
    const remote = document.getElementById('remote');
    const fits = remote && remote.clientWidth >= 320 && remote.clientHeight >= 380;
    if (!on || !fits || !data.wait) { el.hidden = true; el.querySelector('.ad-box').replaceChildren(); return; }
    if (!el.hidden && el.querySelector('.ad-box').firstChild) return;
    fill(el, 'wait');
  }

  async function refresh() {
    const slots = wanted();
    if (!slots.length) { data = {}; render(); return; }
    try {
      const headers = session() ? { Authorization: `Bearer ${session()}` } : {};
      const r = await fetch(`/api/ads?slots=${slots.join(',')}`, { headers });
      data = (await r.json()).slots || {};
    } catch { data = {}; }
    render();
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(refresh, 400); });
  document.addEventListener('langchange', () => document.querySelectorAll('.ad-slot iframe').forEach((f) => { f.title = t('ad.label'); }));
  // Enlace «Configurar cookies» del pie (y botón de la política de cookies)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-cookie-settings]');
    if (!a) return;
    e.preventDefault();
    openConsent();
  });

  window.AdSlots = { refresh, openConsent, consent, wait: showWait };
  refresh();
})();
