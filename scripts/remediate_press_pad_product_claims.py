#!/usr/bin/env python3
"""MKT-009 remediation for verified press-pad product-page / social-card claim classes.

Exact replacements only. No product construction, application fit or performance is invented.
The authoritative press-pad source requires exact product-specific supplier/test/field evidence
before construction/application/performance claims are used in marketing.
"""
from pathlib import Path

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

REPLACEMENTS = [
    ("Press Pads Supplier | Silicone-Copper Lamination Pads — Moldart", "Press Pads Supplier | Lamination Press Pads — Moldart"),
    ("Press Pads from Moldart. Specification notes, document references, and RFQ-led supply support for Short-cycle lamination.",
     "Press Pads from Moldart. Requirement-led specification notes, document references, and RFQ support for lamination applications."),
    ("Silicone-copper composite pads for heat transfer and pressure equalisation in lamination.",
     "Press pads for lamination applications; construction and pressure/thermal response are confirmed against the exact product and press programme."),
    ("<span class=\"ui-chip\"><svg class=\"icon icon-sm\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"/></svg> Short-cycle lamination</span><span class=\"ui-chip\"><svg class=\"icon icon-sm\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"/></svg> High-volume pressing</span><span class=\"ui-chip\"><svg class=\"icon icon-sm\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"/></svg> Decorative board manufacturing</span>",
     "<span class=\"ui-chip\"><svg class=\"icon icon-sm\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"/></svg> Application-specific</span><span class=\"ui-chip\"><svg class=\"icon icon-sm\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"/></svg> Press-line review</span><span class=\"ui-chip\"><svg class=\"icon icon-sm\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 6 9 17l-5-5\"/></svg> Technical RFQ</span>"),
    ("\"summary\": \"Silicone-copper composite pads for heat transfer and pressure equalisation in lamination.\"",
     "\"summary\": \"Press pads for lamination applications; construction and process requirements are confirmed per programme.\""),
    ("\"applications\": [\n        \"Short-cycle lamination\",\n        \"High-volume pressing\",\n        \"Decorative board manufacturing\"\n      ]",
     "\"applications\": [\n        \"Lamination press applications\",\n        \"Press-line technical review\",\n        \"Programme-specific sourcing\"\n      ]"),
    ("Silicone-copper composite pads for", "Press pads for lamination applications;"),
    ("heat transfer and pressure…", "confirm construction per programme."),
    (">Short-cycle lamination<", ">Application-specific<"),
    (">High-volume pressing<", ">Press-line review<"),
    ("<div class=\"article-dashboard-value\">Silicone–copper</div>", "<div class=\"article-dashboard-value\">Per approved product</div>"),
    ("<div class=\"article-signal-label\">Best fit</div><div class=\"article-signal-value\">Short-cycle lamination</div><p class=\"article-signal-note\">High-volume pressing • Decorative board manufacturing</p>",
     "<div class=\"article-signal-label\">Application review</div><div class=\"article-signal-value\">Verify exact press application</div><p class=\"article-signal-note\">Confirm fit from exact product data and line conditions.</p>"),
    ("Guide: Press Plates and Press Pads: Smart Tooling for Better Panel Consistency", "Guide: Press Plates and Press Pads: Reviewing the Lamination Stack"),
    ("<strong>How Copper-Silicone Pads Reduce Lamination Defects</strong>", "<strong>Press pads: technical review considerations</strong>"),
    ("<span>Copper-silicone press pads and defect reduction</span>", "<span>Press-pad construction and lamination review</span>"),
]

changed_files = 0
changed_occurrences = 0
for path in TARGETS:
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    original = text
    for old, new in REPLACEMENTS:
        count = text.count(old)
        if count:
            text = text.replace(old, new)
            changed_occurrences += count
    if text != original:
        path.write_text(text, encoding="utf-8")
        changed_files += 1
        print(f"remediated {path.relative_to(ROOT)}")

print(f"MKT-009 press-pad product remediation: {changed_occurrences} occurrence(s) across {changed_files} file(s)")
