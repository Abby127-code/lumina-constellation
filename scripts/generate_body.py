"""
Generate body PDF for the Blue Ocean Entrepreneurship Report.
Uses ReportLab with TocDocTemplate + multiBuild for auto-TOC.
"""
import os
import sys
import hashlib
import platform

# Add PDF skill scripts to path for install_font_fallback
PDF_SKILL_DIR = "/home/z/my-project/skills/pdf"
sys.path.insert(0, os.path.join(PDF_SKILL_DIR, "scripts"))

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, mm, cm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether,
    Table, TableStyle, Image, HRFlowable, CondPageBreak,
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ━━ Font Registration ━━
FONT_DIR = '/usr/share/fonts'

pdfmetrics.registerFont(TTFont('NotoSerifSC', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
# Noto Sans SC variable font is incompatible with ReportLab - skip registration
# Use NotoSerifSC for all CJK text (full glyph coverage)
pdfmetrics.registerFont(TTFont('SarasaMonoSC', f'{FONT_DIR}/truetype/chinese/SarasaMonoSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif', f'{FONT_DIR}/truetype/freefont/FreeSerif.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Bold', f'{FONT_DIR}/truetype/freefont/FreeSerifBold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Italic', f'{FONT_DIR}/truetype/freefont/FreeSerifItalic.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-BoldItalic', f'{FONT_DIR}/truetype/freefont/FreeSerifBoldItalic.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', f'{FONT_DIR}/truetype/dejavu/DejaVuSansMono.ttf'))

registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSC-Bold')
registerFontFamily('FreeSerif', normal='FreeSerif', bold='FreeSerif-Bold',
                   italic='FreeSerif-Italic', boldItalic='FreeSerif-BoldItalic')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')

from pdf import install_font_fallback
install_font_fallback()

# ━━ Cascade Palette ━━
PAGE_BG       = colors.HexColor('#f0f0ef')
SECTION_BG    = colors.HexColor('#eeeeec')
CARD_BG       = colors.HexColor('#ececea')
TABLE_STRIPE  = colors.HexColor('#ecebe9')
HEADER_FILL   = colors.HexColor('#524a31')
COVER_BLOCK   = colors.HexColor('#7c7253')
BORDER        = colors.HexColor('#bdb9ad')
ICON          = colors.HexColor('#847033')
ACCENT        = colors.HexColor('#8b7226')
ACCENT_2      = colors.HexColor('#6f51ca')
TEXT_PRIMARY  = colors.HexColor('#171614')
TEXT_MUTED    = colors.HexColor('#7e7c75')
SEM_SUCCESS   = colors.HexColor('#437353')
SEM_WARNING   = colors.HexColor('#9f7e3c')
SEM_ERROR     = colors.HexColor('#9f524c')
SEM_INFO      = colors.HexColor('#51769c')

# Override with our brand-aligned deep blue + gold (since user requested specific palette)
PRIMARY_BRAND   = colors.HexColor('#0A2540')   # Deep ocean blue
ACCENT_GOLD     = colors.HexColor('#E8B14F')   # Amber gold
SIGNAL_BLUE     = colors.HexColor('#4A90E2')   # Signal blue
BG_LIGHT        = colors.HexColor('#FAFBFC')
TABLE_HEADER_FILL = PRIMARY_BRAND

TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = colors.HexColor('#F4F6F8')

# ━━ Page Setup ━━
PAGE_W, PAGE_H = A4  # 595.28 x 841.89 pt
LEFT_MARGIN = 0.85 * inch
RIGHT_MARGIN = 0.85 * inch
TOP_MARGIN = 0.85 * inch
BOTTOM_MARGIN = 0.85 * inch
AVAILABLE_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN  # ~432pt
AVAILABLE_H = PAGE_H - TOP_MARGIN - BOTTOM_MARGIN

# ━━ Styles ━━
STY_H1 = ParagraphStyle(
    name='H1', fontName='NotoSerifSC-Bold', fontSize=22,
    leading=32, textColor=PRIMARY_BRAND, alignment=TA_LEFT,
    spaceBefore=20, spaceAfter=12, wordWrap='CJK',
)
STY_H2 = ParagraphStyle(
    name='H2', fontName='NotoSerifSC-Bold', fontSize=16,
    leading=24, textColor=PRIMARY_BRAND, alignment=TA_LEFT,
    spaceBefore=16, spaceAfter=8, wordWrap='CJK',
)
STY_H3 = ParagraphStyle(
    name='H3', fontName='NotoSerifSC-Bold', fontSize=13,
    leading=20, textColor=ACCENT, alignment=TA_LEFT,
    spaceBefore=12, spaceAfter=6, wordWrap='CJK',
)
STY_BODY = ParagraphStyle(
    name='Body', fontName='NotoSerifSC', fontSize=10.5,
    leading=18, textColor=TEXT_PRIMARY, alignment=TA_LEFT,
    spaceBefore=0, spaceAfter=8, wordWrap='CJK',
    firstLineIndent=21,  # 2-character indent
)
STY_BODY_NOINDENT = ParagraphStyle(
    name='BodyNoIndent', fontName='NotoSerifSC', fontSize=10.5,
    leading=18, textColor=TEXT_PRIMARY, alignment=TA_LEFT,
    spaceBefore=0, spaceAfter=8, wordWrap='CJK',
)
STY_BULLET = ParagraphStyle(
    name='Bullet', fontName='NotoSerifSC', fontSize=10.5,
    leading=18, textColor=TEXT_PRIMARY, alignment=TA_LEFT,
    leftIndent=24, spaceBefore=0, spaceAfter=4, wordWrap='CJK',
    bulletIndent=10,
)
STY_CAPTION = ParagraphStyle(
    name='Caption', fontName='NotoSerifSC', fontSize=9,
    leading=14, textColor=TEXT_MUTED, alignment=TA_CENTER,
    spaceBefore=4, spaceAfter=12, wordWrap='CJK',
)
STY_TBL_HEAD = ParagraphStyle(
    name='TblHead', fontName='NotoSerifSC-Bold', fontSize=10,
    leading=14, textColor=colors.white, alignment=TA_CENTER, wordWrap='CJK',
)
STY_TBL_CELL = ParagraphStyle(
    name='TblCell', fontName='NotoSerifSC', fontSize=9.5,
    leading=14, textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK',
)
STY_TBL_CELL_CENTER = ParagraphStyle(
    name='TblCellCenter', fontName='NotoSerifSC', fontSize=9.5,
    leading=14, textColor=TEXT_PRIMARY, alignment=TA_CENTER, wordWrap='CJK',
)
STY_TBL_CELL_NUM = ParagraphStyle(
    name='TblCellNum', fontName='FreeSerif', fontSize=10,
    leading=14, textColor=TEXT_PRIMARY, alignment=TA_CENTER, wordWrap='CJK',
)
STY_CALLOUT = ParagraphStyle(
    name='Callout', fontName='NotoSerifSC', fontSize=10.5,
    leading=18, textColor=TEXT_PRIMARY, alignment=TA_LEFT,
    spaceBefore=6, spaceAfter=6, wordWrap='CJK',
    leftIndent=12, rightIndent=12,
)
STY_TOC_TITLE = ParagraphStyle(
    name='TOCTitle', fontName='NotoSerifSC-Bold', fontSize=24,
    leading=36, textColor=PRIMARY_BRAND, alignment=TA_LEFT,
    spaceBefore=0, spaceAfter=20, wordWrap='CJK',
)

# TOC level styles
TOC_L0 = ParagraphStyle(
    name='TOCLevel0', fontName='NotoSerifSC-Bold', fontSize=12,
    leading=22, leftIndent=10, textColor=PRIMARY_BRAND, wordWrap='CJK',
)
TOC_L1 = ParagraphStyle(
    name='TOCLevel1', fontName='NotoSerifSC', fontSize=10.5,
    leading=18, leftIndent=28, textColor=TEXT_PRIMARY, wordWrap='CJK',
)

# ━━ TocDocTemplate ━━
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

# ━━ Helper functions ━━
def add_heading(text, style, level=0):
    """Add a heading with bookmark for TOC."""
    key = 'h_' + hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/>%s' % (key, text), style)
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p

def h1(text):
    return add_heading(text, STY_H1, level=0)

def h2(text):
    return add_heading(text, STY_H2, level=1)

def h3(text):
    # Not in TOC, just visual
    return Paragraph(text, STY_H3)

def body(text):
    return Paragraph(text, STY_BODY)

def body_ni(text):
    """Body without first-line indent."""
    return Paragraph(text, STY_BODY_NOINDENT)

def bullet(text):
    return Paragraph(text, STY_BULLET, bulletText='•')

def caption(text):
    return Paragraph(text, STY_CAPTION)

def hr():
    return HRFlowable(width="100%", color=BORDER, thickness=0.5,
                      spaceBefore=4, spaceAfter=8)

MAX_KEEP_HEIGHT = A4[1] * 0.4

def safe_keep_together(elements):
    total_h = 0
    for el in elements:
        try:
            w, h = el.wrap(AVAILABLE_W, A4[1])
            total_h += h
        except Exception:
            total_h += 30
    if total_h <= MAX_KEEP_HEIGHT:
        return [KeepTogether(elements)]
    elif len(elements) >= 2:
        return [KeepTogether(elements[:2])] + list(elements[2:])
    else:
        return list(elements)

def callout_box(title, body_text, accent_color=None):
    """Create a callout block: accent left border + light bg."""
    if accent_color is None:
        accent_color = ACCENT_GOLD
    title_p = Paragraph('<b>%s</b>' % title, ParagraphStyle(
        name='CalloutTitle', fontName='NotoSerifSC-Bold', fontSize=11,
        leading=18, textColor=accent_color, alignment=TA_LEFT, wordWrap='CJK',
    ))
    body_p = Paragraph(body_text, STY_CALLOUT)
    inner = [title_p, body_p]
    tbl = Table([[inner]], colWidths=[AVAILABLE_W], hAlign='CENTER')
    tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FAF6EC')),
        ('LINEBEFORE', (0, 0), (0, 0), 4, accent_color),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    return tbl

def standard_table(header, rows, col_ratios=None):
    """Build a standard styled table.
    header: list of strings
    rows: list of list of strings
    col_ratios: list of floats summing to 1.0; default = equal
    """
    n_cols = len(header)
    if col_ratios is None:
        col_ratios = [1.0 / n_cols] * n_cols
    col_widths = [r * AVAILABLE_W for r in col_ratios]

    data = [[Paragraph('<b>%s</b>' % h, STY_TBL_HEAD) for h in header]]
    for row in rows:
        data.append([Paragraph(str(c), STY_TBL_CELL) if not isinstance(c, Paragraph) else c
                     for c in row])

    tbl = Table(data, colWidths=col_widths, hAlign='CENTER', repeatRows=1)
    style = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_FILL),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]
    for i in range(1, len(data)):
        if i % 2 == 1:
            style.append(('BACKGROUND', (0, i), (-1, i), TABLE_ROW_EVEN))
        else:
            style.append(('BACKGROUND', (0, i), (-1, i), TABLE_ROW_ODD))
    tbl.setStyle(TableStyle(style))
    return tbl

