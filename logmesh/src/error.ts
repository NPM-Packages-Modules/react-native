import { createHash } from "node:crypto";
import type { SerializedError } from "./types.js";

export function serializeError(err: unknown, depth = 0): SerializedError | undefined {
  if (err === undefined || err === null) return undefined;
  if (depth > 5) {
    return { name: "Error", message: "[max depth]" };
  }
  if (err instanceof Error) {
    const out: SerializedError = {
      name: err.name || "Error",
      message: err.message,
    };
    if (err.stack) out.stack = err.stack.split("\n").map((s) => s.trim());
    const anyErr = err as unknown as { code?: unknown; cause?: unknown };
    if (typeof anyErr.code === "string") out.code = anyErr.code;
    if (anyErr.cause !== undefined) {
      const cause = serializeError(anyErr.cause, depth + 1);
      if (cause) out.cause = cause;
    }
    return out;
  }
  if (typeof err === "object") {
    return { name: "Object", message: JSON.stringify(err) };
  }
  return { name: typeof err, message: String(err) };
}

export function errorFingerprint(err: SerializedError | undefined): string | undefined {
  if (!err) return undefined;
  const sites = (err.stack ?? [])
    .filter((line) => /\sat\s/.test(line))
    .slice(0, 3)
    .map((line) => line.replace(/[A-Z]:\\|\/.+\//g, "").replace(/:\d+:\d+\)?$/, ""))
    .join("|");
  const key = `${err.name}:${err.message.slice(0, 120)}:${sites}`;
  return createHash("sha1").update(key).digest("hex").slice(0, 12);
}
