from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
CORE = ROOT / "01 - Lõi Pha 1"
required = [
    CORE / "01 - Phạm vi Pha 1.md",
    CORE / "02 - Mô hình dữ liệu.md",
    CORE / "03 - Nguồn dữ liệu.md",
    CORE / "04 - Quyền riêng tư.md",
    CORE / "05 - Kiểm tra lõi.md",
    CORE / "so-do-du-lieu.json",
    ROOT / "index.html",
    ROOT / "app.js",
    ROOT / "people/index.html",
    ROOT / "people/people.js",
    ROOT / "admin/index.html",
    ROOT / "admin/admin.js",
    ROOT / "api/admin/drafts.mjs",
]
for path in required:
    assert path.is_file(), f"thiếu hạng mục Pha 1: {path.relative_to(ROOT)}"

schema = json.loads((CORE / "so-do-du-lieu.json").read_text(encoding="utf-8"))
public = set(schema["publicWhitelist"])
private = set(schema["privateFields"])
assert public.isdisjoint(private), "trường public/private bị trùng"
assert {"name", "class_name", "unit", "role"}.issubset(public)
assert {"phone", "date_of_birth", "casting", "internal_note"}.issubset(private)
print("PASS kiểm tra lõi và đủ màn hình Pha 1")