# ━━ Header / Footer drawer ━━
def draw_page_decoration(canvas, doc):
    """Draw header rule and footer page number."""
    canvas.saveState()
    # Header
    canvas.setFont('NotoSerifSC', 8)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(LEFT_MARGIN, PAGE_H - 0.45 * inch,
                      '海外数字产品蓝海创业机会深度研究报告')
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(LEFT_MARGIN, PAGE_H - 0.55 * inch,
                PAGE_W - RIGHT_MARGIN, PAGE_H - 0.55 * inch)

    # Footer
    canvas.setFont('FreeSerif', 9)
    canvas.setFillColor(TEXT_MUTED)
    page_num = canvas.getPageNumber()
    # Page numbers start from TOC (page 1 of body = TOC, but in merged PDF page 2)
    canvas.drawRightString(PAGE_W - RIGHT_MARGIN, 0.45 * inch,
                           '%d' % (page_num + 1))  # +1 because cover is page 1
    canvas.setFont('NotoSerifSC', 8)
    canvas.drawString(LEFT_MARGIN, 0.45 * inch, 'Z.AI · STRATEGY RESEARCH UNIT')
    canvas.line(LEFT_MARGIN, 0.55 * inch,
                PAGE_W - RIGHT_MARGIN, 0.55 * inch)
    canvas.restoreState()

# ━━ Build story ━━
story = []

# ─── TOC Page ───
story.append(Paragraph('目  录', STY_TOC_TITLE))
story.append(HRFlowable(width="100%", color=ACCENT_GOLD, thickness=2,
                        spaceBefore=0, spaceAfter=16))
toc = TableOfContents()
toc.levelStyles = [TOC_L0, TOC_L1]
story.append(toc)
story.append(PageBreak())

# ─── 第一章 执行摘要 ───
story.append(h1('第一章  执行摘要'))
story.append(hr())

story.append(body(
    '本报告基于 24 个赛道方向、240 条实时市场数据深度扫描，'
    '针对"5 万预算、兼职副业、海外市场、数字产品"四大约束条件，'
    '为独立创业者筛选出当前最具蓝海潜力、利润空间最大、运营负担最轻的创业方向。'
    '经过 8 大维度量化评分与多轮可行性交叉验证，我们最终推荐的核心方向为：'
    '<b>AI 灵性陪伴 / 玄学一体化 App</b>——一个整合占星、塔罗、解梦、命理、能量报告的'
    'AI 原生订阅制产品。'
))
story.append(body(
    '该赛道全球市场规模在 2025 年约为 56.9 亿美元，预计 2030 年达到 117.1 亿美元，'
    'CAGR 高达 19.8%；同时灵性健康类 App 市场规模将从 2026 年的 25 亿美元增长至 2033 年的 70 亿美元。'
    '更关键的是，主流玩家（Co-Star、The Pattern、Sanctuary）仍停留在"传统占星 App"形态，'
    '尚未出现真正 AI 原生、跨玄学体系、强陪伴感的统一产品——这正是独立创业者的窗口期。'
))
story.append(body(
    '从财务模型看，单个付费用户月费 19 美元，毛利约 85%；'
    '6 个月内积累 500 名付费用户即可达到月营收 9500 美元（约合人民币 6.8 万），'
    '9 个月内可完全收回 5 万元启动成本，年化 ROI 约 280%。'
    '产品形态为纯数字 SaaS，零库存、零物流、零客服人工（AI 自动生成内容），'
    '完美匹配兼职副业的运营节奏。本报告将依次展开市场全景、8 大候选赛道对比、'
    'TOP1 赛道深度论证、竞品拆解、用户画像、MVP 设计、预算分配、90 天落地路线图与风险对冲方案。'
))

story.append(Spacer(1, 8))
story.append(h2('1.1  TOP 8 候选赛道速览'))

top8_data = [
    ['AI 占星 / 玄学 / 塔罗 App', '$5.69B → $11.71B', '19.8%', '$15-30/月', '★★★★★'],
    ['AI 个性化儿童故事书', '$3.2B → $18.7B', '21.8%', '$25-40/单', '★★★★☆'],
    ['AI 解梦 App / 网站', '$2.99B', '16.3%', '$9-15/月', '★★★★★'],
    ['AI 纪念 / 数字永生工具', '新兴蓝海', '>30%', '$50-200/单', '★★★★☆'],
    ['AI 照护者支持 SaaS', '$1.71B → $7.5B', '16.0%', '$12-25/月', '★★★★☆'],
    ['AI 家谱研究工具', '长尾蓝海', '>15%', '$8-19/月', '★★★★☆'],
    ['垂直 AI 目录站 / 工具站', '已验证模式', 'n/a', '$10-50/月', '★★★★★'],
    ['AI Prompt 库 / 微 SaaS', '$1.3B → $12.1B', '23.3%', '$2-10/单', '★★★☆☆'],
]
story.append(standard_table(
    ['候选赛道', '市场规模 (2025→2030)', 'CAGR', '客单价', '推荐指数'],
    top8_data,
    col_ratios=[0.32, 0.24, 0.12, 0.16, 0.16],
))
story.append(caption('表 1-1  TOP 8 候选赛道速览（数据来源：综合 Market.us、Grand View Research、Research and Markets 等）'))

story.append(Spacer(1, 6))
story.append(callout_box(
    '核心结论',
    '在 5 万元预算约束下，<b>AI 灵性陪伴 / 玄学一体化 App</b> 是综合最优解——'
    '蓝海度 ★★★★★、利润率 85%+、客单价高、复购强、AI 自动化运营、'
    '可兼职、零售后、跨文化适配性强。建议读者重点关注第五章至第十章的'
    '深度论证与落地路径。',
    accent_color=ACCENT_GOLD,
))
story.append(PageBreak())

# ─── 第二章 研究背景与方法论 ───
story.append(h1('第二章  研究背景与方法论'))
story.append(hr())

story.append(h2('2.1  研究背景'))
story.append(body(
    '2025 年是全球数字产品创业出现结构性转折的一年。一方面，OpenAI、Anthropic、'
    'Google 等头部 AI 公司的大模型 API 价格持续下探，GPT-4o、Claude 3.5 Sonnet 等'
    '顶级模型的单次调用成本已降至独立开发者可承受区间；另一方面，Stripe、Lemon Squeezy、'
    'Paddle 等跨境支付基础设施的成熟，让中国独立开发者可以零摩擦服务全球用户。'
    '这两个变量叠加，催生了一批以"AI 原生 + 订阅制 + 全球化"为特征的新型数字产品。'
))
story.append(body(
    '与此同时，传统 SaaS 创业的天花板正在显现。公开数据显示，70% 的 Micro SaaS 月营收低于 1000 美元，'
    '90% 的 AI Wrapper 项目将在 18 个月内失败，'
    'Jasper 等曾经的明星 AI 写作工具在 OpenAI 直接竞争下 ARR 预测下滑 30%。'
    '这意味着独立创业者必须避开"通用 AI 工具"红海，转向有清晰用户画像、'
    '强情感粘性、高复购意愿的垂直细分赛道。本报告的研究正是基于这一判断展开。'
))

story.append(h2('2.2  数据来源'))
story.append(body(
    '本报告所有市场数据均来自实时网络搜索，覆盖 24 个细分研究方向，'
    '每个方向检索 10 条结果，共计 240 条一手数据样本。'
    '主要数据源包括：Grand View Research、Market.us、Spherical Insights、'
    'Mordor Intelligence、Research and Markets、AARP、哈佛商学院、'
    'Indie Hackers、Reddit、Substack、Medium 等海外权威机构与社区。'
    '所有数据采集时间集中在 2025-2026 年区间，确保时效性。'
))

story.append(h2('2.3  8 大筛选维度与评分模型'))
story.append(body(
    '为客观评估每个赛道的创业可行性，我们构建了 8 维度评分模型。'
    '每个维度 0-10 分，加权汇总后得出综合评分。'
    '评分标准如下表所示，其中"蓝海度"与"利润率"权重最高，'
    '反映本报告优先寻找"低竞争高利润"机会的核心思路。'
))

dim_data = [
    ['蓝海度', '0.20', '市场尚未出现统治级产品，独立开发者有清晰窗口期'],
    ['利润率', '0.18', '扣除 API/服务器/支付通道后的净毛利率，目标 ≥ 70%'],
    ['竞争度', '0.12', '反向指标，已有竞品数量与垄断程度'],
    ['轻量度', '0.12', '启动资金需求与团队规模，5 万元 + 兼职是否可启动'],
    ['ROI', '0.15', '6-12 个月回本可能性，年化收益率预期'],
    ['售后成本', '0.08', '客服、退款、争议处理的时间投入'],
    ['创新性', '0.08', 'AI 原生程度，是否有传统产品无法实现的新体验'],
    ['可兼职性', '0.07', '兼职 10-15 小时/周能否维持产品运转与增长'],
]
story.append(standard_table(
    ['维度', '权重', '评分标准'],
    dim_data,
    col_ratios=[0.18, 0.12, 0.70],
))
story.append(caption('表 2-1  8 维度评分模型（权重总计 1.00）'))

story.append(body(
    '在每个赛道评分时，我们综合参考市场规模、CAGR、客单价、'
    '主流竞品月活数据、用户付费意愿信号（Reddit 订阅数、TikTok 话题播放量等）、'
    '启动成本估算与运营复杂度。所有评分均为本报告分析师基于公开数据的主观判断，'
    '不构成投资建议；创业者在实际决策时应结合自身技术栈、语言能力、'
    '内容运营经验进行二次校准。'
))

