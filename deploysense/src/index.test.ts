import { describe, it, expect } from "vitest";
import { deploysense } from "./index.js";

describe("deploysense", () => {
  it("exports scaffold API", () => {
    expect(deploysense()).toEqual({ ok: true, package: "deploysense" });
  });
});
