#!/usr/bin/env python3
"""Narrow remediation for verified MDF/HDF/fiberboard claim patterns.

The authoritative Moldart product-specification register rejects a universal combined
MDF/HDF 720–1,000 kg/m³ acceptance range and the prior 2–25 mm thickness range.
Exact EN 622-5 product type/class, supplier grade, density, thickness, emissions and
surface/performance requirements remain product, destination and order specific.

This remediator also removes wording that presents E1, buyer-used "E0", CARB and
TSCA Title VI as interchangeable "emission grades". It replaces that grouped wording
with destination-specific compliance/test language; it does not create replacement
limits, certifications or legal conclusions.
"""
from __future__ import annotations

import re
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

COMMON_REPLACEMENTS = [
    (re.compile(r"(?i)\bcombined\s+density(?:\s*\.\.\.|\s*…)?"), "Product-specific density"),
    (
        re.compile(r"(?i)\b720\s*(?:[-–—]|to)\s*1\s*[, ]?\s*000\s*kg\s*/?\s*m(?:3|³)\b"),
        "density per approved product / class",
    ),
    (
        re.compile(r"(?i)\b2\s*(?:[-–—]|to)\s*25\s*mm\b"),
        "thickness per approved product / order",
    ),
    (
        re.compile(r"(?i)\bMDF/HDF\s+Emission\s+Grades:\s*E1,\s*E0,\s*CARB,\s*TSCA\s+Title\s+VI\b"),
        "MDF/HDF Formaldehyde Compliance: Destination-Specific Routes",
    ),
    (
        re.compile(r"(?i)\bMDF/HDF\s+Emission\s+Grades:\s*E1,\s*E0,\s*CARB,\s*TSCA\s+Tit\.\.\."),
        "MDF/HDF Formaldehyde Compliance: Destination-Specific...",
    ),
    (
        re.compile(r"(?i)\bE1\s*/\s*E0\s*/\s*CARB\s+references,?\s+and\s+EPA\s+TSCA\s+Title\s+VI\s+only\s+where\s+US-regulated\s+composite\s+wood\s+rules\s+apply\b"),
        "destination-specific formaldehyde requirements, the applicable legal / certification / test route, and EPA TSCA Title VI where US-regulated composite wood rules apply",
    ),
    (
        re.compile(r"(?i)\bE1\s*/\s*E0\s*/\s*CARB\s+references\b"),
        "destination-specific compliance references",
    ),
    (
        re.compile(r"(?i)\bConfirm\s+E1\s*/\s*E0\s*/\s*CARB\s*/\s*TSCA\s+Title\s+VI\s+only\s+where\s+applicable\b"),
        "Confirm the destination-specific legal / certification / test route and supporting supplier evidence",
    ),
    (
        re.compile(r"(?i)\bE1,\s*E0,\s*CARB,\s*TSCA\s+Title\s+VI\s+where\s+required\b"),
        "Destination-specific formaldehyde compliance route and evidence",
    ),
]

SVG_REPLACEMENTS = [
    (re.compile(r"MDF/HDF Emission</text>"), "MDF/HDF Formaldehyde</text>"),
    (re.compile(r"Grades:\s*E1,\s*E0,"), "Compliance routes"),
    (re.compile(r"CARB,\s*TSCA\s+Title\s+VI"), "Destination-specific"),
    (re.compile(r"MDF/HDF Emission Grades:\s*E1,\s*E0,\s*CARB,"), "MDF/HDF Formaldehyde compliance routes,"),
    (re.compile(r"TSCA\s+Title\s+VI\s+decision\s+sheet\s+for\s+buyers…"), "matched to destination and evidence…"),
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
    changed_files = 0
    replacements = 0
    for path in targets():
        original = path.read_text(encoding="utf-8", errors="ignore")
        updated = original
        count_for_file = 0
        for pattern, replacement in COMMON_REPLACEMENTS:
            updated, n = pattern.subn(replacement, updated)
            count_for_file += n
        if path.suffix.lower() == ".svg":
            for pattern, replacement in SVG_REPLACEMENTS:
                updated, n = pattern.subn(replacement, updated)
                count_for_file += n
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed_files += 1
            replacements += count_for_file
            print(f"CHANGED {path.relative_to(ROOT)}: {count_for_file} replacement(s)")
    print(f"Fiberboard remediation: {changed_files} file(s) changed; {replacements} replacement(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
