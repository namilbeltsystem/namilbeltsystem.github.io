#!/usr/bin/env python3
"""남일벨트시스템 웹사이트 빌더 - 공통 템플릿으로 HTML 페이지 생성"""

import json, os, sys

SITE_URL = "https://xn--q20bp1ulxengk5sqrqshc.kr"
GA_ID = "G-RKW5E36SZV"
NAVER_VERIFY = "d9dd62e476cab31e499018ef4ea7e29990f4531f"
GOOGLE_VERIFY = "WbPgR_X6Y0ddPQl388pQvF2tQiBfU4DNU6dNJZ_fqT8"

# Shared across all pages
HEAD_COMMON = (
    '<meta charset="UTF-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    f'<meta name="naver-site-verification" content="{NAVER_VERIFY}">\n'
    f'<meta name="google-site-verification" content="{GOOGLE_VERIFY}">\n'
    '{{OG_META}}\n'
    '{{DESC_META}}\n'
    '<title>{{TITLE}}</title>\n'
    '<link rel="canonical" href="{{CANONICAL}}">\n'
    '<link rel="icon" type="image/x-icon" href="favicon.ico">\n'
    '<link rel="apple-touch-icon" href="images/logo.png">\n'
    '<link rel="stylesheet" href="css/style.css">\n'
    f'<script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>\n'
    '<script>\n'
    '  window.dataLayer = window.dataLayer || [];\n'
    f'  function gtag(){{dataLayer.push(arguments);}}gtag("js",new Date());gtag("config","{GA_ID}");\n'
    '</script>\n'
    '{{EXTRA_HEAD}}'
)

HEADER = (
    '<header class="page-header">\n'
    '  <div class="container">\n'
    '    <a href="index.html" class="logo">\n'
    '      <img src="images/logo.svg" alt="남일벨트시스템" height="36">\n'
    '      <span>남일벨트시스템</span>\n'
    '    </a>\n'
    '    <button class="nav-toggle" id="nav-toggle" type="button" '
    'aria-label="메뉴 열기" aria-controls="nav" aria-expanded="false">\n'
    '      <span class="nav-toggle__bar"></span>\n'
    '      <span class="nav-toggle__bar"></span>\n'
    '      <span class="nav-toggle__bar"></span>\n'
    '    </button>\n'
    '    <nav class="nav" id="nav" aria-label="주요 메뉴">\n'
    '      <ul class="nav__list">\n'
    '        <li><a href="index.html" class="nav__link{{NAV_HOME}}">홈</a></li>\n'
    '        <li><a href="about.html" class="nav__link{{NAV_ABOUT}}">회사소개</a></li>\n'
    '        <li><a href="belt-types.html" class="nav__link{{NAV_BELT}}">벨트 종류</a></li>\n'
    '        <li><a href="habasit-catalog.html" class="nav__link{{NAV_CATALOG}}">카탈로그</a></li>\n'
    '        <li><a href="industry-trends.html" class="nav__link{{NAV_TRENDS}}">산업 동향</a></li>\n'
    '        <li><a href="news.html" class="nav__link{{NAV_NEWS}}">최신 정보</a></li>\n'
    '        <li><a href="faq.html" class="nav__link{{NAV_FAQ}}">자주 묻는 질문</a></li>\n'
    '        <li><a href="contact.html" class="nav__link{{NAV_CONTACT}}">상담문의</a></li>\n'
    '      </ul>\n'
    '    </nav>\n'
    '  </div>\n'
    '</header>'
)

FOOTER = (
    '<footer class="page-footer">\n'
    '  <div class="container">\n'
    '    <div class="footer__grid">\n'
    '      <div class="footer__company">\n'
    '        <strong>남일벨트시스템</strong>\n'
    '        <p>산업용 컨베이어 벨트 전문 기업 · 하바지트 공식 파트너</p>\n'
    '        <p><a href="company-info.html">사업자 정보 보기</a></p>\n'
    '        <p><a href="privacy.html">개인정보 처리방침</a></p>\n'
    '      </div>\n'
    '      <div class="footer__contact">\n'
    '        <p>전화: <a href="tel:02-6084-7795">02-6084-7795</a></p>\n'
    '        <p>이메일: <a href="mailto:namilsystem@naver.com">namilsystem@naver.com</a></p>\n'
    '      </div>\n'
    '    </div>\n'
    '    <div class="footer__bottom">\n'
    '      <p>&copy; 2026 남일벨트시스템. All Rights Reserved.</p>\n'
    '    </div>\n'
    '  </div>\n'
    '</footer>'
)

