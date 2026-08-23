from pathlib import Path

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

REPLACEMENTS = {
    'SS 304…': 'Grade per project',
    'SS 304...': 'Grade per project',
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

print(f'MKT-009 SS-furniture grade remediation: {replaced} replacements across {changed} files.')
