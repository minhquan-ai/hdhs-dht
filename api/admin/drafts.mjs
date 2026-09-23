import crypto from "node:crypto";
import { requireOwner } from "../_lib/auth.mjs";
import { database, ensureSchema, hashRow, listDrafts, validateRow } from "../_lib/db.mjs";
import { methodNotAllowed, readJson, sameOrigin, send } from "../_lib/http.mjs";

function fail(res, error) {
  const status = Number(error.status) || 500;
  const message = status >= 500 ? "Không thể truy cập kho bản nháp lúc này." : error.message;
  return send(res, status, { error: status === 409 ? "conflict" : "request_failed", message });
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
      const baseRow = validateRow(tableName, body.baseRow);
      const proposedRow = validateRow(tableName, body.proposedRow);
      const recordId = String(body.recordId || "");
      if (!recordId || recordId !== baseRow.id || recordId !== proposedRow.id) {
        return send(res, 400, { error: "invalid_record", message: "ID của bản ghi không khớp." });
      }
      const baseHash = hashRow(baseRow);
      if (body.draftId) {
        const result = await sql.query(
          "UPDATE hdhs_admin_drafts SET proposed_row = $1::jsonb, revision = revision + 1, updated_at = now() WHERE id = $2 AND revision = $3 AND base_hash = $4 AND status = 'pending' RETURNING id, table_name, record_id, base_hash, base_row, proposed_row, revision, status, created_at, updated_at",
          [JSON.stringify(proposedRow), String(body.draftId), Number(body.revision), baseHash]
        );
        if (!result.length) return send(res, 409, { error: "conflict", message: "Nháp đã đổi ở một tab khác. Tải lại rồi thử tiếp." });
        return send(res, 200, { draft: result[0] });
      }
      const existing = await sql.query("SELECT id FROM hdhs_admin_drafts WHERE table_name = $1 AND record_id = $2 AND status = 'pending' LIMIT 1", [tableName, recordId]);
      if (existing.length) return send(res, 409, { error: "conflict", message: "Bản ghi này đã có nháp. Mở nháp hiện có để tiếp tục." });
      const id = crypto.randomUUID();
      const result = await sql.query(
        "INSERT INTO hdhs_admin_drafts(id, table_name, record_id, base_hash, base_row, proposed_row) VALUES($1,$2,$3,$4,$5::jsonb,$6::jsonb) RETURNING id, table_name, record_id, base_hash, base_row, proposed_row, revision, status, created_at, updated_at",
        [id, tableName, recordId, baseHash, JSON.stringify(baseRow), JSON.stringify(proposedRow)]
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