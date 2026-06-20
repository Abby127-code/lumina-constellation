"""Consolidate all web search JSON results into a single readable digest."""
import json
import os
from pathlib import Path

RESEARCH_DIR = Path("/home/z/my-project/research")
OUTPUT_FILE = RESEARCH_DIR / "digest.md"

# Map filename to topic label
TOPIC_MAP = {
    "ai_microsaas.json": "AI Micro SaaS机会",
    "ai_wrapper.json": "AI Wrapper成功案例",
    "substack.json": "Substack Newsletter收入",
    "notion_gumroad.json": "Notion模板/Gumroad数字产品",
    "emotion_app.json": "情绪陪伴App市场",
    "elderly.json": "银发经济数字产品",
    "pet.json": "宠物经济数字产品",
    "directory.json": "出海工具站/目录站案例",
    "prompt.json": "AI Prompt库市场",
    "ai_content.json": "AI内容再加工工具",
    "china_saas.json": "中国出海SaaS案例",
    "indie_low.json": "小众低竞争数字产品",
    "ai_avatar.json": "AI头像生成器",
    "ai_writing.json": "AI写作垂直工具",
    "ai_therapy.json": "AI心理治疗App",
    "pet_ai.json": "AI宠物App",
    "ai_memorial.json": "AI纪念/数字永生",
    "ai_kids.json": "AI儿童故事书",
    "ai_genealogy.json": "AI家谱工具",
    "caregiver.json": "AI照护者支持",
    "ai_astro.json": "AI占星玄学App",
    "ai_dream.json": "AI解梦App",
    "ai_newsletter.json": "AI Newsletter运营",
    "ai_video.json": "AI视频生成垂直",
}

lines = ["# Web Research Digest\n"]
total_items = 0

for fname, label in TOPIC_MAP.items():
    fpath = RESEARCH_DIR / fname
    if not fpath.exists():
        continue
    try:
        with open(fpath, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        lines.append(f"## {label}\n\n[ERROR] {e}\n")
        continue

    lines.append(f"## {label}\n")
    # data may be list of items
    items = data if isinstance(data, list) else data.get("result", data)
    if not isinstance(items, list):
        items = [items]
    for i, it in enumerate(items, 1):
        if not isinstance(it, dict):
            continue
        name = it.get("name") or it.get("title") or "(no title)"
        url = it.get("url") or ""
        snippet = it.get("snippet") or it.get("description") or ""
        host = it.get("host_name") or ""
        date = it.get("date") or ""
        lines.append(f"### {i}. {name}")
        lines.append(f"- URL: {url}")
        if host:
            lines.append(f"- 来源: {host}")
        if date:
            lines.append(f"- 日期: {date}")
        lines.append(f"- 摘要: {snippet}")
        lines.append("")
        total_items += 1
    lines.append("")

lines.insert(1, f"共 {len(TOPIC_MAP)} 个主题，{total_items} 条搜索结果\n")

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print(f"Digest saved to {OUTPUT_FILE}")
print(f"Total topics: {len(TOPIC_MAP)}, Total items: {total_items}")
