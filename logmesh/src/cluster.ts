import type { LogRecord } from "./types.js";

export interface ErrorCluster {
  fingerprint: string;
  count: number;
  firstSeen: string;
  lastSeen: string;
  level: LogRecord["level"];
  message: string;
  sampleRecord: LogRecord;
}

export class ErrorClusterer {
  private map = new Map<string, ErrorCluster>();

  observe(record: LogRecord): ErrorCluster | undefined {
    const fp = record.fingerprint;
    if (!fp) return undefined;
    const existing = this.map.get(fp);
    if (existing) {
      existing.count += 1;
      existing.lastSeen = record.time;
      return existing;
    }
    const cluster: ErrorCluster = {
      fingerprint: fp,
      count: 1,
      firstSeen: record.time,
      lastSeen: record.time,
      level: record.level,
      message: record.msg,
      sampleRecord: record,
    };
    this.map.set(fp, cluster);
    return cluster;
  }

  list(options: { minCount?: number } = {}): ErrorCluster[] {
    const min = options.minCount ?? 1;
    return Array.from(this.map.values())
      .filter((c) => c.count >= min)
      .sort((a, b) => b.count - a.count);
  }

  reset(): void {
    this.map.clear();
  }

  size(): number {
    return this.map.size;
  }

  summarize(): string {
    const lines: string[] = [];
    for (const c of this.list()) {
      lines.push(
        `[${c.level}] ${c.fingerprint} ×${c.count}  ${c.message}` +
          ` (first=${c.firstSeen}, last=${c.lastSeen})`,
      );
    }
    return lines.join("\n");
  }
}
