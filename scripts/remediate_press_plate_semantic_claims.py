#!/usr/bin/env python3
# MKT-009 execution marker: semantic remediation activated for the verified 8-occurrence gate on 2026-08-23.
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "data" / "insights.json",
    ROOT / "public-site" / "data" / "insights.json",
]

REPLACEMENTS = {
    "A practical guide to how press plate grade, hardness, chrome condition, and handling shape the finished panel surface.":
        "A practical guide to how press-plate specification, surface condition, handling, and press context should be reviewed together.",
    "Gloss level, texture fidelity, repeat consistency, and wear marks all move together when the plate condition is not being controlled.":
        "Gloss, texture fidelity, repeat consistency, and wear marks should be reviewed together with plate condition and press context rather than attributed to one factor alone.",
    "**Hardness and chrome condition** — these influence wear resistance and how long the approved finish route stays repeatable.":
        "**Grade / condition and any coating requirement** — verify these against the approved order, material/coating evidence, and agreed test method before using them in wear or replacement decisions.",
    "tooling whose value depends on finish output, cycle life, and stability inside the actual press route.":
        "tooling whose value depends on the approved finish output, verified condition, and fit with the actual press route.",
}

changed_files = 0
changed_occurrences = 0

for path in TARGETS:
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    original = text
    for old, new in REPLACEMENTS.items():
        count = text.count(old)
        if count:
            text = text.replace(old, new)
            changed_occurrences += count
    if text != original:
        path.write_text(text, encoding="utf-8")
        changed_files += 1
        print(f"remediated {path.relative_to(ROOT)}")

print(f"MKT-009 semantic remediation: {changed_occurrences} occurrence(s) across {changed_files} file(s)")