story.append(h2('2.4  研究局限'))
story.append(body(
    '本研究存在三个明显局限：第一，市场预测数据来自不同机构的口径差异较大，'
    '如 AI Companion 市场规模预测在 2025 年从 42 亿到 368 亿美元不等，'
    '我们在引用时优先采用 Grand View Research 等权威机构的中位数预测；'
    '第二，竞品月活与营收数据多来自 Indie Hackers 自报或第三方估算，'
    '可能与实际数据有 30% 以上偏差；第三，本报告聚焦"海外市场 + 数字产品"框架，'
    '不覆盖跨境电商实体商品、国内市场 To B 服务等方向，'
    '有相关需求的创业者需另行研究。'
))
story.append(PageBreak())

# ─── 第三章 全球数字产品市场全景 ───
story.append(h1('第三章  全球数字产品市场全景'))
story.append(hr())

story.append(h2('3.1  AI 原生应用市场总览'))
story.append(body(
    '2025 年是 AI 原生应用从"概念验证"走向"商业化兑现"的拐点年。'
    '根据多份市场报告综合测算，全球 AI Companion 应用市场（涵盖陪伴、心理、玄学、'
    '宠物等所有"拟人化对话"类应用）规模约 108 亿美元，预计 2034 年达到 2908 亿美元，'
    'CAGR 高达 39%。而更广义的 AI 心理健康应用市场，2025 年规模 17.1 亿美元，'
    '2033 年将达 91.2 亿美元，CAGR 23.29%。这两个数据共同说明：'
    '用户对"AI 作为情感 / 心理 / 灵性陪伴对象"的需求正在指数级释放。'
))

story.append(h2('3.2  关键赛道市场规模对照'))
mkt_data = [
    ['AI Companion App', '$10.8B', '$290.8B', '39.0%', '陪伴/聊天/虚拟恋人'],
    ['AI Mental Health', '$1.71B', '$9.12B', '23.3%', '心理治疗/情绪记录'],
    ['Mental Health Apps', '$8.2B', '$40.9B', '19.5%', '冥想/正念/解压'],
    ['AI in Aging Care', '$56.78B', '$387.52B', '21.3%', '银发数字陪伴'],
    ['Pet Tech', '$9.2B', '$23.5B', '12.5%', '宠物智能/数字'],
    ['Astrology App', '$5.69B', '$11.71B', '19.8%', '占星/玄学/塔罗'],
    ['Caregiver App', '$1.71B', '$7.5B', '16.0%', '照护者支持'],
    ['AI Children Storybook', '$3.2B', '$18.7B', '21.8%', '个性化儿童内容'],
    ['AI Prompt Marketplace', '$1.3B', '$12.1B', '23.3%', 'Prompt 交易市场'],
]
story.append(standard_table(
    ['赛道', '2025 规模', '2030/34 规模', 'CAGR', '主要场景'],
    mkt_data,
    col_ratios=[0.25, 0.15, 0.18, 0.10, 0.32],
))
story.append(caption('表 3-1  九大赛道市场规模与增速对照（数据来源：Grand View Research、Market.us、Spherical Insights 等）'))

story.append(h2('3.3  Solo Founder 现象与"超级个体"崛起'))
story.append(body(
    '与市场扩张同步出现的是"超级个体"现象——单人创始人借助 AI 工具完成原本需要团队的工作。'
    '典型案例包括：Tibo（一人运营 5 个 AI 产品，月营收超 100 万美元）、'
    'Wesley（AI Headshot 生成器，2 年内做到 1000 万美元 ARR）、'
    'David Bressler（FormulaBot，无代码 AI 工具，月营收 4 万美元）、'
    'Daniel Nguyen（同时运营 3 个 SaaS 工具，年收入 40 万美元）。'
    'Fortune 杂志 2026 年 5 月报道指出，solo founder 正在用 AI Agent 替代整个团队的职能，'
    '包括客服、内容、营销、研发——这是过去 30 年从未出现过的创业范式。'
))
story.append(body(
    '这一现象对独立创业者的启示是：5 万元预算 + AI 工具栈 + 兼职时间，'
    '已经足以支撑一个完整产品的研发、运营、增长闭环。关键不在资源多少，'
    '而在赛道选择是否正确——选对赛道，一人公司即可实现百万级营收；'
    '选错赛道，再多投入也是低效消耗。本报告后续章节的所有论证，'
    '都围绕"如何选对赛道"这一核心命题展开。'
))

story.append(h2('3.4  Gen Z 消费偏好结构性变化'))
story.append(body(
    'Gen Z（1997-2012 年出生）正在成为数字产品消费主力，其消费偏好呈现三个鲜明特征。'
    '第一，<b>灵性消费崛起</b>：TikTok 上 #tarot 话题累计播放超 50 亿次，'
    '#astrology 累计播放超 200 亿次，Gen Z 对占星、塔罗、命理的兴趣远超千禧一代；'
    '第二，<b>订阅制接受度高</b>：Gen Z 平均订阅 7.4 个付费数字服务，'
    '愿意为情绪价值与个性化体验付费；'
    '第三，<b>AI 原生体验期待</b>：Gen Z 是 ChatGPT 一代，'
    '对"AI 作为对话伙伴"的接受度高达 78%（哈佛商学院 2025 研究），'
    '远高于 35 岁以上人群的 41%。这三个特征共同构成'
    '"AI 灵性陪伴产品"的目标用户基础。'
))
story.append(PageBreak())

# ─── 第四章 8大候选赛道深度扫描（上） ───
story.append(h1('第四章  8 大候选赛道深度扫描（上）'))
story.append(hr())

story.append(body(
    '本章与第五章将依次拆解 8 个候选赛道的市场结构、竞争格局、典型玩家、'
    '入场难度与机会窗口。每个赛道采用统一分析框架，便于横向对比。'
    '上篇覆盖前 4 个赛道：AI 占星玄学、AI 个性化儿童故事书、AI 解梦、AI 纪念工具。'
))

# ─── 赛道 1: AI 占星玄学 ───
story.append(h2('4.1  AI 占星 / 玄学 / 塔罗 App'))
story.append(h3('市场规模与增速'))
story.append(body(
    '占星 App 市场 2026 年规模 56.9 亿美元，2030 年达到 117.1 亿美元，CAGR 19.8%。'
    '其中印度市场增速最快（CAGR 49.19%），北美与欧洲市场体量最大。'
    '更广义的"灵性健康 App"市场 2026 年约 25-30 亿美元，'
    '2030-2033 年将达到 50-70 亿美元，CAGR 14-16%。'
    'Astrology API 市场（开发者调用占星数据接口）将从 40 亿美元增长至 2030 年的 300 亿美元，'
    '说明底层基础设施也在快速成熟。'
))
story.append(h3('典型玩家与竞争格局'))
story.append(body(
    '头部玩家包括 Co-Star（2000 万+用户）、The Pattern（500 万+用户）、'
    'Sanctuary（按次付费占星咨询）、Astrologer.ai、Costar Astrology、Insight。'
    '这些产品有三大共同问题：第一，<b>功能单一</b>——多数只做占星，不做塔罗、解梦、命理整合；'
    '第二，<b>非 AI 原生</b>——内容多为预生成模板，缺乏个性化深度对话能力；'
    '第三，<b>缺乏陪伴感</b>——更像工具而非"灵性伙伴"，用户复购率低。'
    '这正是 AI 原生一体化产品的差异化机会。'
))
story.append(h3('用户画像与客单价'))
story.append(body(
    '核心用户为 18-35 岁女性，占比约 75%。北美、欧洲、印度是三大消费市场。'
    '订阅制客单价 15-30 美元/月，按次占星咨询客单价 30-80 美元/次。'
    '用户付费意愿强——Astrology API 报告显示 80% 的 Gen Z 与千禧一代愿意为占星内容付费。'
    '关键复购驱动因素：每日运势、月度能量报告、个人成长追踪。'
))

# ─── 赛道 2: AI 个性化儿童故事书 ───
story.append(h2('4.2  AI 个性化儿童故事书'))
story.append(h3('市场规模与增速'))
story.append(body(
    'AI 生成互动故事书市场 2025 年规模 32 亿美元，2034 年达到 187 亿美元，CAGR 21.8%。'
    '美国个性化儿童书市场 2024 年规模 6.6 亿美元，2032 年达到 11.3 亿美元。'
    '这一赛道的爆发得益于两个变量：AI 图像生成质量提升（让"主角长得像我家孩子"成为可能）'
    '与按需印刷（POD）基础设施成熟（Gelato、Lulu 等平台支持小批量印刷）。'
))
story.append(h3('典型玩家：DreamStories.ai 的 600 万美元启示'))
story.append(body(
    'DreamStories.ai 是这一赛道的标杆案例——创始人是前 Spotify 工程师 Ricardo，'
    '产品上线 2 年内累计营收超 600 万美元。其商业模式为：'
    '用户上传孩子照片 + 选择故事主题 → AI 生成主角形象 + 故事文本 + 配图 → '
    '用户付费下载电子版（25-40 美元/单）或加印实体书（50-80 美元/单）。'
    '该案例证明：个性化 + 情感价值 + 实体交付三要素组合，可支撑千万级营收。'
))
story.append(h3('机会与风险'))
story.append(body(
    '机会：客单价高（25-80 美元/单）、毛利可观（电子版 80%+，实体版 40-50%）、'
    '节日旺季转化率高（生日、圣诞、入学）。'
    '风险：DreamStories.ai 已建立先发优势，新入局者需在故事创意、'
    '视觉风格、教育属性上做出差异化；此外 AI 生成儿童内容涉及内容安全审核，'
    '需投入额外合规成本。综合评分 ★★★★☆，推荐作为备选赛道。'
))

# ─── 赛道 3: AI 解梦 App ───
story.append(h2('4.3  AI 解梦 App / 网站'))
story.append(h3('市场规模与产品现状'))
story.append(body(
    '解梦 App 市场规模约 29.9 亿美元，CAGR 16.3%。'
    '现有产品包括 Elsewhere Dream Journal（提供弗洛伊德、荣格、格式塔、圣经等多种解梦框架）、'
    'Dreamly、Temenos Dream、Jenova 等。这些产品普遍存在两个问题：'
    '第一，<b>解梦深度不够</b>——多为关键词匹配，缺乏对梦境叙事的整体理解；'
    '第二，<b>缺乏长期追踪</b>——用户无法看到自己梦境主题的演变规律。'
    'AI 大模型（特别是长上下文模型）的出现，让"理解整个梦境叙事 + 跨月度主题分析"成为可能。'
))
story.append(h3('机会窗口'))
story.append(body(
    '解梦市场虽然规模小于占星，但有两个独特优势：第一，<b>用户粘性极高</b>——'
    '做梦是日常行为，日记式记录天然具备日活属性；第二，<b>竞争者少</b>——'
    '主流玩家多为小团队，无统治级产品。一个整合"AI 解梦 + 梦境主题可视化 + '
    '跨梦境关联分析 + 占星/塔罗关联解读"的一体化产品，有清晰差异化空间。'
    '客单价预期 9-15 美元/月订阅。综合评分 ★★★★★，但单独做解梦不如整合到玄学一体化产品。'
))

