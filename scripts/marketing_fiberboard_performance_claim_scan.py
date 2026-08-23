#!/usr/bin/env python3
"""Fail CI if verified MDF/HDF/fiberboard performance-semantic overclaims remain.

This narrow MKT-009 guard targets only verified causal / blanket wording found in the
MDF-vs-HDF buyer guide and mirrored data. It does not reject legitimate requirement-
capture language. Exact board type/class, service condition and performance evidence
remain product/order/process specific.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

TARGETS = [
    ROOT / "insights" / "mdf-vs-hdf-surface-readiness-guide" / "index.html",
    ROOT / "public-site" / "insights" / "mdf-vs-hdf-surface-readiness-guide" / "index.html",
    ROOT / "data" / "insights.json",
    ROOT / "public-site" / "data" / "insights.json",
]

RULES = [
    ("BLANKET_MDF_HDF_COMPARE_LIST", re.compile(r"(?i)MDF and HDF need to be compared by density, swelling, internal bond, screw holding, sanding, edge finish, lamination, painting, and routing fit\.")),
    ("CAUSAL_REWORK_CLAIM", re.compile(r"(?i)Face readiness and edge behaviour decide rework\.")),
    ("BLANKET_ROUTE_BEHAVIOUR_CLAIM", re.compile(r"(?i)Each route handles load, edge, moisture, and finish differently\.")),
    ("CAUSAL_CONVERSION_FIT_CLAIM", re.compile(r"(?i)These decide conversion fit more than brochure photos\.")),
    ("BLANKET_MATCH_PERFORMANCE_ROUTE", re.compile(r"(?i)Match density, swelling, screw holding, surface sanding, and edge route")),
    ("UNQUALIFIED_SMOOTH_SURFACE_APPLICATION", re.compile(r"(?i)Smooth surface for painting(?: or lamination)?")),
    ("BOARD_ROUTE_LADDER", re.compile(r"(?i)Board route ladder: plywood -> MDF/HDF -> particleboard -> OSB, checked against strength, face, edge, moisture, and document needs\.")),
]


def main() -> int:
    failures = []
    scanned = 0
    for path in TARGETS:
        if not path.exists():
            continue
        scanned += 1
        text = path.read_text(encoding="utf-8", errors="ignore")
        for rule_id, pattern in RULES:
            for match in pattern.finditer(text):
                start = max(0, match.start() - 100)
                end = min(len(text), match.end() + 100)
                snippet = " ".join(text[start:end].split())[:340]
                failures.append((path.relative_to(ROOT).as_posix(), rule_id, snippet))
    print(f"Fiberboard performance-semantic scan: {scanned} file(s) scanned.")
    if failures:
        print(f"FAIL: {len(failures)} unsafe semantic occurrence(s) found.")
        for path, rule_id, snippet in failures:
            print(f"- {path} [{rule_id}] {snippet}")
        return 1
    print("PASS: no known verified fiberboard causal / blanket performance-semantic patterns found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
