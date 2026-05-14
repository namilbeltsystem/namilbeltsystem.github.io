# 블로그 자동 포스팅 봇

## 구성

```
blog/
├── generate_post.py      # 포스트 생성기 (템플릿 기반)
├── post_to_tistory.py    # 티스토리 API 포스팅
├── config.json           # 설정 파일
├── templates/            # 포스트 템플릿
├── posts/                # 생성된 포스트 (자동)
├── archive/              # 포스팅 완료된 글
└── README.md             # 이 파일
```

## 설정 방법

### 1. 티스토리 API 키 발급

1. https://www.tistory.com/guide/api/manage/register 접속
2. **앱 등록** 클릭
   - 앱 이름: `남일벨트시스템 블로그`
   - 앱 설명: `블로그 자동 포스팅`
   - 앱 URL: `https://namilbeltsystem.github.io`
3. 등록 완료 후 **Client ID**와 **Secret Key** 확인
4. 브라우저에서 아래 URL 접속:
   ```
   https://www.tistory.com/oauth/authorize?client_id=발급받은ID&redirect_uri=https://namilbeltsystem.github.io&response_type=token
   ```
5. "허가하기" 클릭 → 리디렉션된 URL에서 `access_token=` 뒤의 값을 복사

### 2. GitHub Secrets 설정

1. https://github.com/namilbeltsystem/namilbeltsystem.github.io/settings/secrets/actions 접속
2. **New repository secret** 클릭
3. Name: `TISTORY_TOKEN`, Value: 복사한 토큰 값 붙여넣기 → **Add secret**

### 3. config.json 수정

`blog/config.json` 에서 `YOUR_TISTORY_ACCESS_TOKEN` 대신 토큰 값을 직접 넣으세요 (로컬 테스트용).

## 사용 방법

### 자동 포스팅 (매주 월요일)
- GitHub Actions가 매주 월요일 09:00(KST)에 자동 실행
- 벨트 제품 소개 + 산업 동향 + 서비스 안내 3개 글 생성 후 티스토리 포스팅

### 수동 포스팅
1. GitHub에서 Actions 탭 → "Weekly Blog Post Generator" → **Run workflow**
2. 포스트 내용 확인 후 포스팅됨

### 새 자료 입력하기
`blog/generate_post.py` 파일을 열고 `TEMPLATES` 항목에 새 토픽을 추가하세요:

```python
("새 제목", "이미지키",
 "본문 내용을 여기에 작성합니다.")
```

## 포스트 종류

| 카테고리 | 설명 | 빈도 |
|----------|------|------|
| belt_intro | 벨트 제품 소개 (6종) | 매주 1개 |
| industry_news | 산업 동향/뉴스 | 매주 1개 |
| service_intro | 서비스 안내 | 매주 1개 |
