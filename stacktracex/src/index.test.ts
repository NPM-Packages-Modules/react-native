import { describe, it, expect } from "vitest";
import { stacktracex } from "./index.js";

describe("stacktracex", () => {
  it("exports scaffold API", () => {
    expect(stacktracex()).toEqual({ ok: true, package: "stacktracex" });
  });
});
