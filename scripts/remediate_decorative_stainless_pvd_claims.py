from pathlib import Path

# MKT-009 force marker 2026-08-23 15:25 IST: close residual decorative-stainless PVD grade signal wording.
TARGETS = [
    Path('insights/pvd-stainless-steel-buyer-checklist/index.html'),
    Path('public-site/insights/pvd-stainless-steel-buyer-checklist/index.html'),
]

REPLACEMENTS = {
    '>SS 201 / 304<': '>Grade per approved application<',
    '>SS 201 / SS 304, SS 316 on request<': '>Grade per approved application / project<',
    'SS 201 / SS 304, SS 316 on request': 'Grade per approved application / project',
    '>Gold, Rose Gold, Black<': '>Colour per approved sample / project<',
    '<td data-label="Checkpoint">Anti-fingerprint coating available</td><td data-label="Reference">Anti-fingerprint coating available</td>': '<td data-label="Checkpoint">Anti-fingerprint route</td><td data-label="Reference">Only if specified and validated</td>',
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

print(f'MKT-009 decorative-stainless PVD remediation: {replaced} replacements across {changed} files.')
