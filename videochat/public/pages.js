// Páginas de ayuda, contacto y denuncia de contenido: idioma, antibots y formularios.
(function () {
  const { t, apply, setLang, SUPPORTED, NAMES } = window.I18N;
  const $ = (id) => document.getElementById(id);

  apply();
  document.querySelectorAll('[data-lang-select]').forEach((sel) => {
    sel.innerHTML = SUPPORTED.map((l) => `<option value="${l}">${NAMES[l]}</option>`).join('');
    sel.value = window.I18N.lang;
    sel.onchange = () => setLang(sel.value);
  });
  document.addEventListener('langchange', () => {
    document.querySelectorAll('[data-lang-select]').forEach((sel) => { sel.value = window.I18N.lang; });
  });

  const token = (() => { try { return localStorage.getItem('session') || ''; } catch { return ''; } })();
  const errorText = (res) => (res?.code ? t(`err.${res.code}`) : t('err.generic'));
  const showError = (msg) => { $('formError').textContent = msg; $('formError').hidden = !msg; };

  // ---- Antibots (Cloudflare Turnstile, si está configurado) ----
  let captcha = '';
  let widget = null;
  fetch('/api/config').then((r) => r.json()).then((c) => {
    if (!c.turnstile || !$('captchaPage')) return;
    const sc = document.createElement('script');
    sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    sc.onload = () => {
      widget = window.turnstile.render('#captchaPage', {
        sitekey: c.turnstile, theme: 'dark', language: window.I18N.lang,
        callback: (tok) => { captcha = tok; }, 'expired-callback': () => { captcha = ''; },
      });
    };
    document.head.appendChild(sc);
  }).catch(() => {});

  async function post(path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
      const r = await fetch(path, { method: 'POST', headers, body: JSON.stringify({ ...body, captcha, lang: window.I18N.lang }) });
      return { status: r.status, ...(await r.json().catch(() => ({}))) };
    } catch { return { code: 'offline' }; }
    finally { captcha = ''; if (widget !== null && window.turnstile) window.turnstile.reset(widget); }
  }

  function sent(form, reference) {
    form.hidden = true;
    $('sentRef').textContent = reference;
    $('sentBox').hidden = false;
    $('sentBox').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ---- Contacto ----
  const contact = $('contactForm');
  if (contact) {
    contact.addEventListener('submit', async (e) => {
      e.preventDefault();
      showError('');
      const email = $('cfEmail').value.trim();
      const message = $('cfMessage').value.trim();
      if (!email) return showError(t('err.email'));
      if (message.length < 10) return showError(t('err.messageShort'));
      $('formSubmit').disabled = true;
      const res = await post('/api/contact', { name: $('cfName').value, email, category: $('cfCategory').value, message });
      $('formSubmit').disabled = false;
      if (!res.ok) return showError(errorText(res));
      sent(contact, res.reference);
    });
  }

  // ---- Aviso de contenido ilegal ----
  const notice = $('noticeForm');
  if (notice) {
    notice.addEventListener('submit', async (e) => {
      e.preventDefault();
      showError('');
      const category = $('nfCategory').value;
      const explanation = $('nfExplanation').value.trim();
      const name = $('nfName').value.trim();
      const email = $('nfEmail').value.trim();
      if (!category) return showError(t('err.category'));
      if (explanation.length < 20) return showError(t('err.explanationShort'));
      if (category !== 'minors' && (!name || !email)) return showError(t('err.nameEmail'));
      if (!$('nfGoodFaith').checked) return showError(t('err.goodFaith'));
      $('formSubmit').disabled = true;
      const res = await post('/api/notices', {
        category, explanation, name, email, goodFaith: true,
        accountCode: $('nfAccount').value, location: $('nfLocation').value,
      });
      $('formSubmit').disabled = false;
      if (!res.ok) return showError(errorText(res));
      sent(notice, res.reference);
    });
  }

  // ---- Centro de ayuda: preguntas por categorías, buscador y Guindi ----
  const list = $('faqList');
  if (list && window.FAQ) {
    const F = window.FAQ;
    const pick = (o) => o?.[window.I18N.lang] ?? o?.en ?? '';
    const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    let cat = '';

    function linkify(el, text) {
      String(text).split(/(\/[a-z-]+)/g).forEach((part) => {
        if (/^\/[a-z-]+$/.test(part)) {
          const a = document.createElement('a');
          a.href = window.I18N.href(part); a.className = 'link'; a.textContent = a.getAttribute('href').split('#')[0];
          el.appendChild(a);
        } else el.appendChild(document.createTextNode(part));
      });
    }

    function render() {
      const q = norm($('faqSearch').value.trim());
      const cats = Object.keys(F.cats.en);
      $('faqCats').replaceChildren(...['', ...cats].map((c) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `chip${c === cat ? ' active' : ''}`;
        b.textContent = c ? pick(F.cats)[c] : t('chat.all');
        b.addEventListener('click', () => { cat = c; render(); });
        return b;
      }));
      const items = F.items.filter((it) => (!cat || it.cat === cat) && (!q
        || norm(pick(it.q)).includes(q) || norm(pick(it.a)).includes(q) || (it.k[window.I18N.lang] || []).some((k) => k.includes(q))));
      const groups = cats.filter((c) => items.some((it) => it.cat === c));
      list.replaceChildren(...groups.map((c) => {
        const sec = document.createElement('section');
        sec.className = 'faq-group';
        const h = document.createElement('h2');
        h.textContent = pick(F.cats)[c];
        sec.appendChild(h);
        for (const it of items.filter((x) => x.cat === c)) {
          const d = document.createElement('details');
          d.id = it.id;
          const s = document.createElement('summary');
          s.textContent = pick(it.q);
          const p = document.createElement('p');
          linkify(p, pick(it.a));
          d.append(s, p);
          sec.appendChild(d);
        }
        return sec;
      }));
      $('faqEmpty').hidden = items.length > 0;
    }
    $('faqSearch').addEventListener('input', render);
    document.addEventListener('langchange', render);
    render();
    // Enlace directo a una pregunta (/ayuda#cancel-subscription)
    const target = location.hash && document.getElementById(location.hash.slice(1));
    if (target?.tagName === 'DETAILS') { target.open = true; target.scrollIntoView(); }
    if (window.Guindi && $('guindiEmbed')) window.Guindi.mount($('guindiEmbed'));
  }
})();
