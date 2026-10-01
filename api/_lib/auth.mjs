import crypto from "node:crypto";
import { send } from "./http.mjs";

export const OWNER_GITHUB_ID = "221583146";
export const SESSION_COOKIE = "hdhs_owner_session";
export const STATE_COOKIE = "hdhs_oauth_state";
const SESSION_SECONDS = 4 * 60 * 60;
const STATE_SECONDS = 10 * 60;

function cookieSecure(req) {
  return process.env.NODE_ENV === "production" || req.headers["x-forwarded-proto"] === "https";
}

function cookieHeader(name, value, maxAge, secure) {
  return name + "=" + value + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=" + maxAge + (secure ? "; Secure" : "");
}

function parseCookies(req) {
  const result = {};
  for (const part of String(req.headers.cookie || "").split(";")) {
    const index = part.indexOf("=");
    if (index > 0) result[part.slice(0, index).trim()] = part.slice(index + 1).trim();
  }
  return result;
}

function sign(value) {
  const secret = process.env.HDHS_SESSION_SECRET;
  if (!secret) throw new Error("session_not_configured");
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function authConfigured() {
  return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET && process.env.HDHS_SESSION_SECRET);
}

export function githubLoginUrl(state) {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID || "",
    redirect_uri: process.env.HDHS_OAUTH_CALLBACK_URL || "https://hdhs-dht.vercel.app/api/auth/callback",
    scope: "read:user",
    state,
    allow_signup: "false"
  });
  return "https://github.com/login/oauth/authorize?" + params.toString();
}

export function stateCookie(req, state) {
  return cookieHeader(STATE_COOKIE, state, STATE_SECONDS, cookieSecure(req));
}

export function clearAuthCookies(req) {
  const secure = cookieSecure(req);
  return [
    cookieHeader(SESSION_COOKIE, "", 0, secure),
    cookieHeader(STATE_COOKIE, "", 0, secure)
  ];
}

export function makeSessionCookie(req, user) {
  const payload = Buffer.from(JSON.stringify({
    uid: String(user.id),
    login: String(user.login || ""),
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS
  })).toString("base64url");
  const value = payload + "." + sign(payload);
  return cookieHeader(SESSION_COOKIE, value, SESSION_SECONDS, cookieSecure(req));
}

export function verifySession(req) {
  const value = parseCookies(req)[SESSION_COOKIE];
  if (!value || !process.env.HDHS_SESSION_SECRET) return null;
  const dot = value.lastIndexOf(".");
  if (dot < 1) return null;
  const payload = value.slice(0, dot);
  const signature = value.slice(dot + 1);
  if (!safeEqual(signature, sign(payload))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (String(session.uid) !== OWNER_GITHUB_ID || Number(session.exp) <= Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch { return null; }
}

export function requireOwner(req, res) {
  if (!authConfigured()) {
    send(res, 503, { error: "auth_not_configured", message: "Đăng nhập quản trị chưa được cấu hình." });
    return null;
  }
  const session = verifySession(req);
  if (!session) {
    send(res, 401, { error: "unauthorized", message: "Bạn cần đăng nhập bằng tài khoản được cấp quyền." });
    return null;
  }
  return session;
}

export function githubStateFromRequest(req) {
  return parseCookies(req)[STATE_COOKIE] || "";
}

export function stateMatches(req, returnedState) {
  const cookieState = githubStateFromRequest(req);
  return Boolean(cookieState && returnedState && safeEqual(cookieState, returnedState));
}