#!/usr/bin/env python3
"""Narrow MKT-009 remediation for verified lamination diagnostic and press-pad claim classes.

This script deliberately uses exact replacements only. It does not invent acceptance values.
It converts causal/absolute marketing wording into requirement-led review language.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SLUGS = [
    "press-pads-heat-pressure-note",
    "press-pads-quality-replacement-checks",
    "press-pad-failure-symptoms-lamination-lines",
    "press-plates-panel-quality-guide",
    "press-plate-defect-troubleshooting-guide",
    "press-plates-replacement-programme-guide",
    "press-plate-chrome-condition-guide",
    "press-plates-pads-smart-tooling-perfect-panels",
    "lamination-stack-control-plate-pad-paper-substrate-press-cycle",
]

HTML_TARGETS = []
for slug in SLUGS:
    HTML_TARGETS.extend([
        ROOT / "insights" / slug / "index.html",
        ROOT / "public-site" / "insights" / slug / "index.html",
    ])

DATA_TARGETS = [
    ROOT / "data" / "insights.json",
    ROOT / "public-site" / "data" / "insights.json",
]

# Shared generated defect-map boilerplate: review evidence; do not assign universal root cause.
HTML_REPLACEMENTS = [
    ("<th scope=\"col\">Likely cause</th>", "<th scope=\"col\">Factors to review</th>"),
    ("data-label=\"Likely cause\"", "data-label=\"Factors to review\""),
    ("Contamination, chrome wear, paper/resin issue, or local pressure loss",
     "Review contamination, working-surface condition, paper/resin evidence, and local pressure/stack evidence before assigning cause."),
    ("Chrome wear, pad ageing, heat/pressure drift, or reference loss",
     "Review the approved surface reference, plate/coating condition where applicable, pad condition, and heat/pressure evidence before assigning cause."),
    ("Stack imbalance or surface damage",
     "Review working-surface condition, pad/stack condition, substrate moisture, and press settings against the approved process basis."),
    ("Hold line release until cause is separated",
     "Apply the approved hold/disposition rule until the issue is reviewed against the agreed inspection/process basis."),
    ("Hold affected production lot",
     "Apply the approved hold/disposition rule to affected production where the agreed process requires it."),

    # Press-pad absolute/construction/lifetime/diagnostic wording found on current branch pages.
    ("Engineered for approx. 80,000–100,000 cycles", "Per product-specific supplier data and field conditions"),
    ("Engineered for approx. 80", "Service-life basis"),
    ("Used to support even heat and pressure distribution", "Verify against exact product / application data"),
    ("Used to support even", "Pressure / thermal response"),
    ("Silicone-copper composite construction", "Pad construction"),
    ("Silicone + copper route", "Per approved product"),
    ("Used to support heat spreading and pressure equalisation.",
     "Verify construction and pressure/thermal response against exact product data and the press application."),
    ("Approx. 80k–100k", "Product / field specific"),
    ("Plant conditions still determine the practical replacement rhythm.",
     "Use product-specific supplier data, test conditions, and field evidence; no universal cycle-life promise is implied."),
    ("<div class=\"article-dashboard-label\">Watch first</div>",
     "<div class=\"article-dashboard-label\">Review evidence</div>"),
    ("Dead zones", "Width-wise variation"),
    ("Width-wise defects often point back to pad ageing or collapse.",
     "Review pad condition together with plate, process, and wider-stack evidence before assigning cause."),
    (">3300 mm<", ">Per approved size / configuration<"),
]

DATA_REPLACEMENTS = [
    ("silicone-copper composite construction is part of the route",
     "pad construction must be verified against the exact approved product data"),
    ("the pad supports uniform heat transfer and pressure equalisation",
     "pressure/thermal response must be validated against exact product data and press conditions where relevant"),
    ("expected life is usually discussed in a broad range of roughly 80,000 to 100,000 cycles",
     "service-life or replacement basis must come from exact supplier data, test conditions, and/or field evidence; no universal cycle count is implied"),
    ("The pad is not the visible decorative layer, but it directly affects the surface that leaves the press.",
     "The pad is part of the working press stack, so its condition should be reviewed alongside the plate, substrate, paper/resin, and press settings when panel output changes."),
    ("When this layer performs badly, the line can start showing:",
     "When reviewing suspected pad-related issues, document:"),
    ("faster wear on surrounding tooling", "condition changes in surrounding tooling"),
    ("Heat transfer and pressure balance are usually stack issues, not brochure issues.",
     "Heat/pressure observations should be reviewed at stack level and against the exact product and press evidence."),
    ("By the time the line starts showing surface inconsistency, the pad may already be affecting heat transfer, pressure balance, and wear behaviour.",
     "When the line shows surface inconsistency, review pad condition together with plate, substrate, paper/resin, and press evidence before assigning cause."),
    ("A running line usually gives early warnings before a pad fails completely.",
     "Running-line changes should be treated as observations to investigate, not as universal early-warning signals."),
    ("Typical warning signs include:", "Observations worth documenting include:"),
    ("any change in press conditions that could shorten pad life",
     "any change in press conditions relevant to the approved replacement basis"),
]

changed_files = 0
changed_occurrences = 0

for path in HTML_TARGETS:
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    original = text
    for old, new in HTML_REPLACEMENTS:
        count = text.count(old)
        if count:
            text = text.replace(old, new)
            changed_occurrences += count
    if text != original:
        path.write_text(text, encoding="utf-8")
        changed_files += 1
        print(f"remediated {path.relative_to(ROOT)}")

for path in DATA_TARGETS:
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    original = text
    for old, new in DATA_REPLACEMENTS:
        count = text.count(old)
        if count:
            text = text.replace(old, new)
            changed_occurrences += count
    if text != original:
        path.write_text(text, encoding="utf-8")
        changed_files += 1
        print(f"remediated {path.relative_to(ROOT)}")

print(f"MKT-009 lamination diagnostic remediation: {changed_occurrences} occurrence(s) across {changed_files} file(s)")
