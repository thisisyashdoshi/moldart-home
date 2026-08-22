#!/usr/bin/env python3
"""Fail CI when verified unsafe marketing claim patterns reappear.

This is a narrow regression guard for MKT-009. It covers:
1) printed/decor-paper universal GSM / wet-strength wording; and
2) press-plate generalized numeric acceptance values that the current technical
   master explicitly keeps order/drawing/material/coating/test-method specific.

It does not replace Supply & Procurement technical validation.
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

DECOR_RULES = [
    (
        "UNIVERSAL_GSM_RANGE",
        re.compile(r"(?i)\b60\s*[-–—]\s*85\s*(?:gsm|g\s*/\s*m(?:2|²))\b"),
        "Universal 60–85 GSM wording is not allowed; basis weight must stay tied to the approved grade/order.",
    ),
    (
        "UNIVERSAL_WET_STRENGTH_6N",
        re.compile(r"(?i)(?:above|>|minimum|min\.?|≥)\s*6\s*n\b"),
        "Universal >6 N / Above 6N wet-strength wording is not allowed; state method + approved grade/order instead.",
    ),
]

PRESS_PLATE_RULES = [
    (
        "UNIVERSAL_PRESS_PLATE_CORE_HARDNESS",
        re.compile(r"(?i)\bApprox\.\s*40\s*[-–—]\s*45\s*HRC\b"),
        "Do not publish a universal substrate/core hardness; keep hardness tied to the exact grade, heat/condition, MTC/test evidence and approved order.",
    ),
    (
        "UNIVERSAL_PRESS_PLATE_COATING_HARDNESS",
        re.compile(r"(?i)\bApprox\.\s*65\s*[-–—]\s*70\s*HRC\b"),
        "Do not publish a universal coating hardness; keep the coating and test method/order-specific acceptance tied to approved evidence.",
    ),
    (
        "UNIVERSAL_PRESS_PLATE_FLATNESS",
        re.compile(r"(?i)\bSub[-‐‑‒–— ]*0\.05\s*mm\s*/\s*m\b"),
        "Do not publish a universal flatness limit; use the exact approved drawing/specification and measurement basis.",
    ),
    (
        "UNIVERSAL_PRESS_PLATE_PARALLELISM",
        re.compile(r"(?i)\bApprox\.\s*0\.02\s*mm\b"),
        "Do not publish a universal parallelism value; use the exact approved drawing/specification and measurement basis.",
    ),
    (
        "UNIVERSAL_PRESS_PLATE_ROUGHNESS",
        re.compile(r"(?i)\bRa\s*<\s*0\.05\s*[µμu]m\b"),
        "Do not publish a universal Ra value; surface-texture acceptance and evaluation method remain order-specific.",
    ),
    (
        "UNIVERSAL_PRESS_PLATE_COATING_THICKNESS_WINDOW",
        re.compile(r"(?i)\bApprox\.\s*20\s*[-–—]\s*100\s*[µμu]m\b"),
        "Do not publish a universal chrome/coating thickness window; use the exact approved coating specification and measurement basis.",
    ),
]


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix().lower()


def is_decor_scope(path: Path) -> bool:
    r = rel(path)
    return path.suffix.lower() in TEXT_EXTENSIONS and (
        "decor-paper" in r or "printed-decor-paper" in r
    )


def is_press_plate_scope(path: Path) -> bool:
    r = rel(path)
    if path in EXTRA_FILES:
        return True
    return path.suffix.lower() in TEXT_EXTENSIONS and any(marker in r for marker in PRESS_PLATE_MARKERS)


def scan_file(path: Path, rules, failures) -> None:
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError as exc:
        print(f"WARN: could not read {path.relative_to(ROOT)}: {exc}")
        return

    for lineno, line in enumerate(text.splitlines(), start=1):
        for rule_id, pattern, guidance in rules:
            if pattern.search(line):
                failures.append(
                    (
                        path.relative_to(ROOT).as_posix(),
                        lineno,
                        rule_id,
                        line.strip()[:240],
                        guidance,
                    )
                )


def main() -> int:
    failures: list[tuple[str, int, str, str, str]] = []
    scanned_decor: set[Path] = set()
    scanned_press: set[Path] = set()

    for scan_root in SCAN_ROOTS:
        if not scan_root.exists():
            continue
        for path in scan_root.rglob("*"):
            if not path.is_file():
                continue
            if is_decor_scope(path):
                scanned_decor.add(path)
                scan_file(path, DECOR_RULES, failures)
            if is_press_plate_scope(path):
                scanned_press.add(path)
                scan_file(path, PRESS_PLATE_RULES, failures)

    for path in EXTRA_FILES:
        if not path.exists() or not path.is_file():
            continue
        scanned_press.add(path)
        scan_file(path, PRESS_PLATE_RULES, failures)

    print(
        "Marketing content-safety scan: "
        f"{len(scanned_decor)} decor-paper file(s), "
        f"{len(scanned_press)} press-plate/data file(s) scanned."
    )

    if failures:
        print(f"FAIL: {len(failures)} unsafe claim occurrence(s) found.")
        for rel_path, lineno, rule_id, snippet, guidance in failures:
            print(f"- {rel_path}:{lineno} [{rule_id}] {snippet}")
            print(f"  Required action: {guidance}")
        return 1

    print("PASS: no known MKT-009 decor-paper or press-plate regression patterns found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
