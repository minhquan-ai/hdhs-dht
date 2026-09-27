import { requireOwner } from "../_lib/auth.mjs";
import { database, ensureSchema } from "../_lib/db.mjs";
import { readJson, sameOrigin, send } from "../_lib/http.mjs";

export default async function handler(req, res) {
  if (!requireOwner(req, res)) return;
  if (req.method !== "POST") return send(res, 405, { error: "method_not_allowed" }, { Allow: "POST" });
  if (!sameOrigin(req)) return send(res, 403, { error: "bad_origin" });
  try {
    const body = await readJson(req);
    const commit = String(body.commit || "").trim();
    const revisions = Array.isArray(body.drafts) ? body.drafts : [];
    if (!/^[a-f0-9]{40,64}$/i.test(commit) || !revisions.length || revisions.length > 100) {
      return send(res, 400, { error: "invalid_publish_receipt", message: "Cần mã commit và danh sách nháp đã triển khai." });
    }
    const sql = database();
    await ensureSchema(sql);
    const marked = [];
    for (const item of revisions) {
      const result = await sql.query(
        "UPDATE hdhs_admin_drafts SET status = 'published', published_commit = $1, published_at = now(), updated_at = now() WHERE id = $2 AND revision = $3 AND status = 'pending' RETURNING id",
        [commit, String(item.id || ""), Number(item.revision)]
      );
      if (result.length) marked.push(result[0].id);
    }
    return send(res, 200, { ok: true, marked });
  } catch {
    return send(res, 503, { error: "database_unavailable", message: "Không thể cập nhật trạng thái bản nháp." });
  }
}