import crypto from "node:crypto";
import { authConfigured, githubLoginUrl, stateCookie } from "../_lib/auth.mjs";
import { send } from "../_lib/http.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET") return send(res, 405, { error: "method_not_allowed" }, { Allow: "GET" });
  if (!authConfigured() || !process.env.DATABASE_URL) {
    return send(res, 503, { error: "admin_not_configured", message: "Đăng nhập quản trị chưa được cấu hình." });
  }
  const state = crypto.randomBytes(32).toString("base64url");
  res.setHeader("Set-Cookie", stateCookie(req, state));
  res.statusCode = 302;
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Location", githubLoginUrl(state));
  res.end();
}