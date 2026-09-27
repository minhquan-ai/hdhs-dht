import { clearAuthCookies, verifySession } from "../_lib/auth.mjs";
import { sameOrigin, send } from "../_lib/http.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return send(res, 405, { error: "method_not_allowed" }, { Allow: "POST" });
  if (!sameOrigin(req)) return send(res, 403, { error: "bad_origin" });
  if (!verifySession(req)) return send(res, 401, { error: "unauthorized" });
  res.setHeader("Set-Cookie", clearAuthCookies(req));
  return send(res, 200, { ok: true });
}