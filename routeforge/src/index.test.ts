import { describe, it, expect } from "vitest";
import { routeforge } from "./index.js";

describe("routeforge", () => {
  it("creates a resource scaffold", async () => {
    await expect(routeforge.create("products")).resolves.toEqual({
      resource: "products",
      ok: true,
    });
  });
});
