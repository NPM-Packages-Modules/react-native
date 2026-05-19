import { describe, it, expect } from "vitest";
import { retryflow } from "./index.js";

describe("retryflow", () => {
  it("exports scaffold API", () => {
    expect(retryflow()).toEqual({ ok: true, package: "retryflow" });
  });
});
