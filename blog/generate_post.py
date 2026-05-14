#!/usr/bin/env python3
"""블로그 포스팅 생성기 - 남일벨트시스템"""

import json, os, sys, random
from datetime import datetime, timedelta

# --- Post templates ---
TEMPLATES = {
    "belt_intro": {
        "title_prefix": "[제품 소개]",
        "topics": [
            ("경량 컨베이어 벨트", "belt-lightweight",
             "PVC·PU·PE 소재의 직물 기반 경량 컨베이어 벨트입니다. "
             "분류·계량·검사·포장·일반 운반용으로 폭넓게 사용됩니다. "
             "저마찰·내유·대전방지 등 다양한 표면 처리 옵션을 제공합니다. "
             "물류센터, 제조공장, 포장라인 등 다양한 현장에서 사용되며 유지보수가 용이합니다."),
            ("고하중 컨베이어 벨트", "belt-heavy",
             "엘라스토머 코팅된 고내구성 컨베이어 벨트입니다. "
             "광산·철강·건설·재활용 등 험한 공정 환경에 적합하며 "
             "내마모성·내충격성·내절단성이 탁월합니다. "
             "내유성·내오존성·내UV성이 우수하여 실외 및 열악한 환경에서도 안정적인 성능을 발휘합니다."),
            ("식품 벨트", "belt-food",
             "FDA 및 EU 식품 접촉 규정을 준수하는 프리미엄 TPU 소재 식품 벨트입니다. "
             "육류·제과·유제품 등 끈적이는 식품에도 우수한 방출 특성을 제공하며 "
             "HACCP 대응이 가능한 위생 설계를 갖추었습니다. "
             "CIP(Clean In Place) 세척이 가능하고 내유성·내마모성 코팅이 적용되었습니다."),
            ("타이밍 벨트", "belt-timing",
             "HabaSYNC 타이밍 벨트는 폴리우레탄 및 고무 소재의 고정밀 타이밍 벨트입니다. "
             "T·AT·HTD 프로파일, 스틸·아라미드 텐션 코드를 제공하며 "
             "식품·포장·물류·섬유 산업의 정밀 이송에 최적화되었습니다. "
             "제품의 정확한 위치 이동 및 부품 배치가 필요한 분야에 사용됩니다."),
            ("모놀리식 벨트", "belt-monolithic",
             "아라미드 섬유로 강화된 일체형 모놀리식 벨트입니다. "
             "물이나 습기에 노출되는 식품 공정에서도 탁월한 위생 성능을 발휘하며 "
             "기존 모듈러 벨트 대비 세척 시간과 물 사용량을 크게 줄일 수 있습니다. "
             "이음매가 없어 세균이 서식할 틈이 없으며 HACCP 대응이 가능합니다."),
            ("프로세싱 벨트", "belt-processing",
             "내마모성·내절단성·내유성을 갖춘 고성능 프로세싱 벨트입니다. "
             "높은 그립 및 안정성, 오존 및 자외선 저항성을 제공하며 "
             "다양한 산업 공정의 핵심 이송 장비로 사용됩니다."),
        ]
    },
    "industry_news": {
        "title_prefix": "[산업 동향]",
        "topics": [
            ("컨베이어 벨트 시장 연 5% 성장 전망",
             "세계 컨베이어 벨트 시장은 2025년 약 60억 달러 규모로, "
             "2030년까지 연평균 4~5% 성장이 예상됩니다. "
             "아시아-태평양이 38%로 최대 시장이며, "
             "물류 자동화·이커머스 성장이 핵심 동력입니다. "
             "국내 시장도 약 6,500억원 규모로 꾸준히 성장 중입니다."),
            ("스마트 팩토리와 컨베이어 벨트의 진화",
             "Industry 4.0 시대, 컨베이어 벨트도 진화하고 있습니다. "
             "IoT 센서·AI 예측 정비·RFID 추적 등 지능형 시스템이 도입되며 "
             "실시간 모니터링으로 비계획 다운타임을 줄이고 있습니다. "
             "남일벨트시스템은 최신 트렌드에 맞춘 솔루션을 제공합니다."),
            ("식품 산업용 위생 컨베이어 벨트 시장 확대",
             "글로벌 식품 등급 컨베이어 벨트 시장이 연 4.7% 성장하여 "
             "2031년 16.5억 달러에 이를 전망입니다. "
             "HACCP·FDA·EU 규정 준수가 필수가 되면서 "
             "프리미엄 TPU·PU 소재 벨트 수요가 증가하고 있습니다."),
        ]
    },
    "service_intro": {
        "title_prefix": "[서비스 안내]",
        "topics": [
            ("컨베이어 벨트 무료 상담 서비스",
             "남일벨트시스템은 현장 상황에 맞는 최적의 벨트를 "
             "무료로 상담해 드립니다. 전문 엔지니어가 고객님의 "
             "생산 라인을 분석하고 최적의 솔루션을 제안합니다. "
             "전화 02-6084-7795 또는 이메일 namilsystem@naver.com으로 문의하세요."),
            ("맞춤형 컨베이어 시스템 설계",
             "고객사 생산 라인에 최적화된 맞춤형 컨베이어 시스템을 설계합니다. "
             "벨트 선정부터 레이아웃 설계, 구동부 사양까지 "
             "원스톱으로 제공합니다. 설치 및 시운전, 유지보수까지 책임집니다."),
        ]
    },
}

