#!/usr/bin/env python3
"""Fail CI if verified unsafe ready-made-furniture claim patterns remain/reappear.

This is a narrow MKT-009 regression guard. It does not replace Supply & Procurement
technical validation. It covers verified public claim classes rejected by the current
Moldart product-specification register: universal >3 N scratch resistance, CNC ±0.1 mm,
0.4–2.0 mm edge-band thickness, one >300-cycle abrasion value across mixed surface systems,
and an unqualified "best fit" presentation of modular kitchens without service-environment
qualification. Exact surface product, substrate, laminate, adhesive, edge system, drawing,
process capability and service environment remain product/order specific.
Verification marker: 2026-08-23 service-environment/application-fit audit.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXACT = [
    ROOT / "products" / "ready-made-furniture" / "index.html",
    ROOT / "public-site" / "products" / "ready-made-furniture" / "index.html",
    ROOT / "insights" / "ready-made-furniture-procurement-guide" / "index.html",
    ROOT / "public-site" / "insights" / "ready-made-furniture-procurement-guide" / "index.html",
]
GLOB_ROOTS = [
    ROOT / "images" / "insights",
    ROOT / "public-site" / "images" / "insights",
]

RULES = [
    ("UNIVERSAL_FURNITURE_SCRATCH_3N", re.compile(r"(?i)(?:above|>)\s*3\s*N\b")),
    ("UNIVERSAL_FURNITURE_CNC_TOLERANCE", re.compile(r"(?i)(?:approx\.?\s*)?[±+/-]+\s*0\.1\s*mm\b")),
    ("UNIVERSAL_FURNITURE_EDGE_BAND_RANGE", re.compile(r"(?i)\b0\.4\s*[-–—]\s*2\.0\s*mm\b")),
    ("UNIVERSAL_FURNITURE_ABRASION_CYCLES", re.compile(r"(?i)(?:above|>|minimum|min\.?|≥)\s*300\s*cycles\b")),
    (
        "UNQUALIFIED_MODULAR_KITCHEN_BEST_FIT",
        re.compile(
            r"(?is)(?:Best\s*fit|Best-fit\s*route)</div>\s*"
            r"<div[^>]*>Office\s+workstations</div>\s*"
            r"<p[^>]*>Modular\s+kitchens\s*[•·]\s*Wardrobe\s+systems</p>"
        ),
    ),
]


def targets() -> list[Path]:
    files = [p for p in EXACT if p.exists()]
    for root in GLOB_ROOTS:
        if root.exists():
            files.extend(sorted(root.glob("ready-made-furniture-*.svg")))
    return sorted(set(files))


def main() -> int:
    failures: list[tuple[str, str, str]] = []
    files = targets()
    for path in files:
        text = path.read_text(encoding="utf-8", errors="ignore")
        for rule_id, pattern in RULES:
            for match in pattern.finditer(text):
                start = max(0, match.start() - 90)
                end = min(len(text), match.end() + 90)
                snippet = " ".join(text[start:end].split())[:320]
                failures.append((path.relative_to(ROOT).as_posix(), rule_id, snippet))
    print(f"Ready-made furniture marketing claim scan: {len(files)} file(s) scanned.")
    if failures:
        print(f"FAIL: {len(failures)} unsafe claim occurrence(s) found.")
        for path, rule_id, snippet in failures:
            print(f"- {path} [{rule_id}] {snippet}")
        return 1
    print("PASS: no known universal ready-made furniture scratch/CNC/edge/abrasion or unqualified modular-kitchen best-fit patterns found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
