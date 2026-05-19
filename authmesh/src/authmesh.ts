import type { RequestHandler } from "express";
import { deviceIdFromRequest } from "./device.js";
import { opaqueToken, signJwtHS256, verifyJwtHS256 } from "./jwt.js";
import { recordFailedLogin, resetFailedLogins } from "./suspicious.js";
import type { AuthmeshOptions, AuthmeshRequest, AuthmeshTokens, AuthmeshUser } from "./types.js";

const refreshStore = new Map<string, { sub: string; expiresAt: number }>();

function bearer(req: AuthmeshRequest): string | undefined {
  const h = req.headers.authorization;
  if (!h || typeof h !== "string") return undefined;
  const [k, v] = h.split(" ");
  if (k?.toLowerCase() !== "bearer" || !v) return undefined;
  return v.trim();
}

export function createTokenPair(
  user: AuthmeshUser,
  opts: Pick<AuthmeshOptions, "accessSecret" | "refreshSecret" | "accessTtlSec" | "refreshTtlSec">,
): AuthmeshTokens {
  const accessTtl = opts.accessTtlSec ?? 900;
  const refreshTtl = opts.refreshTtlSec ?? 60 * 60 * 24 * 14;
  const accessToken = signJwtHS256(
    { sub: user.sub, roles: user.roles },
    opts.accessSecret,
    accessTtl,
  );
  const refreshToken = opaqueToken();
  const now = Date.now();
  refreshStore.set(refreshToken, { sub: user.sub, expiresAt: now + refreshTtl * 1000 });
  return { accessToken, refreshToken, accessExpiresInSec: accessTtl };
}

export function consumeRefreshToken(
  refreshToken: string,
  opts: Pick<AuthmeshOptions, "accessSecret" | "refreshSecret" | "accessTtlSec">,
  getUser: (sub: string) => AuthmeshUser | undefined,
): (AuthmeshTokens & { sub: string }) | undefined {
  const row = refreshStore.get(refreshToken);
  if (!row) return undefined;
  refreshStore.delete(refreshToken);
  if (row.expiresAt < Date.now()) return undefined;
  const user = getUser(row.sub);
  if (!user) return undefined;
  const tokens = createTokenPair(user, opts);
  return { ...tokens, sub: user.sub };
}

export function requireAccess(opts: Pick<AuthmeshOptions, "accessSecret">): RequestHandler {
  return (req, res, next) => {
    const token = bearer(req as AuthmeshRequest);
    if (!token) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    const v = verifyJwtHS256<AuthmeshUser>(token, opts.accessSecret);
    if (!v.ok) {
      res.status(401).json({ error: v.error });
      return;
    }
    (req as AuthmeshRequest).auth = {
      sub: String(v.payload.sub),
      roles: Array.isArray(v.payload.roles) ? (v.payload.roles as string[]) : [],
    };
    next();
  };
}

export function requireRole(role: string): RequestHandler {
  return (req, res, next) => {
    const a = (req as AuthmeshRequest).auth;
    if (!a || !a.roles.includes(role)) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    next();
  };
}

/** Global JWT guard — mount after public routes. */
export function authmesh(opts: Pick<AuthmeshOptions, "accessSecret">): RequestHandler {
  return requireAccess({ accessSecret: opts.accessSecret });
}

export function loginHandler(
  opts: AuthmeshOptions,
  verifyPassword: (email: string, password: string) => Promise<AuthmeshUser | null>,
): RequestHandler {
  return async (req, res) => {
    const ip = String(req.ip ?? req.socket.remoteAddress ?? "");
    const email = String((req.body as { email?: string })?.email ?? "");
    const password = String((req.body as { password?: string })?.password ?? "");
    const brute = opts.bruteForce ?? { windowMs: 15 * 60_000, maxFails: 8 };
    const deviceId = deviceIdFromRequest(req.headers as { "user-agent"?: string; "accept-language"?: string });

    const user = await verifyPassword(email, password);
    if (!user) {
      const { suspicious, count } = recordFailedLogin(ip, brute.windowMs, brute.maxFails);
      if (suspicious) opts.analytics?.({ type: "suspicious", reason: "brute-force", ip, at: Date.now() });
      res.status(401).json({ error: "invalid_credentials", failures: count });
      return;
    }
    resetFailedLogins(ip);
    const tokens = createTokenPair(user, opts);
    opts.analytics?.({ type: "login", sub: user.sub, ip, deviceId, at: Date.now() });
    res.json({ ...tokens, user: { sub: user.sub, roles: user.roles } });
  };
}

export function refreshHandler(
  opts: AuthmeshOptions,
  getUser: (sub: string) => AuthmeshUser | undefined,
): RequestHandler {
  return (req, res) => {
    const rt = String((req.body as { refreshToken?: string })?.refreshToken ?? "");
    if (!rt) {
      res.status(400).json({ error: "refresh_token_required" });
      return;
    }
    const nextPair = consumeRefreshToken(rt, opts, getUser);
    if (!nextPair) {
      res.status(401).json({ error: "invalid_refresh" });
      return;
    }
    const { sub, ...tokens } = nextPair;
    opts.analytics?.({ type: "refresh", sub, at: Date.now() });
    res.json(tokens);
  };
}

export function oauthStateToken(secret: string, ttlSec = 600): string {
  return signJwtHS256({ typ: "oauth-state", rnd: opaqueToken(8) }, secret, ttlSec);
}

export function verifyOAuthState(token: string, secret: string): boolean {
  const v = verifyJwtHS256<{ typ?: string }>(token, secret);
  return v.ok && v.payload.typ === "oauth-state";
}

export { refreshStore as __unsafe_refreshStoreForTests };
