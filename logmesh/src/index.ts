/** Structured logging for React Native. */
export type LogLevel = "debug" | "info" | "warn" | "error";

export function createLogger(tag = "app") {
  return {
    debug: (msg: string, meta?: unknown) => console.debug(`[${tag}]`, msg, meta),
    info: (msg: string, meta?: unknown) => console.info(`[${tag}]`, msg, meta),
    warn: (msg: string, meta?: unknown) => console.warn(`[${tag}]`, msg, meta),
    error: (msg: string, meta?: unknown) => console.error(`[${tag}]`, msg, meta),
  };
}

export const log = createLogger();

export function connect(_root: unknown, options?: { tag?: string }) {
  return createLogger(options?.tag ?? "app");
}

export const logmesh = { connect, createLogger, log };
