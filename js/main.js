(() => {
  'use strict';

  const DOM = {};

  function init() {
    cacheDom();
    setupLightbox();
    setupSmoothScroll();
    highlightCurrentNav();
    setupFloatingButtons();
  }

  function cacheDom() {
    DOM.lightbox = document.getElementById('lightbox');
    if (DOM.lightbox) {
      DOM.lightboxImg = DOM.lightbox.querySelector('.lightbox__image');
      DOM.lightboxClose = DOM.lightbox.querySelector('.lightbox__close');
    }
  }

  // ---- Lightbox ----
  function setupLightbox() {
    if (!DOM.lightbox) return;
    document.querySelectorAll('[data-lightbox]').forEach(item => {
      item.addEventListener('click', () => {
        DOM.lightboxImg.src = item.dataset.lightbox;
        DOM.lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });
    DOM.lightbox.addEventListener('click', () => { DOM.lightbox.classList.remove('is-open'); document.body.style.overflow = ''; });
    if (DOM.lightboxClose) DOM.lightboxClose.addEventListener('click', (e) => { e.stopPropagation(); DOM.lightbox.classList.remove('is-open'); document.body.style.overflow = ''; });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.lightbox.classList.contains('is-open')) { DOM.lightbox.classList.remove('is-open'); document.body.style.overflow = ''; }
    });
  }

  // ---- Smooth Scroll ----
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
      });
    });
  }

  // ---- Nav Highlighting ----
  function highlightCurrentNav() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav__link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && path.endsWith(href)) link.classList.add('nav__link--active');
    });
    if (!document.querySelector('.nav__link--active')) {
      const home = document.querySelector('.nav__link[href="index.html"]');
      if (home) home.classList.add('nav__link--active');
    }
  }

  // ---- Floating Buttons ----
  function setupFloatingButtons() {
    document.querySelector('.floating__btn--top')?.addEventListener('click', (e) => {
      e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function setupPostModals() {}

  // ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
