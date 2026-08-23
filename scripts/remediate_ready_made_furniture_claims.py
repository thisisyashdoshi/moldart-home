#!/usr/bin/env python3
"""Narrow remediation for verified ready-made furniture claim patterns.

Authoritative Moldart product-specification control rejects universal ready-made furniture
claims for scratch resistance >3 N, CNC ±0.1 mm, generic 0.4–2.0 mm edging and
one abrasion-cycle value across MFC/HPL systems. It also does not support presenting
modular kitchens as a blanket "best fit" route because higher-moisture/special-service
applications require the exact substrate, surface/laminate, adhesive and edge system to be
qualified for the service environment. Exact surface product, test method, drawing/process
capability, edge specification and service environment remain order/product specific.

Scope is deliberately limited to ready-made-furniture product/Insight source + public mirrors.
Execution marker: 2026-08-23 service-environment/application-fit remediation.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

EXACT = [
    ROOT / "products" / "ready-made-furniture" / "index.html",
    ROOT / "public-site" / "products" / "ready-made-furniture" / "index.html",
    ROOT / "insights" / "ready-made-furniture-procurement-guide" / "index.html",
    ROOT / "public-site" / "insights" / "ready-made-furniture-procurement-guide" / "index.html",
]
GLOBS = [
    ROOT / "images" / "insights",
    ROOT / "public-site" / "images" / "insights",
]

REPLACEMENTS = [
    (re.compile(r"(?i)\babove\s*3\s*N\b"), "per approved surface product / test method"),
    (re.compile(r"(?i)>\s*3\s*N\b"), "per approved surface product / test method"),
    (re.compile(r"(?i)\bapprox\.?\s*[±+/-]+\s*0\.1\s*mm\b"), "per approved drawing / process capability"),
    (re.compile(r"(?i)[±+/-]+\s*0\.1\s*mm\b"), "per approved drawing / process capability"),
    (re.compile(r"(?i)\b0\.4\s*[-–—]\s*2\.0\s*mm\b"), "per approved edge design / product"),
    (re.compile(r"(?i)(?:above|>|minimum|min\.?|≥)\s*300\s*cycles\b"), "per approved surface product / class / test method"),
    (
        re.compile(
            r'(?is)<div class="article-signal-label">Best fit</div><div class="article-signal-value">Office workstations</div><p class="article-signal-note">Modular kitchens\s*[•·]\s*Wardrobe systems</p>'
        ),
        '<div class="article-signal-label">Example interior routes</div><div class="article-signal-value">Office workstations • Wardrobe systems</div><p class="article-signal-note">Modular kitchens require the approved substrate / surface / edge / adhesive system to be qualified for the service environment.</p>',
    ),
    (
        re.compile(
            r'(?is)<div class="article-dashboard-label">Best-fit route</div><div class="article-dashboard-value">Office workstations</div><p class="article-dashboard-note">Modular kitchens\s*[•·]\s*Wardrobe systems</p>'
        ),
        '<div class="article-dashboard-label">Application route</div><div class="article-dashboard-value">Office workstations • Wardrobe systems</div><p class="article-dashboard-note">Modular kitchens require service-environment qualification of the substrate / surface / edge / adhesive system.</p>',
    ),
]


def targets() -> list[Path]:
    files = [p for p in EXACT if p.exists()]
    for root in GLOBS:
        if root.exists():
            files.extend(sorted(root.glob("ready-made-furniture-*.svg")))
    return sorted(set(files))


def main() -> int:
    changed_files = 0
    replacements = 0
    for path in targets():
        original = path.read_text(encoding="utf-8", errors="ignore")
        updated = original
        count_for_file = 0
        for pattern, replacement in REPLACEMENTS:
            updated, n = pattern.subn(replacement, updated)
            count_for_file += n
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed_files += 1
            replacements += count_for_file
            print(f"CHANGED {path.relative_to(ROOT)}: {count_for_file} replacement(s)")
    print(f"Ready-made furniture remediation: {changed_files} file(s) changed; {replacements} replacement(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
