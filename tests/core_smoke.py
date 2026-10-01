from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

required = [
    ROOT / "core" / "PHASE1.md",
    ROOT / "core" / "MODEL.md",
    ROOT / "core" / "SOURCES.md",
    ROOT / "core" / "PRIVACY.md",
    ROOT / "core" / "VALIDATION.md",
    ROOT / "core" / "schema.json",
]
for p in required:
    assert p.exists(), f"missing core file: {p.name}"

forbidden = [
    "index.html", "app.js", "data.js", "styles.css", "package.json",
    "vercel.json", "manifest.webmanifest", "sw.js", "_preview",
    "admin", "api", "people", "database",
]
for name in forbidden:
    assert not (ROOT / name).exists(), f"web artifact returned too early: {name}"

schema = json.loads((ROOT / "core" / "schema.json").read_text(encoding="utf-8"))
public = set(schema["publicWhitelist"])
private = set(schema["privateFields"])
assert public.isdisjoint(private), "public/private fields overlap"
assert {"name", "class_name", "unit", "role"}.issubset(public)
assert {"phone", "date_of_birth", "casting", "internal_note"}.issubset(private)

print("PASS phase1 core smoke")
