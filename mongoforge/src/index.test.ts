import { describe, it, expect } from "vitest";
import { mongoforge } from "./index.js";

describe("mongoforge", () => {
  it("exports scaffold API", () => {
    expect(mongoforge()).toEqual({ ok: true, package: "mongoforge" });
  });
});
