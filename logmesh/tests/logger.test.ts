import { describe, expect, it } from "vitest";
import express from "express";
import request from "supertest";
import {
  Logger,
  memoryTransport,
  ErrorClusterer,
  buildRedactor,
  serializeError,
  errorFingerprint,
  runWithContext,
  expressLogger,
} from "../src/index.js";

describe("Logger", () => {
  it("writes structured records via custom transport", () => {
    const t = memoryTransport();
    const log = new Logger({ level: "debug", transports: [t] });
    log.info("hello", { user: "alice" });
    expect(t.records).toHaveLength(1);
    const r = t.records[0]!;
    expect(r.level).toBe("info");
    expect(r.msg).toBe("hello");
    expect(r.context).toEqual({ user: "alice" });
    expect(r.time).toMatch(/T.*Z$/);
  });

  it("respects log level", () => {
    const t = memoryTransport();
    const log = new Logger({ level: "warn", transports: [t] });
    log.debug("nope");
    log.info("nope");
    log.warn("yes");
    expect(t.records.map((r) => r.level)).toEqual(["warn"]);
  });

  it("redacts sensitive keys", () => {
    const t = memoryTransport();
    const log = new Logger({ level: "trace", transports: [t] });
    log.info("login", { password: "abc", nested: { authorization: "Bearer x" } });
    const r = t.records[0]!;
    expect(r.context.password).toBe("[REDACTED]");
    expect((r.context.nested as Record<string, unknown>).authorization).toBe("[REDACTED]");
  });

  it("supports child loggers with bindings", () => {
    const t = memoryTransport();
    const log = new Logger({ transports: [t], bindings: { app: "api" } });
    const child = log.child({ requestId: "r1" });
    child.info("hi");
    const r = t.records[0]!;
    expect(r.bindings).toEqual({ app: "api", requestId: "r1" });
  });

  it("serializes Errors with fingerprint", () => {
    const t = memoryTransport();
    const log = new Logger({ transports: [t] });
    log.error(new Error("boom"));
    const r = t.records[0]!;
    expect(r.error?.name).toBe("Error");
    expect(r.error?.message).toBe("boom");
    expect(r.fingerprint).toHaveLength(12);
    expect(r.msg).toBe("boom");
  });

  it("samples records", () => {
    const t = memoryTransport();
    let i = 0;
    const log = new Logger({
      transports: [t],
      sampler: () => (i++ % 2 === 0),
    });
    log.info("a");
    log.info("b");
    log.info("c");
    expect(t.records.map((r) => r.msg)).toEqual(["a", "c"]);
  });

  it("merges context with async storage", () => {
    const t = memoryTransport();
    const log = new Logger({ transports: [t] });
    runWithContext({ traceId: "tr-1" }, () => {
      log.info("inside", { foo: 1 });
    });
    expect(t.records[0]!.context).toEqual({ traceId: "tr-1", foo: 1 });
  });
});

describe("ErrorClusterer", () => {
  it("groups by fingerprint and counts", () => {
    const c = new ErrorClusterer();
    const err = serializeError(new Error("same"))!;
    const fp = errorFingerprint(err);
    const time = new Date().toISOString();
    c.observe({
      level: "error",
      levelValue: 50,
      time,
      msg: "same",
      context: {},
      bindings: {},
      error: err,
      fingerprint: fp,
    });
    c.observe({
      level: "error",
      levelValue: 50,
      time,
      msg: "same",
      context: {},
      bindings: {},
      error: err,
      fingerprint: fp,
    });
    expect(c.size()).toBe(1);
    expect(c.list()[0]!.count).toBe(2);
  });
});

describe("buildRedactor", () => {
  it("handles circular structures safely", () => {
    const obj: Record<string, unknown> = { a: 1 };
    obj.self = obj;
    const result = buildRedactor()(obj) as Record<string, unknown>;
    expect(result.a).toBe(1);
    expect(result.self).toBe("[Circular]");
  });
});

describe("expressLogger middleware", () => {
  it("emits a record per request with status code", async () => {
    const t = memoryTransport();
    const log = new Logger({ transports: [t] });

    const app = express();
    app.use(expressLogger({ logger: log }));
    app.get("/x", (_req, res) => res.json({ ok: true }));

    const res = await request(app).get("/x");
    expect(res.status).toBe(200);
    expect(res.headers["x-trace-id"]).toBeTruthy();
    expect(t.records.length).toBeGreaterThan(0);
    const r = t.records.at(-1)!;
    expect(r.context.statusCode).toBe(200);
  });
});
