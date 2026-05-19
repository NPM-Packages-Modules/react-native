import { describe, it, expect } from "vitest";
import { cachepilot } from "./index.js";

describe("cachepilot", () => {
  it("exports scaffold API", () => {
    expect(cachepilot()).toEqual({ ok: true, package: "cachepilot" });
  });
});
