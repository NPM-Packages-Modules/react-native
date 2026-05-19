import { describe, expect, it } from "vitest";
import { servbridge } from "./index.js";

it("register and call", async () => {
  const sb = servbridge();
  sb.register("payments", async (p) => ({ ok: true, p }));
  expect(sb.list()).toContain("payments");
  const r = await sb.call<{ ok: boolean }>("payments", 1);
  expect(r.ok).toBe(true);
});

it("emit", () => {
  const sb = servbridge();
  const seen: unknown[] = [];
  sb.on("x", (e) => seen.push(e));
  sb.emit("x", 2);
  expect(seen).toEqual([2]);
});
