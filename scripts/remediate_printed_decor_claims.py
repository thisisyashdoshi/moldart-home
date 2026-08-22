#!/usr/bin/env python3
"""Deterministically remediate the known printed-decor-paper universal claim class.

This is a narrow MKT-009 cleanup utility for existing Insights source/public files.
It does not introduce product specifications. It replaces only the already-verified
unsafe universal basis-weight / wet-strength wording with requirement-capture
language that keeps the exact value tied to the approved grade/order/test method.
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
TEXT_EXTENSIONS = {".html", ".htm", ".svg", ".txt", ".md", ".json"}

UNSAFE_GSM = re.compile(r"(?i)\b60\s*[-–—]\s*85\s*(?:gsm|g\s*/\s*m(?:2|²))\b")
UNSAFE_WET = re.compile(r"(?i)(?:above|>|minimum|min\.?|≥)\s*6\s*n\b")


def in_scope(path: Path) -> bool:
    rel = path.relative_to(ROOT).as_posix().lower()
    return (
        path.suffix.lower() in TEXT_EXTENSIONS
        and ("decor-paper" in rel or "printed-decor-paper" in rel)
    )


def remediate(text: str) -> tuple[str, int]:
    changed = 0

    text, n = UNSAFE_GSM.subn("Per approved grade", text)
    changed += n
    text, n = UNSAFE_WET.subn("Method + approved grade", text)
    changed += n

    # Clean up the most common surrounding phrases so the replacement remains
    # readable rather than merely scanner-compliant.
    phrase_replacements = {
        "A typical working range for many printed decor routes.":
            "Use the approved grade and order-specific basis weight.",
        "A typical working range for many printed décor routes.":
            "Use the approved grade and order-specific basis weight.",
        "Per approved grade range": "approved grade / order basis",
        "range of Per approved grade": "approved grade / order basis",
        "Weight range": "Basis weight basis",
    }
    for old, new in phrase_replacements.items():
        count = text.count(old)
        if count:
            text = text.replace(old, new)
            changed += count

    return text, changed


def main() -> int:
    files_changed = 0
    replacements = 0

    for scan_root in SCAN_ROOTS:
        if not scan_root.exists():
            continue
        for path in scan_root.rglob("*"):
            if not path.is_file() or not in_scope(path):
                continue
            original = path.read_text(encoding="utf-8", errors="ignore")
            updated, count = remediate(original)
            if count and updated != original:
                path.write_text(updated, encoding="utf-8")
                files_changed += 1
                replacements += count
                print(f"REMEDIATED {path.relative_to(ROOT)} ({count} replacement(s))")

    print(
        f"MKT-009 remediation complete: {files_changed} file(s) changed, "
        f"{replacements} replacement(s)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
