#!/usr/bin/env python3
from __future__ import annotations

import csv
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATABASE = ROOT / "database"

EXPECTED_HEADERS = {
    "units.csv": ["id", "parent_id", "name", "kind", "sort_order", "summary", "status"],
    "subunits.csv": ["id", "parent_id", "name", "kind", "sort_order", "summary", "status"],
    "academic_teams.csv": ["id", "parent_id", "name", "kind", "sort_order", "summary", "status"],
    "roles.csv": ["id", "unit_id", "title", "sort_order", "summary"],
    "people.csv": ["id", "name", "class_name"],
    "assignments.csv": ["id", "person_id", "unit_id", "role_id", "role_label", "status", "sort_order"],
}

FORBIDDEN_PUBLIC_FIELDS = {
    "phone",
    "phone_number",
    "birth_date",
    "date_of_birth",
    "gender",
    "email",
    "address",
    "note",
    "notes",
}

FORBIDDEN_SOURCE_MARKERS = (
    "08A - Dữ liệu nhân sự",
    "08B - Dữ liệu nội bộ",
)

SCAN_SUFFIXES = {".js", ".mjs", ".html", ".css", ".csv", ".json"}


def main() -> int:
    failures: list[str] = []
    warnings: list[str] = []

    for name, expected in EXPECTED_HEADERS.items():
        path = DATABASE / name
        if not path.exists():
            failures.append(f"missing public CSV: database/{name}")
            continue
        with path.open(encoding="utf-8-sig", newline="") as handle:
            reader = csv.reader(handle)
            header = next(reader, [])
        if header != expected:
            failures.append(
                f"unexpected public header in database/{name}: {header!r}; expected {expected!r}"
            )
        leaked = sorted(set(header) & FORBIDDEN_PUBLIC_FIELDS)
        if leaked:
            failures.append(f"forbidden public fields in database/{name}: {', '.join(leaked)}")

    code_and_data: list[Path] = []
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if "node_modules" in path.parts or ".git" in path.parts:
            continue
        if path.suffix.lower() in SCAN_SUFFIXES:
            code_and_data.append(path)

    for path in code_and_data:
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        rel = path.relative_to(ROOT)
        for marker in FORBIDDEN_SOURCE_MARKERS:
            if marker in text:
                failures.append(f"internal source path marker {marker!r} referenced by {rel}")
        if path.suffix.lower() == ".csv" and "casting" in text.casefold():
            warnings.append(
                f"aggregate casting wording remains in public data: {rel}; review whether this statistic is intentionally public"
            )

    db_source = (ROOT / "api" / "_lib" / "db.mjs").read_text(encoding="utf-8")
    for field in FORBIDDEN_PUBLIC_FIELDS:
        token = f'"{field}"'
        if token in db_source:
            failures.append(f"server PUBLIC_FIELDS appears to include forbidden field {field!r}")

    syntax_targets = sorted(
        path for path in code_and_data if path.suffix.lower() in {".js", ".mjs"}
    )
    for path in syntax_targets:
        proc = subprocess.run(
            ["node", "--check", str(path)],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        if proc.returncode != 0:
            failures.append(
                f"JavaScript syntax check failed for {path.relative_to(ROOT)}: {proc.stderr.strip()}"
            )

    print("HĐHS public-site privacy smoke")
    print("==============================")
    for item in failures:
        print("FAIL ", item)
    for item in sorted(set(warnings)):
        print("WARN ", item)
    if not failures:
        print(
            "PASS  public CSV schemas contain only allowlisted fields; no 08A/08B source-path references; JS/MJS syntax is valid"
        )
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
