#!/usr/bin/env python3
"""Narrow remediation for verified MDF/HDF/fiberboard claim patterns.

The authoritative Moldart product-specification register rejects a universal combined
MDF/HDF 720–1,000 kg/m³ acceptance range and the prior 2–25 mm thickness range.
Exact EN 622-5 product type/class, supplier grade, density, thickness and surface/
performance requirements remain product/order specific. This script changes only the
verified public/source claim class and does not create replacement numeric specs.
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

REPLACEMENTS = [
    (re.compile(r"(?i)\bcombined\s+density(?:\s*\.\.\.|\s*…)?"), "Product-specific density"),
    (
        re.compile(r"(?i)\b720\s*(?:[-–—]|to)\s*1\s*[, ]?\s*000\s*kg\s*/?\s*m(?:3|³)\b"),
        "density per approved product / class",
    ),
    (
        re.compile(r"(?i)\b2\s*(?:[-–—]|to)\s*25\s*mm\b"),
        "thickness per approved product / order",
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
    changed_files = 0
    replacements = 0
    for path in targets():
        original = path.read_text(encoding="utf-8", errors="ignore")
        updated = original
        count_for_file = 0
        for pattern, replacement in REPLACEMENTS:
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
