type FailBucket = { count: number; resetAt: number };

const failBuckets = new Map<string, FailBucket>();

export function recordFailedLogin(
  ip: string,
  windowMs: number,
  maxFails: number,
): { suspicious: boolean; count: number } {
  const now = Date.now();
  let b = failBuckets.get(ip);
  if (!b || now > b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    failBuckets.set(ip, b);
  }
  b.count += 1;
  return { suspicious: b.count >= maxFails, count: b.count };
}

export function resetFailedLogins(ip: string): void {
  failBuckets.delete(ip);
}
