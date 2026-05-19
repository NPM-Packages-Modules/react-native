const DEFAULT_REDACT_KEYS = [
  "password",
  "pass",
  "passwd",
  "secret",
  "token",
  "apikey",
  "api_key",
  "authorization",
  "auth",
  "cookie",
  "set-cookie",
  "session",
  "ssn",
  "creditcard",
  "credit_card",
  "cvv",
];

export const DEFAULT_REDACT_VALUE = "[REDACTED]";

export function buildRedactor(extraKeys: string[] = []): (input: unknown) => unknown {
  const keys = new Set(
    [...DEFAULT_REDACT_KEYS, ...extraKeys].map((k) => k.toLowerCase()),
  );

  function redact(value: unknown, seen: WeakSet<object>): unknown {
    if (value === null || typeof value !== "object") return value;
    if (seen.has(value as object)) return "[Circular]";
    seen.add(value as object);
    if (Array.isArray(value)) return value.map((v) => redact(v, seen));
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (keys.has(k.toLowerCase())) {
        out[k] = DEFAULT_REDACT_VALUE;
      } else {
        out[k] = redact(v, seen);
      }
    }
    return out;
  }

  return (input) => redact(input, new WeakSet());
}
