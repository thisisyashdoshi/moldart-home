from pathlib import Path

# MKT-009 verification marker 2026-08-23 18:18 IST: verify SS-furniture grade remediation after bot commit.
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
]

UNSAFE_PATTERNS = [
    'SS 304…',
    'SS 304...',
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
    print(f'MKT-009 SS-furniture grade safety FAIL: {total} known blanket SS304 signals remain.')
    for path, pattern, count in hits:
        print(f'{path}: {count} x {pattern}')
    raise SystemExit(1)

print('MKT-009 SS-furniture grade safety PASS: 12 files scanned; 0 known blanket SS304 signals.')
