#!/usr/bin/env python3
"""Fail CI if verified unsafe MDF/HDF/fiberboard claim patterns remain or reappear.

Narrow MKT-009 regression guard. The authoritative Moldart product-specification
register rejects a universal combined MDF/HDF 720–1,000 kg/m³ acceptance range and
the prior 2–25 mm thickness range. Exact EN 622-5 product type/class, supplier grade,
density, thickness, emissions and surface/performance requirements remain product,
destination and order specific.

The emissions/compliance lane is also guarded against treating E1, buyer-used "E0",
CARB and TSCA Title VI as interchangeable "emission grades". EPA treats TSCA Title VI
as the U.S. compliance/certification route for covered composite wood products. EU
REACH Annex XVII entry 77 separately regulates formaldehyde released from articles
placed on the market after 6 Aug 2026, subject to its scope and exemptions. This guard
does not replace independent technical or regulatory validation.

The guard also catches stale URL-encoded social/share titles that still advertise the
old interchangeable grade ladder after visible-page remediation.

Application fit is guarded separately: the current product-specification register says
furniture / panel / lamination use is acceptable only where the exact board type/class,
service condition, surface/conversion route and regulatory requirements are qualified.
Therefore blanket "best-fit" furniture-front / door-skin / flooring-core positioning is
not allowed as a generic MDF/HDF product claim. The guard includes legacy SVG,
dashboard and HTML signal-card wording so visually prominent residual defaults cannot
escape the release gate.

Surface-readiness wording is also guarded where it presents a smooth surface as a
complete painting/lamination acceptance criterion. Smooth/homogeneous surfaces may be
common MDF characteristics, but the exact surface requirement still belongs to the
approved conversion route and product/order evidence.
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
    ROOT / "data" / "product-directory.json",
    ROOT / "public-site" / "data" / "product-directory.json",
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
        "TRUNCATED_INTERCHANGEABLE_EMISSION_GRADE_LABEL",
        re.compile(r"(?i)\bMDF/HDF\s+Emission\s+Grades:\s*E1,\s*E0,\s*CARB,\s*TSCA\s+Tit\.\.\."),
    ),
    (
        "URL_ENCODED_INTERCHANGEABLE_EMISSION_TITLE",
        re.compile(r"MDF%2FHDF%20Emission%20Grades%3A%20E1%2C%20E0%2C%20CARB%2C%20TSCA%20Title%20VI", re.I),
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
    (
        "UNQUALIFIED_FIBERBOARD_SUMMARY",
        re.compile(r"(?i)\bMDF\s+and\s+HDF\s+panels\s+for\s+lamination,\s*painting,\s*and\s+conversion\."),
    ),
    (
        "UNQUALIFIED_FIBERBOARD_META_FURNITURE_FRONTS",
        re.compile(r"(?i)RFQ-led\s+supply\s+support\s+for\s+Furniture\s+fronts\."),
    ),
    (
        "UNQUALIFIED_FIBERBOARD_BEST_FIT_ROUTE",
        re.compile(r"(?i)BEST-FIT\s+ROUTE"),
    ),
    (
        "UNQUALIFIED_FIBERBOARD_HTML_SIGNAL_BEST_FIT",
        re.compile(r"(?i)<div\s+class=\"article-signal-label\">Best\s+fit</div>\s*<div\s+class=\"article-signal-value\">Furniture\s+fronts</div>"),
    ),
    (
        "UNQUALIFIED_FIBERBOARD_HTML_SIGNAL_DOOR_SKINS",
        re.compile(r"(?i)<p\s+class=\"article-signal-note\">Door\s+skins\s*•\s*Decorative\s+panel\s+systems</p>"),
    ),
    (
        "UNQUALIFIED_FIBERBOARD_DASHBOARD_DOOR_SKINS",
        re.compile(r"(?i)<p\s+class=\"article-dashboard-note\">Door\s+skins\s*•\s*Decorative\s+panel\s+systems</p>"),
    ),
    (
        "INCOMPLETE_FIBERBOARD_SURFACE_ACCEPTANCE_REFERENCE",
        re.compile(r"(?i)<td\s+data-label=\"Reference\">Smooth\s+surface\s+for\s+painting\s+or\s+lamination</td>"),
    ),
    (
        "UNQUALIFIED_FIBERBOARD_PRODUCT_FIT_FURNITURE",
        re.compile(r"(?i)>Furniture\s+fronts</text>"),
    ),
    (
        "UNQUALIFIED_FIBERBOARD_PRODUCT_FIT_DOOR_SKINS",
        re.compile(r"(?i)>Door\s+skins</text>"),
    ),
    (
        "UNQUALIFIED_FIBERBOARD_FLOORING_CORE_CLAIM",
        re.compile(r"(?i)\bflooring\s+cores\b"),
    ),
    (
        "UNQUALIFIED_FIBERBOARD_CORE_SUBSTRATE_SENTENCE",
        re.compile(r"(?i)Fiberboard\s+panels\s+serve\s+as\s+the\s+core\s+substrate\s+in\s+laminated\s+furniture\s+fronts,\s*door\s+skins,\s*decorative\s+panel\s+systems,\s*and\s+flooring\s+cores"),
    ),
    (
        "UNQUALIFIED_FIBERBOARD_RFQ_DEFAULT",
        re.compile(r"(?i)End\s+use\s+or\s+application:\s*Furniture\s+fronts"),
    ),
    (
        "UNQUALIFIED_FIBERBOARD_COMPARE_DEFAULT",
        re.compile(r"(?i)Comparing\s+options\s+outside\s+Furniture\s+fronts"),
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
        "interchangeable E1/E0/CARB/TSCA Title VI, incomplete surface-readiness, or unqualified fiberboard application-fit patterns found."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
