import { describe, it, expect } from "vitest";
import { querygenie } from "./index.js";

describe("querygenie", () => {
  it("builds a filter query", () => {
    const model = { name: "Product" };
    expect(querygenie(model).filter({ q: "x" })).toEqual({ model, query: { q: "x" } });
  });
});