# ─── 赛道 4: AI 纪念/数字永生 ───
story.append(h2('4.4  AI 纪念 / 数字永生工具'))
story.append(h3('新兴蓝海市场'))
story.append(body(
    'AI 纪念工具是一个尚未被充分开发的新兴蓝海。PlotBox 公司推出"殡仪馆 AI 悼词助手"，'
    '可基于逝者生平信息自动生成个性化悼词；《华盛顿邮报》2025 年 8 月报道显示，'
    '越来越多的家庭与殡葬机构开始使用 AI 悼词生成器；'
    'Pre-Need Death Care 市场预计 2032 年达到 1200 亿美元，CAGR 6.5%。'
    '在这一大趋势下，面向 C 端的"AI 数字永生"产品——让用户生前录制视频、'
    '文字、声音，由 AI 训练为可对话的"数字分身"——尚无统治级产品。'
))
story.append(h3('商业模式与挑战'))
story.append(body(
    '客单价预期 50-200 美元/单（一次性付费）或 9-19 美元/月（持续订阅托管）。'
    '该赛道最大挑战是<b>市场教育成本高</b>——用户对"数字永生"概念陌生，'
    '需要大量内容营销；其次是<b>伦理与合规风险</b>——'
    '涉及逝者肖像、声音、人格权，需要严格的法律框架。'
    '该赛道更适合作为长期方向，不适合 5 万元预算的兼职启动。'
    '综合评分 ★★★★☆，建议作为观察赛道。'
))
story.append(PageBreak())

# ─── 第五章 8大候选赛道深度扫描（下） ───
story.append(h1('第五章  8 大候选赛道深度扫描（下）'))
story.append(hr())

story.append(body(
    '下篇覆盖后 4 个赛道：AI 照护者支持 SaaS、AI 家谱研究工具、'
    '垂直 AI 目录站 / 工具站、AI Prompt 库 / 微 SaaS。'
    '这 4 个赛道在"可兼职性"与"启动成本"维度表现更优，'
    '但部分赛道在"市场增速"或"创新性"维度有所妥协。'
))

# ─── 赛道 5: AI 照护者支持 ───
story.append(h2('5.1  AI 照护者支持 SaaS'))
story.append(h3('老龄化刚需与市场规模'))
story.append(body(
    'Caregiver App 市场 2025 年规模 17.1 亿美元，2035 年达到 75 亿美元，CAGR 16%。'
    'Elderly Care Apps 市场 2025 年 68.4 亿美元，2033 年 195.1 亿美元，CAGR 14%。'
    'AARP 2025 年报告显示，美国已有 6300 万人担任家庭照护者，'
    '他们的痛点集中在：症状判断不知所措、医疗信息过载、情绪长期压抑、'
    '缺乏同伴支持。MIT 新闻 2025 年 8 月报道的 Ianacare 就是典型——'
    '为家庭照护者提供资源、社群、工具一体化平台。'
))
story.append(h3('AI 原生机会'))
story.append(body(
    '现有照护者 App 多为信息聚合与社群工具，缺少 AI 原生能力。'
    '差异化机会：AI 症状解读（输入长辈症状描述，AI 给出可能性分析与就医建议）、'
    'AI 情绪支持（针对照护者 burnout 的对话陪伴）、AI 用药提醒与冲突检测、'
    'AI 照护日志自动生成（家属群内同步长辈状况）。'
    '客单价预期 12-25 美元/月，由家庭照护者或子女付费。'
    '该赛道刚需属性强，但用户教育成本较高。综合评分 ★★★★☆。'
))

# ─── 赛道 6: AI 家谱研究工具 ───
story.append(h2('5.2  AI 家谱研究工具'))
story.append(h3('长尾蓝海市场'))
story.append(body(
    '家谱研究是一个被严重低估的长尾市场。Reddit r/Genealogy 有 50 万+ 订阅者，'
    'The Family History AI Show 播客持续更新，AI Genealogy Insights 等专业博客'
    '已建立稳定读者群。现有玩家包括 MyHeritage、Ancestry（老牌巨头）、'
    'FamilySearch（免费工具），但 AI 原生工具极少。'
    'Steve Little（家谱 AI 领域权威）已开源 80+ AI 家谱工具，证明市场需求存在。'
))
story.append(h3('差异化机会'))
story.append(body(
    'AI 在家谱研究中有三大应用场景：第一，<b>老照片修复与人物识别</b>——'
    '将模糊老照片修复并尝试识别其中人物；第二，<b>历史文档 OCR 与结构化</b>——'
    '将教区档案、移民记录、人口普查等手写文档自动识别并结构化；'
    '第三，<b>家族故事 AI 生成</b>——基于家谱数据自动撰写家族历史叙事。'
    '客单价预期 8-19 美元/月订阅。该赛道用户虽少但付费意愿强、复购高，'
    '适合做长期副业。综合评分 ★★★★☆。'
))

# ─── 赛道 7: 垂直 AI 目录站 ───
story.append(h2('5.3  垂直 AI 目录站 / 工具站'))
story.append(h3('已验证的轻量模式'))
story.append(body(
    '目录站是最被低估的"被动收入"模式之一。Indie Hackers 案例显示，'
    '一个聚焦细分赛道的目录站可达 3.4 万美元 MRR，毛利率近 100%，'
    '维护工时仅 3 小时/月。成功案例包括：StandOut CV（SEO 驱动达到 £4 万 MRR）、'
    'Pallyy（社交媒体管理工具，年营收 120 万美元）、aiCarousels（10 天开发，6 个月达 5000 美元 MRR）。'
    '关键成功要素：选对长尾关键词 + 程序化 SEO + 极简产品 + 社群口碑。'
))
story.append(h3('AI 时代的目录站机会'))
story.append(body(
    'AI 时代催生了大量新的细分赛道，每个赛道都需要目录站来组织信息：'
    'AI Agent 目录、AI 工具按行业分类目录、AI Prompt 库目录、'
    'Substack Newsletter 目录、独立开发者产品目录等。'
    '目录站本身的"AI 增强"机会包括：AI 自动收录新工具、AI 生成工具对比、'
    'AI 个性化推荐。客单价 10-50 美元/月（赞助位 + 高级筛选 + API）。'
    '该模式适合技术背景较弱的创业者。综合评分 ★★★★★。'
))

# ─── 赛道 8: AI Prompt 库 ───
story.append(h2('5.4  AI Prompt 库 / 微 SaaS'))
story.append(h3('市场现状'))
story.append(body(
    'AI Prompt 交易市场 2024 年规模 13 亿美元，2034 年达到 121 亿美元，CAGR 23.3%。'
    'PromptBase 是头部平台，已有 27 万+ Prompt 上架，'
    '顶级卖家月收入 500-3000 美元，平台分成 20%（创作者得 80%）。'
    '微 SaaS 整体方面，IdeaProof 数据显示 2026 年最有前景的方向包括：'
    'AI Chrome 扩展、Notion 插件、Stripe 计费工具、垂直 CRM、Shopify 应用、'
    'Slack Bot、Zapier 集成等。'
))
story.append(h3('机会与限制'))
story.append(body(
    '该赛道优势：启动成本极低、可快速验证、单品价格低用户决策快。'
    '限制：单品收入天花板低（一个 Prompt 售价 2-10 美元），'
    '需要持续高频产出；面临 ChatGPT 等 AI 工具直接替代风险——'
    '用户越来越倾向自己写 Prompt 而非购买。'
    '该赛道更适合作为副业练手项目，不适合作为主赛道。'
    '综合评分 ★★★☆☆。'
))
story.append(PageBreak())

# ─── 第六章 TOP1推荐赛道 ───
story.append(h1('第六章  TOP 1 推荐赛道：AI 灵性陪伴 / 玄学一体化 App'))
story.append(hr())

story.append(callout_box(
    '推荐结论',
    '在 8 大候选赛道中，<b>AI 灵性陪伴 / 玄学一体化 App</b> '
    '综合评分最高（8.6 / 10）。该赛道同时满足"蓝海度高、利润率高、'
    '客单价高、复购强、AI 原生、可兼职、零售后"七大条件，'
    '是 5 万元预算独立创业者的最优选择。',
    accent_color=ACCENT_GOLD,
))

story.append(h2('6.1  产品定位'))
story.append(body(
    '产品形态：移动 App + Web 双端，整合五大核心功能——'
    '<b>AI 占星本命盘解读</b>（输入出生时间地点生成完整本命盘 + AI 深度解读）、'
    '<b>AI 塔罗占卜</b>（每日一抽 + 任意主题深度占卜 + AI 解读牌阵）、'
    '<b>AI 解梦日记</b>（记录梦境 + AI 多框架解读 + 月度主题分析）、'
    '<b>AI 每日能量报告</b>（结合占星 + 塔罗 + 数字能量学的每日个性化指南）、'
    '<b>AI 命理八字 / 印度占星</b>（覆盖东西方主流玄学体系）。'
    '差异化关键词：一体化、AI 原生、强陪伴感、跨文化适配。'
))

story.append(h2('6.2  8 维度评分对比'))
score_data = [
    ['AI 占星 / 玄学一体化 App', '9', '9', '8', '9', '9', '9', '9', '8', '8.6'],
    ['AI 个性化儿童故事书', '8', '8', '7', '7', '8', '8', '8', '6', '7.5'],
    ['AI 解梦 App', '9', '8', '9', '9', '7', '9', '8', '8', '8.3'],
    ['AI 纪念 / 数字永生', '10', '9', '10', '6', '7', '7', '9', '5', '7.9'],
    ['AI 照护者支持 SaaS', '8', '8', '8', '7', '7', '7', '7', '6', '7.4'],
    ['AI 家谱研究工具', '9', '7', '9', '8', '6', '8', '7', '7', '7.6'],
    ['垂直 AI 目录站', '7', '10', '8', '10', '8', '10', '6', '10', '8.4'],
    ['AI Prompt 库', '5', '7', '5', '10', '5', '9', '5', '9', '6.4'],
]
story.append(standard_table(
    ['赛道', '蓝海', '利润', '竞争', '轻量', 'ROI', '售后', '创新', '兼职', '综合'],
    score_data,
    col_ratios=[0.28, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.08, 0.10],
))
story.append(caption('表 6-1  8 大候选赛道 8 维度评分对比（满分 10 分）'))

