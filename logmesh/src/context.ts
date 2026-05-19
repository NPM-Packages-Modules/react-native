import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
  traceId: string;
  spanId?: string;
  userId?: string;
  [key: string]: unknown;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithContext<T>(ctx: RequestContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

export function getContext(): RequestContext | undefined {
  return storage.getStore();
}

export function patchContext(extra: Record<string, unknown>): void {
  const ctx = storage.getStore();
  if (ctx) Object.assign(ctx, extra);
}
