#!/usr/bin/env python3
"""
build_zip.py — BitTracer Python Edition
Packages the entire project into a distributable ZIP file.

Usage:
    python build_zip.py
"""

import os
import zipfile
import sys
from pathlib import Path

# ── Configuration ─────────────────────────────────────────────────────────
PROJECT_NAME = "cryptotrack-python"
OUTPUT_ZIP = f"{PROJECT_NAME}.zip"

# Directories and files to exclude from the ZIP
EXCLUDE_DIRS = {
    "__pycache__",
    ".git",
    ".venv",
    "venv",
    "env",
    ".mypy_cache",
    ".pytest_cache",
    "node_modules",
    ".DS_Store",
}

EXCLUDE_FILES = {
    ".env",
    ".env.local",
    "*.pyc",
    "*.pyo",
    f"{OUTPUT_ZIP}",   # Don't include a previous ZIP
}


def should_exclude(path: Path) -> bool:
    """Return True if the given path should be excluded from the ZIP."""
    # Check directory components
    for part in path.parts:
        if part in EXCLUDE_DIRS:
            return True

    # Check file extensions and specific names
    name = path.name
    if name in EXCLUDE_FILES:
        return True
    if name.endswith((".pyc", ".pyo")):
        return True
    if name.startswith(".") and name != ".gitignore":
        return True

    return False


def build_zip(source_dir: Path, output_path: Path) -> None:
    """Walk source_dir and add all non-excluded files to output_path ZIP."""
    files_added = 0

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for file_path in sorted(source_dir.rglob("*")):
            # Only add files (not directories themselves)
            if not file_path.is_file():
                continue

            relative = file_path.relative_to(source_dir.parent)

            if should_exclude(relative):
                continue

            zf.write(file_path, arcname=relative)
            print(f"  + {relative}")
            files_added += 1

    print(f"\n✅ Done — {files_added} files packed into '{output_path}'")


def main() -> None:
    # Resolve paths relative to this script's location
    script_dir = Path(__file__).parent.resolve()
    output_zip = script_dir / OUTPUT_ZIP

    print(f"📦 Building {OUTPUT_ZIP} …\n")
    print(f"   Source : {script_dir}")
    print(f"   Output : {output_zip}\n")

    if not script_dir.exists():
        print(f"❌ Source directory not found: {script_dir}", file=sys.stderr)
        sys.exit(1)

    build_zip(script_dir, output_zip)

    size_kb = output_zip.stat().st_size / 1024
    print(f"   Size   : {size_kb:.1f} KB")


if __name__ == "__main__":
    main()
