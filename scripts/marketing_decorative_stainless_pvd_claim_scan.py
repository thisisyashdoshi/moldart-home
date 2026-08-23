from pathlib import Path

TARGETS = [
    Path('insights/pvd-stainless-steel-buyer-checklist/index.html'),
    Path('public-site/insights/pvd-stainless-steel-buyer-checklist/index.html'),
]

UNSAFE_PATTERNS = [
    'SS 201 / 304',
    'SS 201 / SS 304, SS 316 on request',
    'Gold, Rose Gold, Black',
    '<td data-label="Checkpoint">Anti-fingerprint coating available</td><td data-label="Reference">Anti-fingerprint coating available</td>',
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
    print(f'MKT-009 decorative-stainless PVD safety FAIL: {total} known patterns remain.')
    for path, pattern, count in hits:
        print(f'{path}: {count} x {pattern}')
    raise SystemExit(1)

print('MKT-009 decorative-stainless PVD safety PASS: 2 files scanned; 0 known default grade/colour/AFP patterns.')
