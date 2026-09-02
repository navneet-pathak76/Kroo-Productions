import { NextResponse } from "next/server";
import { findAdminByEmail, isAdminAuthConfigured } from "@/lib/auth/config";
import { verifyPassword } from "@/lib/auth/password";
import {
  createAdminSession,
  getSessionFromRequest,
  serializeSessionCookie,
} from "@/lib/auth/session";
import { extractClientIp } from "@/lib/telemetry/ip";
import { recordAdminAudit } from "@/lib/telemetry/admin-audit";

function toSafeString(value: unknown, max = 256): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: "Admin authentication is not configured." },
      { status: 503 },
    );
  }

  const existing = getSessionFromRequest(request);
  if (existing) {
    return NextResponse.json({ success: true, email: existing.email, role: existing.role });
  }

  try {
    const body = await request.json();
    const email = toSafeString(body?.email, 320);
    const password = toSafeString(body?.password, 256);

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const admin = findAdminByEmail(email);
    const ip = extractClientIp(request);
    const passwordValid = admin
      ? await verifyPassword(password, admin.passwordHash)
      : false;

    if (!admin || !passwordValid) {
      // Audit logging must never add authentication latency or turn an
      // otherwise-correct login response into a 5xx when telemetry storage
      // is unavailable. recordAdminAudit handles its own persistence errors.
      void recordAdminAudit("login_failed", {
        route: "/admin/login",
        adminEmail: email,
        ip,
      });

      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const session = createAdminSession(admin.email, admin.role, admin.name);
    void recordAdminAudit("login", {
      route: "/admin/login",
      adminEmail: admin.email,
      ip,
    });

    return NextResponse.json(
      { success: true, email: admin.email, role: admin.role, name: admin.name },
      { headers: { "Set-Cookie": serializeSessionCookie(session) } },
    );
  } catch (error) {
    console.error("[admin/login] failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
