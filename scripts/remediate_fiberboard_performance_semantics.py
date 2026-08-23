#!/usr/bin/env python3
"""Narrow remediation for verified MDF/HDF/fiberboard performance-semantic overclaims.

This pass does not create product limits or recommend a universal board route. It only
converts verified causal / blanket performance language to evidence-led wording. Exact
board type/class, service condition, density, swelling, internal bond, screw holding,
surface readiness, edge behaviour and conversion fit remain product/order/process
specific and must be supported by the applicable supplier / test / project evidence.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

TARGETS = [
    ROOT / "insights" / "mdf-vs-hdf-surface-readiness-guide" / "index.html",
    ROOT / "public-site" / "insights" / "mdf-vs-hdf-surface-readiness-guide" / "index.html",
    ROOT / "data" / "insights.json",
    ROOT / "public-site" / "data" / "insights.json",
]

REPLACEMENTS = [
    (
        re.compile(r"(?i)MDF and HDF need to be compared by density, swelling, internal bond, screw holding, sanding, edge finish, lamination, painting, and routing fit\."),
        "Where relevant to the intended product and process, compare supplier / test evidence for density, swelling, internal bond, screw holding, sanding, edge finish and conversion fit.",
    ),
    (
        re.compile(r"(?i)Face readiness and edge behaviour decide rework\."),
        "Face readiness and edge behaviour should be verified against the approved product, process and acceptance basis.",
    ),
    (
        re.compile(r"(?i)Each route handles load, edge, moisture, and finish differently\."),
        "Load, edge, moisture and finish requirements should be checked against the exact board type / class and service condition.",
    ),
    (
        re.compile(r"(?i)These decide conversion fit more than brochure photos\."),
        "Use supplier data / test evidence relevant to the intended conversion route when comparing these points.",
    ),
    (
        re.compile(r"(?i)Match density, swelling, screw holding, surface sanding, and edge route"),
        "Confirm the performance properties, surface readiness and edge / processing requirements relevant to the intended route",
    ),
    (
        re.compile(r"(?i)Smooth surface for painting or lamination"),
        "Surface readiness per approved conversion route",
    ),
    (
        re.compile(r"(?i)Smooth surface for painting"),
        "Surface readiness",
    ),
    (
        re.compile(r"(?i)Board route ladder: plywood -> MDF/HDF -> particleboard -> OSB, checked against strength, face, edge, moisture, and document needs\."),
        "Compare candidate board types against the approved strength, surface, edge, moisture / service-condition and document requirements.",
    ),
]


def main() -> int:
    changed_files = 0
    replacements = 0
    for path in TARGETS:
        if not path.exists():
            continue
        original = path.read_text(encoding="utf-8", errors="ignore")
        updated = original
        count = 0
        for pattern, replacement in REPLACEMENTS:
            updated, n = pattern.subn(replacement, updated)
            count += n
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed_files += 1
            replacements += count
            print(f"CHANGED {path.relative_to(ROOT)}: {count} replacement(s)")
    print(f"Fiberboard performance-semantic remediation: {changed_files} file(s) changed; {replacements} replacement(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
