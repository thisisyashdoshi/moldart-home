#!/usr/bin/env python3
"""Remove residual unqualified fiberboard application-fit defaults.

The current Moldart product-specification register permits furniture/panel/lamination use
only when the exact board type/class, service condition, surface/conversion route and
regulatory requirements are qualified. This script only replaces verified residual
HTML dashboard/signal defaults; it does not claim a substitute application.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = [
    ROOT / "insights" / "mdf-hdf-emission-grades-e1-e0-carb-tsca-title-vi" / "index.html",
    ROOT / "public-site" / "insights" / "mdf-hdf-emission-grades-e1-e0-carb-tsca-title-vi" / "index.html",
    ROOT / "insights" / "mdf-vs-hdf-surface-readiness-guide" / "index.html",
    ROOT / "public-site" / "insights" / "mdf-vs-hdf-surface-readiness-guide" / "index.html",
]

REPLACEMENTS = [
    (
        '<div class="article-dashboard-label">Best-fit route</div><div class="article-dashboard-value">Furniture fronts</div>',
        '<div class="article-dashboard-label">Application fit</div><div class="article-dashboard-value">Confirm exact route</div>',
    ),
    (
        '<article class="article-signal-card"><div class="article-signal-label">Best fit</div><div class="article-signal-value">Furniture fronts</div><p class="article-signal-note">Door skins • Decorative panel systems</p></article>',
        '<article class="article-signal-card"><div class="article-signal-label">Application fit</div><div class="article-signal-value">Confirm exact route</div><p class="article-signal-note">Qualify board type • service condition • conversion route</p></article>',
    ),
]

changed = 0
replacements = 0
for path in FILES:
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    original = text
    local_count = 0
    for old, new in REPLACEMENTS:
        count = text.count(old)
        if count:
            text = text.replace(old, new)
            local_count += count
    if text != original:
        path.write_text(text, encoding="utf-8")
        changed += 1
        replacements += local_count
        print(f"CHANGED {path.relative_to(ROOT)}: {local_count} replacement(s)")
print(f"Fiberboard application-fit residual remediation: {changed} file(s) changed; {replacements} replacement(s).")
