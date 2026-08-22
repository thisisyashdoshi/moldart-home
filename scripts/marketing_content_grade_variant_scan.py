#!/usr/bin/env python3
"""Fail CI if verified blanket SS 304/420/630 press-plate grade lists reappear.

This is a narrow MKT-009 regression guard. It does not replace Supply & Procurement technical validation.
"""
from __future__ import annotations

import re
import sys
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
        "UNIVERSAL_PRESS_PLATE_SS304_GRADE_PLATFORM_SLASH",
        re.compile(r"(?i)\bSS\s*304\s*/\s*420\s*/\s*630\b"),
    ),
    (
        "UNIVERSAL_PRESS_PLATE_SS304_GRADE_PLATFORM_LIST",
        re.compile(r"(?i)\bSS\s*304\s*,\s*SS\s*420\s*,\s*(?:and\s*)?SS\s*630\b"),
    ),
]


def in_scope(path: Path) -> bool:
    if path.suffix.lower() not in TEXT_EXTENSIONS:
        return False
    if path in EXTRA_FILES:
        return True
    rel = path.relative_to(ROOT).as_posix().lower()
    return any(marker in rel for marker in PRESS_PLATE_MARKERS)


def scan(path: Path, failures: list[tuple[str, int, str, str]]) -> None:
    if not path.exists() or not path.is_file() or not in_scope(path):
        return
    text = path.read_text(encoding="utf-8", errors="ignore")
    for lineno, line in enumerate(text.splitlines(), start=1):
        for rule_id, pattern in RULES:
            if pattern.search(line):
                failures.append((path.relative_to(ROOT).as_posix(), lineno, rule_id, line.strip()[:240]))


def main() -> int:
    failures: list[tuple[str, int, str, str]] = []
    scanned: set[Path] = set()
    for root in SCAN_ROOTS:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if not path.is_file() or not in_scope(path):
                continue
            scanned.add(path)
            scan(path, failures)
    for path in EXTRA_FILES:
        if path.exists() and path.is_file():
            scanned.add(path)
            scan(path, failures)
    print(f"MKT-009 grade-variant scan: {len(scanned)} press-plate/data file(s) scanned.")
    if failures:
        print(f"FAIL: {len(failures)} blanket SS304/420/630 grade-list occurrence(s) found.")
        for rel, lineno, rule_id, snippet in failures:
            print(f"- {rel}:{lineno} [{rule_id}] {snippet}")
        return 1
    print("PASS: no known SS304/420/630 blanket press-plate grade-list variants found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
