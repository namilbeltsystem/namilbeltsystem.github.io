#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
남일벨트시스템 — 완전 한글 카탈로그 PDF 생성기 (데이터 구동)
============================================================
pdfgen/catalogs_data.py 의 CATALOGS 데이터를 소비해, 모든 페이지가
완전한 한국어인 카탈로그 PDF를 생성한다.

- reportlab + Nanum Gothic(임베드) → 한국어 글리프 100% 정상 렌더링
- 진짜 텍스트 레이어(검색/복사 가능), 사이트 브랜드(네이버 그린) 일관 디자인
- 절 번호(01, 02, …)는 실제 포함된 절 순서대로 자동 부여

사용법:
    python pdfgen/build_catalog_kr.py              # 전체 22종 빌드
    python pdfgen/build_catalog_kr.py habasync-wide # 특정 1종만
    python pdfgen/build_catalog_kr.py --list        # 카탈로그 키 목록
"""

import os
import re
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table,
    TableStyle, PageBreak, ListFlowable, ListItem, KeepTogether, FrameBreak,
)
from reportlab.platypus.doctemplate import NextPageTemplate

from catalogs_data import (
    CATALOGS, DEFAULT_KICKER, DEFAULT_YEAR, DEFAULT_DISCLAIMER,
)

# ---------------------------------------------------------------------------
# 경로 / 상수
# ---------------------------------------------------------------------------
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT_DIR = os.path.join(ROOT, "fonts")
OUT_DIR = os.path.join(ROOT, "docs", "korean")

GREEN = colors.HexColor("#03C75A")
GREEN_DARK = colors.HexColor("#02a94b")
GREEN_LIGHT = colors.HexColor("#E9F9EF")
INK = colors.HexColor("#1e1e1e")
INK_LIGHT = colors.HexColor("#555555")
INK_MUTED = colors.HexColor("#6b7280")
BORDER = colors.HexColor("#e5e5e5")
BG_ALT = colors.HexColor("#f8f9fa")
DARK = colors.HexColor("#1a1f24")

PAGE_W, PAGE_H = A4
MARGIN_L = 20 * mm
MARGIN_R = 20 * mm
MARGIN_T = 26 * mm
MARGIN_B = 22 * mm

COMPANY = "남일벨트시스템"
REPR = "홍종수"
BIZ_NO = "268-06-02265"
ADDR = "서울특별시 동대문구 한천로2길 16, 212호 (덕암빌딩)"
TEL = "02-6084-7795"
FAX = "02-6403-9380"
EMAIL = "namilsystem@naver.com"
SITE = "남일벨트시스템.kr"
SITE_URL = "https://xn--q20bp1ulxengk5sqrqshc.kr"

STY = {}
TOTAL_PAGES = {"n": 0}
HEADER_LABEL = {"s": ""}  # 본문 헤더에 표시할 카탈로그명(동적 주입)


# ---------------------------------------------------------------------------
# 폰트 등록
# ---------------------------------------------------------------------------
def register_fonts():
    pdfmetrics.registerFont(TTFont("Nanum", os.path.join(FONT_DIR, "nanum-gothic-400.ttf")))
    pdfmetrics.registerFont(TTFont("Nanum-Bold", os.path.join(FONT_DIR, "nanum-gothic-700.ttf")))
    pdfmetrics.registerFont(TTFont("Nanum-Black", os.path.join(FONT_DIR, "nanum-gothic-800.ttf")))
    pdfmetrics.registerFontFamily(
        "Nanum", normal="Nanum", bold="Nanum-Bold",
        italic="Nanum", boldItalic="Nanum-Bold",
    )


# ---------------------------------------------------------------------------
# 스타일 (fontName 누락 주의: 한글이 ZapfDingbats 로 폴백되어 깨짐)
# ---------------------------------------------------------------------------
def make_styles():
    base = dict(fontName="Nanum", textColor=INK, wordWrap="CJK", leading=18)
    s = {}
    s["body"] = ParagraphStyle("body", fontSize=10.5, alignment=TA_JUSTIFY, **base)
    s["body_light"] = ParagraphStyle("body_light", parent=s["body"], textColor=INK_LIGHT)
    s["lead"] = ParagraphStyle("lead", parent=s["body"], fontSize=12, leading=21, textColor=INK_LIGHT)
    s["bullet"] = ParagraphStyle("bullet", parent=s["body"], leftIndent=6, leading=17)
    s["h1"] = ParagraphStyle(
        "h1", fontName="Nanum-Black", fontSize=18, textColor=INK,
        leading=24, spaceBefore=4, spaceAfter=4, wordWrap="CJK")
    s["h3"] = ParagraphStyle(
        "h3", fontName="Nanum-Bold", fontSize=11.5, textColor=INK,
        leading=16, spaceBefore=8, spaceAfter=3, wordWrap="CJK")
    s["cover_kicker"] = ParagraphStyle(
        "cover_kicker", fontName="Nanum-Bold", fontSize=12, textColor=colors.white,
        alignment=TA_CENTER, leading=18, wordWrap="CJK")
    s["cover_title"] = ParagraphStyle(
        "cover_title", fontName="Nanum-Black", fontSize=34, textColor=colors.white,
        alignment=TA_CENTER, leading=46, wordWrap="CJK")
    s["cover_sub"] = ParagraphStyle(
        "cover_sub", fontName="Nanum", fontSize=14, textColor=colors.white,
        alignment=TA_CENTER, leading=22, wordWrap="CJK")
    s["cover_brand"] = ParagraphStyle(
        "cover_brand", fontName="Nanum-Bold", fontSize=15, textColor=colors.white,
        alignment=TA_CENTER, leading=22, wordWrap="CJK")
    s["cover_contact_h"] = ParagraphStyle(
        "cover_contact_h", fontName="Nanum-Bold", fontSize=12, textColor=INK,
        alignment=TA_CENTER, leading=18, wordWrap="CJK")
    s["cover_contact"] = ParagraphStyle(
        "cover_contact", fontName="Nanum", fontSize=9.5, textColor=INK_LIGHT,
        alignment=TA_CENTER, leading=15, wordWrap="CJK")
    s["cell"] = ParagraphStyle("cell", fontName="Nanum", fontSize=9.5, textColor=INK, wordWrap="CJK", leading=14)
    s["cell_b"] = ParagraphStyle("cell_b", fontName="Nanum-Bold", fontSize=9.5, textColor=INK, wordWrap="CJK", leading=14)
    s["cell_h"] = ParagraphStyle("cell_h", fontName="Nanum-Bold", fontSize=9.5, textColor=colors.white, wordWrap="CJK", leading=14)
    s["small"] = ParagraphStyle("small", fontName="Nanum", fontSize=8.5, textColor=INK_MUTED, wordWrap="CJK", leading=12)
    return s


# ---------------------------------------------------------------------------
# 페이지 장식
# ---------------------------------------------------------------------------
def draw_cover_bg(c, doc):
    band_h = PAGE_H * 0.62
    c.setFillColor(GREEN)
    c.rect(0, PAGE_H - band_h, PAGE_W, band_h, fill=1, stroke=0)
    c.setFillColor(GREEN_DARK)
    c.rect(0, PAGE_H - band_h, PAGE_W, 6, fill=1, stroke=0)
    c.setFillColor(BG_ALT)
    c.rect(0, 0, PAGE_W, PAGE_H - band_h, fill=1, stroke=0)
    c.setStrokeColor(BORDER)
    c.setLineWidth(0.5)
    c.line(MARGIN_L, 16 * mm, PAGE_W - MARGIN_R, 16 * mm)
    c.setFont("Nanum", 8)
    c.setFillColor(INK_MUTED)
    c.drawString(MARGIN_L, 10 * mm, "%s | 하바지트(Habasit) 공식 파트너" % COMPANY)
    c.drawRightString(PAGE_W - MARGIN_R, 10 * mm, SITE)


def make_content_chrome(total_holder):
    def draw(c, doc):
        c.setFillColor(DARK)
        c.rect(0, PAGE_H - 14 * mm, PAGE_W, 14 * mm, fill=1, stroke=0)
        c.setFillColor(GREEN)
        c.rect(0, PAGE_H - 14.8 * mm, PAGE_W, 0.8 * mm, fill=1, stroke=0)
        c.setFont("Nanum-Bold", 10)
        c.setFillColor(colors.white)
        c.drawString(MARGIN_L, PAGE_H - 9.5 * mm, COMPANY)
        c.setFont("Nanum", 8.5)
        c.setFillColor(colors.HexColor("#cfd4d9"))
        c.drawRightString(PAGE_W - MARGIN_R, PAGE_H - 9.5 * mm, HEADER_LABEL["s"])
        c.setStrokeColor(BORDER)
        c.setLineWidth(0.5)
        c.line(MARGIN_L, 14 * mm, PAGE_W - MARGIN_R, 14 * mm)
        c.setFont("Nanum", 8)
        c.setFillColor(INK_MUTED)
        c.drawString(MARGIN_L, 9 * mm, "하바지트(Habasit) 공식 파트너 | %s" % SITE)
        total = total_holder["n"]
        label = ("%d / %d" % (doc.page, total)) if total else ("%d" % doc.page)
        c.drawRightString(PAGE_W - MARGIN_R, 9 * mm, label)
    return draw


# ---------------------------------------------------------------------------
# 플로어블 헬퍼
# ---------------------------------------------------------------------------
def _section_title(text):
    bar = Table([[""]], colWidths=[3.2 * mm], rowHeights=[15])
    bar.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), GREEN),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    t = Table([[bar, Paragraph(text, STY["h1"])]],
              colWidths=[6 * mm, PAGE_W - MARGIN_L - MARGIN_R - 6 * mm])
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 2), ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    return KeepTogether([Spacer(1, 6), t, Spacer(1, 8)])


def _bullets(items):
    lis = [ListItem(Paragraph(it, STY["bullet"]), leftIndent=10,
                    value="circle", bulletColor=GREEN) for it in items]
    return ListFlowable(lis, bulletType="bullet", start="•",
                        bulletFontName="Nanum-Bold", bulletFontSize=9,
                        leftIndent=14, bulletColor=GREEN,
                        spaceBefore=2, spaceAfter=2)


def _spec_table(rows, col0_width=42 * mm):
    data = [[Paragraph(r[0], STY["cell_b"]), Paragraph(r[1], STY["cell"])] for r in rows]
    t = Table(data, colWidths=[col0_width, PAGE_W - MARGIN_L - MARGIN_R - col0_width])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), BG_ALT),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, BORDER),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def _data_table(header, rows, widths=None):
    avail = PAGE_W - MARGIN_L - MARGIN_R
    if widths is None:
        widths = [avail / len(header)] * len(header)
    head = [Paragraph(h, STY["cell_h"]) for h in header]
    body = [[Paragraph(c, STY["cell_b"]) if i == 0 else Paragraph(c, STY["cell"])
             for i, c in enumerate(r)] for r in rows]
    data = [head] + body
    t = Table(data, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BG_ALT]),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, BORDER),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7), ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def _info_box(title, body_html):
    inner = [Paragraph("<b>%s</b>" % title, STY["cell_b"]), Spacer(1, 3),
             Paragraph(body_html, STY["cell"])]
    t = Table([[inner]], colWidths=[PAGE_W - MARGIN_L - MARGIN_R])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), GREEN_LIGHT),
        ("LINEBEFORE", (0, 0), (0, -1), 3, GREEN),
        ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 12), ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return t


def _plain(s):
    """<br/> 는 공백으로, 나머지 태그 제거 — 헤더 라벨 등에 사용."""
    return re.sub(r"<[^>]+>", " ", s).replace("  ", " ").strip()


# ---------------------------------------------------------------------------
# 콘텐츠 빌드 (데이터 구동)
# ---------------------------------------------------------------------------
def build_flowables(cat):
    F = []

    # ===== 표지 =====
    F.append(Spacer(1, 52 * mm))
    F.append(Paragraph(cat.get("kicker", DEFAULT_KICKER), STY["cover_kicker"]))
    F.append(Spacer(1, 9 * mm))
    F.append(Paragraph(cat["title"], STY["cover_title"]))
    F.append(Spacer(1, 6 * mm))
    F.append(Paragraph(cat["subtitle"], STY["cover_sub"]))
    F.append(Spacer(1, 14 * mm))
    F.append(Paragraph("완전 한글판 · " + cat.get("year", DEFAULT_YEAR), STY["cover_brand"]))
    F.append(Spacer(1, 34 * mm))
    F.append(Paragraph("%s (Namil Belt System)" % COMPANY, STY["cover_contact_h"]))
    F.append(Spacer(1, 2 * mm))
    F.append(Paragraph(
        "하바지트(Habasit) 공식 파트너<br/>"
        "전화 %s · 이메일 %s · 남일벨트시스템.kr" % (TEL, EMAIL),
        STY["cover_contact"]))
    F.append(FrameBreak())

    counter = [0]
    def num():
        counter[0] += 1
        return "%02d" % counter[0]

    # 01 제품 개요
    F.append(_section_title(num() + "  제품 개요"))
    F.append(Paragraph(cat["overview"], STY["lead"]))
    if cat.get("info"):
        F.append(Spacer(1, 4 * mm))
        F.append(_info_box(cat["info"][0], cat["info"][1]))

    # 02 주요 특징
    F.append(_section_title(num() + "  주요 특징"))
    F.append(_bullets(cat["features"]))

    # 03 기술 사양
    if cat.get("specs"):
        F.append(_section_title(num() + "  기술 사양"))
        F.append(_spec_table(cat["specs"]))

    # 04.. 추가 절(extras)
    for ex in cat.get("extras", []):
        F.append(_section_title(num() + "  " + ex["title"]))
        if ex.get("intro"):
            F.append(Paragraph(ex["intro"], STY["body_light"]))
            F.append(Spacer(1, 3 * mm))
        if ex.get("bullets"):
            F.append(_bullets(ex["bullets"]))
        if ex.get("table"):
            tb = ex["table"]
            F.append(_data_table(tb["header"], tb["rows"], ex.get("widths")))

    # 적용 산업
    if cat.get("applications"):
        F.append(_section_title(num() + "  적용 산업"))
        F.append(_data_table(
            ["산업 분야", "대표 적용 공정"], cat["applications"],
            [42 * mm, PAGE_W - MARGIN_L - MARGIN_R - 42 * mm]))

    # 남일벨트시스템 / 연락처 (마지막 절)
    product_name = _plain(cat["title"])
    F.append(_section_title(num() + "  남일벨트시스템 — 하바지트 공식 파트너"))
    F.append(Paragraph(
        "남일벨트시스템은 산업용 컨베이어 벨트 전문 기업으로, 스위스 하바지트(Habasit)의 "
        "공식 파트너입니다. 기술 상담에서 시스템 설계, 제품 공급, 전문 엔지니어의 "
        "현장 설치·시운전, 정기 유지보수까지 — 벨트 하나를 넘어 생산 라인 전체를 "
        "책임지는 원스톱 서비스로 고객의 생산성을 극대화합니다.", STY["lead"]))
    F.append(Spacer(1, 4 * mm))
    F.append(_spec_table([
        ["대표자", REPR],
        ["사업자등록번호", BIZ_NO],
        ["사업장 소재지", ADDR],
        ["전화", TEL],
        ["팩스", FAX],
        ["이메일", EMAIL],
        ["홈페이지", "%s (%s)" % (SITE, SITE_URL)],
    ]))
    F.append(Spacer(1, 8 * mm))
    F.append(_info_box(
        "무료 상담 안내",
        "사용 환경, 이송 물체의 종류와 중량, 컨베이어 규격, 작업 온도, 라인 속도 등을 "
        "알려주시면 전문 엔지니어가 현장에 가장 적합한 %s를 선정해 드립니다. "
        "전화(%s) 또는 이메일(%s)로 편하게 문의해 주세요." % (product_name, TEL, EMAIL)))
    F.append(Spacer(1, 6 * mm))
    F.append(Paragraph(cat.get("disclaimer", DEFAULT_DISCLAIMER), STY["small"]))
    return F


# ---------------------------------------------------------------------------
# 문서 조립 (2패스: 총 페이지수 → 푸터 "n/총n")
# ---------------------------------------------------------------------------
def _new_doc(out_path, title):
    return BaseDocTemplate(
        out_path, pagesize=A4,
        leftMargin=MARGIN_L, rightMargin=MARGIN_R,
        topMargin=MARGIN_T, bottomMargin=MARGIN_B,
        title=title, author=COMPANY,
        subject="남일벨트시스템 기술 카탈로그(한글판)",
        creator="%s / Habasit 공식 파트너" % COMPANY,
    )


def _make_frames():
    w = PAGE_W - MARGIN_L - MARGIN_R
    h = PAGE_H - MARGIN_T - MARGIN_B
    cover = Frame(MARGIN_L, MARGIN_B, w, h, id="cover", showBoundary=0,
                  leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    content = Frame(MARGIN_L, MARGIN_B, w, h, id="content", showBoundary=0,
                    leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    return cover, content


def build_catalog(cat_key, out_path):
    """단일 카탈로그를 빌드하여 out_path 에 저장. 총 페이지수 반환."""
    cat = CATALOGS[cat_key]
    register_fonts()
    global STY
    STY = make_styles()
    HEADER_LABEL["s"] = _plain(cat["title"]) + " 카탈로그"
    title = "%s - 남일벨트시스템" % _plain(cat["title"])

    cover_frame, content_frame = _make_frames()
    flow = [NextPageTemplate("Content")] + build_flowables(cat)

    # 1패스: 임시 파일에서 총 페이지수 확인
    tmp = out_path + ".tmp"
    doc1 = _new_doc(tmp, title)
    doc1.addPageTemplates([
        PageTemplate(id="Cover", frames=[cover_frame], onPage=draw_cover_bg),
        PageTemplate(id="Content", frames=[content_frame], onPage=make_content_chrome(TOTAL_PAGES)),
    ])
    doc1.build(flow)
    TOTAL_PAGES["n"] = doc1.page

    # 2패스: 총 페이지수 반영하여 최종 생성
    doc2 = _new_doc(out_path, title)
    doc2.addPageTemplates([
        PageTemplate(id="Cover", frames=[cover_frame], onPage=draw_cover_bg),
        PageTemplate(id="Content", frames=[content_frame], onPage=make_content_chrome(TOTAL_PAGES)),
    ])
    doc2.build([NextPageTemplate("Content")] + build_flowables(cat))
    if os.path.exists(tmp):
        os.remove(tmp)
    return TOTAL_PAGES["n"]


def main(argv):
    if len(argv) > 1 and argv[1] in ("--list", "-l"):
        for k in CATALOGS:
            print(k)
        return
    os.makedirs(OUT_DIR, exist_ok=True)
    if len(argv) > 1 and argv[1] != "all":
        keys = [argv[1]]
    else:
        keys = list(CATALOGS.keys())
    for k in keys:
        if k not in CATALOGS:
            print("ERROR: unknown catalog '%s' (use --list)" % k, file=sys.stderr)
            sys.exit(1)
        out = os.path.join(OUT_DIR, k + "-kr.pdf")
        n = build_catalog(k, out)
        print("OK  %-34s %2d pages  %5d KB  %s" % (
            k, n, os.path.getsize(out) // 1024, out))


if __name__ == "__main__":
    main(sys.argv)
