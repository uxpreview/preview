// uxpreview access gate. Drop this file at the root of a project repo.
// Requires two environment variables on the Vercel project:
//   AUTH_SECRET  - the same value used by the hub
//   PROJECT_ID   - this project's subdomain label, e.g. "open-search"
//
// Unauthenticated visitors are bounced to the hub. A valid session cookie only
// passes if it was issued for THIS project, so one client's code can never open
// another client's project.

export const config = { matcher: "/:path*" };

const enc = new TextEncoder();
const COOKIE_NAME = "__Secure-uxp";
const HUB = "https://uxpreview.com/";

function readCookie(header, name) {
  if (!header) return null;
  for (const part of header.split(/; */)) {
    const i = part.indexOf("=");
    if (i > -1 && part.slice(0, i) === name) return part.slice(i + 1);
  }
  return null;
}

function b64urlToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function verifyToken(token, secret) {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlToBytes(sig),
      enc.encode(payload)
    );
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(b64urlToBytes(payload)));
    if (!data || typeof data.exp !== "number") return null;
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function middleware(request) {
  const secret = process.env.AUTH_SECRET;
  const projectId = process.env.PROJECT_ID;
  const cookie = readCookie(request.headers.get("cookie"), COOKIE_NAME);
  const data = secret ? await verifyToken(cookie, secret) : null;
  if (data && data.p === projectId) return; // authorized -> serve normally
  return Response.redirect(HUB, 302);
}
