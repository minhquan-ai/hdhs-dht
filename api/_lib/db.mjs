import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

export const PUBLIC_FIELDS = {
  "units.csv": ["id", "parent_id", "name", "kind", "sort_order", "summary", "status"],
  "subunits.csv": ["id", "parent_id", "name", "kind", "sort_order", "summary", "status"],
  "academic_teams.csv": ["id", "parent_id", "name", "kind", "sort_order", "summary", "status"],
  "roles.csv": ["id", "unit_id", "title", "sort_order", "summary"],
  "people.csv": ["id", "name", "class_name"],
  "assignments.csv": ["id", "person_id", "unit_id", "role_id", "role_label", "status", "sort_order"]
};
export const TABLE_NAMES = Object.keys(PUBLIC_FIELDS);

let cachedSql;
let schemaReady;

export function database() {
  if (!process.env.DATABASE_URL) throw Object.assign(new Error("database_not_configured"), { status: 503 });
  if (!cachedSql) cachedSql = neon(process.env.DATABASE_URL);
  return cachedSql;
}

export async function ensureSchema(sql = database()) {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql.query("CREATE TABLE IF NOT EXISTS hdhs_admin_drafts (id text PRIMARY KEY, table_name text NOT NULL, record_id text NOT NULL, operation text NOT NULL DEFAULT 'update', base_hash text NOT NULL, base_row jsonb NOT NULL, proposed_row jsonb NOT NULL, revision integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'pending', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), published_commit text, published_at timestamptz)");
      await sql.query("ALTER TABLE hdhs_admin_drafts ADD COLUMN IF NOT EXISTS operation text NOT NULL DEFAULT 'update'");
      await sql.query("CREATE UNIQUE INDEX IF NOT EXISTS hdhs_admin_one_pending_row ON hdhs_admin_drafts(table_name, record_id) WHERE status = 'pending'");
      await sql.query("CREATE INDEX IF NOT EXISTS hdhs_admin_drafts_updated ON hdhs_admin_drafts(status, updated_at DESC)");
    })().catch(error => { schemaReady = null; throw error; });
  }
  return schemaReady;
}

export function validateRow(tableName, row) {
  const fields = PUBLIC_FIELDS[tableName];
  if (!fields || !row || typeof row !== "object" || Array.isArray(row)) throw Object.assign(new Error("Bảng hoặc bản ghi không hợp lệ"), { status: 400 });
  const keys = Object.keys(row);
  if (keys.some(key => !fields.includes(key))) throw Object.assign(new Error("Bản ghi có trường không được công khai"), { status: 400 });
  if (typeof row.id !== "string" || !/^[a-z0-9][a-z0-9-]{0,119}$/.test(row.id.trim())) {
    throw Object.assign(new Error("ID phải ổn định và chỉ gồm chữ thường, số hoặc dấu gạch nối"), { status: 400 });
  }
  const clean = {};
  for (const key of fields) {
    const value = row[key] == null ? "" : row[key];
    if (typeof value !== "string" && typeof value !== "number") throw Object.assign(new Error("Giá trị trường không hợp lệ"), { status: 400 });
    const text = String(value).trim();
    if (text.length > 1200) throw Object.assign(new Error("Một trường vượt quá độ dài cho phép"), { status: 400 });
    clean[key] = text;
  }
  return clean;
}

export function validateDomainRow(tableName, row) {
  if (tableName === "people.csv" && !row.name) {
    throw Object.assign(new Error("Tên người không được để trống."), { status: 400 });
  }
  if (tableName === "assignments.csv") {
    if (!row.person_id || !row.unit_id || (!row.role_id && !row.role_label)) {
      throw Object.assign(new Error("Phân công cần có người, đơn vị và chức danh."), { status: 400 });
    }
    if (/casting/i.test(row.status) || /casting/i.test(row.role_label)) {
      throw Object.assign(new Error("Dữ liệu casting không được tạo thành phân công công khai."), { status: 400 });
    }
  }
  return row;
}

export async function listDrafts(sql = database()) {
  await ensureSchema(sql);
  return sql.query("SELECT id, table_name, record_id, operation, base_hash, base_row, proposed_row, revision, status, created_at, updated_at, published_commit, published_at FROM hdhs_admin_drafts WHERE status = 'pending' ORDER BY updated_at DESC");
}

export function hashRow(row) {
  const stable = Object.fromEntries(Object.keys(row).sort().map(key => [key, String(row[key] ?? "")]));
  return crypto.createHash("sha256").update(JSON.stringify(stable)).digest("hex");
}
