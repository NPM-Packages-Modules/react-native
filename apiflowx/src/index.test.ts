import { describe, it, expect } from "vitest";
import { apiflowx } from "./index.js";

describe("apiflowx", () => {
  it("exports scaffold API", () => {
    expect(apiflowx()).toEqual({ ok: true, package: "apiflowx" });
  });
});
