import { OWNER_GITHUB_ID, authConfigured, clearAuthCookies, makeSessionCookie, stateMatches } from "../_lib/auth.mjs";
import { send } from "../_lib/http.mjs";

function queryValue(req, name) {
  const value = req.query?.[name];
  return Array.isArray(value) ? value[0] : String(value || "");
}

export default async function handler(req, res) {
  if (req.method !== "GET") return send(res, 405, { error: "method_not_allowed" }, { Allow: "GET" });
  if (!authConfigured() || !process.env.DATABASE_URL) {
    return send(res, 503, { error: "admin_not_configured", message: "Đăng nhập quản trị chưa được cấu hình." });
  }
  const code = queryValue(req, "code");
  const state = queryValue(req, "state");
  const providerError = queryValue(req, "error");
  if (providerError || !code || !stateMatches(req, state)) {
    res.setHeader("Set-Cookie", clearAuthCookies(req));
    res.statusCode = 302;
    res.setHeader("Location", "/admin/?login=failed");
    res.end();
    return;
  }
  try {
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.HDHS_OAUTH_CALLBACK_URL || "https://hdhs-dht.vercel.app/api/auth/callback"
      })
    });
    if (!tokenResponse.ok) throw new Error("github_token_exchange_failed");
    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) throw new Error("github_token_missing");
    const userResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: "Bearer " + tokenData.access_token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "hdhs-dht-admin" }
    });
    if (!userResponse.ok) throw new Error("github_identity_failed");
    const user = await userResponse.json();
    if (String(user.id) !== OWNER_GITHUB_ID) {
      res.setHeader("Set-Cookie", clearAuthCookies(req));
      return send(res, 403, { error: "not_owner", message: "Tài khoản này chỉ có quyền xem trang công khai." });
    }
    res.setHeader("Set-Cookie", [makeSessionCookie(req, user), ...clearAuthCookies(req).slice(1)]);
    res.statusCode = 302;
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Location", "/admin/");
    res.end();
  } catch {
    res.setHeader("Set-Cookie", clearAuthCookies(req));
    return send(res, 502, { error: "login_failed", message: "Không thể xác nhận tài khoản GitHub lúc này." });
  }
}