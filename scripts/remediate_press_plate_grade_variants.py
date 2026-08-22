#!/usr/bin/env python3
"""Remediate verified blanket press-plate grade-list variants missed by the main MKT-009 pass.

Narrow scope only: press-plate / lamination-stack Insights content and data mirrors.
No grade is introduced; blanket SS 304/420/630 lists are converted to application-specific wording.
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCAN_ROOTS = [
    ROOT / "insights",
    ROOT / "public-site" / "insights",
    ROOT / "images" / "insights",
    ROOT / "public-site" / "images" / "insights",
]
EXTRA_FILES = [
    ROOT / "data" / "insights.json",
    ROOT / "public-site" / "data" / "insights.json",
]
TEXT_EXTENSIONS = {".html", ".htm", ".svg", ".txt", ".md", ".json"}
PRESS_PLATE_MARKERS = (
    "press-plate",
    "press-plates",
    "industrial-press-plates",
    "lamination-stack-control-plate-pad-paper-substrate-press-cycle",
)

RULES = [
    (
        re.compile(r"(?i)\bSS\s*304\s*/\s*420\s*/\s*630\b"),
        "Per approved application",
    ),
    (
        re.compile(r"(?i)\bSS\s*304\s*,\s*SS\s*420\s*,\s*(?:and\s*)?SS\s*630\b"),
        "Grade per approved application",
    ),
]


def in_scope(path: Path) -> bool:
    if path.suffix.lower() not in TEXT_EXTENSIONS:
        return False
    if path in EXTRA_FILES:
        return True
    rel = path.relative_to(ROOT).as_posix().lower()
    return any(marker in rel for marker in PRESS_PLATE_MARKERS)


def process(path: Path) -> tuple[int, int]:
    if not path.exists() or not path.is_file() or not in_scope(path):
        return 0, 0
    original = path.read_text(encoding="utf-8", errors="ignore")
    updated = original
    replacements = 0
    for pattern, replacement in RULES:
        updated, n = pattern.subn(replacement, updated)
        replacements += n
    if updated != original:
        path.write_text(updated, encoding="utf-8")
        print(f"REMEDIATED {path.relative_to(ROOT)} ({replacements} replacement(s))")
        return 1, replacements
    return 0, 0


def main() -> int:
    files_changed = 0
    replacements = 0
    seen: set[Path] = set()
    for root in SCAN_ROOTS:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if not path.is_file():
                continue
            seen.add(path)
            f, r = process(path)
            files_changed += f
            replacements += r
    for path in EXTRA_FILES:
        if path in seen:
            continue
        f, r = process(path)
        files_changed += f
        replacements += r
    print(f"MKT-009 grade-variant remediation: {files_changed} file(s), {replacements} replacement(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
