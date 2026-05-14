(() => {
  'use strict';

  const DOM = {};

  function init() {
    cacheDom();
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
      default: { primary:'#364153', primaryLight:'#4B5563', primaryDark:'#1F2937', accent:'#256F8A', accentLight:'#3B8CA8', bg:'#FFFFFF', bgAlt:'#F5F6F8', bgDark:'#1F2937', text:'#1F2937', textLight:'#4B5563', textMuted:'#6B7280', border:'#D1D5DB', white:'#FFFFFF', heroBg:'rgba(0,0,0,0.35)' },
      blue:    { primary:'#1E3A5F', primaryLight:'#2563EB', primaryDark:'#0F2440', accent:'#3B82F6', accentLight:'#60A5FA', bg:'#FFFFFF', bgAlt:'#EFF6FF', bgDark:'#0F2440', text:'#1E293B', textLight:'#475569', textMuted:'#64748B', border:'#BFDBFE', white:'#FFFFFF', heroBg:'rgba(15,36,64,0.4)' },
      green:   { primary:'#22543D', primaryLight:'#2F855A', primaryDark:'#14532D', accent:'#38A169', accentLight:'#68D391', bg:'#FFFFFF', bgAlt:'#F0FFF4', bgDark:'#14532D', text:'#1A2E1F', textLight:'#3F5A47', textMuted:'#5F7A67', border:'#C6F6D5', white:'#FFFFFF', heroBg:'rgba(0,0,0,0.35)' },
      warm:    { primary:'#9B4D2E', primaryLight:'#C05621', primaryDark:'#6B3A1F', accent:'#D68B3C', accentLight:'#E5A14D', bg:'#FFFFFF', bgAlt:'#FFFBEB', bgDark:'#3E2723', text:'#2D2119', textLight:'#5C4633', textMuted:'#7A6652', border:'#FDE68A', white:'#FFFFFF', heroBg:'rgba(62,39,35,0.45)' },
      dark:    { primary:'#6366F1', primaryLight:'#818CF8', primaryDark:'#3730A3', accent:'#38BDF8', accentLight:'#7DD3FC', bg:'#0F172A', bgAlt:'#1E293B', bgDark:'#020617', text:'#E2E8F0', textLight:'#94A3B8', textMuted:'#64748B', border:'#334155', white:'#1E293B', heroBg:'rgba(0,0,0,0.6)' }
    };
    // Also store current theme name for body class
    document.body.className = document.body.className.replace(/theme-\w+/g, '') + ' theme-' + theme;
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
