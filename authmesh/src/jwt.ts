import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function b64urlJson(obj: object): string {
  return b64url(Buffer.from(JSON.stringify(obj), "utf8"));
}

export function signJwtHS256(payload: Record<string, unknown>, secret: string, expiresInSec: number): string {
  const header = { alg: "HS256", typ: "JWT" } as const;
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + expiresInSec };
  const h = b64urlJson(header);
  const p = b64urlJson(body);
  const sig = createHmac("sha256", secret).update(`${h}.${p}`).digest();
  return `${h}.${p}.${b64url(sig)}`;
}

export function verifyJwtHS256<T extends Record<string, unknown>>(
  token: string,
  secret: string,
): { ok: true; payload: T } | { ok: false; error: string } {
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, error: "malformed" };
  const [h, p, s] = parts;
  if (!h || !p || !s) return { ok: false, error: "malformed" };
  const expected = createHmac("sha256", secret).update(`${h}.${p}`).digest();
  let sigBuf: Buffer;
  try {
    sigBuf = Buffer.from(s, "base64url");
  } catch {
    return { ok: false, error: "bad-signature-encoding" };
  }
  if (sigBuf.length !== expected.length || !timingSafeEqual(sigBuf, expected)) {
    return { ok: false, error: "bad-signature" };
  }
  let payload: T & { exp?: number };
  try {
    payload = JSON.parse(Buffer.from(p, "base64url").toString("utf8")) as T & { exp?: number };
  } catch {
    return { ok: false, error: "bad-payload" };
  }
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === "number" && payload.exp < now) return { ok: false, error: "expired" };
  return { ok: true, payload };
}

/** Random refresh token (opaque). */
export function opaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}
