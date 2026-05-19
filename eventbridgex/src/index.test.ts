import { describe, it, expect } from "vitest";
import { eventbridgex } from "./index.js";

describe("eventbridgex", () => {
  it("exports scaffold API", () => {
    expect(eventbridgex()).toEqual({ ok: true, package: "eventbridgex" });
  });
});