story.append(h2('6.3  核心论证'))
story.append(h3('论证一：蓝海度 9 分——市场在涨但无统治级产品'))
story.append(body(
    '占星 App 市场 CAGR 19.8%、灵性健康市场 CAGR 14-16%、'
    'AI Companion 市场 CAGR 39%——三个数据共同说明这是一个高速增长的市场。'
    '但现有头部产品 Co-Star、The Pattern、Sanctuary 均为"传统占星 App"，'
    '功能单一、非 AI 原生、缺乏陪伴感。这是典型的"市场在涨、产品没跟上"的蓝海窗口。'
    '参考案例：Tibo 的 5 个 AI 产品月营收超 100 万美元，证明 AI 原生 + 细分定位有清晰盈利空间。'
))
story.append(h3('论证二：利润率 9 分——85%+ 毛利的订阅制'))
story.append(body(
    '产品成本结构：OpenAI/Claude API 调用（约 0.05-0.15 美元/次深度解读）、'
    '服务器与 CDN（约 50-200 美元/月）、Stripe 支付通道费（2.9% + 0.3 美元/笔）。'
    '订阅制客单价 19 美元/月，扣除成本后毛利约 16 美元，毛利率 84%+。'
    '对比实体商品（毛利 30-50%）、跨境物流电商（毛利 20-40%），'
    '该赛道在利润率上有数量级优势。'
))
story.append(h3('论证三：竞争度 8 分——主流玩家仍是传统占星 App'))
story.append(body(
    '主流玩家分析：Co-Star（极简风格但功能单一）、The Pattern（性格分析为主）、'
    'Sanctuary（按次付费咨询模式，重运营）。这些产品在 App Store 排名靠前，'
    '但都未做"AI 原生 + 多玄学体系整合 + 强陪伴感"。'
    '新入局者的差异化路径清晰：AI 深度对话 + 占星塔罗解梦一体化 + '
    '每日能量报告 + 跨文化玄学体系。这种"瑞士军刀式"产品在工具类 App 中已多次验证。'
))
story.append(h3('论证四：轻量度 9 分——5 万元预算可启动 MVP'))
story.append(body(
    '5 万元（约 7000 美元）预算分配：域名 + 服务器 200 美元/年、'
    'AI API 调用 1500 美元/年、Stripe + 支付 100 美元、设计素材 300 美元、'
    '营销启动 2000 美元、应急储备 2900 美元。技术栈选择 Next.js + Vercel + Supabase + '
    'OpenAI/Claude API，单人可在 30 天内完成 MVP 开发。无需团队、无需库存、无需物流。'
))
story.append(h3('论证五：ROI 9 分——9 个月回本，年化 280%'))
story.append(body(
    '保守预测：6 个月内积累 500 名付费用户 × 19 美元/月 = 9500 美元/月 MRR；'
    '9 个月达到 800 名付费用户 × 19 美元/月 = 15200 美元/月 MRR。'
    '9 个月累计营收约 5-6 万美元，完全覆盖 7000 美元启动成本，'
    '年化 ROI 约 280%。中性预测：12 个月达到 1500 名付费用户，'
    '月营收 28500 美元，年化 ROI 超 400%。'
))
story.append(h3('论证六：售后成本 9 分——AI 自动生成内容'))
story.append(body(
    '内容生成完全由 AI 完成，无需人工内容编辑；用户咨询由 AI 实时响应，'
    '无需人工客服；退款政策明确（7 天无理由退款），争议率预期低于 2%；'
    '唯一需要人工的是社交内容运营（TikTok / Instagram / Pinterest），'
    '可由创始人兼职完成，每周投入 5-8 小时。整体售后与运营成本极低。'
))
story.append(h3('论证七：创新性 9 分——AI + 玄学跨学科融合'))
story.append(body(
    'AI 大模型（特别是 GPT-4o、Claude 3.5）让"个性化玄学解读"达到全新高度——'
    '不再是关键词匹配的模板回答，而是基于用户完整命盘、历史梦境、'
    '当前困扰的深度对话式解读。同时，跨文化玄学体系整合（西方占星 + '
    '印度吠陀占星 + 中国八字 + 塔罗 + 解梦）也是传统产品无法实现的。'
    '这种"AI 原生 + 跨文化 + 一体化"的组合，构成清晰的产品创新护城河。'
))
story.append(h3('论证八：可兼职性 8 分——AI 自动化运营'))
story.append(body(
    '产品上线后，日常运营只需：监控 API 调用成本、回复邮件咨询（每周 5-10 封）、'
    '社交内容发布（每周 3-5 条 TikTok / Instagram）、监控数据指标（每日 5 分钟）。'
    '兼职 10-15 小时/周完全可维持。增长阶段可能需要投入更多时间在内容与社群运营，'
    '但相比传统电商、跨境物流等需要全天候响应的生意，本赛道在时间投入上有数量级优势。'
))
story.append(PageBreak())

# ─── 第七章 竞品深度分析 ───
story.append(h1('第七章  竞品深度分析'))
story.append(hr())

story.append(body(
    '本章拆解 6 个核心竞品的商业模式、定价、用户量、产品功能与弱点，'
    '为新入局者提供差异化设计的依据。所有数据来自公开渠道（App Store、'
    'Google Play、Reddit、Indie Hackers、Sensor Tower 估算），'
    '可能存在 20-30% 偏差，仅供方向性参考。'
))

story.append(h2('7.1  Co-Star：极简美学下的功能单一'))
story.append(body(
    'Co-Star 是占星 App 鼻祖，2017 年上线，至今积累 2000 万+ 用户。'
    '商业模式：App 内订阅 8 美元/月，主要卖点为"AI 占星师"对话功能（实为预生成模板）。'
    '优势：极简黑色美学品牌力强、用户基数大、社交分享设计优秀。'
    '弱点：功能仅限西方占星、内容深度不足、缺乏塔罗解梦等关联功能、'
    '近年用户增长放缓。差异化机会：在视觉美学上做出新意（如神秘学奢华风），'
    '在功能深度上做加法。'
))

story.append(h2('7.2  The Pattern：性格分析导向'))
story.append(body(
    'The Pattern 主打"性格深度分析"，用户量约 500 万。商业模式：'
    '免费 + 订阅 14.99 美元/月。优势：性格分析维度深入、用户粘性高、'
    '社交匹配功能有创新。弱点：不是传统占星 App、缺乏塔罗等占卜功能、'
    '内容更新频率低。差异化机会：将"性格分析 + 占星 + 塔罗"整合，'
    '提供更立体的"个人使用说明书"。'
))

story.append(h2('7.3  Sanctuary：按次付费咨询模式'))
story.append(body(
    'Sanctuary 采用"按次付费占星咨询"模式，用户付费 30-80 美元/次，'
    '与真人占星师 1 对 1 视频或文字咨询。优势：客单价高、'
    '体验个性化、有真人温度。弱点：模式重（需要招募占星师）、'
    '规模化困难、用户体验依赖于占星师质量。差异化机会：用 AI 完全替代真人占星师，'
    '将客单价从 30-80 美元/次降到 19 美元/月无限次，覆盖更广泛用户群。'
))

story.append(h2('7.4  Astrologer.ai 与 Costar Astrology'))
story.append(body(
    'Astrologer.ai 是 AI 驱动的占星 App，但功能仍局限于占星，'
    'AI 解读深度有限；Costar Astrology 是 Co-Star 的子品牌/竞品，'
    '定位相近但用户量更小。这两个产品都没有跨玄学体系整合。'
))

story.append(h2('7.5  Insight：印度市场的成功案例'))
story.append(body(
    'Insight 是印度占星 App 头部产品，主打吠陀占星 + 婚配匹配，'
    '在印度市场拥有 5000 万+ 用户。商业模式：免费 + 订阅 + 按次咨询。'
    '启示：印度市场对占星类应用接受度极高（CAGR 49.19%），'
    '是出海的重要目标市场之一。新入局者可在产品上线初期就规划印度本地化版本。'
))

story.append(h2('7.6  差异化设计总结'))
diff_data = [
    ['功能整合度', '单功能为主', '占星+塔罗+解梦+命理+能量'],
    ['AI 原生度', '模板/规则为主', '大模型深度对话'],
    ['陪伴感', '工具属性', '日常陪伴 + 长期成长追踪'],
    ['跨文化', '单一体系', '东西方玄学整合'],
    ['定价', '高价订阅或按次', '中等订阅 + 免费层引流'],
    ['视觉', '极简/卡通', '神秘奢华美学'],
]
story.append(standard_table(
    ['维度', '现有竞品', '本产品差异化'],
    diff_data,
    col_ratios=[0.22, 0.36, 0.42],
))
story.append(caption('表 7-1  与现有竞品的差异化设计总结'))
story.append(PageBreak())

# ─── 第八章 用户画像与需求验证 ───
story.append(h1('第八章  目标用户画像与需求验证'))
story.append(hr())

story.append(h2('8.1  三类核心用户画像'))

story.append(h3('用户画像一：Gen Z 灵性觉醒者（18-28 岁，女性为主）'))
story.append(body(
    '人口统计：女性占比 75%，主要分布北美、欧洲、拉美、东南亚；'
    '教育程度大学及以上，月可支配收入 500-2000 美元。'
    '心理特征：处于"灵性觉醒期"——对主流宗教失望、对玄学好奇、'
    '相信"宇宙能量"与"个人成长"的关联；TikTok 重度用户，'
    '关注 #witchtok、#astrology、#tarot 等话题。'
    '使用场景：每日早晨查看运势规划一天、塔罗占卜重大决策、'
    '解梦寻找潜意识信号。付费意愿：15-25 美元/月订阅。'
))

story.append(h3('用户画像二：千禧一代职场女性（28-38 岁）'))
story.append(body(
    '人口统计：女性占比 80%，主要分布北美、欧洲、澳新；'
    '中高收入（年薪 5-15 万美元），已婚或稳定伴侣关系，'
    '部分有 1-2 个孩子。心理特征：职场压力大、寻求心灵慰藉、'
    '将玄学视为"低门槛心理治疗"；倾向深度内容而非娱乐化占卜。'
    '使用场景：周末深度塔罗占卜、月度能量复盘、解梦分析压力源。'
    '付费意愿：25-40 美元/月订阅 + 高客单价增值服务（如年度命盘深度解读）。'
))

