export const LEVELS = ["trace", "debug", "info", "warn", "error", "fatal"] as const;
export type Level = (typeof LEVELS)[number];
export const LEVEL_VALUES: Record<Level, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

export interface LogRecord {
  level: Level;
  levelValue: number;
  time: string;
  msg: string;
  context: Record<string, unknown>;
  bindings: Record<string, unknown>;
  error?: SerializedError;
  fingerprint?: string;
}

export interface SerializedError {
  name: string;
  message: string;
  stack?: string[];
  code?: string;
  cause?: SerializedError;
}

export interface Transport {
  name: string;
  write(record: LogRecord): void;
  flush?(): void | Promise<void>;
}

export interface LoggerOptions {
  level?: Level;
  bindings?: Record<string, unknown>;
  transports?: Transport[];
  redactKeys?: string[];
  sampler?: (record: LogRecord) => boolean;
  fingerprint?: (record: LogRecord) => string | undefined;
}
