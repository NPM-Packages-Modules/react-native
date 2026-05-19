import { getContext } from "./context.js";
import { errorFingerprint, serializeError } from "./error.js";
import { buildRedactor } from "./redact.js";
import { jsonTransport, prettyTransport } from "./transports.js";
import { LEVEL_VALUES, LEVELS, type Level, type LoggerOptions, type LogRecord, type Transport } from "./types.js";

function defaultTransports(): Transport[] {
  const isTTY = Boolean((process.stdout as NodeJS.WriteStream).isTTY);
  const env = (process.env.LOG_FORMAT ?? (isTTY ? "pretty" : "json")).toLowerCase();
  return [env === "pretty" ? prettyTransport() : jsonTransport()];
}

export class Logger {
  private level: Level;
  private bindings: Record<string, unknown>;
  private transports: Transport[];
  private redactor: (input: unknown) => unknown;
  private sampler?: (record: LogRecord) => boolean;
  private fingerprint?: (record: LogRecord) => string | undefined;

  constructor(options: LoggerOptions = {}) {
    this.level = options.level ?? ((process.env.LOG_LEVEL as Level) || "info");
    this.bindings = options.bindings ?? {};
    this.transports = options.transports ?? defaultTransports();
    this.redactor = buildRedactor(options.redactKeys ?? []);
    this.sampler = options.sampler;
    this.fingerprint = options.fingerprint;
  }

  child(bindings: Record<string, unknown>): Logger {
    return new Logger({
      level: this.level,
      bindings: { ...this.bindings, ...bindings },
      transports: this.transports,
      redactKeys: [],
      sampler: this.sampler,
      fingerprint: this.fingerprint,
    });
  }

  setLevel(level: Level): void {
    this.level = level;
  }

  isLevelEnabled(level: Level): boolean {
    return LEVEL_VALUES[level] >= LEVEL_VALUES[this.level];
  }

  addTransport(t: Transport): void {
    this.transports.push(t);
  }

  removeAllTransports(): void {
    this.transports = [];
  }

  private write(
    level: Level,
    msgOrObj: string | Record<string, unknown> | Error,
    maybeObj?: Record<string, unknown>,
  ): void {
    if (!this.isLevelEnabled(level)) return;

    let msg = "";
    let context: Record<string, unknown> = {};
    let err: unknown;

    if (msgOrObj instanceof Error) {
      err = msgOrObj;
      msg = maybeObj && typeof maybeObj.msg === "string" ? (maybeObj.msg as string) : msgOrObj.message;
      if (maybeObj) {
        const { msg: _msg, ...rest } = maybeObj;
        void _msg;
        context = rest;
      }
    } else if (typeof msgOrObj === "string") {
      msg = msgOrObj;
      context = maybeObj ? { ...maybeObj } : {};
      if (context.err) {
        err = context.err;
        delete context.err;
      }
    } else {
      context = { ...msgOrObj };
      if (context.err) {
        err = context.err;
        delete context.err;
      }
      msg = typeof context.msg === "string" ? (context.msg as string) : "";
      delete context.msg;
      if (typeof maybeObj === "string") msg = maybeObj;
    }

    const ctxStore = getContext();
    const contextWithStore = ctxStore ? { ...ctxStore, ...context } : context;
    const serializedErr = serializeError(err);
    const safeContext = this.redactor(contextWithStore) as Record<string, unknown>;
    const safeBindings = this.redactor(this.bindings) as Record<string, unknown>;

    const record: LogRecord = {
      level,
      levelValue: LEVEL_VALUES[level],
      time: new Date().toISOString(),
      msg,
      context: safeContext,
      bindings: safeBindings,
    };
    if (serializedErr) {
      record.error = serializedErr;
      record.fingerprint =
        (this.fingerprint && this.fingerprint(record)) ?? errorFingerprint(serializedErr);
    } else if (this.fingerprint) {
      const fp = this.fingerprint(record);
      if (fp) record.fingerprint = fp;
    }

    if (this.sampler && !this.sampler(record)) return;

    for (const t of this.transports) t.write(record);
  }

  trace(msg: string | Record<string, unknown> | Error, obj?: Record<string, unknown>): void {
    this.write("trace", msg, obj);
  }
  debug(msg: string | Record<string, unknown> | Error, obj?: Record<string, unknown>): void {
    this.write("debug", msg, obj);
  }
  info(msg: string | Record<string, unknown> | Error, obj?: Record<string, unknown>): void {
    this.write("info", msg, obj);
  }
  warn(msg: string | Record<string, unknown> | Error, obj?: Record<string, unknown>): void {
    this.write("warn", msg, obj);
  }
  error(msg: string | Record<string, unknown> | Error, obj?: Record<string, unknown>): void {
    this.write("error", msg, obj);
  }
  fatal(msg: string | Record<string, unknown> | Error, obj?: Record<string, unknown>): void {
    this.write("fatal", msg, obj);
  }
}

export { LEVELS };
