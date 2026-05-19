import { randomBytes } from "node:crypto";
import { runWithContext, getContext } from "./context.js";
import type { Logger } from "./logger.js";

type IncomingMessageLike = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
};
type ServerResponseLike = {
  statusCode: number;
  on(event: "finish", cb: () => void): void;
  setHeader(name: string, value: string): void;
};

export interface ExpressLoggerOptions {
  logger: Logger;
  traceHeader?: string;
  exposeTraceHeader?: boolean;
  level?: "debug" | "info";
  ignore?: (req: IncomingMessageLike) => boolean;
}

export function expressLogger(
  options: ExpressLoggerOptions,
): (req: IncomingMessageLike, res: ServerResponseLike, next: () => void) => void {
  const {
    logger,
    traceHeader = "x-trace-id",
    exposeTraceHeader = true,
    level = "info",
    ignore,
  } = options;

  return function expressLoggerMiddleware(req, res, next) {
    if (ignore && ignore(req)) return next();

    const headerVal = req.headers[traceHeader.toLowerCase()];
    const traceId =
      (typeof headerVal === "string" && headerVal) ||
      (Array.isArray(headerVal) && headerVal[0]) ||
      `req_${randomBytes(8).toString("hex")}`;

    if (exposeTraceHeader) {
      res.setHeader(traceHeader, traceId);
    }

    const startedAt = process.hrtime.bigint();
    const childLogger = logger.child({ traceId, method: req.method, url: req.url });

    runWithContext({ traceId }, () => {
      res.on("finish", () => {
        const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
        const ctx = { statusCode: res.statusCode, durationMs: Number(elapsedMs.toFixed(2)) };
        const msg = `${req.method ?? "?"} ${req.url ?? "?"} -> ${res.statusCode}`;
        if (res.statusCode >= 500) childLogger.error(msg, ctx);
        else if (res.statusCode >= 400) childLogger.warn(msg, ctx);
        else if (level === "info") childLogger.info(msg, ctx);
        else childLogger.debug(msg, ctx);
      });
      next();
    });
  };
}

export { getContext };
