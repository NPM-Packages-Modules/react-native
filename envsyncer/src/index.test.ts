import { describe, it, expect } from "vitest";
import { envsyncer } from "./index.js";

describe("envsyncer", () => {
  it("exports scaffold API", () => {
    expect(envsyncer()).toEqual({ ok: true, package: "envsyncer" });
  });
});
