import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { getTelemetrySnapshot } from "@/lib/telemetry/store";

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const snapshot = await getTelemetrySnapshot();
    return NextResponse.json({ snapshot, viewer: { email: session.email, role: session.role } });
  } catch (error) {
    console.error("[admin/telemetry] failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to load telemetry." }, { status: 500 });
  }
}
