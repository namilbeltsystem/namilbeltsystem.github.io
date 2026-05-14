(() => {
  'use strict';

  const DOM = {};

  function init() {
    cacheDom();
    setupMobileNav();
    setupLightbox();
    setupSmoothScroll();
    highlightCurrentNav();
    setupFloatingButtons();
    setupPostModals();
  }

  function cacheDom() {
    DOM.hamburger = document.getElementById('hamburger');
    DOM.nav = document.getElementById('nav');
    DOM.overlay = document.getElementById('mobileOverlay');
    DOM.floatingBtns = document.querySelectorAll('.floating__btn');
    DOM.lightbox = document.getElementById('lightbox');
    if (DOM.lightbox) {
      DOM.lightboxImg = DOM.lightbox.querySelector('.lightbox__image');
      DOM.lightboxClose = DOM.lightbox.querySelector('.lightbox__close');
    }
    DOM.postModal = document.getElementById('postModal');
  }

  // ---- Mobile Nav ----
  function setupMobileNav() {
    if (!DOM.hamburger || !DOM.nav) return;

    // Create overlay backdrop for mobile menu
    const backdrop = document.createElement('div');
    backdrop.className = 'mobile-menu-overlay';
    backdrop.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1060;transition:opacity 0.3s ease';
    document.body.appendChild(backdrop);

    DOM.hamburger.addEventListener('click', () => {
      const isOpen = DOM.nav.classList.toggle('is-open');
      DOM.hamburger.classList.toggle('is-open', isOpen);
      backdrop.style.display = isOpen ? 'block' : 'none';
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    backdrop.addEventListener('click', closeMobileNav);

    function closeMobileNav() {
      DOM.nav.classList.remove('is-open');
      DOM.hamburger.classList.remove('is-open');
      backdrop.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  // ---- Lightbox ----
  function setupLightbox() {
    if (!DOM.lightbox) return;

    document.querySelectorAll('[data-lightbox]').forEach(item => {
      item.addEventListener('click', () => {
        const src = item.dataset.lightbox;
        DOM.lightboxImg.src = src;
        DOM.lightboxImg.alt = item.querySelector('img')?.alt || '';
        DOM.lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });

    DOM.lightbox.addEventListener('click', closeLightbox);
    DOM.lightboxClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.lightbox.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  }

  function closeLightbox() {
    DOM.lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // ---- Smooth Scroll ----
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 72;
          window.scrollTo({
            top: target.offsetTop - headerHeight - 20,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ---- Nav Highlighting ----
  function highlightCurrentNav() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav__link');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && currentPath.endsWith(href)) {
        link.classList.add('nav__link--active');
      } else if (href === 'index.html' && (currentPath.endsWith('/') || currentPath.endsWith('/index.html'))) {
        link.classList.add('nav__link--active');
      }
    });
    // If no match, mark '홈'/index as active
    if (!document.querySelector('.nav__link--active')) {
      const homeLink = document.querySelector('.nav__link[href="index.html"]');
      if (homeLink) homeLink.classList.add('nav__link--active');
    }
  }

  // ---- Floating Buttons ----
  function setupFloatingButtons() {
    document.querySelector('.floating__btn--top')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- Board Post Modals ----
  function setupPostModals() {
    if (!DOM.postModal) return;

    document.querySelectorAll('[data-post]').forEach(row => {
      row.addEventListener('click', () => {
        const title = row.dataset.postTitle;
        const author = row.dataset.postAuthor;
        const date = row.dataset.postDate;
        const content = row.dataset.postContent;

        DOM.postModal.querySelector('.post-modal__title').textContent = title;
        DOM.postModal.querySelector('.post-modal__meta').innerHTML = `
          <span>${author}</span> &middot; <span>${date}</span>
        `;
        DOM.postModal.querySelector('.post-modal__body').innerHTML = content;
        DOM.postModal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });

    DOM.postModal.querySelector('.post-modal__close').addEventListener('click', closePostModal);
    DOM.postModal.addEventListener('click', (e) => {
      if (e.target === DOM.postModal) closePostModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && DOM.postModal.classList.contains('is-open')) {
        closePostModal();
      }
    });
  }

  function closePostModal() {
    DOM.postModal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
