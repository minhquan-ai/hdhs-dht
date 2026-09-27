#!/usr/bin/env python3
from __future__ import annotations

import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "database"
EXPECTED = {
    "units.csv": ["id", "parent_id", "name", "kind", "sort_order", "summary", "status"],
    "subunits.csv": ["id", "parent_id", "name", "kind", "sort_order", "summary", "status"],
    "academic_teams.csv": ["id", "parent_id", "name", "kind", "sort_order", "summary", "status"],
    "roles.csv": ["id", "unit_id", "title", "sort_order", "summary"],
    "people.csv": ["id", "name", "class_name"],
    "assignments.csv": ["id", "person_id", "unit_id", "role_id", "role_label", "status", "sort_order"],
}
SENSITIVE_HEADERS = {"phone", "birth_date", "gender", "email", "address", "note", "notes"}
PHONE = re.compile(r"(?<!\d)(?:0|\+84)[\s.-]?(?:\d[\s.-]?){8}\d(?!\d)")
DATE = re.compile(r"\b\d{1,2}[/.-]\d{1,2}[/.-](?:19|20)\d{2}\b")
EMAIL = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I)

def main() -> int:
    errors: list[str] = []
    for name, expected in EXPECTED.items():
        path = DB / name
        if not path.exists():
            errors.append(f"thiếu {name}")
            continue
        text = path.read_text(encoding="utf-8-sig")
        with path.open(encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            headers = reader.fieldnames or []
        if headers != expected:
            errors.append(f"{name}: header public lệch schema: {headers}")
        if SENSITIVE_HEADERS.intersection(headers):
            errors.append(f"{name}: có cột nhạy cảm")
        if PHONE.search(text):
            errors.append(f"{name}: phát hiện mẫu số điện thoại")
        if DATE.search(text):
            errors.append(f"{name}: phát hiện ngày cá nhân")
        if EMAIL.search(text):
            errors.append(f"{name}: phát hiện email")
        if "casting" in text.casefold():
            errors.append(f"{name}: còn dữ liệu casting trong public database")

    source_text = "\n".join(
        p.read_text(encoding="utf-8", errors="ignore")
        for p in [
            ROOT / "api/_lib/db.mjs",
            ROOT / "api/admin/drafts.mjs",
            ROOT / "api/admin/drafts-published.mjs",
        ]
    )
    for token in ("phone", "birth_date", "gender", "email", "address", "notes"):
        if f'"{token}"' in source_text.split("export const PUBLIC_FIELDS", 1)[-1].split("};", 1)[0]:
            errors.append(f"PUBLIC_FIELDS chứa trường nhạy cảm: {token}")
    drafts = (ROOT / "api/admin/drafts.mjs").read_text(encoding="utf-8")
    if "requireOwner(req, res)" not in drafts or "sameOrigin(req)" not in drafts:
        errors.append("API nháp thiếu owner auth hoặc same-origin")
    for forbidden_ref in ("08A - Dữ liệu nhân sự", "08B - Dữ liệu nội bộ"):
        for path in ROOT.rglob("*"):
            if path.is_file() and ".git" not in path.parts and path.suffix.lower() in {".js", ".mjs", ".html", ".css", ".csv", ".json"}:
                if forbidden_ref in path.read_text(encoding="utf-8", errors="ignore"):
                    errors.append(f"{path.relative_to(ROOT)} tham chiếu nguồn nội bộ {forbidden_ref}")
                    break

    if errors:
        for error in errors:
            print("BLOCK:", error)
        return 1
    print("PASS: privacy smoke; public database chỉ có trường cho phép, không PII/casting")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
