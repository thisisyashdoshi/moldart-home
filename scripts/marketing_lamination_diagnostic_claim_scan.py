#!/usr/bin/env python3
"""Regression guard for verified MKT-009 lamination diagnostic/press-pad claim classes."""
from pathlib import Path
import sys

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

TARGETS = [ROOT / "data" / "insights.json", ROOT / "public-site" / "data" / "insights.json"]
for slug in SLUGS:
    TARGETS.extend([
        ROOT / "insights" / slug / "index.html",
        ROOT / "public-site" / "insights" / slug / "index.html",
    ])

UNSAFE_PATTERNS = [
    # Shared causal boilerplate.
    "<th scope=\"col\">Likely cause</th>",
    "data-label=\"Likely cause\"",
    "Contamination, chrome wear, paper/resin issue, or local pressure loss",
    "Chrome wear, pad ageing, heat/pressure drift, or reference loss",
    "Stack imbalance or surface damage",
    "Hold line release until cause is separated",
    "Hold affected production lot",

    # Press-pad unsupported absolute/construction/lifetime wording.
    "Silicone + copper route",
    "silicone-copper composite construction",
    "Approx. 80k–100k",
    "80,000–100,000 cycles",
    "80,000 to 100,000 cycles",
    "Engineered for approx. 80",
    ">3300 mm<",
    "Used to support even heat and pressure distribution",
    "Used to support heat spreading and pressure equalisation.",
    "<div class=\"article-dashboard-label\">Watch first</div>",
    "Dead zones",
    "Width-wise defects often point back to pad ageing or collapse.",
    "expected life is usually discussed in a broad range of roughly 80,000 to 100,000 cycles",
    "A running line usually gives early warnings before a pad fails completely.",
    "Typical warning signs include:",
    "any change in press conditions that could shorten pad life",
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
    print(f"FAIL: {total} known lamination diagnostic / press-pad claim occurrence(s) remain across {scanned} file(s).")
    for path, pattern, count in hits:
        print(f"- {path}: {count} × {pattern}")
    sys.exit(1)

print(f"PASS: {scanned} lamination/press-pad target file(s) scanned; 0 known diagnostic or unsupported press-pad claim patterns remain.")
