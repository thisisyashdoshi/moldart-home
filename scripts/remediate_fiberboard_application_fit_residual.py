#!/usr/bin/env python3
"""Remove the residual unqualified fiberboard dashboard application-fit default.

The current Moldart product-specification register permits furniture/panel/lamination use
only when the exact board type/class, service condition, surface/conversion route and
regulatory requirements are qualified. This script only replaces the verified residual
HTML dashboard pair; it does not claim a substitute application.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    ROOT / "insights" / "mdf-hdf-emission-grades-e1-e0-carb-tsca-title-vi" / "index.html",
    ROOT / "public-site" / "insights" / "mdf-hdf-emission-grades-e1-e0-carb-tsca-title-vi" / "index.html",
    ROOT / "insights" / "mdf-vs-hdf-surface-readiness-guide" / "index.html",
    ROOT / "public-site" / "insights" / "mdf-vs-hdf-surface-readiness-guide" / "index.html",
]
OLD = '<div class="article-dashboard-label">Best-fit route</div><div class="article-dashboard-value">Furniture fronts</div>'
NEW = '<div class="article-dashboard-label">Application fit</div><div class="article-dashboard-value">Confirm exact route</div>'

changed = 0
replacements = 0
for path in FILES:
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    count = text.count(OLD)
    if count:
        path.write_text(text.replace(OLD, NEW), encoding="utf-8")
        changed += 1
        replacements += count
        print(f"CHANGED {path.relative_to(ROOT)}: {count} replacement(s)")
print(f"Fiberboard application-fit residual remediation: {changed} file(s) changed; {replacements} replacement(s).")
