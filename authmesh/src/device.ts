import { createHash } from "node:crypto";

/** Derive a stable pseudo-device id from headers (MVP — prefer client-side device ids in production). */
export function deviceIdFromRequest(headers: {
  "user-agent"?: string | undefined;
  "accept-language"?: string | undefined;
}): string {
  const ua = headers["user-agent"] ?? "";
  const al = headers["accept-language"] ?? "";
  return createHash("sha256").update(`${ua}|${al}`).digest("hex").slice(0, 24);
}
