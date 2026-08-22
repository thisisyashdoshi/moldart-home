#!/usr/bin/env python3
"""Fail CI when known unsafe printed-decor-paper claim patterns reappear.

Scope is intentionally narrow: only public/source Insights files whose path contains
"decor-paper" or "printed-decor-paper". This is a regression guard for the claim
class verified during MKT-009; it is not a substitute for product-specific technical
validation.
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
TEXT_EXTENSIONS = {".html", ".htm", ".svg", ".txt", ".md", ".json"}

RULES = [
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


def is_in_scope(path: Path) -> bool:
    rel = path.relative_to(ROOT).as_posix().lower()
    return (
        path.suffix.lower() in TEXT_EXTENSIONS
        and ("decor-paper" in rel or "printed-decor-paper" in rel)
    )


def main() -> int:
    failures: list[tuple[str, int, str, str, str]] = []
    scanned = 0

    for scan_root in SCAN_ROOTS:
        if not scan_root.exists():
            continue
        for path in scan_root.rglob("*"):
            if not path.is_file() or not is_in_scope(path):
                continue
            scanned += 1
            try:
                text = path.read_text(encoding="utf-8", errors="ignore")
            except OSError as exc:
                print(f"WARN: could not read {path.relative_to(ROOT)}: {exc}")
                continue

            for lineno, line in enumerate(text.splitlines(), start=1):
                for rule_id, pattern, guidance in RULES:
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

    print(f"Marketing content-safety scan: {scanned} in-scope files scanned.")

    if failures:
        print(f"FAIL: {len(failures)} unsafe claim occurrence(s) found.")
        for rel, lineno, rule_id, snippet, guidance in failures:
            print(f"- {rel}:{lineno} [{rule_id}] {snippet}")
            print(f"  Required action: {guidance}")
        return 1

    print("PASS: no known MKT-009 printed-decor-paper regression patterns found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
