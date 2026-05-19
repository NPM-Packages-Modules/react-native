import { describe, it, expect } from "vitest";
import { apidocsmith } from "./index.js";

describe("apidocsmith", () => {
  it("exports scaffold API", () => {
    expect(apidocsmith()).toEqual({ ok: true, package: "apidocsmith" });
  });
});
