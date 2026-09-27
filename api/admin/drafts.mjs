import crypto from "node:crypto";
import { requireOwner } from "../_lib/auth.mjs";
import { database, ensureSchema, hashRow, listDrafts, validateDomainRow, validateRow } from "../_lib/db.mjs";
import { methodNotAllowed, readJson, sameOrigin, send } from "../_lib/http.mjs";

const CREATE_TABLES = new Set(["people.csv", "assignments.csv"]);
const OPERATIONS = new Set(["create", "update", "remove"]);

function fail(res, error) {
  const status = error.code === "23505" ? 409 : Number(error.status) || 500;
  const message = status >= 500
    ? "Không thể truy cập kho bản nháp lúc này."
    : error.code === "23505"
      ? "Bản ghi này đã có một nháp đang chờ."
      : error.message;
  return send(res, status, { error: status === 409 ? "conflict" : "request_failed", message });
}

function validateOperation(tableName, operation) {
  if (!OPERATIONS.has(operation)) {
    throw Object.assign(new Error("Loại thay đổi không hợp lệ."), { status: 400 });
  }
  if (operation === "create" && !CREATE_TABLES.has(tableName)) {
    throw Object.assign(new Error("Pha này chỉ cho phép tạo hồ sơ người và phân công."), { status: 400 });
  }
  if (operation === "remove" && tableName !== "assignments.csv") {
    throw Object.assign(new Error("Chỉ được gỡ phân công; hồ sơ người không bị xóa cứng."), { status: 400 });
  }
}

function draftColumns() {
  return "id, table_name, record_id, operation, base_hash, base_row, proposed_row, revision, status, created_at, updated_at, published_commit, published_at";
}

export default async function handler(req, res) {
  if (!requireOwner(req, res)) return;
  try {
    const sql = database();
    await ensureSchema(sql);
    if (req.method === "GET") {
      const drafts = await listDrafts(sql);
      return send(res, 200, { drafts });
    }
    if (req.method === "POST") {
      if (!sameOrigin(req)) return send(res, 403, { error: "bad_origin" });
      const body = await readJson(req);
      const tableName = String(body.tableName || "");
      const operation = String(body.operation || "update");
      validateOperation(tableName, operation);

      let baseRow;
      let proposedRow;
      if (operation === "create") {
        baseRow = {};
        proposedRow = validateDomainRow(tableName, validateRow(tableName, body.proposedRow));
      } else {
        baseRow = validateRow(tableName, body.baseRow);
        proposedRow = operation === "remove"
          ? baseRow
          : validateDomainRow(tableName, validateRow(tableName, body.proposedRow));
      }

      const recordId = String(body.recordId || proposedRow.id);
      if (!recordId || recordId !== proposedRow.id || (operation !== "create" && recordId !== baseRow.id)) {
        return send(res, 400, { error: "invalid_record", message: "ID của bản ghi không khớp." });
      }
      const baseHash = hashRow(baseRow);

      if (body.draftId) {
        const revision = Number(body.revision);
        if (!Number.isInteger(revision) || revision < 1) {
          return send(res, 400, { error: "invalid_revision", message: "Phiên bản nháp không hợp lệ." });
        }
        const result = await sql.query(
          `UPDATE hdhs_admin_drafts SET proposed_row = $1::jsonb, revision = revision + 1, updated_at = now() WHERE id = $2 AND revision = $3 AND base_hash = $4 AND operation = $5 AND table_name = $6 AND record_id = $7 AND status = 'pending' RETURNING ${draftColumns()}`,
          [JSON.stringify(proposedRow), String(body.draftId), revision, baseHash, operation, tableName, recordId]
        );
        if (!result.length) return send(res, 409, { error: "conflict", message: "Nháp đã đổi ở một tab khác. Tải lại rồi thử tiếp." });
        return send(res, 200, { draft: result[0] });
      }

      const existing = await sql.query(
        "SELECT id FROM hdhs_admin_drafts WHERE table_name = $1 AND record_id = $2 AND status = 'pending' LIMIT 1",
        [tableName, recordId]
      );
      if (existing.length) return send(res, 409, { error: "conflict", message: "Bản ghi này đã có nháp. Mở nháp hiện có để tiếp tục." });

      const id = crypto.randomUUID();
      const result = await sql.query(
        `INSERT INTO hdhs_admin_drafts(id, table_name, record_id, operation, base_hash, base_row, proposed_row) VALUES($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb) RETURNING ${draftColumns()}`,
        [id, tableName, recordId, operation, baseHash, JSON.stringify(baseRow), JSON.stringify(proposedRow)]
      );
      return send(res, 201, { draft: result[0] });
    }
    if (req.method === "DELETE") {
      if (!sameOrigin(req)) return send(res, 403, { error: "bad_origin" });
      const body = await readJson(req);
      const result = await sql.query(
        "UPDATE hdhs_admin_drafts SET status = 'discarded', updated_at = now() WHERE id = $1 AND revision = $2 AND status = 'pending' RETURNING id",
        [String(body.id || ""), Number(body.revision)]
      );
      if (!result.length) return send(res, 409, { error: "conflict", message: "Nháp đã đổi hoặc đã được xử lý." });
      return send(res, 200, { ok: true });
    }
    return methodNotAllowed(res, ["GET", "POST", "DELETE"]);
  } catch (error) {
    return fail(res, error);
  }
}
