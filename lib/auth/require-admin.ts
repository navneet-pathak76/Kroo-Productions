import "server-only";
import type { AdminRole, AdminSession } from "./types";
import { getSessionFromRequest } from "./session";

export function requireAdminSession(request: Request): AdminSession | null {
  return getSessionFromRequest(request);
}

export function hasAdminRole(session: AdminSession, allowed: AdminRole[]): boolean {
  return allowed.includes(session.role);
}

export function requireAdminRole(
  session: AdminSession | null,
  allowed: AdminRole[],
): session is AdminSession {
  return session !== null && hasAdminRole(session, allowed);
}
