import type { Request, RequestHandler } from "express";

export type AuthmeshUser = { sub: string; roles: string[] };

export interface AuthmeshTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresInSec: number;
}

export type SessionAnalyticsEvent =
  | { type: "login"; sub: string; ip: string; deviceId: string; at: number }
  | { type: "refresh"; sub: string; at: number }
  | { type: "suspicious"; reason: string; ip: string; at: number };

export type AuthmeshAnalyticsHook = (e: SessionAnalyticsEvent) => void;

export interface AuthmeshOptions {
  accessSecret: string;
  refreshSecret: string;
  accessTtlSec?: number;
  refreshTtlSec?: number;
  analytics?: AuthmeshAnalyticsHook;
  bruteForce?: { windowMs: number; maxFails: number };
}

export interface AuthmeshRequest extends Request {
  auth?: AuthmeshUser;
}

export type TypedRequestHandler = RequestHandler;
