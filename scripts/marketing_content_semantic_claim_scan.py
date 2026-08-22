#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "data" / "insights.json",
    ROOT / "public-site" / "data" / "insights.json",
]

UNSAFE_PATTERNS = [
    "A practical guide to how press plate grade, hardness, chrome condition, and handling shape the finished panel surface.",
    "Gloss level, texture fidelity, repeat consistency, and wear marks all move together when the plate condition is not being controlled.",
    "**Hardness and chrome condition** — these influence wear resistance and how long the approved finish route stays repeatable.",
    "tooling whose value depends on finish output, cycle life, and stability inside the actual press route.",
]

hits = []
scanned = 0
for path in TARGETS:
    if not path.exists():
        continue
    scanned += 1
    text = path.read_text(encoding="utf-8")
    for pattern in UNSAFE_PATTERNS:
        count = text.count(pattern)
        if count:
            hits.append((path.relative_to(ROOT), pattern, count))

if hits:
    total = sum(count for _, _, count in hits)
    print(f"FAIL: {total} known press-plate semantic claim occurrence(s) remain across {scanned} file(s).")
    for path, pattern, count in hits:
        print(f"- {path}: {count} × {pattern}")
    sys.exit(1)

print(f"PASS: {scanned} press-plate data file(s) scanned; 0 known MKT-009 semantic claim patterns remain.")
