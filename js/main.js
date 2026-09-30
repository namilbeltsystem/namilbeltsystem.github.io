(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    highlightCurrentNav();
    setupHeaderScroll();
    setupMobileNav();
    setupHeroSlider();
    setupCounters();
    setupReveal();
    setupSmoothScroll();
    setupFloatingButtons();
    setupInquiryForm();
    setupFaq();
    setupBlogFeed();
    setupFooterYear();
  }

  // ---- Nav Highlighting ----
  function highlightCurrentNav() {
    const path = window.location.pathname;
    let active = null;
    document.querySelectorAll('.nav__link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && path.endsWith(href)) active = link;
    });
    // 네비게이션에 없는 서브 페이지에서는 "홈"이 잘못 활성화되지 않도록,
    // 실제 홈(/ 또는 index.html)일 때만 처리.
    if (!active) {
      const isHome = path === '/' || /(^|\/)index\.html$/.test(path);
      if (isHome) active = document.querySelector('.nav__link[href="index.html"]');
    }
    if (active) {
      active.classList.add('nav__link--active');
      active.setAttribute('aria-current', 'page');
    }
  }

  // ---- Header Scroll State ----
  function setupHeaderScroll() {
    const header = document.querySelector('.page-header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ---- Mobile Navigation (Hamburger) ----
  function setupMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('nav');
    if (!toggle || !nav) return;

    const background = [document.querySelector('main'), document.querySelector('.page-footer'), document.querySelector('.floating')]
      .filter(Boolean);

    const setBackgroundInert = (state) => {
      background.forEach(el => {
        if (state) el.setAttribute('inert', '');
        else el.removeAttribute('inert');
      });
    };

    const close = (returnFocus) => {
      nav.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '메뉴 열기');
      document.body.classList.remove('nav-open');
      setBackgroundInert(false);
      if (returnFocus) toggle.focus();
    };
    const open = () => {
      nav.classList.add('is-open');
      toggle.classList.add('is-active');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', '메뉴 닫기');
      document.body.classList.add('nav-open');
      setBackgroundInert(true);
      const first = nav.querySelector('a');
      if (first) first.focus();
    };

    toggle.addEventListener('click', () => {
      nav.classList.contains('is-open') ? close(false) : open();
    });
    // 메뉴 링크 클릭 시 닫기
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => close(false)));
    // 데스크톱으로 확장 시 닫기
    window.addEventListener('resize', () => { if (window.innerWidth > 992) close(false); });
    // Escape 키로 닫기 (포커스 복원)
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) close(true);
    });
    // 포커스 트랩: 메뉴 열림 상태에서 탭 순환을 토글+메뉴 내부로 제한
    document.addEventListener('keydown', e => {
      if (e.key !== 'Tab' || !nav.classList.contains('is-open')) return;
      const focusables = [toggle, ...nav.querySelectorAll('a')];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (!focusables.includes(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  // ---- Hero Slider ----
  function setupHeroSlider() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) return;
    const slides = Array.from(slider.querySelectorAll('.hero-slide'));
    if (slides.length < 2) return;

    const dotsWrap = slider.querySelector('.hero-slider__dots');
    const prevBtn = slider.querySelector('.hero-slider__arrow--prev');
    const nextBtn = slider.querySelector('.hero-slider__arrow--next');
    const pauseBtn = slider.querySelector('.hero-slider__pause');
    const progressBar = slider.querySelector('.hero-slider__progress-bar');
    const INTERVAL = 6000;
    slider.style.setProperty('--hero-interval', INTERVAL + 'ms');

    let index = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));
    let timer = null;
    let paused = false;
    const isPlaying = () => !paused && !prefersReducedMotion;

    // 도트 생성
    const dots = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hero-slider__dot';
      dot.setAttribute('aria-label', (i + 1) + '번 슬라이드로 이동');
      dot.addEventListener('click', () => goTo(i, true));
      if (dotsWrap) dotsWrap.appendChild(dot);
      return dot;
    });

    function render() {
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
      if (progressBar) {
        progressBar.classList.remove('is-running');
        // 리플로우 후 애니메이션 재시작
        void progressBar.offsetWidth;
        if (isPlaying()) progressBar.classList.add('is-running');
      }
    }

    function goTo(i, userAction) {
      index = (i + slides.length) % slides.length;
      render();
      if (userAction) restart();
    }

    function next() { goTo(index + 1, false); }
    function prev() { goTo(index - 1, false); }

    function start() {
      stop();
      if (!isPlaying()) return;
      timer = window.setInterval(next, INTERVAL);
    }
    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }
    function restart() {
      stop();
      start();
    }

    // 일시정지/재생 버튼
    if (pauseBtn) {
      const syncPauseBtn = () => {
        pauseBtn.textContent = paused ? '▶' : '❚❚';
        pauseBtn.setAttribute('aria-label', paused ? '자동 재생 시작' : '자동 재생 일시정지');
      };
      pauseBtn.addEventListener('click', () => {
        paused = !paused;
        syncPauseBtn();
        render();
        restart();
      });
      syncPauseBtn();
    }

    // 화살표
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); restart(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); restart(); });

    // 호버/포커스 시 일시정지
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', (e) => {
      if (!slider.contains(e.relatedTarget)) start();
    });

    // 키보드 조작 (슬라이더 내부 포커스 시)
    slider.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); restart(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); restart(); }
    });

    // 모바일 스와이프
    let touchX = null;
    slider.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; stop(); }, { passive: true });
    slider.addEventListener('touchend', e => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 48) (dx < 0 ? next() : prev());
      touchX = null;
      start();
    }, { passive: true });

    // 탭 전환 시 일시정지
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });

    render();
    start();
  }

  // ---- Animated Counters ----
  function setupCounters() {
    const numbers = document.querySelectorAll('[data-count]');
    if (!numbers.length) return;

    const animate = (el) => {
      const target = parseInt(el.getAttribute('data-count'), 10) || 0;
      const suffix = el.getAttribute('data-suffix') || '';
      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString('ko-KR') + suffix;
        return;
      }
      const duration = 1600;
      const startTime = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        el.textContent = Math.round(target * eased).toLocaleString('ko-KR') + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if (!('IntersectionObserver' in window)) {
      numbers.forEach(animate);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    numbers.forEach(el => io.observe(el));
  }

  // ---- Scroll Reveal ----
  function setupReveal() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      targets.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(el => io.observe(el));
  }

  // ---- Smooth Scroll ----
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;
        let target = null;
        try { target = document.querySelector(href); } catch (_) { return; }
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        // 키보드 사용자를 위해 이동 후 포커스 이동
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  // ---- Floating Buttons ----
  function setupFloatingButtons() {
    const floating = document.querySelector('.floating');
    const topBtn = document.querySelector('.floating__btn--top');
    const toggleBtn = document.querySelector('.floating__toggle');

    if (topBtn) {
      const onScroll = () => topBtn.classList.toggle('is-visible', window.scrollY > 400);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      topBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    }

    // 모바일 접이식 빠른 연락 메뉴
    if (toggleBtn && floating) {
      toggleBtn.addEventListener('click', () => {
        const expanded = floating.classList.toggle('is-expanded');
        toggleBtn.classList.toggle('is-active', expanded);
        toggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        toggleBtn.setAttribute('aria-label', expanded ? '빠른 연락 메뉴 닫기' : '빠른 연락 메뉴 열기');
      });
    }
  }

  // ---- Contact Form ----
  function setupInquiryForm() {
    const form = document.querySelector('.inquiry-form');
    if (!form) return;

    const fields = Array.from(form.querySelectorAll('[data-validate]'));
    const submitBtn = form.querySelector('.inquiry-form__submit');
    const successMsg = form.querySelector('.inquiry-form__success');
    const failMsg = form.querySelector('.inquiry-form__fail');
    const summary = form.querySelector('.inquiry-form__error-summary');

    // 커스텀 검증 UI 사용을 위해 네이티브 검증 비활성화
    form.setAttribute('novalidate', 'novalidate');

    // 실시간 검증(오류 해제)
    fields.forEach(field => {
      field.addEventListener('input', () => clearError(field));
      field.addEventListener('change', () => clearError(field));
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // 봇 방지 허니팟
      const hp = form.querySelector('[name="_gotcha"]');
      if (hp && hp.value) return;

      // 검증
      const invalid = [];
      fields.forEach(field => {
        if (!validateField(field)) invalid.push(field);
      });

      if (invalid.length > 0) {
        showSummary(invalid);
        invalid[0].focus();
        return;
      }
      hideSummary();

      // 전송 준비
      submitBtn.disabled = true;
      const originalLabel = submitBtn.textContent;
      submitBtn.textContent = '전송 중…';

      const formData = new FormData(form);
      const data = {};
      formData.forEach((v, k) => data[k] = v);

      const restore = () => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      };

      const onSuccess = () => {
        form.querySelectorAll('.inquiry-form__group, .inquiry-form__row, .inquiry-form__submit, .inquiry-form__error-summary')
          .forEach(el => { el.style.display = 'none'; });
        if (successMsg) {
          successMsg.classList.add('is-visible');
          successMsg.setAttribute('tabindex', '-1');
          successMsg.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
          successMsg.focus({ preventScroll: true });
        }
      };

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
          .then(res => {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            onSuccess();
          })
          .catch(() => {
            // 전송 실패: 사용자에게 정확히 알리고 대체 연락 수단 안내
            restore();
            if (failMsg) {
              failMsg.classList.add('is-visible');
              failMsg.setAttribute('tabindex', '-1');
              failMsg.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
              failMsg.focus({ preventScroll: true });
            }
          });
      } else {
        // 폼 엔드포인트가 없는 경우: 이메일 클라이언트로 전달
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
        restore();
        onSuccess();
      }
    });

    // 전송 실패 화면의 "다시 시도" 버튼
    const retryBtn = form.querySelector('.inquiry-form__retry');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        if (failMsg) failMsg.classList.remove('is-visible');
        submitBtn.disabled = false;
        submitBtn.focus();
      });
    }

    function fieldLabel(field) {
      const group = field.closest('.inquiry-form__group');
      const label = group ? group.querySelector('.inquiry-form__label') : null;
      return label ? label.textContent.replace('*', '').trim() : (field.name || '입력 항목');
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

      const group = field.closest('.inquiry-form__group');
      const errorEl = group ? group.querySelector('.inquiry-form__error') : null;
      if (!valid) {
        field.classList.add('has-error');
        field.setAttribute('aria-invalid', 'true');
        if (errorEl) {
          const id = errorEl.id || (errorEl.id = 'err-' + (field.name || Math.random().toString(36).slice(2)));
          errorEl.textContent = msg;
          errorEl.classList.add('is-visible');
          field.setAttribute('aria-describedby', id);
        }
      }
      return valid;
    }

    function clearError(field) {
      field.classList.remove('has-error');
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
      const group = field.closest('.inquiry-form__group');
      const errorEl = group ? group.querySelector('.inquiry-form__error') : null;
      if (errorEl) errorEl.classList.remove('is-visible');
    }

    function showSummary(invalid) {
      if (!summary) return;
      const list = summary.querySelector('ul');
      if (list) {
        list.innerHTML = '';
        invalid.forEach(field => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = '#' + (field.id || field.name);
          a.textContent = fieldLabel(field) + ' 항목을 확인해 주세요';
          a.addEventListener('click', (ev) => {
            ev.preventDefault();
            field.focus();
          });
          li.appendChild(a);
          list.appendChild(li);
        });
      }
      summary.classList.add('is-visible');
      summary.setAttribute('tabindex', '-1');
      summary.focus({ preventScroll: true });
    }

    function hideSummary() {
      if (summary) summary.classList.remove('is-visible');
    }
  }

  // ---- FAQ Accordion ----
  function setupFaq() {
    const questions = document.querySelectorAll('.faq-item__question');
    questions.forEach((btn, i) => {
      const item = btn.closest('.faq-item');
      const answer = item ? item.querySelector('.faq-item__answer') : null;
      if (!answer) return;

      // 접근성 속성 연결
      const answerId = answer.id || (answer.id = 'faq-answer-' + (i + 1));
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-controls', answerId);
      answer.setAttribute('role', 'region');
      answer.setAttribute('aria-labelledby', 'faq-question-' + (i + 1));
      btn.id = 'faq-question-' + (i + 1);

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // 같은 목록의 다른 항목 닫기
        const list = item.parentElement;
        list.querySelectorAll('.faq-item.is-open').forEach(open => {
          open.classList.remove('is-open');
          const q = open.querySelector('.faq-item__question');
          if (q) q.setAttribute('aria-expanded', 'false');
        });

        // 클릭한 항목이 닫혀 있었으면 열기
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
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

    // XSS 방지: 외부 피드 데이터를 HTML로 삽입하기 전 반드시 이스케이프
    function escapeHtml(text) {
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
    function decodeHtml(text) {
      // RSS 제목에 이중 인코딩된 엔티티(예: &amp;mdash;)가 포함될 수 있으므로
      // 값이 안정될 때까지 반복 디코딩하여 &mdash; 같은 문자열 노출을 방지
      let result = String(text);
      for (let i = 0; i < 5; i++) {
        const txt = document.createElement('textarea');
        txt.innerHTML = result;
        if (txt.value === result) break;
        result = txt.value;
      }
      return result;
    }
    function normalizeTitle(text) {
      // 제목 후처리: 엔티티 완전 디코딩 → HTML 태그 제거 → 공백·대시 정규화
      let title = decodeHtml(text);
      title = title.replace(/<[^>]*>/g, '');          // 태그 조각 제거
      title = title.replace(/\s+/g, ' ').trim();      // 연속 공백·줄바꿈 정리
      title = title.replace(/\s*([\u2013\u2014\u2015])\s*/g, ' $1 '); // 대시 주변 공백 균일화
      return title;
    }
    function safeUrl(url) {
      try {
        const u = new URL(url);
        return (u.protocol === 'http:' || u.protocol === 'https:') ? escapeHtml(u.href) : '#';
      } catch (_) {
        return '#';
      }
    }
    function renderItems(items, limit) {
      let html = '<div class="blog-feed__list">';
      items.slice(0, limit).forEach(item => {
        const date = new Date(item.pubDate).toLocaleDateString('ko-KR');
        const title = escapeHtml(normalizeTitle(item.title));
        html += '<a href="' + safeUrl(item.link) + '" target="_blank" rel="noopener" class="blog-feed__item">' +
          '<span class="blog-feed__title">' + title + '</span>' +
          '<span class="blog-feed__date">' + escapeHtml(date) + '</span></a>';
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

  // ---- Footer Year ----
  function setupFooterYear() {
    const year = String(new Date().getFullYear());
    document.querySelectorAll('[data-year]').forEach(el => { el.textContent = year; });
  }

  // ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
