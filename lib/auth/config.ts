import "server-only";
import type { AdminUser } from "./types";

const MAX_ADMINS = 4;

function parseAdminUsers(): AdminUser[] {
  const raw = process.env.ADMIN_USERS;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const users: AdminUser[] = [];
    for (const item of parsed.slice(0, MAX_ADMINS)) {
      if (
        typeof item === "object" &&
        item !== null &&
        typeof (item as AdminUser).email === "string" &&
        typeof (item as AdminUser).passwordHash === "string" &&
        ((item as AdminUser).role === "SUPER_ADMIN" || (item as AdminUser).role === "ADMIN")
      ) {
        users.push({
          email: (item as AdminUser).email.trim().toLowerCase(),
          passwordHash: (item as AdminUser).passwordHash,
          role: (item as AdminUser).role,
          name: typeof (item as AdminUser).name === "string" ? (item as AdminUser).name : undefined,
        });
      }
    }

    return users;
  } catch {
    return [];
  }
}

let cachedUsers: AdminUser[] | null = null;

export function getAdminUsers(): AdminUser[] {
  if (cachedUsers === null) {
    cachedUsers = parseAdminUsers();
  }
  return cachedUsers;
}

export function findAdminByEmail(email: string): AdminUser | undefined {
  const normalized = email.trim().toLowerCase();
  return getAdminUsers().find((user) => user.email === normalized);
}

export function isAdminAuthConfigured(): boolean {
  return getAdminUsers().length > 0 && Boolean(process.env.AUTH_SECRET);
}

export function getAuthSecret(): string | null {
  return process.env.AUTH_SECRET ?? null;
}
