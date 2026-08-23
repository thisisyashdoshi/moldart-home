#!/usr/bin/env python3
"""Regression guard for verified MKT-009 press-pad product-page / social-card claim classes."""
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "products" / "press-pads" / "index.html",
    ROOT / "public-site" / "products" / "press-pads" / "index.html",
    ROOT / "products" / "index.html",
    ROOT / "public-site" / "products" / "index.html",
    ROOT / "data" / "product-directory.json",
    ROOT / "public-site" / "data" / "product-directory.json",
    ROOT / "images" / "social" / "moldart-product-press-pads.svg",
    ROOT / "public-site" / "images" / "social" / "moldart-product-press-pads.svg",
    ROOT / "insights" / "press-plates-pads-smart-tooling-perfect-panels" / "index.html",
    ROOT / "public-site" / "insights" / "press-plates-pads-smart-tooling-perfect-panels" / "index.html",
    ROOT / "insights" / "press-pads-heat-pressure-note" / "index.html",
    ROOT / "public-site" / "insights" / "press-pads-heat-pressure-note" / "index.html",
]

UNSAFE_PATTERNS = [
    "Press Pads Supplier | Silicone-Copper Lamination Pads — Moldart",
    "Silicone-copper composite pads for heat transfer and pressure equalisation in lamination.",
    "\"summary\": \"Silicone-copper composite pads for heat transfer and pressure equalisation in lamination.\"",
    "\"Short-cycle lamination\",\n        \"High-volume pressing\",\n        \"Decorative board manufacturing\"",
    "<text x=\"70\" y=\"410\" font-family=\"Arial, sans-serif\" font-size=\"23\" fill=\"#52525b\">Silicone-copper composite pads for</text>",
    ">Short-cycle lamination<",
    ">High-volume pressing<",
    "<div class=\"article-dashboard-value\">Silicone–copper</div>",
    "<div class=\"article-signal-label\">Best fit</div><div class=\"article-signal-value\">Short-cycle lamination</div><p class=\"article-signal-note\">High-volume pressing • Decorative board manufacturing</p>",
    "Guide: Press Plates and Press Pads: Smart Tooling for Better Panel Consistency",
    "<strong>How Copper-Silicone Pads Reduce Lamination Defects</strong>",
    "<span>Copper-silicone press pads and defect reduction</span>",
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
    total = sum(c for _, _, c in hits)
    print(f"FAIL: {total} known press-pad product/application claim occurrence(s) remain across {scanned} file(s).")
    for path, pattern, count in hits:
        print(f"- {path}: {count} × {pattern}")
    sys.exit(1)

print(f"PASS: {scanned} press-pad product/social target file(s) scanned; 0 known blanket construction/application/outcome claim patterns remain.")
