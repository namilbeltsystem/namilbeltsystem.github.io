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
    setupSettings();
    loadSavedSettings();
  }

  // ---- Settings Panel (Font & Theme) ----
  function setupSettings() {
    const btn = document.getElementById('settingsBtn');
    const panel = document.getElementById('settingsPanel');
    if (!btn || !panel) return;

    btn.addEventListener('click', () => panel.classList.toggle('is-open'));
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== btn) panel.classList.remove('is-open');
    });

    // Font switcher
    document.querySelectorAll('#fontOptions .opt-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('#fontOptions .opt-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        const font = b.dataset.font;
        const fonts = {
          noto: "'Noto Sans KR', sans-serif",
          serif: "'Noto Serif KR', serif",
          ibm: "'IBM Plex Sans KR', sans-serif",
          blackhan: "'Black Han Sans', sans-serif",
          sunflower: "'Sunflower', sans-serif"
        };
        document.documentElement.style.setProperty('--font-family', fonts[font]);
        localStorage.setItem('font', font);
      });
    });

    // Theme switcher
    document.querySelectorAll('#themeOptions .opt-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('#themeOptions .opt-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        const theme = b.dataset.theme;
        const themes = {
          default: { primary: '#474b53', accent: '#256f8a', bg: '#ffffff', bgAlt: '#f5f6f8', bgDark: '#23262b' },
          blue:    { primary: '#2c5282', accent: '#3182ce', bg: '#ffffff', bgAlt: '#ebf4ff', bgDark: '#1a365d' },
          green:   { primary: '#276749', accent: '#38a169', bg: '#ffffff', bgAlt: '#f0fff4', bgDark: '#1c4532' },
          warm:    { primary: '#9b4d2e', accent: '#c05621', bg: '#ffffff', bgAlt: '#fffaf0', bgDark: '#3e2723' },
          dark:    { primary: '#718096', accent: '#a0aec0', bg: '#1a202c', bgAlt: '#2d3748', bgDark: '#0d1117' }
        };
        const t = themes[theme];
        document.documentElement.style.setProperty('--color-primary', t.primary);
        document.documentElement.style.setProperty('--color-accent', t.accent);
        document.documentElement.style.setProperty('--color-bg', t.bg);
        document.documentElement.style.setProperty('--color-bg-alt', t.bgAlt);
        document.documentElement.style.setProperty('--color-bg-dark', t.bgDark);
        if (theme === 'dark') {
          document.documentElement.style.setProperty('--color-text', '#e2e8f0');
          document.documentElement.style.setProperty('--color-text-light', '#a0aec0');
          document.documentElement.style.setProperty('--color-text-muted', '#718096');
          document.documentElement.style.setProperty('--color-border', '#4a5568');
        } else {
          document.documentElement.style.setProperty('--color-text', '#2c2c2c');
          document.documentElement.style.setProperty('--color-text-light', '#555555');
          document.documentElement.style.setProperty('--color-text-muted', '#777777');
          document.documentElement.style.setProperty('--color-border', '#e0e0e0');
        }
        localStorage.setItem('theme', theme);
      });
    });
  }

  function loadSavedSettings() {
    const font = localStorage.getItem('font');
    if (font) {
      const btn = document.querySelector(`#fontOptions [data-font="${font}"]`);
      if (btn) {
        document.querySelectorAll('#fontOptions .opt-btn').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
        btn.click();
      }
    }
    const theme = localStorage.getItem('theme');
    if (theme) {
      const btn = document.querySelector(`#themeOptions [data-theme="${theme}"]`);
      if (btn) {
        document.querySelectorAll('#themeOptions .opt-btn').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
        btn.click();
      }
    }
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