FLOATING = (
    '<div class="floating">\n'
    '  <a href="tel:02-6084-7795" class="floating__btn" title="전화" aria-label="전화">&#128222;</a>\n'
    '  <a href="mailto:namilsystem@naver.com" class="floating__btn" title="이메일" aria-label="이메일">&#9993;</a>\n'
    '  <a href="https://namilsystem.tistory.com/" target="_blank" rel="noopener" class="floating__btn" title="블로그" aria-label="블로그">&#127760;</a>\n'
    '  <button class="floating__btn floating__btn--top" title="맨 위로" aria-label="맨 위로">&#9650;</button>\n'
    '</div>'
)

LIGHTBOX = (
    '<div class="lightbox" id="lightbox">\n'
    '  <button class="lightbox__close" aria-label="닫기">&times;</button>\n'
    '  <img class="lightbox__image" src="" alt="">\n'
    '</div>'
)

SCRIPT = '<script src="js/main.js"></script>'

PAGES = {
    "index": {
        "file": "index.html",
        "nav_active": "home",
        "title": "컨베이어 벨트 전문기업 남일벨트시스템 | 산업용 벨트 솔루션",
        "description": "경량·고하중·식품·타이밍·모놀리식 컨베이어 벨트 전문. 무료 상담, 맞춤 설계, 현장 설치, 유지보수까지. 지금 문의하세요.",
        "og_title": "남일벨트시스템 - 최고의 컨베이어 벨트를 제공합니다",
        "og_image": "images/logo.png",
        "og_description": "산업용 벨트, 컨베이어 벨트, 컨베이어 시스템",
        "canonical": f"{SITE_URL}/",
        "extra_head": (
            '<script type="application/ld+json">\n'
            '{\n'
            '  "@context": "https://schema.org",\n'
            '  "@type": "LocalBusiness",\n'
            '  "name": "남일벨트시스템",\n'
            '  "description": "산업용 컨베이어 벨트 전문기업",\n'
            f'  "url": "{SITE_URL}/",\n'
            '  "telephone": "+82-2-6084-7795",\n'
            '  "email": "namilsystem@naver.com",\n'
            '  "faxNumber": "+82-2-6403-9380",\n'
            '  "address": {\n'
            '    "@type": "PostalAddress",\n'
            '    "addressCountry": "KR",\n'
            '    "addressRegion": "서울특별시",\n'
            '    "addressLocality": "동대문구"\n'
            '  }\n'
            '}\n'
            '</script>'
        ),
    },
    "about": {
        "file": "about.html",
        "nav_active": "about",
        "title": "회사소개 - 컨베이어 벨트 전문기업 | 남일벨트시스템",
        "description": "남일벨트시스템 회사소개 - 하바지트 공식 파트너. 산업용 컨베이어 벨트 설계·제작·설치·유지보수 원스톱 전문. 미션·핵심가치·서비스 프로세스를 소개합니다.",
        "og_title": "회사소개 | 남일벨트시스템",
        "og_image": "images/about-1.png",
        "og_description": "산업용 벨트, 컨베이어 벨트, 컨베이어 시스템 전문 기업 남일벨트시스템입니다.",
        "canonical": f"{SITE_URL}/about.html",
        "extra_head": (
            '<script type="application/ld+json">\n'
            '{\n'
            '  "@context": "https://schema.org",\n'
            '  "@type": "Organization",\n'
            '  "name": "남일벨트시스템",\n'
            '  "description": "산업용 컨베이어 벨트 전문기업 · 하바지트 공식 파트너",\n'
            f'  "url": "{SITE_URL}/about.html",\n'
            '  "telephone": "+82-2-6084-7795",\n'
            '  "email": "namilsystem@naver.com",\n'
            '  "sameAs": ["https://namilsystem.tistory.com/"]\n'
            '}\n'
            '</script>'
        ),
    },
    "contact": {
        "file": "contact.html",
        "nav_active": "contact",
        "title": "상담문의 - 무료 견적 및 기술 상담 | 남일벨트시스템",
        "description": "컨베이어 벨트 무료 상담 및 견적 문의. 전화 02-6084-7795, 이메일 namilsystem@naver.com. 맞춤 설계부터 설치까지 신속하게 도와드립니다.",
        "og_title": "상담문의 | 남일벨트시스템",
        "og_image": "images/contact-hero.png",
        "og_description": "산업용 벨트, 컨베이어 벨트 상담 및 문의 - 남일벨트시스템",
        "canonical": f"{SITE_URL}/contact.html",
        "extra_head": "",
    },
    "belt-types": {
        "file": "belt-types.html",
        "nav_active": "belt",
        "title": "컨베이어 벨트 종류 및 시스템 - 경량·고하중·식품·타이밍 | 남일벨트시스템",
        "description": "6종 산업용 컨베이어 벨트 소개 - 경량, 고하중, 식품, 프로세싱, 타이밍, 모놀리식 벨트. 용도별 맞춤 추천. 무료 상담 문의.",
        "og_title": "벨트 종류 | 남일벨트시스템",
        "og_image": "images/belt-lightweight.png",
        "og_description": "경량 컨베이어 벨트, 고하중 벨트, 식품 벨트, 타이밍 벨트 등 다양한 산업용 벨트를 소개합니다.",
        "canonical": f"{SITE_URL}/belt-types.html",
        "extra_head": "",
    },
    "industry-trends": {
        "file": "industry-trends.html",
        "nav_active": "trends",
        "title": "벨트 산업 동향 2025-2030 | 남일벨트시스템",
        "description": "2025-2030 글로벌 및 국내 컨베이어 벨트 시장 분석. 세계 시장 71억 달러, 국내 6,500억원 규모. 물류·식품·광업·스마트팩토리 동향.",
        "og_title": "벨트 산업 동향 | 남일벨트시스템",
        "og_image": "images/logo.png",
        "og_description": "국내외 컨베이어 벨트 시장 규모, 성장률, 주요 트렌드 분석",
        "canonical": f"{SITE_URL}/industry-trends.html",
        "extra_head": "",
    },
    "habasit-catalog": {
        "file": "habasit-catalog.html",
        "nav_active": "catalog",
        "title": "전체 카탈로그 - 하바지트 전 제품군 | 남일벨트시스템",
        "description": "Habasit 하바지트 전체 카탈로그 - 패브릭 벨트, 타이밍 벨트, 모듈러 벨트, 모놀리식 벨트, 식품 벨트, 고하중 벨트, 체인, 플라스틱 모듈, 공구 및 액세서리.",
        "og_title": "전체 카탈로그 | 남일벨트시스템",
        "og_image": "images/logo.png",
        "og_description": "Habasit 하바지트 전 제품군 카탈로그를 한눈에 확인하세요. 벨트, 체인, 플라스틱 모듈, 공구 및 액세서리.",
        "canonical": f"{SITE_URL}/habasit-catalog.html",
        "extra_head": "",
    },
    "privacy": {
        "file": "privacy.html",
        "nav_active": "privacy",
        "title": "개인정보 처리방침 | 남일벨트시스템",
        "description": "남일벨트시스템 개인정보 처리방침 - 수집하는 개인정보 항목, 이용 목적, 보유 기간 등 안내.",
        "og_title": "개인정보 처리방침 | 남일벨트시스템",
        "og_image": "images/logo.png",
        "og_description": "남일벨트시스템 개인정보 처리방침 안내",
        "canonical": f"{SITE_URL}/privacy.html",
        "extra_head": "",
    },
    "company-info": {
        "file": "company-info.html",
        "nav_active": "company",
        "title": "사업자 정보 | 남일벨트시스템",
        "description": "남일벨트시스템 사업자 정보 - 상호, 소재지, 사업자등록번호, 연락처 안내. (개인정보 보호를 위해 별도 페이지에 공개합니다.)",
        "og_title": "사업자 정보 | 남일벨트시스템",
        "og_image": "images/logo.png",
        "og_description": "남일벨트시스템 사업자 정보 안내 페이지",
        "canonical": f"{SITE_URL}/company-info.html",
        "extra_head": (
            '<script type="application/ld+json">\n'
            '{\n'
            '  "@context": "https://schema.org",\n'
            '  "@type": "LocalBusiness",\n'
            '  "name": "남일벨트시스템",\n'
            '  "description": "산업용 컨베이어 벨트 전문기업",\n'
            f'  "url": "{SITE_URL}/",\n'
            '  "telephone": "+82-2-6084-7795",\n'
            '  "email": "namilsystem@naver.com",\n'
            '  "faxNumber": "+82-2-6403-9380",\n'
            '  "address": {\n'
            '    "@type": "PostalAddress",\n'
            '    "addressCountry": "KR",\n'
            '    "addressRegion": "서울특별시",\n'
            '    "addressLocality": "동대문구",\n'
            '    "streetAddress": "한천로2길 16, 212호(덕암빌딩)"\n'
            '  },\n'
            '  "founder": {\n'
            '    "@type": "Person",\n'
            '    "name": "홍종수"\n'
            '  },\n'
            '  "taxID": "268-06-02265"\n'
            '}\n'
            '</script>'
        ),
    },
    "news": {
        "file": "news.html",
        "nav_active": "news",
        "title": "최신 정보 - 컨베이어 벨트 기술·업계 소식 | 남일벨트시스템",
        "description": "남일벨트시스템 최신 정보 - 컨베이어 벨트 기술 자료, 설치·유지보수 노하우, 업계 동향을 블로그와 연동하여 한곳에서 확인하세요.",
        "og_title": "최신 정보 | 남일벨트시스템",
        "og_image": "images/logo.png",
        "og_description": "컨베이어 벨트 최신 기술 자료와 업계 소식, 남일벨트시스템 블로그를 연동한 최신 정보",
        "canonical": f"{SITE_URL}/news.html",
        "extra_head": "",
    },
    "faq": {
        "file": "faq.html",
        "nav_active": "faq",
        "title": "자주 묻는 질문 - 벨트 선정·견적·설치·A/S | 남일벨트시스템",
        "description": "남일벨트시스템 자주 묻는 질문(FAQ) - 컨베이어 벨트 선정, 견적, 설치 기간, 최소 주문, 교체, 유지보수, 긴급 출장 등 고객 문의 정리.",
        "og_title": "자주 묻는 질문 | 남일벨트시스템",
        "og_image": "images/logo.png",
        "og_description": "컨베이어 벨트 선정·견적·설치·유지보수 관련 자주 묻는 질문과 답변",
        "canonical": f"{SITE_URL}/faq.html",
        "extra_head": "",
    },
}

