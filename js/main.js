(() => {
  'use strict';

  const DOM = {};

  function init() {
    cacheDom();
    setupHamOverlay();
    setupLightbox();
    setupSmoothScroll();
    highlightCurrentNav();
    setupFloatingButtons();
    setupSettings();
    loadSavedSettings();
  }

  function cacheDom() {
    DOM.lightbox = document.getElementById('lightbox');
    if (DOM.lightbox) {
      DOM.lightboxImg = DOM.lightbox.querySelector('.lightbox__image');
      DOM.lightboxClose = DOM.lightbox.querySelector('.lightbox__close');
    }
  }

  // ---- Hamburger overlay ----
  function setupHamOverlay() {
    const overlay = document.querySelector('.ham-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        document.getElementById('hamToggle').checked = false;
        document.body.style.overflow = '';
      });
    }
    // Track checkbox state for body overflow
    const hamToggle = document.getElementById('hamToggle');
    if (hamToggle) {
      hamToggle.addEventListener('change', () => {
        document.body.style.overflow = hamToggle.checked ? 'hidden' : '';
      });
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

  // ---- Settings ----
  let pendingFont = null, pendingTheme = null;

  function setupSettings() {
    const btn = document.getElementById('settingsBtn');
    const panel = document.getElementById('settingsPanel');
    if (!btn || !panel) return;

    btn.addEventListener('click', () => panel.classList.toggle('is-open'));
    document.addEventListener('click', (e) => {
      if (!panel.contains(e.target) && e.target !== btn) panel.classList.remove('is-open');
    });

    // Font options - select only (no auto-apply)
    document.querySelectorAll('#fontOptions .opt-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('#fontOptions .opt-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        pendingFont = b.dataset.font;
      });
    });

    // Theme options - select only (no auto-apply)
    document.querySelectorAll('#themeOptions .opt-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('#themeOptions .opt-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        pendingTheme = b.dataset.theme;
      });
    });

    // Apply button
    const applyBtn = document.getElementById('applySettings');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        if (pendingFont) applyFont(pendingFont);
        if (pendingTheme) applyTheme(pendingTheme);
        panel.classList.remove('is-open');
      });
    }

    // Close button
    const closeBtn = document.getElementById('closeSettings');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        pendingFont = null;
        pendingTheme = null;
        panel.classList.remove('is-open');
      });
    }
  }

  function applyFont(font) {
    const fonts = {
      noto: "'Noto Sans KR', sans-serif",
      serif: "'Noto Serif KR', serif",
      ibm: "'IBM Plex Sans KR', sans-serif",
      blackhan: "'Black Han Sans', sans-serif",
      sunflower: "'Sunflower', sans-serif"
    };
    document.documentElement.style.setProperty('--font-family', fonts[font]);
    localStorage.setItem('font', font);
  }

  function applyTheme(theme) {
    const themes = {
      default: { primary:'#474b53', primaryLight:'#5e636c', primaryDark:'#303339', accent:'#256f8a', accentLight:'#3498be', bg:'#ffffff', bgAlt:'#f5f6f8', bgDark:'#23262b', text:'#2c2c2c', textLight:'#555555', textMuted:'#777777', border:'#e0e0e0', white:'#ffffff' },
      blue:    { primary:'#2c5282', primaryLight:'#3182ce', primaryDark:'#1a365d', accent:'#2b6cb0', accentLight:'#4299e1', bg:'#ffffff', bgAlt:'#ebf8ff', bgDark:'#1a365d', text:'#1a202c', textLight:'#4a5568', textMuted:'#718096', border:'#bee3f8', white:'#ffffff' },
      green:   { primary:'#276749', primaryLight:'#38a169', primaryDark:'#1c4532', accent:'#2f855a', accentLight:'#48bb78', bg:'#ffffff', bgAlt:'#f0fff4', bgDark:'#1c4532', text:'#1a202c', textLight:'#4a5568', textMuted:'#718096', border:'#c6f6d5', white:'#ffffff' },
      warm:    { primary:'#c05621', primaryLight:'#dd6b20', primaryDark:'#9c4221', accent:'#b7791f', accentLight:'#d69e2e', bg:'#ffffff', bgAlt:'#fffaf0', bgDark:'#3e2723', text:'#2d2d2d', textLight:'#5a4636', textMuted:'#7a6652', border:'#fbd38d', white:'#ffffff' },
      dark:    { primary:'#718096', primaryLight:'#a0aec0', primaryDark:'#4a5568', accent:'#63b3ed', accentLight:'#90cdf4', bg:'#1a202c', bgAlt:'#2d3748', bgDark:'#0d1117', text:'#e2e8f0', textLight:'#a0aec0', textMuted:'#718096', border:'#4a5568', white:'#2d3748' }
    };
    const t = themes[theme];
    for (const [k, v] of Object.entries(t)) {
      document.documentElement.style.setProperty('--color-' + k, v);
    }
    localStorage.setItem('theme', theme);
  }

  function loadSavedSettings() {
    const font = localStorage.getItem('font');
    if (font) {
      document.querySelectorAll('#fontOptions .opt-btn').forEach(x => x.classList.remove('active'));
      const fb = document.querySelector(`#fontOptions [data-font="${font}"]`);
      if (fb) { fb.classList.add('active'); applyFont(font); }
    }
    const theme = localStorage.getItem('theme');
    if (theme) {
      document.querySelectorAll('#themeOptions .opt-btn').forEach(x => x.classList.remove('active'));
      const tb = document.querySelector(`#themeOptions [data-theme="${theme}"]`);
      if (tb) { tb.classList.add('active'); applyTheme(theme); }
    }
  }

  function setupPostModals() {}

  // ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
