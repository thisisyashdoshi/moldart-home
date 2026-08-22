#!/usr/bin/env python3
"""Deterministically remediate known generalized press-plate claim patterns.

This is a narrow MKT-009 cleanup utility for existing Insights source/public files.
It does not introduce product specifications. It replaces only claim classes already
verified as unsafe against the current Press Plates technical master, where numeric
acceptance values are order/drawing/material/coating/test-method specific.

Post-remediation verification is performed by scripts/marketing_content_safety_scan.py.
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
        re.compile(r"(?i)\bApprox\.\s*40\s*[-–—]\s*45\s*HRC\b"),
        "Per approved grade",
    ),
    (
        re.compile(r"(?i)\bApprox\.\s*65\s*[-–—]\s*70\s*HRC\b"),
        "Per approved coating",
    ),
    (
        re.compile(r"(?i)\bSub[-‐‑‒–— ]*0\.05\s*mm\s*/\s*m\b"),
        "Per approved drawing",
    ),
    (
        re.compile(r"(?i)\bApprox\.\s*0\.02\s*mm\b"),
        "Per approved drawing",
    ),
    (
        re.compile(r"(?i)\bRa\s*<\s*0\.05\s*[µμu]m\b"),
        "Ra per approved order",
    ),
    (
        re.compile(r"(?i)\bApprox\.\s*20\s*[-–—]\s*100\s*[µμu]m\b"),
        "Per approved coating spec",
    ),
]


def in_scope(path: Path) -> bool:
    if path.suffix.lower() not in TEXT_EXTENSIONS:
        return False
    rel = path.relative_to(ROOT).as_posix().lower()
    return any(marker in rel for marker in PRESS_PLATE_MARKERS)


def remediate(text: str) -> tuple[str, int]:
    changed = 0
    for pattern, replacement in RULES:
        text, n = pattern.subn(replacement, text)
        changed += n

    phrase_replacements = {
        "CORE HARDNESS</text><text": "SUBSTRATE HARDNESS</text><text",
        "CHROME SURFACE</text><text": "COATING HARDNESS</text><text",
        "FLATNESS</text><text": "FLATNESS BASIS</text><text",
        "PARALLELISM</text><text": "PARALLELISM BASIS</text><text",
        "CHROME WINDOW</text><text": "COATING BASIS</text><text",
    }
    for old, new in phrase_replacements.items():
        count = text.count(old)
        if count:
            text = text.replace(old, new)
            changed += count

    return text, changed


def process_file(path: Path) -> tuple[int, int]:
    if not path.exists() or not path.is_file():
        return 0, 0
    original = path.read_text(encoding="utf-8", errors="ignore")
    updated, count = remediate(original)
    if count and updated != original:
        path.write_text(updated, encoding="utf-8")
        print(f"REMEDIATED {path.relative_to(ROOT)} ({count} replacement(s))")
        return 1, count
    return 0, 0


def main() -> int:
    files_changed = 0
    replacements = 0
    seen: set[Path] = set()

    for scan_root in SCAN_ROOTS:
        if not scan_root.exists():
            continue
        for path in scan_root.rglob("*"):
            if not path.is_file() or not in_scope(path):
                continue
            seen.add(path)
            f, r = process_file(path)
            files_changed += f
            replacements += r

    for path in EXTRA_FILES:
        if path in seen:
            continue
        f, r = process_file(path)
        files_changed += f
        replacements += r

    print(
        f"MKT-009 press-plate remediation complete: {files_changed} file(s) changed, "
        f"{replacements} replacement(s)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