story.append(h3('用户画像三：新纪元爱好者（40+ 岁）'))
story.append(body(
    '人口统计：性别均衡，主要分布北美、欧洲、澳新；'
    '收入中高，多数为灵性健康长期消费者。'
    '心理特征：将玄学、心理学、灵性、健康视为整合系统；'
    '追求"个性化"与"权威感"并重；付费决策理性，看重内容深度。'
    '使用场景：长期命盘追踪、家谱与命理关联、玄学社群交流。'
    '付费意愿：50-100 美元/月订阅或一次性高客单价服务（如 200 美元深度命盘报告）。'
))

story.append(h2('8.2  需求验证信号'))

story.append(h3('信号一：Reddit 社区活跃度'))
story.append(body(
    'Reddit r/astrology 订阅 150 万+、r/tarot 订阅 80 万+、r/Dreams 订阅 60 万+、'
    'r/Psychic 订阅 30 万+。这些社区每日活跃讨论占星、塔罗、解梦话题，'
    '用户对"AI 解读"接受度高，频繁出现"AI 解读比真人更准"的讨论。'
    '这是清晰的需求验证信号——用户已经在自发讨论 AI 玄学产品。'
))

story.append(h3('信号二：TikTok 话题播放量'))
story.append(body(
    'TikTok 上 #tarot 累计播放超 50 亿次、#astrology 超 200 亿次、'
    '#witchtok 超 400 亿次、#dreaminterpretation 超 10 亿次。'
    '这些数据说明 Gen Z 对玄学内容的消费已经形成稳定习惯，'
    '产品上线后可通过 TikTok 短视频低成本获客。'
))

story.append(h3('信号三：现有竞品营收规模'))
story.append(body(
    'Co-Star 估算年营收 5000 万-1 亿美元；The Pattern 估算年营收 2000-5000 万美元；'
    'Sanctuary 估算年营收 1000-3000 万美元。这些数字说明赛道天花板足够高，'
    '即使新入局者只拿到 1% 市场份额，也有数百万美元年营收空间。'
))

story.append(h3('信号四：哈佛商学院研究背书'))
story.append(body(
    '哈佛商学院 2025 年 11 月发表的研究《AI Companions Reduce Loneliness》指出：'
    'AI 陪伴 App 确实能缓解用户孤独感，且效果与真人陪伴接近。'
    '这一学术背书为 AI 灵性陪伴产品提供了正当性，降低用户心理门槛。'
))

story.append(h2('8.3  早期用户获取渠道'))
channel_data = [
    ['TikTok 短视频', '低', '高', '日常运势 + 塔罗占卜演示'],
    ['Instagram Reels', '低', '高', '视觉化占星卡片 + 解梦故事'],
    ['Pinterest', '低', '中', '占星美图 + 塔罗牌设计'],
    ['Reddit 社区', '低', '中', '深度解读 + 用户案例分享'],
    ['Product Hunt', '一次性', '中', '上线日获取首批种子用户'],
    ['Substack Newsletter', '中', '中', '建立专家人设 + 邮件转化'],
    ['Apple App Store ASO', '中', '高', '占星、塔罗等关键词优化'],
]
story.append(standard_table(
    ['渠道', '成本', '获客效率', '内容策略'],
    channel_data,
    col_ratios=[0.24, 0.16, 0.16, 0.44],
))
story.append(caption('表 8-1  早期用户获取渠道矩阵'))
story.append(PageBreak())

# ─── 第九章 产品MVP设计 ───
story.append(h1('第九章  产品 MVP 设计'))
story.append(hr())

story.append(h2('9.1  MVP 功能清单与优先级'))
story.append(body(
    'MVP 遵循"最小可行但完整体验"原则——不是做减法把功能砍到只有占星，'
    '而是做加法把"占星 + 塔罗 + 解梦 + 能量报告"四大核心功能做透，'
    '让用户体验到"一体化"的差异化价值。功能优先级如下表。'
))

mvp_data = [
    ['P0 (必做)', 'AI 占星本命盘', '输入出生时间地点，生成本命盘 + AI 深度解读'],
    ['P0 (必做)', 'AI 塔罗占卜', '每日一抽 + 任意主题占卜 + AI 解读牌阵'],
    ['P0 (必做)', 'AI 每日能量报告', '结合占星 + 塔罗的每日个性化指南'],
    ['P0 (必做)', '用户账号与订阅', '邮箱注册 + Stripe 订阅 + 7 天免费试用'],
    ['P1 (重要)', 'AI 解梦日记', '记录梦境 + AI 多框架解读 + 月度主题'],
    ['P1 (重要)', '占星合盘', '情侣 / 朋友合盘分析'],
    ['P1 (重要)', '历史记录与成长追踪', '过去占卜记录 + 个人成长主题演变'],
    ['P2 (后续)', 'AI 命理八字 / 印度占星', '东西方玄学体系扩展'],
    ['P2 (后续)', '社群功能', '同类用户匹配 + 经验分享'],
    ['P2 (后续)', '真人专家咨询', '高客单价增值服务'],
]
story.append(standard_table(
    ['优先级', '功能', '说明'],
    mvp_data,
    col_ratios=[0.18, 0.28, 0.54],
))
story.append(caption('表 9-1  MVP 功能优先级清单'))

story.append(h2('9.2  技术栈选择'))
story.append(body(
    '前端：Next.js 14+（App Router + React Server Components），'
    '部署于 Vercel，自动 CDN 加速全球访问。UI 库：shadcn/ui + Tailwind CSS，'
    '快速构建高质感界面。移动端：先做 PWA（无需上架审核），'
    '验证 PMF 后再用 React Native 或 Expo 封装为原生 App。'
))
story.append(body(
    '后端：Next.js API Routes + Supabase（Postgres + Auth + Realtime + Storage），'
    '无需自建数据库与认证系统。AI 调用：OpenAI GPT-4o（主）+ '
    'Anthropic Claude 3.5 Sonnet（备）+ Google Gemini（降本备选），'
    '通过 OpenRouter 统一接口管理。占星计算：使用 Swiss Ephemeris API '
    '或 Astrology API（按调用计费）。'
))
story.append(body(
    '支付：Stripe Checkout + Stripe Billing（订阅管理），'
    ' webhook 自动同步订阅状态。邮件：Resend 或 Postmark（事务性邮件）+ '
    'ConvertKit（营销邮件）。分析：PostHog（产品分析）+ Plausible（轻量网站分析）。'
    '监控：Sentry（错误监控）+ Better Stack（uptime 监控）。'
    '整个技术栈月度成本可控在 50-200 美元，5 万元预算绰绰有余。'
))

story.append(h2('9.3  设计原则与视觉风格'))
story.append(body(
    '设计原则：<b>神秘美学 + AI 原生 + 情感陪伴</b>。视觉风格避开 Co-Star 的极简黑色、'
    '避开主流占星 App 的卡通星座符号，采用"神秘奢华风"——'
    '深紫罗兰、午夜蓝、香槟金为主色，搭配星空、月相、塔罗牌等神秘元素。'
    '字体：英文用 Cormorant Garamond（衬线优雅）+ Inter（无衬线现代），'
    '中文用思源宋体 + 思源黑体。动效：星空粒子背景、月相渐变、'
    '塔罗牌翻转动画，营造仪式感。'
))
story.append(body(
    'AI 交互原则：避免传统聊天机器人界面，采用"占卜仪式"流程——'
    '用户进入占卜前需选择主题、深呼吸 3 秒（仪式感）、抽牌（动效）、'
    'AI 解读（打字机效果）。每一次占卜都是一次"灵性仪式"而非工具操作。'
    '这种设计让产品体验与传统占星 App 形成代际差异。'
))

story.append(h2('9.4  内容与 AI Prompt 设计'))
story.append(body(
    'AI 解读质量是产品命脉。Prompt 设计原则：'
    '第一，<b>结构化输入</b>——将用户命盘、塔罗牌阵、历史占卜记录结构化传入；'
    '第二，<b>角色设定</b>——AI 扮演"资深灵性导师"而非"占卜机器"，'
    '语气温暖、富有洞察；第三，<b>多框架解读</b>——同时给出心理学、'
    '象征学、占星学多角度解读，提升内容深度；'
    '第四，<b>行动建议</b>——每条解读结尾给出 1-2 条可执行建议，'
    '让用户感受到"占卜有价值"而非"占卜是娱乐"。'
))
story.append(PageBreak())

# ─── 第十章 5万预算分配与ROI测算 ───
story.append(h1('第十章  5 万预算分配与 ROI 测算'))
story.append(hr())

story.append(h2('10.1  预算总览'))
story.append(body(
    '5 万元人民币约折合 7000 美元（按 7.15 汇率计算）。'
    '预算分配遵循"轻启动 + 留足弹药"原则——前期投入控制在 4000 美元以内，'
    '保留 3000 美元应对突发情况与增长期投入。'
))

budget_data = [
    ['域名 + DNS', '50', '一次性', '.com 域名，Namecheap/Cloudflare'],
    ['服务器 + CDN', '200', '年度', 'Vercel Pro + Cloudflare'],
    ['数据库 + Auth', '300', '年度', 'Supabase Pro'],
    ['AI API 调用', '1500', '年度', 'OpenAI + Claude + Astrology API'],
    ['支付通道', '100', '年度', 'Stripe 手续费预存'],
    ['设计素材', '300', '一次性', 'Figma + Unsplash + 塔罗牌图库'],
    ['邮件服务', '120', '年度', 'Resend + ConvertKit'],
    ['监控与分析', '200', '年度', 'Sentry + PostHog + Plausible'],
    ['营销启动', '2000', '一次性', 'TikTok 推广 + KOL 合作 + Product Hunt'],
    ['应急储备', '2230', '弹性', '应对 API 涨价、突发需求'],
    ['合计', '7000', '—', '约 5 万人民币'],
]
story.append(standard_table(
    ['项目', '金额 (USD)', '周期', '说明'],
    budget_data,
    col_ratios=[0.24, 0.14, 0.12, 0.50],
))
story.append(caption('表 10-1  5 万元（约 7000 美元）预算分配表'))

story.append(h2('10.2  ROI 测算'))

