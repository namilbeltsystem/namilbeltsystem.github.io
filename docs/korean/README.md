# Habasit 한글 기술자료 PDF

하바지트(Habasit) 공식 파트너 남일벨트시스템이 제공하는 **완전 한글 카탈로그**입니다.

## 완전 한글판 (전 22종)

모든 카탈로그가 **모든 페이지 한국어 완역**된 완전 한글판입니다.
- 진짜 텍스트 레이어(검색·복사 가능), 한국어 글리프 100% 정상 렌더링
- 사이트 브랜드(네이버 그린 #03C75A, Nanum Gothic)와 일관된 디자인
- 영문 원본은 `../english/` 에 분리 보존(아래 “영문 원본” 참고)
- 생성 스크립트: `../../pdfgen/build_catalog_kr.py` + `../../pdfgen/catalogs_data.py`

### HabaSYNC 타이밍 벨트 계열
- `habasync-timing-belts-kr.pdf` — HabaSYNC 타이밍 벨트
- `habasync-wide-kr.pdf` — 와이드 타이밍 벨트
- `habasync-flex-kr.pdf` — Flex 타이밍 벨트
- `habasync-flat-kr.pdf` — 플랫 타이밍 벨트
- `habasync-capabilities-kr.pdf` — 타이밍 벨트 제품·제작 역량

### 컨베이어 / 고하중 벨트
- `heavy-duty-belts-kr.pdf` — 고하중 컨베이어 벨트
- `crosslapper-kr.pdf` — 크로스래퍼 벨트

### 식품 벨트
- `food-belts-kr.pdf` — 프리미엄 TPU 식품 벨트
- `cleanline-kr.pdf` — Cleanline 위생 벨트
- `monolithic-belts-kr.pdf` — Cleandrive 모놀리식 벨트
- `monolithic-elastic-kr.pdf` — 모놀리식 탄성 벨트

### 식품 산업별 가이드
- `bakery-industry-kr.pdf` — 베이커리 산업 벨트
- `meat-poultry-kr.pdf` — 육류/가금류 산업 벨트
- `food-protein-kr.pdf` — 식품 단백질 가공 벨트

### 모듈러 벨트 / 체인 / 스파이럴
- `modular-belts-kr.pdf` — HabasitLINK 모듈러 벨트
- `habachain-guide-kr.pdf` — HabaCHAIN 컨베이어 체인
- `spiral-capabilities-kr.pdf` — 스파이럴 컨베이어 솔루션

### 산업별 솔루션
- `textile-yarn-kr.pdf` — 섬유 산업 벨트
- `tire-industry-kr.pdf` — 타이어 산업 벨트
- `wide-timing-tire-kr.pdf` — 타이어용 와이드 타이밍 벨트

### 공구 / 부품
- `tools-accessories-kr.pdf` — 제작 공구 및 액세서리
- `habiplast-kr.pdf` — HabiPLAST 열가소성 프로파일 부품

## 전체 재생성

```bash
python pdfgen/build_catalog_kr.py             # 전체 22종
python pdfgen/build_catalog_kr.py <키>        # 특정 1종만
python pdfgen/build_catalog_kr.py --list      # 키 목록
```

콘텐츠 수정은 `pdfgen/catalogs_data.py` 의 `CATALOGS` 데이터를 편집한 뒤 재생성.
