# 남일벨트시스템

산업용 컨베이어 벨트 전문 기업 남일벨트시스템의 공식 홈페이지입니다. (하바지트/Habasit 공식 파트너)

## 빌드 방법

소스는 `content/*.html`(페이지 본문)이며, `build.py`가 공통 템플릿(HEAD/HEADER/FOOTER 등)으로 래핑하여 루트의 `*.html`을 생성합니다. 콘텐츠를 수정한 뒤에는 반드시 빌드를 다시 실행하세요.

```bash
python build.py
```

- GitHub Pages로 자동 배포(`.github/workflows/pages.yml`)
- 티스토리 블로그 최신 글은 `news.html`에서 rss2json API로 실시간 연동(`js/main.js`의 `setupBlogFeed`)

## 사이트 구조

| 페이지 | 파일 | 설명 |
|------|------|------|
| 홈 | `index.html` | 전체 메뉴 버튼 그리드 + 상담문의 CTA |
| 회사소개 | `about.html` | 미션·핵심가치·하바지트 파트너십·원스톱 프로세스 |
| 벨트 종류 | `belt-types.html` | 6종 벨트 + 시스템 서비스 + 하바지트 기술 상세 |
| 전체 카탈로그 | `habasit-catalog.html` | 제품군별 기술 자료(PDF) 다운로드 |
| 산업 동향 | `industry-trends.html` | 2025-2030 시장 분석 |
| 최신 정보 | `news.html` | 블로그 최신 글 연동 + 관련 자료 |
| 자주 묻는 질문 | `faq.html` | 선정·견적·설치·A/S FAQ |
| 상담문의 | `contact.html` | 온라인 문의 폼 + 연락처 |
| 개인정보 처리방침 | `privacy.html` | 개인정보 처리방침 |
| 사업자 정보 | `company-info.html` | 대표·주소·사업자번호 (개인정보 보호용 별도 페이지) |

## 사업자 정보

개인정보 보호를 위해 대표자 성함·사업장 주소·사업자등록번호는 `company-info.html`에만 공개합니다. 자세한 연락처는 상담문의 페이지를 참고하세요.

## 주요 기술 스택

- 순수 HTML/CSS/JS (빌드 도구: Python `build.py`)
- Nanum Gothic 웹폰트, 네이버 컬러(#03C75A) 테마
- 반응형(모바일 햄버거 메뉴), SEO 메타/OG/JSON-LD, 구글 애널리틱스
