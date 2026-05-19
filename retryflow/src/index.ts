export function retryflow<T extends (...args: unknown[]) => Promise<unknown>>(fn: T): T {
  return fn;
}
