#!/usr/bin/env python3
"""Fail CI if verified unsafe MDF/HDF/fiberboard claim patterns remain or reappear.

Narrow MKT-009 regression guard. The authoritative Moldart product-specification
register rejects a universal combined MDF/HDF 720–1,000 kg/m³ acceptance range and
the prior 2–25 mm thickness range. Exact EN 622-5 product type/class, supplier grade,
density, thickness, emissions and surface/performance requirements remain product,
destination and order specific.

The emissions/compliance lane is also guarded against treating E1, buyer-used "E0",
CARB and TSCA Title VI as interchangeable "emission grades". EPA treats TSCA Title VI
as the U.S. compliance/certification route for covered composite wood products, while
E1 is an EN 13986 emission class and other labels/schemes must be tied to the actual
destination, test method and evidence. This guard does not replace Supply & Procurement
technical or regulatory validation.
Post-remediation verification marker: 2026-08-23.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

EXACT = [
    ROOT / "products" / "fiberboard" / "index.html",
    ROOT / "public-site" / "products" / "fiberboard" / "index.html",
    ROOT / "insights" / "mdf-vs-hdf-surface-readiness-guide" / "index.html",
    ROOT / "public-site" / "insights" / "mdf-vs-hdf-surface-readiness-guide" / "index.html",
    ROOT / "insights" / "mdf-hdf-emission-grades-e1-e0-carb-tsca-title-vi" / "index.html",
    ROOT / "public-site" / "insights" / "mdf-hdf-emission-grades-e1-e0-carb-tsca-title-vi" / "index.html",
    ROOT / "images" / "social" / "moldart-product-fiberboard.svg",
    ROOT / "public-site" / "images" / "social" / "moldart-product-fiberboard.svg",
]

GLOB_ROOTS = [
    ROOT / "images" / "insights",
    ROOT / "public-site" / "images" / "insights",
]

RULES = [
    ("COMBINED_MDF_HDF_DENSITY_SIGNAL", re.compile(r"(?i)\bcombined\s+density(?:\s*\.\.\.|\s*…)?")),
    (
        "UNIVERSAL_MDF_HDF_DENSITY_RANGE",
        re.compile(r"(?i)\b720\s*(?:[-–—]|to)\s*1\s*[, ]?\s*000\s*kg\s*/?\s*m(?:3|³)\b"),
    ),
    (
        "UNIVERSAL_FIBERBOARD_THICKNESS_RANGE",
        re.compile(r"(?i)\b2\s*(?:[-–—]|to)\s*25\s*mm\b"),
    ),
    (
        "INTERCHANGEABLE_EMISSION_GRADE_TITLE",
        re.compile(r"(?i)\bMDF/HDF\s+Emission\s+Grades:\s*E1,\s*E0,\s*CARB,\s*TSCA\s+Title\s+VI\b"),
    ),
    (
        "GENERIC_E1_E0_CARB_REFERENCE_GROUP",
        re.compile(r"(?i)\bE1\s*/\s*E0\s*/\s*CARB\s+references\b"),
    ),
    (
        "GENERIC_E1_E0_CARB_TSCA_ROUTE_LIST",
        re.compile(r"(?i)\b(?:confirm\s+)?E1\s*/\s*E0\s*/\s*CARB\s*/\s*TSCA\s+Title\s+VI(?:\s+only\s+where\s+applicable)?\b"),
    ),
    (
        "GENERIC_E1_E0_CARB_TSCA_COMMA_LIST",
        re.compile(r"(?i)\bE1,\s*E0,\s*CARB,\s*TSCA\s+Title\s+VI\s+where\s+required\b"),
    ),
    (
        "SVG_EMISSION_GRADE_LINE",
        re.compile(r"(?i)Grades:\s*E1,\s*E0,"),
    ),
]


def targets() -> list[Path]:
    files = [p for p in EXACT if p.exists()]
    for root in GLOB_ROOTS:
        if not root.exists():
            continue
        for pattern in ("fiberboard-*.svg", "mdf-vs-hdf-*.svg", "mdf-hdf-*.svg"):
            files.extend(sorted(root.glob(pattern)))
    return sorted(set(files))


def main() -> int:
    files = targets()
    failures: list[tuple[str, str, str]] = []
    for path in files:
        text = path.read_text(encoding="utf-8", errors="ignore")
        for rule_id, pattern in RULES:
            for match in pattern.finditer(text):
                start = max(0, match.start() - 100)
                end = min(len(text), match.end() + 100)
                snippet = " ".join(text[start:end].split())[:340]
                failures.append((path.relative_to(ROOT).as_posix(), rule_id, snippet))

    print(f"Fiberboard marketing claim scan: {len(files)} file(s) scanned.")
    if failures:
        print(f"FAIL: {len(failures)} unsafe claim occurrence(s) found.")
        for path, rule_id, snippet in failures:
            print(f"- {path} [{rule_id}] {snippet}")
        return 1
    print(
        "PASS: no known combined MDF/HDF density, universal 720–1,000 kg/m³ / 2–25 mm, "
        "or interchangeable E1/E0/CARB/TSCA Title VI compliance-label patterns found."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
