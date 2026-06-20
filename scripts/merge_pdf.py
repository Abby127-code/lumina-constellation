"""Merge cover PDF + body PDF into final report PDF."""
from pypdf import PdfReader, PdfWriter

A4_W, A4_H = 595.28, 841.89

def normalize_page_to_a4(page):
    box = page.mediabox
    w, h = float(box.width), float(box.height)
    # Force scale to exact A4 if dimensions differ even slightly
    if abs(w - A4_W) > 0.5 or abs(h - A4_H) > 0.5:
        page.scale_to(A4_W, A4_H)
    return page

cover_pdf = '/home/z/my-project/scripts/cover.pdf'
body_pdf = '/home/z/my-project/scripts/body.pdf'
output_pdf = '/home/z/my-project/download/海外数字产品蓝海创业机会深度研究报告.pdf'

writer = PdfWriter()

# Cover as page 1
cover_page = PdfReader(cover_pdf).pages[0]
writer.add_page(normalize_page_to_a4(cover_page))

# Body pages follow
for page in PdfReader(body_pdf).pages:
    writer.add_page(normalize_page_to_a4(page))

writer.add_metadata({
    '/Title': '海外数字产品蓝海创业机会深度研究报告',
    '/Author': 'Z.ai',
    '/Creator': 'Z.ai',
    '/Subject': 'Blue Ocean Entrepreneurship Research Report - 2025-2026 Edition',
})

import os
os.makedirs(os.path.dirname(output_pdf), exist_ok=True)
with open(output_pdf, 'wb') as f:
    writer.write(f)

import os
size_kb = os.path.getsize(output_pdf) / 1024
print(f'✅ Final PDF: {output_pdf}')
print(f'   Size: {size_kb:.1f} KB')

# Page count
reader = PdfReader(output_pdf)
print(f'   Pages: {len(reader.pages)}')