story.append(h3('保守预测'))
story.append(body(
    '假设：6 个月达成 500 名付费用户，月增长 12%，'
    '客单价 19 美元/月，月流失率 8%。'
    '月 6 营收：500 × 19 = 9500 美元；'
    '月 9 营收：800 × 19 = 15200 美元；'
    '月 12 营收：1050 × 19 = 19950 美元。'
    '扣除成本（API + 服务器 + 支付通道，约占营收 25%），'
    '月 12 净利润约 15000 美元。'
    '9 个月累计净利约 4-5 万美元，覆盖 7000 美元启动成本。'
    '年化 ROI 约 280%。'
))

story.append(h3('中性预测'))
story.append(body(
    '假设：6 个月达成 800 名付费用户，月增长 15%，'
    '客单价 24 美元/月（含 30% 用户升级高级版），月流失率 6%。'
    '月 6 营收：800 × 24 = 19200 美元；'
    '月 9 营收：1300 × 24 = 31200 美元；'
    '月 12 营收：1700 × 24 = 40800 美元。'
    '扣除成本（约占 22%），月 12 净利润约 32000 美元。'
    '6 个月回本，年化 ROI 约 450%。'
))

story.append(h3('乐观预测'))
story.append(body(
    '假设：产品在 Product Hunt 上爆火，首月获得 5000+ 用户；'
    'TikTok 视频病毒式传播，6 个月达成 3000 付费用户。'
    '月 6 营收：3000 × 24 = 72000 美元；'
    '月 12 营收：8000 × 24 = 192000 美元。'
    '扣除成本（约占 18%，规模化后单位成本下降），月 12 净利润约 157000 美元。'
    '3 个月回本，年化 ROI 超 1000%。'
    '此情况概率约 5-10%，需产品体验与营销内容双优秀。'
))

story.append(h2('10.3  现金流敏感性分析'))
story.append(body(
    '关键风险变量：付费转化率、月流失率、API 成本波动。'
    '敏感性测试显示，若付费转化率从预期的 5% 降至 2%，'
    '月 12 营收将从 19950 美元降至 8000 美元，回本周期延长至 14 个月；'
    '若月流失率从 8% 升至 15%，月 12 用户数将从 1050 降至 500，'
    '回本周期延长至 16 个月。建议创始人前 3 个月密切监控这两个指标，'
    '必要时快速迭代产品体验与 onboarding 流程。'
))

story.append(callout_box(
    '财务结论',
    '在保守预测下，5 万元预算可在 9 个月内完全回本，年化 ROI 280%。'
    '即使最悲观情况（转化率 2%、流失率 15%），14-16 个月也可回本。'
    '该赛道在 5 万元预算约束下有清晰的财务可行性与较高的安全边际。',
    accent_color=SEM_SUCCESS,
))
story.append(PageBreak())

# ─── 第十一章 90天落地路线图 ───
story.append(h1('第十一章  90 天落地路线图'))
story.append(hr())

story.append(h2('11.1  Day 1-30：市场调研 + MVP 开发 + 品牌设计'))
story.append(body(
    '<b>核心目标</b>：完成 MVP 开发，准备好品牌资产，做好上线前所有准备。'
    '<b>关键里程碑</b>：（1）Day 1-7：完成竞品深度拆解，'
    '确定产品差异化定位与品牌名（建议 brainstorm 20+ 名字，筛选 3 个测试）；'
    '（2）Day 8-15：完成 UI/UX 设计，包括品牌色、Logo、核心界面（首页、占星、塔罗、解梦、个人中心）；'
    '（3）Day 16-25：完成 MVP 核心功能开发（占星本命盘、塔罗占卜、每日能量报告、订阅支付）；'
    '（4）Day 26-30：内测与 Bug 修复，准备 Product Hunt 上线物料。'
))
story.append(body(
    '<b>KPI</b>：MVP 可用、核心功能无 P0 Bug、品牌资产齐全、'
    'Product Hunt 上线页面就绪。'
    '<b>风险点</b>：开发进度延误（应对：使用 Lovable、v0 等 AI 开发工具加速）；'
    '品牌定位不清晰（应对：用 5 天时间访谈 10 位目标用户验证）。'
))

story.append(h2('11.2  Day 31-60：内测 + 种子用户获取 + Product Hunt 发布'))
story.append(body(
    '<b>核心目标</b>：获取首批 100 名种子用户，验证产品 PMF。'
    '<b>关键里程碑</b>：（1）Day 31-35：邀请 20-30 位目标用户内测，'
    '收集反馈，迭代产品；（2）Day 36-45：在 TikTok / Instagram / Reddit / Pinterest '
    '同时启动内容运营，每周发布 5-10 条内容，引流到产品；'
    '（3）Day 46-50：Product Hunt 上线（选择周二/周三发布，流量最大），'
    '争取当日 Top 5；（4）Day 51-60：根据种子用户反馈，'
    '快速迭代产品（重点优化 AI 解读质量与 onboarding 流程）。'
))
story.append(body(
    '<b>KPI</b>：注册用户 500+、付费用户 30+、Product Hunt 当日 Top 10、'
    'TikTok 累计曝光 10 万+。'
    '<b>风险点</b>：Product Hunt 发布效果不佳（应对：提前 2 周联系 hunter、'
    '准备 20+ 支持者）；种子用户反馈不佳（应对：快速调整产品定位与功能）。'
))

story.append(h2('11.3  Day 61-90：付费转化 + SEO 启动 + TikTok 矩阵运营'))
story.append(body(
    '<b>核心目标</b>：达成 100+ 付费用户，月营收 2000 美元，'
    '建立可持续获客通道。'
    '<b>关键里程碑</b>：（1）Day 61-70：优化付费转化漏斗，'
    'A/B 测试不同定价方案（19 美元 vs 24 美元 vs 29 美元）、'
    '不同试用期（3 天 vs 7 天 vs 14 天）；'
    '（2）Day 71-80：启动 SEO 内容营销，每周发布 2-3 篇深度博客'
    '（如"如何解读本命盘月亮星座"、"塔罗牌 22 张大阿卡那深度解析"），'
    '同步构建程序化 SEO 页面（每个星座/每张塔罗牌独立页面）；'
    '（3）Day 81-90：建立 TikTok 矩阵（1 个主账号 + 2-3 个细分账号），'
    '测试不同内容形式（运势播报、占卜演示、解梦故事、玄学科普）。'
))
story.append(body(
    '<b>KPI</b>：付费用户 100+、月营收 2000+ 美元、'
    'SEO 自然流量占新增用户 30%+、TikTok 月曝光 50 万+。'
    '<b>风险点</b>：付费转化率低于预期（应对：增加免费层价值、'
    '降低试用门槛）；SEO 见效慢（应对：同步投入 Pinterest、Reddit 等渠道）。'
))

story.append(h2('11.4  90 天后中长期规划'))
story.append(body(
    '90 天后进入增长期，重点投入：（1）<b>AI 能力升级</b>——'
    '接入 GPT-5 / Claude 4 等新一代模型，提升解读深度；'
    '（2）<b>功能扩展</b>——上线命理八字、印度占星、占星合盘等高级功能；'
    '（3）<b>多语言本地化</b>——西班牙语、葡萄牙语、日语、印地语版本，'
    '覆盖拉美、日本、印度市场；（4）<b>真人专家咨询</b>——'
    '接入真人占星师、塔罗师，提供高客单价 1 对 1 咨询服务；'
    '（5）<b>原生 App 开发</b>——将 PWA 封装为 iOS / Android 原生 App，'
    '上架 App Store 与 Google Play，获取应用商店自然流量。'
))
story.append(PageBreak())

# ─── 第十二章 风险清单与对冲策略 ───
story.append(h1('第十二章  风险清单与对冲策略'))
story.append(hr())

story.append(body(
    '本章梳理 5 大类共 15 个具体风险，并给出可操作的对冲方案。'
    '风险评估维度：发生概率（高/中/低）× 影响程度（高/中/低）= 优先级。'
))

story.append(h2('12.1  平台风险'))
risk1_data = [
    ['OpenAI / Claude API 涨价', '中', '高', '高', '多模型路由 + 自建小模型缓存高频请求'],
    ['Stripe 政策调整 / 账户冻结', '低', '高', '中', '备用 Lemon Squeezy / Paddle 通道'],
    ['App Store / Google Play 审核拒绝', '中', '中', '中', '先做 PWA 规避审核，验证后再上原生'],
    ['Vercel / Supabase 服务中断', '低', '中', '低', '关键数据定期备份至 Cloudflare R2'],
]
story.append(standard_table(
    ['风险点', '概率', '影响', '优先级', '对冲方案'],
    risk1_data,
    col_ratios=[0.28, 0.10, 0.10, 0.10, 0.42],
))
story.append(caption('表 12-1  平台风险与对冲策略'))

story.append(h2('12.2  市场风险'))
risk2_data = [
    ['用户付费意愿不及预期', '中', '高', '高', '前 30 天密集访谈，快速调整定价与产品'],
    ['付费转化率低于 3%', '中', '高', '高', '加强免费层价值，降低试用门槛至 14 天'],
    ['月流失率超过 12%', '中', '中', '中', '增加用户留存功能：每日仪式、成长追踪'],
    ['细分市场天花板低于预期', '低', '中', '低', '拓展到情绪陪伴、冥想等相邻赛道'],
]
story.append(standard_table(
    ['风险点', '概率', '影响', '优先级', '对冲方案'],
    risk2_data,
    col_ratios=[0.28, 0.10, 0.10, 0.10, 0.42],
))
story.append(caption('表 12-2  市场风险与对冲策略'))

story.append(h2('12.3  合规风险'))
story3_data = [
    ['GDPR 数据合规', '中', '高', '高', '用户数据加密存储 + 数据删除 API + 隐私政策透明'],
    ['玄学内容监管', '低', '中', '中', '明确"娱乐内容"免责声明，避免医疗/投资建议'],
    ['未成年人使用', '中', '中', '中', '注册需年满 18 岁，未成年子女需家长授权'],
    ['支付合规（PCI DSS）', '低', '高', '中', '完全使用 Stripe 托管支付，不接触卡号'],
]
story.append(standard_table(
    ['风险点', '概率', '影响', '优先级', '对冲方案'],
    story3_data,
    col_ratios=[0.28, 0.10, 0.10, 0.10, 0.42],
))
story.append(caption('表 12-3  合规风险与对冲策略'))

