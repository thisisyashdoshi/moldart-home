#!/usr/bin/env python3
"""Narrow remediation for verified MDF/HDF/fiberboard claim patterns.

The authoritative Moldart product-specification register rejects a universal combined
MDF/HDF 720–1,000 kg/m³ acceptance range and the prior 2–25 mm thickness range.
Exact EN 622-5 product type/class, supplier grade, density, thickness, emissions and
surface/performance requirements remain product, destination and order specific.

This remediator also removes wording that presents E1, buyer-used "E0", CARB and
TSCA Title VI as interchangeable "emission grades". It replaces that grouped wording
with destination-specific compliance/test language; it does not create replacement
product limits, certifications or legal conclusions.

For the dedicated MDF/HDF formaldehyde-compliance guide only, it also inserts a concise
jurisdiction-specific note backed by current primary sources checked on 24 Aug 2026:
EPA TSCA Title VI for covered U.S.-destination composite wood products and REACH Annex
XVII entry 77 for EU articles placed on the market after 6 Aug 2026. The note preserves
product/destination/test-route specificity and does not turn those regimes into a single
interchangeable grade ladder.

Application fit is also remediated. The current Moldart product-specification register
allows furniture / panel / lamination use only where the exact board type/class,
service condition, surface/conversion route and regulatory requirements are qualified.
Blanket "best-fit" furniture-front / door-skin / flooring-core positioning is therefore
converted to requirement-led wording; no alternative application is claimed.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

EMISSION_GUIDES = [
    ROOT / "insights" / "mdf-hdf-emission-grades-e1-e0-carb-tsca-title-vi" / "index.html",
    ROOT / "public-site" / "insights" / "mdf-hdf-emission-grades-e1-e0-carb-tsca-title-vi" / "index.html",
]

PRODUCT_PAGES = [
    ROOT / "products" / "fiberboard" / "index.html",
    ROOT / "public-site" / "products" / "fiberboard" / "index.html",
]

PRODUCT_DIRECTORIES = [
    ROOT / "data" / "product-directory.json",
    ROOT / "public-site" / "data" / "product-directory.json",
]

SOCIAL_FIBERBOARD = [
    ROOT / "images" / "social" / "moldart-product-fiberboard.svg",
    ROOT / "public-site" / "images" / "social" / "moldart-product-fiberboard.svg",
]

EXACT = [
    *PRODUCT_PAGES,
    ROOT / "insights" / "mdf-vs-hdf-surface-readiness-guide" / "index.html",
    ROOT / "public-site" / "insights" / "mdf-vs-hdf-surface-readiness-guide" / "index.html",
    *EMISSION_GUIDES,
    *SOCIAL_FIBERBOARD,
    *PRODUCT_DIRECTORIES,
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
        re.compile(r"MDF%2FHDF%20Emission%20Grades%3A%20E1%2C%20E0%2C%20CARB%2C%20TSCA%20Title%20VI", re.I),
        "MDF%2FHDF%20Formaldehyde%20Compliance%3A%20Destination-Specific%20Routes",
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
    (
        re.compile(r"(?i)\bMDF\s+and\s+HDF\s+panels\s+for\s+lamination,\s*painting,\s*and\s+conversion\."),
        "MDF and HDF panels supplied against the approved application, service condition, surface and conversion route.",
    ),
    (
        re.compile(r"(?i)RFQ-led\s+supply\s+support\s+for\s+Furniture\s+fronts\."),
        "RFQ-led supply support for application-specific panel programmes.",
    ),
    (
        re.compile(r"(?i)End\s+use\s+or\s+application:\s*Furniture\s+fronts"),
        "End use / application and service condition",
    ),
    (
        re.compile(r"(?i)Comparing\s+options\s+outside\s+Furniture\s+fronts"),
        "Comparing boards before exact product class, service condition and conversion route are aligned",
    ),
    (
        re.compile(r"(?i)Fiberboard\s+panels\s+serve\s+as\s+the\s+core\s+substrate\s+in\s+laminated\s+furniture\s+fronts,\s*door\s+skins,\s*decorative\s+panel\s+systems,\s*and\s+flooring\s+cores\.?(?:\s*Their\s+smooth\s+surface\s+is\s+critical\s+for\s+high-quality\s+surface\s+finishing\.)?"),
        "Application fit depends on the exact board type / class, service condition, surface / conversion route and regulatory requirements.",
    ),
]

SVG_REPLACEMENTS = [
    (re.compile(r"MDF/HDF Emission</text>"), "MDF/HDF Formaldehyde</text>"),
    (re.compile(r"Grades:\s*E1,\s*E0,"), "Compliance routes"),
    (re.compile(r"CARB,\s*TSCA\s+Title\s+VI"), "Destination-specific"),
    (re.compile(r"MDF/HDF Emission Grades:\s*E1,\s*E0,\s*CARB,"), "MDF/HDF Formaldehyde compliance routes,"),
    (re.compile(r"TSCA\s+Title\s+VI\s+decision\s+sheet\s+for\s+buyers…"), "matched to destination and evidence…"),
    (re.compile(r"(?i)>BEST-FIT ROUTE</text>"), ">APPLICATION FIT</text>"),
    (re.compile(r"(?i)>Furniture fronts</text>"), ">Confirm exact route</text>"),
]

PRODUCT_PAGE_REPLACEMENTS = [
    (re.compile(r"> Furniture fronts</span>"), "> Application-specific</span>"),
    (re.compile(r"> Door skins</span>"), "> Service-condition qualified</span>"),
    (re.compile(r"> Decorative panel systems</span>"), "> Conversion-route qualified</span>"),
    (re.compile(r">Furniture fronts</div>"), ">Application-specific programmes</div>"),
    (re.compile(r">Door skins • Decorative panel systems</p>"), ">Board type • Service condition • Conversion route</p>"),
]

SOCIAL_REPLACEMENTS = [
    (re.compile(r">Furniture fronts</text>"), ">Application-specific</text>"),
    (re.compile(r">Door skins</text>"), ">Service-qualified</text>"),
]

PRODUCT_DIRECTORY_APPLICATIONS = re.compile(
    r'(?s)("id"\s*:\s*"fiberboard".*?"applications"\s*:\s*)\[\s*"Furniture fronts",\s*"Door skins",\s*"Decorative panel systems",\s*"Flooring cores"\s*\]'
)

COMPLIANCE_NOTE_MARKER = "Destination compliance note (checked 24 Aug 2026)"
COMPLIANCE_NOTE_ANCHOR = (
    "<p>Moldart helps buyers convert product intent into controlled specifications, approval packs, "
    "document checks, and RFQ-ready sourcing requirements.</p>"
)
COMPLIANCE_NOTE = (
    COMPLIANCE_NOTE_ANCHOR
    + "\n      <p><strong>Destination compliance note (checked 24 Aug 2026):</strong> "
      "For U.S.-destination covered composite wood products, EPA TSCA Title VI applies to hardwood plywood, "
      "particleboard, MDF and thin MDF and includes applicable labeling, third-party certification, recordkeeping "
      "and import-certification requirements. For EU market placement after 6 August 2026, REACH Annex XVII entry 77 "
      "restricts formaldehyde released from articles under Appendix 14 test conditions, including a 0.062 mg/m³ limit "
      "for furniture and wood-based articles, subject to the regulation’s listed exemptions. Confirm the exact product "
      "scope, destination, test/certification evidence and current legal requirements before approval or shipment. "
      "<a href=\"https://www.epa.gov/formaldehyde/formaldehyde-emission-standards-composite-wood-products\" target=\"_blank\" rel=\"noopener noreferrer\">EPA TSCA Title VI source</a> · "
      "<a href=\"https://eur-lex.europa.eu/eli/reg/2023/1464/oj/eng\" target=\"_blank\" rel=\"noopener noreferrer\">EU REACH formaldehyde source</a>.</p>"
)


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
    emission_guides = set(EMISSION_GUIDES)
    product_pages = set(PRODUCT_PAGES)
    product_directories = set(PRODUCT_DIRECTORIES)
    social_fiberboard = set(SOCIAL_FIBERBOARD)

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

        if path in product_pages:
            for pattern, replacement in PRODUCT_PAGE_REPLACEMENTS:
                updated, n = pattern.subn(replacement, updated)
                count_for_file += n

        if path in social_fiberboard:
            for pattern, replacement in SOCIAL_REPLACEMENTS:
                updated, n = pattern.subn(replacement, updated)
                count_for_file += n

        if path in product_directories:
            updated, n = PRODUCT_DIRECTORY_APPLICATIONS.subn(
                r'\1[\n        "Application-specific panel programmes",\n        "Lamination / conversion where qualified",\n        "Service-condition-specific use"\n      ]',
                updated,
            )
            count_for_file += n

        if path in emission_guides and COMPLIANCE_NOTE_MARKER not in updated and COMPLIANCE_NOTE_ANCHOR in updated:
            updated = updated.replace(COMPLIANCE_NOTE_ANCHOR, COMPLIANCE_NOTE, 1)
            count_for_file += 1

        if updated != original:
            path.write_text(updated, encoding="utf-8")
            changed_files += 1
            replacements += count_for_file
            print(f"CHANGED {path.relative_to(ROOT)}: {count_for_file} replacement(s)")

    print(f"Fiberboard remediation: {changed_files} file(s) changed; {replacements} replacement(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
