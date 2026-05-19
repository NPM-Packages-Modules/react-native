import { describe, it, expect } from "vitest";
import { secureflow } from "./index.js";

describe("secureflow", () => {
  it("exports scaffold API", () => {
    expect(secureflow()).toEqual({ ok: true, package: "secureflow" });
  });
});
