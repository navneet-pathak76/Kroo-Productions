import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import type { AdminSession } from "./types";
import { getAuthSecret } from "./config";

const SESSION_COOKIE = "kroo_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function encodeSession(session: AdminSession): string {
  const secret = getAuthSecret();
  if (!secret) throw new Error("AUTH_SECRET is not configured.");

  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = signPayload(payload, secret);
  return `${payload}.${signature}`;
}

function decodeSession(token: string): AdminSession | null {
  const secret = getAuthSecret();
  if (!secret) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = signPayload(payload, secret);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);

  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    if (Date.now() > session.expiresAt) return null;
    if (!session.email || !session.role) return null;
    return session;
  } catch {
    return null;
  }
}

export function createAdminSession(email: string, role: AdminSession["role"], name?: string): AdminSession {
  const now = Date.now();
  return {
    email,
    role,
    name,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE;
}

export function serializeSessionCookie(session: AdminSession): string {
  const value = encodeSession(session);
  const maxAge = Math.floor((session.expiresAt - Date.now()) / 1000);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

export function serializeClearSessionCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export function parseSessionFromCookieHeader(cookieHeader: string | null): AdminSession | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  if (!sessionCookie) return null;

  const token = sessionCookie.slice(SESSION_COOKIE.length + 1);
  return decodeSession(token);
}

export function getSessionFromRequest(request: Request): AdminSession | null {
  return parseSessionFromCookieHeader(request.headers.get("cookie"));
}

export function getSessionFromToken(token: string | undefined): AdminSession | null {
  if (!token) return null;
  return decodeSession(token);
}
