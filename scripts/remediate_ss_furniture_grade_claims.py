from pathlib import Path

# MKT-009 2026-08-23 20:20 IST: SS-furniture grade + construction/finish default remediation execution marker.
TARGETS = [
    Path('images/insights/ss-furniture-guide.svg'),
    Path('images/insights/ss-furniture-quality.svg'),
    Path('images/insights/ss-furniture-comparison.svg'),
    Path('images/insights/ss-furniture-applications.svg'),
    Path('images/insights/ss-furniture-buyers-guide.svg'),
    Path('images/insights/ss-furniture-specifications.svg'),
    Path('public-site/images/insights/ss-furniture-guide.svg'),
    Path('public-site/images/insights/ss-furniture-quality.svg'),
    Path('public-site/images/insights/ss-furniture-comparison.svg'),
    Path('public-site/images/insights/ss-furniture-applications.svg'),
    Path('public-site/images/insights/ss-furniture-buyers-guide.svg'),
    Path('public-site/images/insights/ss-furniture-specifications.svg'),
    Path('products/ss-furniture/index.html'),
    Path('public-site/products/ss-furniture/index.html'),
]

REPLACEMENTS = {
    'SS 304…': 'Grade per project',
    'SS 304...': 'Grade per project',
    'Stainless Steel Furniture | PVD-Plated Luxury Furniture — Moldart': 'Stainless Steel Furniture | Specification-Led Supply — Moldart',
    'SS furniture is fabricated from stainless steel frames, finished with PVD or electroplating, then assembled with selected top materials (marble, glass, MDF) before delivery to site.': 'SS furniture requirements are project-specific. Define the approved stainless-steel structure, finish/coating system, top material and assembly details for the intended application.',
}

changed = 0
replaced = 0
for path in TARGETS:
    if not path.exists():
        raise SystemExit(f'Missing target: {path}')
    text = path.read_text(encoding='utf-8')
    original = text
    for old, new in REPLACEMENTS.items():
        count = text.count(old)
        if count:
            text = text.replace(old, new)
            replaced += count
    if text != original:
        path.write_text(text, encoding='utf-8')
        changed += 1

print(f'MKT-009 SS-furniture grade/construction remediation: {replaced} replacements across {changed} files.')
