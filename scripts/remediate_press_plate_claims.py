#!/usr/bin/env python3
"""Deterministically remediate known generalized press-plate claim patterns.

This is a narrow MKT-009 cleanup utility for existing Insights source/public files.
It does not introduce product specifications. It replaces only claim classes already
verified as unsafe against the current Press Plates technical master, where acceptance
values and grade/surface routes remain application/order/drawing/material/coating/
test-method specific.

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

# Longer/specific prose first so later generic rules do not create awkward sentences.
FULL_SENTENCE_RULES = [
    (
        re.compile(
            r"(?i)SS\s*304,\s*SS\s*420,\s*and\s*SS\s*630\s+are\s+the\s+most\s+frequently\s+referenced\s+working\s+grades"
        ),
        "Press-plate grade must follow the approved application and plate specification",
    ),
    (
        re.compile(
            r"(?i)420\s+and\s+630\s+routes\s+are\s+associated\s+with\s+core\s+hardness\s+in\s+the\s+roughly\s*40\s*[-–—]\s*45\s*HRC\s+range"
        ),
        "Substrate hardness remains tied to the approved grade / condition and verified order evidence",
    ),
    (
        re.compile(
            r"(?i)hard[- ]chrome\s+working\s+surfaces\s+are\s+referenced\s+in\s+the\s+roughly\s*65\s*[-–—]\s*70\s*HRC\s+range"
        ),
        "Coating microhardness must be verified by the agreed microindentation method",
    ),
    (
        re.compile(
            r"(?i)SUS\s*301,\s*SUS\s*420,\s*and\s*SUS\s*630\s+references\s+for\s+electronics\s+lamination\s+programmes"
        ),
        "grade selected for the approved electronics-lamination application",
    ),
    (
        re.compile(
            r"(?i)heat[- ]treated\s+hardness\s+in\s+the\s+roughly\s*40\s*[-–—]\s*45\s*HRC\s+range\s+for\s+relevant\s+platforms"
        ),
        "hardness per approved grade / condition and test evidence",
    ),
    (
        re.compile(r"(?i)flatness\s+below\s*0\.05\s*mm\s+per\s+metre"),
        "flatness per approved drawing / measurement basis",
    ),
    (
        re.compile(r"(?i)parallelism\s+around\s*0\.02\s*mm"),
        "parallelism per approved drawing / measurement basis",
    ),
    (
        re.compile(
            r"(?i)very\s+low\s+surface\s+roughness,\s+with\s+electronics\s+tooling\s+references\s+often\s+pointing\s+to\s+Ra\s+below\s*0\.1\s*[µμu]m"
        ),
        "surface roughness per approved order and measurement method",
    ),
]

RULES = [
    # Existing verified numeric classes.
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

    # Newly verified variants missed by the first pass.
    (
        re.compile(r"(?i)\bapprox\.\s*HRC\s*40\s*[-–—]\s*45\b"),
        "Per approved grade / condition",
    ),
    (
        re.compile(r"(?i)\broughly\s*40\s*[-–—]\s*45\s*HRC\b"),
        "hardness per approved grade / condition",
    ),
    (
        re.compile(r"(?i)\b(?:flatness\s+)?below\s*0\.05\s*mm\s*(?:/\s*m|per\s+metre)\b"),
        "flatness per approved drawing / measurement basis",
    ),
    (
        re.compile(r"(?i)\bparallelism\s+(?:around|approx\.?)\s*0\.02\s*mm\b"),
        "parallelism per approved drawing / measurement basis",
    ),
    (
        re.compile(r"(?i)\bRa\s+below\s*0\.1\s*[µμu]m\b"),
        "surface roughness per approved order / measurement method",
    ),

    # Newly verified non-numeric / application-specific generalizations.
    (
        re.compile(r"(?i)\bSUS\s*301\s*/\s*420\s*/\s*630\b"),
        "Per approved application",
    ),
    (
        re.compile(r"(?i)\bSUS\s*301\s*,\s*SUS\s*420\s*,\s*(?:and\s*)?SUS\s*630\b"),
        "Grade per approved application",
    ),
    (
        re.compile(r"(?i)\bVery low roughness\b"),
        "Per approved surface requirement",
    ),
]


def in_scope(path: Path) -> bool:
    if path.suffix.lower() not in TEXT_EXTENSIONS:
        return False
    rel = path.relative_to(ROOT).as_posix().lower()
    return any(marker in rel for marker in PRESS_PLATE_MARKERS)


def remediate(text: str) -> tuple[str, int]:
    changed = 0

    for pattern, replacement in FULL_SENTENCE_RULES:
        text, n = pattern.subn(replacement, text)
        changed += n

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
