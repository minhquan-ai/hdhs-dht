# Phase 1 Public Site — Privacy Audit 2026-09-27

Status: **PASS WITH ONE REVIEW WARNING**

## Scope

Read-only review of the local Phase 1 public site and owner-only draft admin path. No public data was changed and nothing was deployed.

## Verified controls

- Public CSV schemas are limited to the six intended tables.
- `people.csv` exposes only `id,name,class_name`.
- `assignments.csv` exposes only assignment/role/status/sort fields.
- Server `PUBLIC_FIELDS` does not allow phone, date of birth, gender, email, address or note fields.
- `validateRow()` rejects fields outside the server allowlist.
- Owner draft writes require an authenticated owner session.
- POST/DELETE draft mutations require same-origin checks.
- Hard delete of a person is not supported by the current draft operation contract; remove is limited to assignments.
- No public code/data file references the internal `08A - Dữ liệu nhân sự` or `08B - Dữ liệu nội bộ` paths.
- JavaScript and MJS files pass `node --check`.

## Automated smoke

Run:

```bash
python3 scripts/privacy_smoke.py
```

Observed overnight result:

```text
WARN  aggregate casting wording remains in public data: database/subunits.csv; review whether this statistic is intentionally public
PASS  public CSV schemas contain only allowlisted fields; no 08A/08B source-path references; JS/MJS syntax is valid
```

## Review warning

`database/subunits.csv` currently contains aggregate recruitment wording derived from casting, including counts such as “29 đăng ký casting”, “26 đăng ký casting” and “21 đăng ký casting”.

This does **not** expose applicant names, phone numbers, dates of birth or application notes. It is therefore not a direct PII leak. However it is derived from casting data, while the project policy treats casting data as internal unless deliberately approved for public use.

Decision needed before the next publish:

- **Keep** the aggregate counts only if the school/project explicitly wants recruitment statistics public; or
- **replace** those summaries with non-numeric public status wording such as “Đang tuyển” / a general club description.

Do not silently infer that aggregate casting counts are approved just because they are non-identifying.

## Release recommendation

This audit alone is not a deployment approval. Before publishing the current Phase 1 UI:

1. decide the aggregate casting-count policy;
2. run this privacy smoke again;
3. run the public-route/asset smoke;
4. review the actual diff;
5. keep source-of-truth reconciliation with the 05 CSV master;
6. deploy only public fields.
