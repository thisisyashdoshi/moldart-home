#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "data" / "insights.json",
    ROOT / "public-site" / "data" / "insights.json",
    ROOT / "insights" / "press-plate-chrome-condition-guide" / "index.html",
    ROOT / "public-site" / "insights" / "press-plate-chrome-condition-guide" / "index.html",
    ROOT / "insights" / "press-plates-pads-smart-tooling-perfect-panels" / "index.html",
    ROOT / "public-site" / "insights" / "press-plates-pads-smart-tooling-perfect-panels" / "index.html",
]

UNSAFE_PATTERNS = [
    # Data-layer semantic patterns.
    "A practical guide to how press plate grade, hardness, chrome condition, and handling shape the finished panel surface.",
    "Gloss level, texture fidelity, repeat consistency, and wear marks all move together when the plate condition is not being controlled.",
    "**Hardness and chrome condition** — these influence wear resistance and how long the approved finish route stays repeatable.",
    "tooling whose value depends on finish output, cycle life, and stability inside the actual press route.",

    # Chrome-condition article unsupported causal ordering / early-warning hierarchy / stale metadata.
    "Press Plate Chrome Condition: Why Surface Wear Changes Panel Output",
    "Press Plate Chrome Condition: Why Surface Wear Changes Panel...",
    "Press%20Plate%20Chrome%20Condition%3A%20Why%20Surface%20Wear%20Changes%20Panel%20Output",
    "Treat it as the surface that protects finish retention, not as cosmetic language.",
    "A stable route often starts signalling change here before one obvious failure appears.",
    "<div class=\"article-dashboard-label\">Watch first</div>",
    "Casual storage and rushed cleaning can damage the route earlier than expected.",
    "What usually exposes chrome deterioration first",
    "Illustrative weighting for how finish-sensitive lines tend to notice working-face change.",
    "Earliest signal",
    "Obvious but late",
    "Often secondary",
    "The approved panel begins to look slightly off before the team wants to admit the plate has moved.",
    "The route may start feeling less predictable even when grade language is unchanged.",
    "Once they are easy to see, the finish route is already under pressure.",
    "Those checks still matter, but the plate should be reviewed before the discussion narrows too far.",
    "What is the first warning that chrome condition is moving?",
    "Usually a slower drift rather than one dramatic failure: gloss variation, weaker release, or a finish that no longer matches the approved panel as cleanly as before.",
    "When should the plate be inspected against the working face, not only the grade?",
    "Inspect earlier when the route becomes visually sensitive or when repeated finish change appears without staying tied to one paper or resin batch.",
    "Stops the route from drifting until the defect becomes expensive.",

    # Plate + pad article unsupported grade bias, guaranteed outcome, root-cause weighting, stale metadata.
    "Press Plates and Press Pads: Smart Tooling for Better Panel Consistency",
    "Press Plates and Press Pads: Smart Tooling for Better Panel...",
    "Press%20Plates%20and%20Press%20Pads%3A%20Smart%20Tooling%20for%20Better%20Panel%20Consistency",
    "400 / 600-series bias",
    "The article focuses on harder tooling routes rather than broad stainless substitution.",
    "A controlled working band matters more than decorative chrome language.",
    "Used to stabilise pressure and thermal spread across the stack.",
    "Lower repeat defects",
    "The goal is a more predictable press, not just a better brochure.",
    "Where chronic panel defects usually begin",
    "Illustrative weighting for first-pass diagnostics based on the research note and press-stack logic.",
    "Finish drift often starts with the working surface itself.",
    "Shows up as cloudy areas, pressure drift, and width-wise inconsistency.",
    "Wear, micro-cracking, or roughness drift can change release and gloss.",
    "Important, but often blamed too early when the stack is unstable.",
    "Protects the working surface over repeated cycles.",
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

print(f"PASS: {scanned} press-plate/data file(s) scanned; 0 known MKT-009 semantic claim patterns remain.")
