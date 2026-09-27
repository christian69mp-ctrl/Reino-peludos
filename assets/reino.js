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

    var media = document.querySelector('[data-rp-parallax] img');
    if (!media) return;

    var ticking = false;

    function update() {
      var scrollY = window.scrollY || window.pageYOffset;
      var offset = Math.min(scrollY * 0.18, 80);
      media.style.transform =
        'scale(1.08) translateY(' + offset + 'px)';
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

  function initBuyNow() {
    var containers = document.querySelectorAll('.product-form__buttons');
    if (!containers.length) return;

    containers.forEach(function (container) {
      if (container.querySelector('.rp-buy-now')) return;

      var form = container.closest('form');
      if (!form) return;

      var idInput = form.querySelector('input[name="id"]');
      var submitButton = container.querySelector('.product-form__submit');
      if (!idInput || !submitButton) return;

      var scope = container.closest('product-info') || document;

      var link = document.createElement('a');
      link.className = 'rp-buy-now button button--full-width';
      link.textContent = 'Comprar ya';
      submitButton.insertAdjacentElement('afterend', link);

      function currentQuantity() {
        var qtyInput = scope.querySelector('.quantity__input');
        var qty = qtyInput ? parseInt(qtyInput.value, 10) : 1;
        return qty > 0 ? qty : 1;
      }

      function update() {
        var variantId = idInput.value;
        var disabled = !variantId || submitButton.disabled;
        if (disabled) {
          link.setAttribute('aria-disabled', 'true');
          link.classList.add('rp-buy-now--disabled');
          link.removeAttribute('href');
        } else {
          link.removeAttribute('aria-disabled');
          link.classList.remove('rp-buy-now--disabled');
          link.href = '/cart/' + variantId + ':' + currentQuantity();
        }
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
    });
  } else {
    initScrollReveal();
    initHeroParallax();
    initBuyNow();
  }

  document.addEventListener('shopify:section:load', function () {
    initScrollReveal();
    initHeroParallax();
    initBuyNow();
  });
})();
