import { authConfigured, verifySession } from "../_lib/auth.mjs";
import { send } from "../_lib/http.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET") return send(res, 405, { error: "method_not_allowed" }, { Allow: "GET" });
  const configured = authConfigured() && Boolean(process.env.DATABASE_URL);
  if (!configured) return send(res, 200, { configured: false, authenticated: false });
  const session = verifySession(req);
  if (!session) return send(res, 200, { configured: true, authenticated: false });
  return send(res, 200, { configured: true, authenticated: true, user: { login: session.login } });
}