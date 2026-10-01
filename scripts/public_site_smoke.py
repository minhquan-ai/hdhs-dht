#!/usr/bin/env python3
from __future__ import annotations

import csv
import threading
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATABASE = ROOT / "database"


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass


def rows(name: str) -> list[dict[str, str]]:
    with (DATABASE / name).open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def unique_ids(name: str, items: list[dict[str, str]], failures: list[str]) -> set[str]:
    values = [str(item.get("id", "")).strip() for item in items]
    missing = [index + 2 for index, value in enumerate(values) if not value]
    if missing:
        failures.append(f"{name}: missing id on CSV lines {missing}")
    duplicates = sorted({value for value in values if value and values.count(value) > 1})
    if duplicates:
        failures.append(f"{name}: duplicate id(s): {', '.join(duplicates)}")
    return {value for value in values if value}


def check_references(failures: list[str]) -> None:
    units = rows("units.csv")
    subunits = rows("subunits.csv")
    academic = rows("academic_teams.csv")
    roles = rows("roles.csv")
    people = rows("people.csv")
    assignments = rows("assignments.csv")

    unit_ids = unique_ids("units.csv", units, failures)
    subunit_ids = unique_ids("subunits.csv", subunits, failures)
    academic_ids = unique_ids("academic_teams.csv", academic, failures)
    role_ids = unique_ids("roles.csv", roles, failures)
    person_ids = unique_ids("people.csv", people, failures)
    unique_ids("assignments.csv", assignments, failures)

    all_units = unit_ids | subunit_ids | academic_ids

    for filename, records in (
        ("units.csv", units),
        ("subunits.csv", subunits),
        ("academic_teams.csv", academic),
    ):
        for line, item in enumerate(records, start=2):
            parent = str(item.get("parent_id", "")).strip()
            if parent and parent not in all_units:
                failures.append(f"{filename}:{line}: missing parent_id target {parent!r}")

    for line, item in enumerate(roles, start=2):
        unit = str(item.get("unit_id", "")).strip()
        if unit and unit not in all_units:
            failures.append(f"roles.csv:{line}: unit_id {unit!r} does not exist")

    for line, item in enumerate(assignments, start=2):
        person = str(item.get("person_id", "")).strip()
        unit = str(item.get("unit_id", "")).strip()
        role = str(item.get("role_id", "")).strip()
        if person not in person_ids:
            failures.append(f"assignments.csv:{line}: person_id {person!r} does not exist")
        if unit not in all_units:
            failures.append(f"assignments.csv:{line}: unit_id {unit!r} does not exist")
        if role and role not in role_ids:
            failures.append(f"assignments.csv:{line}: role_id {role!r} does not exist")


def fetch(base: str, route: str) -> tuple[int, bytes]:
    url = urllib.parse.urljoin(base, route)
    try:
        with urllib.request.urlopen(url, timeout=5) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.read()


def main() -> int:
    failures: list[str] = []
    check_references(failures)

    handler = lambda *args, **kwargs: QuietHandler(*args, directory=str(ROOT), **kwargs)
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f"http://127.0.0.1:{server.server_address[1]}/"

    routes = [
        "/",
        "/index.html",
        "/styles.css",
        "/people/",
        "/people/index.html",
        "/people/people.css",
        "/people/people.js",
        "/admin/",
        "/admin/index.html",
        "/admin/admin.css",
        "/admin/admin.js",
        "/database/units.csv",
        "/database/subunits.csv",
        "/database/academic_teams.csv",
        "/database/roles.csv",
        "/database/people.csv",
        "/database/assignments.csv",
        "/manifest.webmanifest",
    ]

    try:
        for route in routes:
            status, body = fetch(base, route)
            if status != 200:
                failures.append(f"{route}: expected HTTP 200, got {status}")
            elif not body:
                failures.append(f"{route}: returned an empty body")
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)

    print("HĐHS public-site route/data smoke")
    print("=================================")
    for item in failures:
        print("FAIL ", item)
    if not failures:
        print(
            f"PASS  {len(routes)} static routes/assets responded; public CSV IDs and references are consistent"
        )
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
