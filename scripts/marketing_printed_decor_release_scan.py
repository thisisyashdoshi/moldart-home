#!/usr/bin/env python3
from pathlib import Path
import re, sys

TARGETS = [
    Path('images/insights/printed-decor-paper-selection-guide.svg'),
    Path('public-site/images/insights/printed-decor-paper-selection-guide.svg'),
]

PATTERNS = {
    'universal_gsm_range': re.compile(r'\b60\s*(?:[-–—]|to)\s*85\s*g(?:sm|/m(?:2|²))\b', re.I),
    'universal_wet_strength_6n': re.compile(r'(?:above\s*6\s*n\b|>\s*6\s*n\b|wet\s*(?:strength|tensile)[^\n<]{0,40}\b6\s*n\b)', re.I),
}

errors = []
for path in TARGETS:
    if not path.exists():
        errors.append(f'{path}: missing target')
        continue
    text = path.read_text(encoding='utf-8', errors='ignore')
    for name, pattern in PATTERNS.items():
        for match in pattern.finditer(text):
            snippet = re.sub(r'\s+', ' ', text[max(0, match.start()-60):match.end()+60]).strip()
            errors.append(f'{path}: {name}: {snippet}')

if errors:
    print('Printed décor paper release safety: FAIL')
    print('\n'.join(errors))
    sys.exit(1)

print(f'Printed décor paper release safety: PASS — {len(TARGETS)} files scanned, 0 known universal GSM/wet-strength patterns')