def nav_class(page_key, active):
    return ' nav__link--active' if page_key == active else ''

def abs_url(path):
    """상대 경로를 사이트 절대 URL로 변환 (OG/Twitter 이미지는 절대 URL이어야 함)."""
    if path.startswith('http://') or path.startswith('https://'):
        return path
    return SITE_URL.rstrip('/') + '/' + path.lstrip('/')

def build():
    """모든 페이지 생성"""
    built = 0
    for key, meta in PAGES.items():
        content_file = f"content/{key}.html"
        if not os.path.exists(content_file):
            print(f"SKIP: {content_file} not found")
            continue

        with open(content_file, encoding="utf-8") as f:
            body = f.read().strip()

        # Open Graph & Twitter Card meta tags (이미지/URL은 절대 경로)
        og_image_url = abs_url(meta["og_image"])
        og_meta = (
            '<meta property="og:type" content="website">\n'
            f'<meta property="og:site_name" content="남일벨트시스템">\n'
            f'<meta property="og:title" content="{meta["og_title"]}">\n'
            f'<meta property="og:url" content="{meta["canonical"]}">\n'
            f'<meta property="og:image" content="{og_image_url}">\n'
            f'<meta property="og:description" content="{meta["og_description"]}">\n'
            '<meta name="twitter:card" content="summary_large_image">\n'
            f'<meta name="twitter:title" content="{meta["og_title"]}">\n'
            f'<meta name="twitter:description" content="{meta["og_description"]}">\n'
            f'<meta name="twitter:image" content="{og_image_url}">'
        )

        desc_meta = f'<meta name="description" content="{meta["description"]}">'

        # Navigation active states
        active = meta["nav_active"]
        nav_map = {
            "{{NAV_HOME}}": nav_class(active, "home"),
            "{{NAV_ABOUT}}": nav_class(active, "about"),
            "{{NAV_CONTACT}}": nav_class(active, "contact"),
            "{{NAV_BELT}}": nav_class(active, "belt"),
            "{{NAV_CATALOG}}": nav_class(active, "catalog"),
            "{{NAV_TRENDS}}": nav_class(active, "trends"),
            "{{NAV_NEWS}}": nav_class(active, "news"),
            "{{NAV_FAQ}}": nav_class(active, "faq"),
        }
        header_html = HEADER
        for marker, cls in nav_map.items():
            header_html = header_html.replace(marker, cls)

        # Head section
        head_html = HEAD_COMMON
        head_html = head_html.replace("{{OG_META}}", og_meta)
        head_html = head_html.replace("{{DESC_META}}", desc_meta)
        head_html = head_html.replace("{{TITLE}}", meta["title"])
        head_html = head_html.replace("{{CANONICAL}}", meta["canonical"])
        head_html = head_html.replace("{{EXTRA_HEAD}}", meta.get("extra_head", ""))

        # Assemble
        output = f'<!DOCTYPE html>\n<html lang="ko">\n<head>\n  {head_html}\n</head>\n<body>\n\n{header_html}\n\n<main>\n{body}\n</main>\n\n{FOOTER}\n\n{FLOATING}\n\n{LIGHTBOX}\n\n{SCRIPT}\n</body>\n</html>\n'

        file_path = meta["file"]
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(output)
        print(f"  OK  {file_path}")
        built += 1

    print(f"\nBuilt {built} pages.")

if __name__ == "__main__":
    build()
