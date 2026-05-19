import { describe, expect, it } from "vitest";
import { datamorph } from "./index.js";

it("hide rename", () => {
  const d = datamorph().hide("password").rename("full_name", "name");
  expect(d.apply({ password: "x", full_name: "A", id: 1 })).toEqual({ name: "A", id: 1 });
});
