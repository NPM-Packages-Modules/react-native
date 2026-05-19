import { describe, it, expect } from "vitest";
import { cronpilot } from "./index.js";

describe("cronpilot", () => {
  it("exports scaffold API", () => {
    expect(cronpilot()).toEqual({ ok: true, package: "cronpilot" });
  });
});
