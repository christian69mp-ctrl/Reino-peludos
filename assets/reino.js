/**
 * Reino Peludos — animaciones de scroll y microinteracciones.
 * No depende de frameworks; se apoya en IntersectionObserver.
 */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  function initScrollReveal() {
    var items = document.querySelectorAll('.rp-reveal');
    if (!items.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var groups = {};
    items.forEach(function (el) {
      var group = el.getAttribute('data-rp-group') || 'default';
      groups[group] = groups[group] || 0;
      var index = groups[group]++;
      el.style.setProperty('--rp-delay', Math.min(index * 90, 540) + 'ms');
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initHeroParallax() {
    if (prefersReducedMotion) return;

    var hero = document.querySelector('.rp-hero');
    if (!hero) return;

    var layers = [
      {
        el: hero.querySelector('[data-rp-parallax] img'),
        speed: 0.18,
        max: 80,
        prefix: 'scale(1.08) '
      },
      {
        el: hero.querySelector('[data-rp-parallax-paws]'),
        speed: 0.4,
        max: 140,
        prefix: ''
      },
      {
        el: hero.querySelector('[data-rp-parallax-content]'),
        speed: -0.05,
        max: 18,
        prefix: ''
      }
    ].filter(function (layer) {
      return !!layer.el;
    });

    if (!layers.length) return;

    var ticking = false;

    function update() {
      var scrollY = window.scrollY || window.pageYOffset;
      layers.forEach(function (layer) {
        var raw = scrollY * layer.speed;
        var offset = Math.max(Math.min(raw, layer.max), -layer.max);
        layer.el.style.transform = layer.prefix + 'translateY(' + offset + 'px)';
      });
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  }

  function initTilt3D() {
    if (prefersReducedMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var cards = document.querySelectorAll(
      '.rp-category-card, .rp-packs__card, .card-wrapper .card'
    );
    if (!cards.length) return;

    var maxTilt = 7;

    cards.forEach(function (card) {
      if (card.hasAttribute('data-rp-tilt-ready')) return;
      card.setAttribute('data-rp-tilt-ready', 'true');

      var raf = null;
      var resetTimeout = null;

      function handleMove(event) {
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width;
        var y = (event.clientY - rect.top) / rect.height;
        var rotateY = (x - 0.5) * (maxTilt * 2);
        var rotateX = (0.5 - y) * (maxTilt * 2);

        if (raf) return;
        raf = window.requestAnimationFrame(function () {
          card.style.transform =
            'perspective(900px) rotateX(' +
            rotateX.toFixed(2) +
            'deg) rotateY(' +
            rotateY.toFixed(2) +
            'deg) translateY(-6px) scale(1.025)';
          raf = null;
        });
      }

      card.addEventListener('pointerenter', function (event) {
        if (event.pointerType !== 'mouse') return;
        if (resetTimeout) {
          window.clearTimeout(resetTimeout);
          resetTimeout = null;
        }
        card.style.transition = 'none';
      });

      card.addEventListener('pointermove', function (event) {
        if (event.pointerType !== 'mouse') return;
        handleMove(event);
      });

      card.addEventListener('pointerleave', function (event) {
        if (event.pointerType !== 'mouse') return;
        card.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
        card.style.transform = '';
        resetTimeout = window.setTimeout(function () {
          card.style.transition = '';
        }, 500);
      });
    });
  }

  function initBuyNow() {
    var containers = document.querySelectorAll('.product-form__buttons');
    if (!containers.length) return;

    containers.forEach(function (container) {
      if (container.querySelector('.rp-buy-now-form')) return;

      var form = container.closest('form');
      if (!form) return;

      var idInput = form.querySelector('input[name="id"]');
      var submitButton = container.querySelector('.product-form__submit');
      if (!idInput || !submitButton) return;

      var scope = container.closest('product-info') || document;

      var buyNowForm = document.createElement('form');
      buyNowForm.className = 'rp-buy-now-form';
      buyNowForm.method = 'post';
      buyNowForm.action = '/cart/add';

      var hiddenId = document.createElement('input');
      hiddenId.type = 'hidden';
      hiddenId.name = 'id';

      var hiddenQty = document.createElement('input');
      hiddenQty.type = 'hidden';
      hiddenQty.name = 'quantity';

      var hiddenReturnTo = document.createElement('input');
      hiddenReturnTo.type = 'hidden';
      hiddenReturnTo.name = 'return_to';
      hiddenReturnTo.value = '/checkout';

      var button = document.createElement('button');
      button.type = 'submit';
      button.className = 'rp-buy-now button button--full-width';
      button.textContent = 'Comprar ya';

      buyNowForm.appendChild(hiddenId);
      buyNowForm.appendChild(hiddenQty);
      buyNowForm.appendChild(hiddenReturnTo);
      buyNowForm.appendChild(button);
      submitButton.insertAdjacentElement('afterend', buyNowForm);

      function currentQuantity() {
        var qtyInput = scope.querySelector('.quantity__input');
        var qty = qtyInput ? parseInt(qtyInput.value, 10) : 1;
        return qty > 0 ? qty : 1;
      }

      function update() {
        var variantId = idInput.value;
        hiddenId.value = variantId || '';
        hiddenQty.value = currentQuantity();
        button.disabled = !variantId || submitButton.disabled;
      }

      update();

      idInput.addEventListener('change', update);
      scope.addEventListener('change', function (event) {
        if (event.target && event.target.classList && event.target.classList.contains('quantity__input')) {
          update();
        }
      });

      new MutationObserver(update).observe(submitButton, {
        attributes: true,
        attributeFilter: ['disabled']
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initScrollReveal();
      initHeroParallax();
      initBuyNow();
      initTilt3D();
    });
  } else {
    initScrollReveal();
    initHeroParallax();
    initBuyNow();
    initTilt3D();
  }

  document.addEventListener('shopify:section:load', function () {
    initScrollReveal();
    initHeroParallax();
    initBuyNow();
    initTilt3D();
  });
})();
