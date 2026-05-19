export function cachepilot<T extends (...args: unknown[]) => unknown>(fn: T): T {
  return fn;
}
