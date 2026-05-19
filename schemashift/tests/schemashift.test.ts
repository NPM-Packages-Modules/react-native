import { describe, expect, it } from "vitest";
import { diffSampleDocuments, migrationHealthScore } from "../src/index.js";

describe("schemashift", () => {
  it("detects removals and type changes", () => {
    const d = diffSampleDocuments({ a: 1, b: { c: "x" } }, { a: "1", b: { c: "x", d: 1 } });
    expect(d.removedPaths).toEqual([]);
    expect(d.addedPaths).toContain("b.d");
    expect(d.typeChanges.some((x) => x.path === "a")).toBe(true);
  });

  it("scores lower on breaking diffs", () => {
    const safe = diffSampleDocuments({ x: 1 }, { x: 1, y: 2 });
    const bad = diffSampleDocuments({ x: 1 }, { y: 2 });
    expect(migrationHealthScore(safe)).toBeGreaterThan(migrationHealthScore(bad));
  });
});
