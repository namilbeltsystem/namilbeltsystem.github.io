(() => {
  'use strict';

  const DOM = {};

  function init() {
    cacheDom();
    setupLightbox();
    setupSmoothScroll();
    highlightCurrentNav();
    setupFloatingButtons();
    setupMobileNav();
    setupInquiryForm();
    setupFaq();
    setupBlogFeed();
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

  // ---- Mobile Navigation (Hamburger) ----
  function setupMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('nav');
    if (!toggle || !nav) return;

    const close = () => {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '메뉴 열기');
      document.body.classList.remove('nav-open');
    };
    const open = () => {
      nav.classList.add('is-open');
      toggle.classList.add('is-active');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', '메뉴 닫기');
      document.body.classList.add('nav-open');
    };

    toggle.addEventListener('click', () => {
      nav.classList.contains('is-open') ? close() : open();
    });
    // 메뉴 링크 클릭 시 닫기
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    // 데스크톱으로 확장 시 닫기
    window.addEventListener('resize', () => { if (window.innerWidth > 992) close(); });
    // Escape 키로 닫기
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) close();
    });
  }

  // ---- Contact Form ----
  function setupInquiryForm() {
    const form = document.querySelector('.inquiry-form');
    if (!form) return;

    const fields = form.querySelectorAll('[data-validate]');
    const submitBtn = form.querySelector('.inquiry-form__submit');
    const successMsg = form.querySelector('.inquiry-form__success');

    // Real-time validation
    fields.forEach(field => {
      field.addEventListener('input', () => clearError(field));
      field.addEventListener('change', () => clearError(field));
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      let valid = true;

      fields.forEach(field => {
        if (!validateField(field)) valid = false;
      });

      if (!valid) return;

      // Disable button & show loading
      submitBtn.disabled = true;
      submitBtn.textContent = '전송 중...';

      // Collect form data
      const formData = new FormData(form);
      const data = {};
      formData.forEach((v, k) => data[k] = v);

      // Try form action endpoint, fallback to mailto
      const action = form.getAttribute('action');
      if (action && action !== '#') {
        fetch(action, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(data)
        })
        .then(() => showSuccess(form, successMsg))
        .catch(() => showSuccess(form, successMsg)); // Show success either way for UX
      } else {
        // Fallback: open email client
        const subject = encodeURIComponent('[남일벨트시스템] ' + (data.inquiry_type || '문의'));
        const body = encodeURIComponent(
          `이름: ${data.name || ''}\n` +
          `회사: ${data.company || ''}\n` +
          `연락처: ${data.phone || ''}\n` +
          `이메일: ${data.email || ''}\n` +
          `문의유형: ${data.inquiry_type || ''}\n` +
          `문의내용:\n${data.message || ''}`
        );
        window.location.href = `mailto:namilsystem@naver.com?subject=${subject}&body=${body}`;
        showSuccess(form, successMsg);
      }
    });
  }

  function validateField(field) {
    let valid = true;
    let msg = '';

    // 체크박스(개인정보 동의 등)는 value가 아닌 checked 여부로 검증
    if (field.type === 'checkbox') {
      if (field.hasAttribute('required') && !field.checked) {
        valid = false;
        msg = '필수 동의 항목입니다.';
      }
    } else {
      const val = field.value.trim();
      if (field.hasAttribute('required') && !val) {
        valid = false;
        msg = '필수 입력 항목입니다.';
      } else if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        valid = false;
        msg = '올바른 이메일 형식이 아닙니다.';
      } else if (field.type === 'tel' && val && !/^[\d\-() ]{7,}$/.test(val)) {
        valid = false;
        msg = '올바른 전화번호 형식이 아닙니다.';
      }
    }

    const errorEl = field.parentElement.querySelector('.inquiry-form__error');
    if (!valid) {
      field.classList.add('has-error');
      if (errorEl) { errorEl.textContent = msg; errorEl.classList.add('is-visible'); }
    }
    return valid;
  }

  function clearError(field) {
    field.classList.remove('has-error');
    const errorEl = field.parentElement.querySelector('.inquiry-form__error');
    if (errorEl) errorEl.classList.remove('is-visible');
  }

  function showSuccess(form, successMsg) {
    form.style.display = 'none';
    if (successMsg) successMsg.classList.add('is-visible');
  }

  // ---- FAQ Accordion ----
  function setupFaq() {
    document.querySelectorAll('.faq-item__question').forEach(btn => {
      btn.addEventListener('click', function() {
        const item = this.closest('.faq-item');
        const isOpen = item.classList.contains('is-open');

        // Close all items in the same list
        const list = item.parentElement;
        list.querySelectorAll('.faq-item.is-open').forEach(open => open.classList.remove('is-open'));

        // Open clicked item if it wasn't already open
        if (!isOpen) item.classList.add('is-open');
      });
    });
  }

  // ---- Blog Feed (Tistory RSS via rss2json) ----
  function setupBlogFeed() {
    // 지원 컨테이너: 기존 #blog-feed (최대 5) + [data-blog-feed] (data-limit 만큼)
    const containers = [];
    const legacy = document.getElementById('blog-feed');
    if (legacy) containers.push({ el: legacy, limit: 5 });
    document.querySelectorAll('[data-blog-feed]').forEach(el => {
      const limit = parseInt(el.getAttribute('data-limit'), 10) || 5;
      containers.push({ el: el, limit: limit });
    });
    if (containers.length === 0) return;

    // 설정: 티스토리 블로그 ID (예: 'namilsystem')
    const tistoryId = 'namilsystem';
    const rssUrl = 'https://' + tistoryId + '.tistory.com/rss';
    const apiUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl);

    const loadingHtml = '<p style="text-align:center;color:var(--color-text-muted);padding:24px 0">블로그 글을 불러오는 중입니다…</p>';
    const emptyHtml = '<p style="text-align:center;color:var(--color-text-muted)">아직 등록된 블로그 글이 없습니다.</p>';
    const errorHtml = '<p style="text-align:center;color:var(--color-text-muted)">블로그 피드를 불러오는 중 문제가 발생했습니다.</p>';

    containers.forEach(c => { c.el.innerHTML = loadingHtml; });

    function decodeHtml(text) {
      const txt = document.createElement('textarea');
      txt.innerHTML = text;
      return txt.value;
    }
    function renderItems(items, limit) {
      let html = '<div class="blog-feed__list">';
      items.slice(0, limit).forEach(item => {
        const date = new Date(item.pubDate).toLocaleDateString('ko-KR');
        const title = decodeHtml(item.title);
        html += '<a href="' + item.link + '" target="_blank" rel="noopener" class="blog-feed__item">' +
          '<span class="blog-feed__title">' + title + '</span>' +
          '<span class="blog-feed__date">' + date + '</span></a>';
      });
      html += '</div>';
      return html;
    }

    fetch(apiUrl)
      .then(r => r.json())
      .then(data => {
        if (data.status !== 'ok' || !data.items || data.items.length === 0) {
          containers.forEach(c => { c.el.innerHTML = emptyHtml; });
          return;
        }
        containers.forEach(c => { c.el.innerHTML = renderItems(data.items, c.limit); });
      })
      .catch(() => {
        containers.forEach(c => { c.el.innerHTML = errorHtml; });
      });
  }

  // ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
