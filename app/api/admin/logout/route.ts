import { NextResponse } from "next/server";
import {
  getSessionFromRequest,
  serializeClearSessionCookie,
} from "@/lib/auth/session";
import { extractClientIp } from "@/lib/telemetry/ip";
import { recordAdminAudit } from "@/lib/telemetry/admin-audit";

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);

  if (session) {
    await recordAdminAudit("logout", {
      route: "/admin/logout",
      adminEmail: session.email,
      ip: extractClientIp(request),
    });
  }

  return NextResponse.json(
    { success: true },
    { headers: { "Set-Cookie": serializeClearSessionCookie() } },
  );
}
