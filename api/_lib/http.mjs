export function send(res, status, payload, extraHeaders = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, private");
  res.setHeader("X-Content-Type-Options", "nosniff");
  for (const [name, value] of Object.entries(extraHeaders)) res.setHeader(name, value);
  res.end(JSON.stringify(payload));
}

export async function readJson(req, maxBytes = 32_000) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > maxBytes) throw Object.assign(new Error("Yêu cầu quá lớn"), { status: 413 });
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  try { return JSON.parse(raw || "{}"); }
  catch { throw Object.assign(new Error("JSON không hợp lệ"), { status: 400 }); }
}

export function sameOrigin(req) {
  const origin = req.headers.origin;
  const allowed = process.env.HDHS_SITE_ORIGIN || "https://hdhs-dht.vercel.app";
  if (!origin || origin !== allowed) return false;
  const fetchSite = req.headers["sec-fetch-site"];
  return !fetchSite || fetchSite === "same-origin" || fetchSite === "none";
}

export function methodNotAllowed(res, methods) {
  send(res, 405, { error: "method_not_allowed" }, { Allow: methods.join(", ") });
}