# --- Company footer (appended to every post) ---
COMPANY_FOOTER = """
<hr/>
<p style="font-size:13px;color:#666">
<strong>남일벨트시스템</strong> | 하바지트(Habasit) 공식 파트너<br/>
전화: 02-6084-7795 | 이메일: namilsystem@naver.com<br/>
홈페이지: <a href="https://namilbeltsystem.github.io">namilbeltsystem.github.io</a><br/>
블로그: <a href="https://blog.naver.com/namilsystem">blog.naver.com/namilsystem</a>
</p>
"""

def generate_post(category=None, topic_index=None):
    """Generate a blog post from templates"""
    if category is None:
        category = random.choice(list(TEMPLATES.keys()))

    tmpl = TEMPLATES[category]
    if topic_index is None:
        topic_index = random.randint(0, len(tmpl["topics"]) - 1)

    title_text, image_key, body_text = tmpl["topics"][topic_index]
    title = f"{tmpl['title_prefix']} {title_text}"

    # Add image if relevant
    image_html = ""
    if image_key:
        image_html = f'<p><img src="https://namilbeltsystem.github.io/images/{image_key}.png" alt="{title_text}" style="max-width:100%"/></p>\n'

    post_content = f"""<h2>{title_text}</h2>
{image_html}
<p style="line-height:1.8">{body_text}</p>
<p style="line-height:1.8">자세한 내용은 <a href="https://namilbeltsystem.github.io/belt-types.html">벨트 종류 및 시스템</a> 페이지를 참고해 주세요.</p>
{COMPANY_FOOTER}"""

    return {
        "title": title,
        "content": post_content,
        "category": category,
        "tags": ["컨베이어벨트", "산업용벨트", "남일벨트시스템", "하바지트", "Habasit"]
    }

def generate_weekly_posts():
    """Generate multiple posts for the week"""
    posts = []
    # Product intro
    posts.append(generate_post("belt_intro"))
    # Industry news
    posts.append(generate_post("industry_news"))
    # Service intro
    posts.append(generate_post("service_intro"))
    return posts

if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "generate"

    if action == "generate":
        import json
        now = datetime.now()
        posts = generate_weekly_posts()

        for i, post in enumerate(posts):
            date_str = now.strftime("%Y-%m-%d")
            filename = f"blog/posts/{date_str}-{post['category']}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(post, f, ensure_ascii=False, indent=2)
            print(f"Generated: {post['title']}")

        print(f"\n총 {len(posts)}개 포스트 생성 완료")

    elif action == "list":
        # List available templates
        for cat, tmpl in TEMPLATES.items():
            print(f"\n[{cat}] {len(tmpl['topics'])} topics:")
            for i, (title, _, _) in enumerate(tmpl['topics']):
                print(f"  {i+1}. {title}")

    elif action == "preview":
        cat = sys.argv[2] if len(sys.argv) > 2 else "belt_intro"
        idx = int(sys.argv[3]) if len(sys.argv) > 3 else 0
        post = generate_post(cat, idx)
        print(f"TITLE: {post['title']}\n")
        print(post['content'])
