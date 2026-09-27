#!/usr/bin/env python3
from __future__ import annotations

import csv
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "database"

def rows(name: str) -> list[dict[str, str]]:
    with (DB / name).open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))

def duplicate_ids(items):
    seen, duplicates = set(), set()
    for row in items:
        value = row.get("id", "").strip()
        if not value or value in seen:
            duplicates.add(value or "<blank>")
        seen.add(value)
    return duplicates

def main() -> int:
    errors: list[str] = []
    units = rows("units.csv") + rows("subunits.csv") + rows("academic_teams.csv")
    roles, people, assignments = rows("roles.csv"), rows("people.csv"), rows("assignments.csv")
    unit_ids = {x["id"] for x in units}
    role_by_id = {x["id"]: x for x in roles}
    people_ids = {x["id"] for x in people}

    for label, items in (("unit", units), ("role", roles), ("person", people), ("assignment", assignments)):
        dup = duplicate_ids(items)
        if dup:
            errors.append(f"ID {label} trùng/rỗng: {sorted(dup)}")

    for unit in units:
        parent = unit.get("parent_id", "").strip()
        if parent and parent not in unit_ids:
            errors.append(f"{unit['id']}: parent_id không tồn tại: {parent}")
    for role in roles:
        if role.get("unit_id") not in unit_ids:
            errors.append(f"{role['id']}: unit_id không tồn tại")
    for item in assignments:
        if item.get("person_id") not in people_ids:
            errors.append(f"{item['id']}: person_id không tồn tại")
        if item.get("unit_id") not in unit_ids:
            errors.append(f"{item['id']}: unit_id không tồn tại")
        role_id = item.get("role_id", "")
        if role_id:
            role = role_by_id.get(role_id)
            if not role:
                errors.append(f"{item['id']}: role_id không tồn tại")
            elif role.get("unit_id") != item.get("unit_id"):
                errors.append(f"{item['id']}: role không thuộc đúng unit")

    required = [
        "index.html", "styles.css", "app.js", "people/index.html", "people/people.css",
        "people/people.js", "admin/index.html", "admin/admin.css", "admin/admin.js",
        "api/_lib/auth.mjs", "api/_lib/db.mjs", "api/_lib/http.mjs",
        "api/admin/drafts.mjs", "api/admin/drafts-published.mjs",
        "api/auth/login.mjs", "api/auth/callback.mjs", "api/auth/logout.mjs", "api/auth/session.mjs",
    ]
    for rel in required:
        if not (ROOT / rel).is_file():
            errors.append(f"thiếu route/asset: {rel}")

    people_html = (ROOT / "people/index.html").read_text(encoding="utf-8")
    people_js = (ROOT / "people/people.js").read_text(encoding="utf-8")
    for filter_id in ("unit-filter", "class-filter", "role-filter"):
        if f'id="{filter_id}"' not in people_html:
            errors.append(f"danh bạ thiếu bộ lọc {filter_id}")
        if f'$("#{filter_id}")' not in people_js:
            errors.append(f"people.js chưa xử lý bộ lọc {filter_id}")

    js_files = [p for p in ROOT.rglob("*") if p.is_file() and p.suffix in {".js", ".mjs"}]
    for path in js_files:
        result = subprocess.run(["node", "--check", str(path)], capture_output=True, text=True)
        if result.returncode:
            errors.append(f"syntax {path.relative_to(ROOT)}: {result.stderr.strip()}")

    if errors:
        for error in errors:
            print("BLOCK:", error)
        return 1
    print(f"PASS: public site smoke; {len(required)} route/asset, quan hệ dữ liệu và JS/MJS hợp lệ")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
