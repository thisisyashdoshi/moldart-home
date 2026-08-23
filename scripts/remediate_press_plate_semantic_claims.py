#!/usr/bin/env python3
# MKT-009 semantic remediation: data-layer claims plus article causation/priority/metadata claims.
# Execution marker 2026-08-23b: close fifth-pass residual title/FAQ/share-card semantic claims.
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [
    ROOT / "data" / "insights.json",
    ROOT / "public-site" / "data" / "insights.json",
    ROOT / "insights" / "press-plate-chrome-condition-guide" / "index.html",
    ROOT / "public-site" / "insights" / "press-plate-chrome-condition-guide" / "index.html",
    ROOT / "insights" / "press-plates-pads-smart-tooling-perfect-panels" / "index.html",
    ROOT / "public-site" / "insights" / "press-plates-pads-smart-tooling-perfect-panels" / "index.html",
]

REPLACEMENTS = {
    # Data-layer semantic claims already verified in the fourth pass.
    "A practical guide to how press plate grade, hardness, chrome condition, and handling shape the finished panel surface.":
        "A practical guide to how press-plate specification, surface condition, handling, and press context should be reviewed together.",
    "Gloss level, texture fidelity, repeat consistency, and wear marks all move together when the plate condition is not being controlled.":
        "Gloss, texture fidelity, repeat consistency, and wear marks should be reviewed together with plate condition and press context rather than attributed to one factor alone.",
    "**Hardness and chrome condition** — these influence wear resistance and how long the approved finish route stays repeatable.":
        "**Grade / condition and any coating requirement** — verify these against the approved order, material/coating evidence, and agreed test method before using them in wear or replacement decisions.",
    "tooling whose value depends on finish output, cycle life, and stability inside the actual press route.":
        "tooling whose value depends on the approved finish output, verified condition, and fit with the actual press route.",

    # Chrome-condition article: remove unsupported causal ordering / early-warning hierarchy.
    "Press Plate Chrome Condition: Why Surface Wear Changes Panel Output":
        "Press Plate Chrome Condition: How to Review Surface Wear and Panel Output",
    "Press Plate Chrome Condition: Why Surface Wear Changes Panel...":
        "Press Plate Chrome Condition: Review Surface Wear and Panel...",
    "Press%20Plate%20Chrome%20Condition%3A%20Why%20Surface%20Wear%20Changes%20Panel%20Output":
        "Press%20Plate%20Chrome%20Condition%3A%20How%20to%20Review%20Surface%20Wear%20and%20Panel%20Output",
    "Treat it as the surface that protects finish retention, not as cosmetic language.":
        "Where a coated plate is specified, verify coating condition against the approved order and inspection basis.",
    "A stable route often starts signalling change here before one obvious failure appears.":
        "Track gloss only where it is part of the approved finish or inspection basis; do not use it as a universal early-failure signal.",
    "<div class=\"article-dashboard-label\">Watch first</div>":
        "<div class=\"article-dashboard-label\">If specified</div>",
    "Casual storage and rushed cleaning can damage the route earlier than expected.":
        "Record storage and cleaning history when investigating visible, release, or finish changes.",
    "What usually exposes chrome deterioration first":
        "What to review when coating condition is questioned",
    "Illustrative weighting for how finish-sensitive lines tend to notice working-face change.":
        "Diagnostic checklist only; sequence and significance depend on the exact product, coating, press conditions, and approved inspection basis.",
    "<text x=\"302\" y=\"63\" class=\"chart-value\">Earliest signal</text>":
        "<text x=\"302\" y=\"63\" class=\"chart-value\">If specified</text>",
    "<text x=\"302\" y=\"141\" class=\"chart-value\">High</text>":
        "<text x=\"302\" y=\"141\" class=\"chart-value\">Review</text>",
    "<text x=\"302\" y=\"219\" class=\"chart-value\">Obvious but late</text>":
        "<text x=\"302\" y=\"219\" class=\"chart-value\">Visual check</text>",
    "<text x=\"302\" y=\"297\" class=\"chart-value\">Often secondary</text>":
        "<text x=\"302\" y=\"297\" class=\"chart-value\">Review together</text>",
    "The approved panel begins to look slightly off before the team wants to admit the plate has moved.":
        "Compare the panel against the approved reference and inspect the plate or coating using the agreed method before assigning cause.",
    "The route may start feeling less predictable even when grade language is unchanged.":
        "If release behaviour changes, review plate or coating condition and the wider press stack before assigning cause.",
    "Once they are easy to see, the finish route is already under pressure.":
        "Visible scratches or dents should be documented and dispositioned against the approved defect and inspection basis.",
    "Those checks still matter, but the plate should be reviewed before the discussion narrows too far.":
        "Review paper, resin, plate, coating, and wider stack evidence together; no universal diagnostic priority is assumed.",
    "What is the first warning that chrome condition is moving?":
        "What should be reviewed when coating condition is questioned?",
    "Usually a slower drift rather than one dramatic failure: gloss variation, weaker release, or a finish that no longer matches the approved panel as cleanly as before.":
        "Compare the approved panel or finish reference with current output, then review plate/coating condition and the wider press stack using the agreed inspection basis before assigning cause.",
    "When should the plate be inspected against the working face, not only the grade?":
        "What should be checked when finish or release behaviour changes?",
    "Inspect earlier when the route becomes visually sensitive or when repeated finish change appears without staying tied to one paper or resin batch.":
        "Review the approved finish reference, working-face condition, coating where applicable, paper/resin evidence, and press conditions together before assigning cause.",
    "Stops the route from drifting until the defect becomes expensive.":
        "Keeps follow-up timing documented rather than ad hoc.",

    # Plate + pad article: remove blanket grade bias, outcome guarantees, and unsupported root-cause weighting.
    "Press Plates and Press Pads: Smart Tooling for Better Panel Consistency":
        "Press Plates and Press Pads: Reviewing the Lamination Stack",
    "Press Plates and Press Pads: Smart Tooling for Better Panel...":
        "Press Plates and Press Pads: Reviewing the Lamination Stack",
    "Press%20Plates%20and%20Press%20Pads%3A%20Smart%20Tooling%20for%20Better%20Panel%20Consistency":
        "Press%20Plates%20and%20Press%20Pads%3A%20Reviewing%20the%20Lamination%20Stack",
    "400 / 600-series bias":
        "Grade per approved application",
    "The article focuses on harder tooling routes rather than broad stainless substitution.":
        "Grade and condition selection remain application- and order-specific; do not substitute by material family alone.",
    "A controlled working band matters more than decorative chrome language.":
        "Where coating is specified, define and verify coating criteria against the approved order and agreed test method.",
    "Used to stabilise pressure and thermal spread across the stack.":
        "Verify pad construction and relevant pressure/thermal response against the exact product and press application.",
    "Lower repeat defects":
        "Controlled evaluation",
    "The goal is a more predictable press, not just a better brochure.":
        "The goal is an evidence-based review of the stack against the approved process and inspection basis.",
    "Where chronic panel defects usually begin":
        "Stack elements to review when panel defects appear",
    "Illustrative weighting for first-pass diagnostics based on the research note and press-stack logic.":
        "Diagnostic checklist only; no universal weighting or root-cause priority is implied.",
    "<text x=\"302\" y=\"63\" class=\"chart-value\">Primary</text>":
        "<text x=\"302\" y=\"63\" class=\"chart-value\">Review</text>",
    "<text x=\"302\" y=\"141\" class=\"chart-value\">Primary</text>":
        "<text x=\"302\" y=\"141\" class=\"chart-value\">Review</text>",
    "<text x=\"302\" y=\"219\" class=\"chart-value\">High</text>":
        "<text x=\"302\" y=\"219\" class=\"chart-value\">Review</text>",
    "<text x=\"302\" y=\"297\" class=\"chart-value\">Secondary</text>":
        "<text x=\"302\" y=\"297\" class=\"chart-value\">Review</text>",
    "Finish drift often starts with the working surface itself.":
        "Inspect the approved plate surface and geometry against the documented criteria before assigning cause.",
    "Shows up as cloudy areas, pressure drift, and width-wise inconsistency.":
        "Inspect pad condition and the relevant pressure or thermal evidence under the actual line conditions before assigning cause.",
    "Wear, micro-cracking, or roughness drift can change release and gloss.":
        "Where a coated plate is specified, inspect coating condition against the approved coating and measurement criteria.",
    "Important, but often blamed too early when the stack is unstable.":
        "Review paper and resin evidence alongside the rest of the stack; do not assign universal diagnostic priority to one layer.",
    "Protects the working surface over repeated cycles.":
        "Keeps coating-related acceptance tied to documented inspection evidence and the approved coating requirement.",
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
