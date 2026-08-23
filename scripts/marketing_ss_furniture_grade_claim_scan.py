from pathlib import Path

# MKT-009 verification marker 2026-08-23 20:20 IST: verify SS-furniture grade + construction/finish default remediation after bot changes.
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

UNSAFE_PATTERNS = [
    'SS 304…',
    'SS 304...',
    'Stainless Steel Furniture | PVD-Plated Luxury Furniture — Moldart',
    'SS furniture is fabricated from stainless steel frames, finished with PVD or electroplating, then assembled with selected top materials (marble, glass, MDF) before delivery to site.',
]

hits = []
for path in TARGETS:
    if not path.exists():
        hits.append((str(path), 'MISSING TARGET', 1))
        continue
    text = path.read_text(encoding='utf-8')
    for pattern in UNSAFE_PATTERNS:
        count = text.count(pattern)
        if count:
            hits.append((str(path), pattern, count))

if hits:
    total = sum(count for _, _, count in hits)
    print(f'MKT-009 SS-furniture safety FAIL: {total} known blanket grade/construction/finish defaults remain.')
    for path, pattern, count in hits:
        print(f'{path}: {count} x {pattern}')
    raise SystemExit(1)

print('MKT-009 SS-furniture safety PASS: 14 files scanned; 0 known blanket grade/construction/finish defaults.')