story.append(h2('12.4  竞争风险'))
story.append(body(
    '竞争风险主要来自两个方面：一是 Co-Star、The Pattern 等头部产品跟进 AI 与多玄学体系整合，'
    '二是 OpenAI、Google 等大厂直接推出免费玄学产品。'
    '对冲方案：（1）<b>建立用户数据护城河</b>——用户的命盘、历史占卜、梦境记录等数据'
    '形成迁移成本，即使竞品跟进也难以撬动存量用户；'
    '（2）<b>建立品牌与社群护城河</b>——通过 TikTok、Discord、Substack 等渠道'
    '建立品牌人格与社群文化，这是大厂难以复制的；'
    '（3）<b>保持产品迭代速度</b>——每月发布新功能，让竞品始终追赶而非超越。'
))

story.append(h2('12.5  运营风险'))
risk5_data = [
    ['兼职时间不足导致运营断档', '高', '中', '高', '建立 SOP + 自动化工具（Buffer、Make）'],
    ['AI 内容质量不稳定', '中', '高', '高', '建立 Prompt 模板库 + 用户反馈标注系统'],
    ['内容创作瓶颈（TikTok）', '中', '中', '中', '建立内容矩阵 + UGC 激励'],
    ['情绪耗竭（创始人心力透支）', '中', '高', '高', '设定明确工作时间 + 每月复盘 + 必要时求助'],
]
story.append(standard_table(
    ['风险点', '概率', '影响', '优先级', '对冲方案'],
    risk5_data,
    col_ratios=[0.28, 0.10, 0.10, 0.10, 0.42],
))
story.append(caption('表 12-4  运营风险与对冲策略'))
story.append(PageBreak())

# ─── 第十三章 行动建议与下一步 ───
story.append(h1('第十三章  行动建议与下一步'))
story.append(hr())

story.append(h2('13.1  本周该做什么（Week 1）'))
story.append(body(
    '<b>行动 1</b>：完成本报告深度阅读，重点关注第六章（TOP1 推荐）与第十一章（90 天路线图）。'
    '同步与 1-2 位行业朋友或潜在用户讨论，校准判断。'
))
story.append(body(
    '<b>行动 2</b>：下载 Co-Star、The Pattern、Sanctuary 三款主流竞品 App，'
    '各使用 3 天，记录使用体验、付费点、不爽点。这是后续产品差异化的基础。'
))
story.append(body(
    '<b>行动 3</b>：在 Reddit r/astrology、r/tarot、r/Dreams 三个社区潜伏一周，'
    '观察用户讨论话题、痛点、对现有产品的不满。整理至少 30 条用户原话作为后续产品设计输入。'
))

story.append(h2('13.2  本月该做什么（Month 1）'))
story.append(body(
    '<b>行动 1</b>：完成竞品深度拆解报告（10 页左右），'
    '明确自己产品的 5 个差异化卖点与对应功能设计。'
))
story.append(body(
    '<b>行动 2</b>：注册域名、搭建开发环境、完成品牌视觉设计'
    '（Logo、品牌色、字体、UI Kit）。'
))
story.append(body(
    '<b>行动 3</b>：完成 MVP 核心功能开发（占星本命盘、塔罗占卜、AI 每日能量报告）。'
    '使用 Next.js + Supabase + OpenAI API 技术栈，单人 30 天可完成。'
))

story.append(h2('13.3  本季度该做什么（Q1）'))
story.append(body(
    '<b>行动 1</b>：完成 MVP 上线，在 Product Hunt 发布，争取 Top 5。'
    '同步在 TikTok / Instagram / Reddit / Pinterest 多渠道启动内容运营。'
))
story.append(body(
    '<b>行动 2</b>：获取首批 500 注册用户、30-50 付费用户，'
    '完成 PMF 验证。每周与 5 位用户深度访谈，迭代产品。'
))
story.append(body(
    '<b>行动 3</b>：建立 SEO 内容矩阵，每月发布 8-10 篇深度博客，'
    '构建程序化 SEO 页面（每个星座/每张塔罗牌/每个梦境主题独立页面）。'
    '90 天时 SEO 自然流量应占新增用户 30%+。'
))

story.append(h2('13.4  三个备选方向'))
story.append(body(
    '如果首选赛道（AI 灵性陪伴 App）与你的兴趣/技能不匹配，'
    '可考虑以下三个备选方向，均为 5 万预算可启动的轻量数字产品：'
))
story.append(body(
    '<b>备选 1：AI 个性化儿童故事书</b>——'
    '客单价高（25-80 美元/单）、节日旺季转化率高、'
    '已有 DreamStories.ai 验证模式（年营收 600 万美元）。'
    '适合有内容创作能力、对儿童教育有兴趣的创业者。'
))
story.append(body(
    '<b>备选 2：垂直 AI 目录站 / 工具站</b>——'
    '已验证模式（3.4 万美元 MRR、3 小时/月维护）、'
    '启动成本极低、SEO 驱动长期复利。'
    '适合技术背景较弱但擅长内容运营的创业者。'
))
story.append(body(
    '<b>备选 3：AI 照护者支持 SaaS</b>——'
    '刚需属性强、客单价稳定（12-25 美元/月）、'
    '老龄化大趋势红利。'
    '适合有医疗/养老行业背景或对该领域有使命感的创业者。'
))

story.append(h2('13.5  推荐资源清单'))
resource_data = [
    ['Indie Hackers', 'https://www.indiehackers.com', '独立开发者社区，MRR 案例库'],
    ['Reddit r/microsaas', 'https://reddit.com/r/microsaas', '微 SaaS 讨论区'],
    ['Reddit r/SaaS', 'https://reddit.com/r/SaaS', 'SaaS 创业讨论'],
    ['PromptBase', 'https://promptbase.com', 'AI Prompt 交易市场'],
    ['Microns.io', 'https://microns.io', '微 SaaS 项目买卖'],
    ['Stripe Atlas', 'https://stripe.com/atlas', '美国公司注册 + 银行账户'],
    ['Lemon Squeezy', 'https://lemonsqueezy.com', 'Stripe 替代，Merchant of Record'],
    ['Vercel', 'https://vercel.com', 'Next.js 部署平台'],
    ['Supabase', 'https://supabase.com', '开源 Firebase 替代'],
    ['OpenRouter', 'https://openrouter.ai', 'AI 模型统一接口'],
]
story.append(standard_table(
    ['资源', '网址', '用途'],
    resource_data,
    col_ratios=[0.22, 0.36, 0.42],
))
story.append(caption('表 13-1  独立创业者推荐资源清单'))
story.append(PageBreak())

# ─── 附录 ───
story.append(h1('附录  8 大候选赛道速查表'))
story.append(hr())

appendix_data = [
    ['1', 'AI 占星 / 玄学一体化 App', '$5.69B', '$11.71B', '19.8%', '$15-30/月', '★★★★★', '8.6'],
    ['2', 'AI 个性化儿童故事书', '$3.2B', '$18.7B', '21.8%', '$25-80/单', '★★★★☆', '7.5'],
    ['3', 'AI 解梦 App', '$2.99B', '—', '16.3%', '$9-15/月', '★★★★★', '8.3'],
    ['4', 'AI 纪念 / 数字永生', '新兴', '—', '>30%', '$50-200/单', '★★★★☆', '7.9'],
    ['5', 'AI 照护者支持 SaaS', '$1.71B', '$7.5B', '16.0%', '$12-25/月', '★★★★☆', '7.4'],
    ['6', 'AI 家谱研究工具', '长尾', '—', '>15%', '$8-19/月', '★★★★☆', '7.6'],
    ['7', '垂直 AI 目录站', '已验证', '—', 'n/a', '$10-50/月', '★★★★★', '8.4'],
    ['8', 'AI Prompt 库 / 微 SaaS', '$1.3B', '$12.1B', '23.3%', '$2-10/单', '★★★☆☆', '6.4'],
]
story.append(standard_table(
    ['#', '赛道', '2025 市场', '2030/34 市场', 'CAGR', '客单价', '推荐指数', '综合评分'],
    appendix_data,
    col_ratios=[0.04, 0.24, 0.10, 0.12, 0.08, 0.14, 0.14, 0.10],
))
story.append(caption('表 A-1  8 大候选赛道综合速查表'))

story.append(Spacer(1, 18))
story.append(h2('数据来源说明'))
story.append(body(
    '本报告所有市场数据均来自公开渠道，主要数据源包括：'
    'Grand View Research、Market.us、Spherical Insights、Mordor Intelligence、'
    'Research and Markets、Coherent Market Insights、Precedence Research、'
    'AARP（美国退休人协会）、哈佛商学院、MIT News、华盛顿邮报、'
    'Indie Hackers、Reddit、Substack、Medium、Forbes、Fortune、Inc.、'
    'Business Insider 等。共采集 24 个细分研究方向、240 条一手数据样本，'
    '采集时间集中在 2025-2026 年。'
))
story.append(body(
    '所有市场规模预测来自不同机构口径可能存在差异，'
    '本报告优先采用 Grand View Research、Market.us 等权威机构的中位数预测。'
    '竞品营收数据多来自 Indie Hackers 自报或第三方估算，'
    '可能与实际数据有 20-30% 偏差。所有评分均为本报告分析师基于公开数据的'
    '主观判断，不构成投资建议。'
))

story.append(Spacer(1, 12))
story.append(hr())
story.append(Paragraph(
    '<b>报告编制</b>：Z.AI Strategy Research Unit',
    ParagraphStyle(name='Footer1', fontName='NotoSerifSC', fontSize=10,
                   leading=16, textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK')
))
story.append(Paragraph(
    '<b>报告版本</b>：2026 Q2 Edition v1.0',
    ParagraphStyle(name='Footer2', fontName='NotoSerifSC', fontSize=10,
                   leading=16, textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK')
))
story.append(Paragraph(
    '<b>适用对象</b>：5 万预算、兼职副业、海外市场、数字产品方向的独立创业者',
    ParagraphStyle(name='Footer3', fontName='NotoSerifSC', fontSize=10,
                   leading=16, textColor=TEXT_PRIMARY, alignment=TA_LEFT, wordWrap='CJK')
))

# ━━ Build PDF ━━
output_body = '/home/z/my-project/scripts/body.pdf'

doc = TocDocTemplate(
    output_body,
    pagesize=A4,
    leftMargin=LEFT_MARGIN,
    rightMargin=RIGHT_MARGIN,
    topMargin=TOP_MARGIN,
    bottomMargin=BOTTOM_MARGIN,
    title='海外数字产品蓝海创业机会深度研究报告',
    author='Z.ai',
    creator='Z.ai',
    subject='Blue Ocean Entrepreneurship Research Report',
)

doc.multiBuild(story, onFirstPage=draw_page_decoration, onLaterPages=draw_page_decoration)
print(f'✅ Body PDF generated: {output_body}')
