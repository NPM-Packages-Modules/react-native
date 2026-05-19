import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import {
  authmesh,
  loginHandler,
  refreshHandler,
  requireAccess,
  requireRole,
  signJwtHS256,
  verifyJwtHS256,
  __unsafe_refreshStoreForTests,
} from "../src/index.js";

const secret = "test-secret-access";
const refreshOpts = { accessSecret: secret, refreshSecret: "refresh" };

afterEach(() => {
  __unsafe_refreshStoreForTests.clear();
});

describe("jwt", () => {
  it("roundtrips", () => {
    const t = signJwtHS256({ sub: "u1", roles: ["admin"] }, secret, 60);
    const v = verifyJwtHS256<{ sub: string; roles: string[] }>(t, secret);
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.payload.sub).toBe("u1");
      expect(v.payload.roles).toEqual(["admin"]);
    }
  });
});

describe("authmesh http", () => {
  it("protects with authmesh()", async () => {
    const app = express();
    app.get("/ok", authmesh({ accessSecret: secret }), (req, res) => res.json({ ok: true }));
    const r1 = await request(app).get("/ok");
    expect(r1.status).toBe(401);
    const tok = signJwtHS256({ sub: "x", roles: [] }, secret, 30);
      const r2 = await request(app).get("/ok").set("Authorization", `Bearer ${tok}`);
    expect(r2.status).toBe(200);
  });

  it("login + refresh rotation", async () => {
    const users = new Map<string, { sub: string; roles: string[] }>([["u1", { sub: "u1", roles: ["r"] }]]);
    const app = express();
    app.use(express.json());
    app.post(
      "/login",
      loginHandler(refreshOpts, async (email) => (email === "a@b.com" ? users.get("u1")! : null)),
    );
    app.post("/refresh", refreshHandler(refreshOpts, (sub) => users.get(sub)));
    const login = await request(app).post("/login").send({ email: "a@b.com", password: "x" });
    expect(login.status).toBe(200);
    const { refreshToken } = login.body as { refreshToken: string };
    const r2 = await request(app).post("/refresh").send({ refreshToken });
    expect(r2.status).toBe(200);
    expect((r2.body as { refreshToken: string }).refreshToken).not.toBe(refreshToken);
    const r3 = await request(app).post("/refresh").send({ refreshToken });
    expect(r3.status).toBe(401);
  });

  it("requireRole", async () => {
    const app = express();
    const t = signJwtHS256({ sub: "u", roles: ["admin"] }, secret, 30);
    app.get("/a", requireAccess({ accessSecret: secret }), requireRole("admin"), (_req, res) => res.send("ok"));
    const bad = await request(app).get("/a").set("Authorization", `Bearer ${signJwtHS256({ sub: "u", roles: [] }, secret, 30)}`);
    expect(bad.status).toBe(403);
    const ok = await request(app).get("/a").set("Authorization", `Bearer ${t}`);
    expect(ok.text).toBe("ok");
  });
});
