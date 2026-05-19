import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import pc from "picocolors";
import type { LogRecord, Transport } from "./types.js";

export function jsonTransport(options: { stream?: NodeJS.WritableStream } = {}): Transport {
  const stream = options.stream ?? process.stdout;
  return {
    name: "json",
    write(record) {
      stream.write(`${JSON.stringify(record)}\n`);
    },
  };
}

const LEVEL_COLORS: Record<string, (s: string) => string> = {
  trace: pc.gray,
  debug: pc.cyan,
  info: pc.green,
  warn: pc.yellow,
  error: pc.red,
  fatal: (s: string) => pc.bgRed(pc.white(s)),
};

export function prettyTransport(options: { stream?: NodeJS.WritableStream } = {}): Transport {
  const stream = options.stream ?? process.stdout;
  return {
    name: "pretty",
    write(record) {
      const colorize = LEVEL_COLORS[record.level] ?? ((s: string) => s);
      const lvl = colorize(record.level.toUpperCase().padEnd(5));
      const t = pc.dim(record.time);
      const fields = { ...record.bindings, ...record.context };
      const tail = Object.keys(fields).length > 0 ? ` ${pc.dim(JSON.stringify(fields))}` : "";
      const fp = record.fingerprint ? pc.magenta(` ⟶ ${record.fingerprint}`) : "";
      stream.write(`${t} ${lvl} ${record.msg}${tail}${fp}\n`);
      if (record.error?.stack) {
        for (const line of record.error.stack) stream.write(pc.dim(`  ${line}\n`));
      }
    },
  };
}

export function fileTransport(filePath: string): Transport {
  mkdirSync(dirname(filePath), { recursive: true });
  return {
    name: `file:${filePath}`,
    write(record) {
      appendFileSync(filePath, `${JSON.stringify(record)}\n`);
    },
  };
}

export function memoryTransport(): Transport & { records: LogRecord[] } {
  const records: LogRecord[] = [];
  return {
    name: "memory",
    records,
    write(record) {
      records.push(record);
    },
  };
}
