import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { analyzePerformance } from "@/lib/ai-optimization/analyze";
import { getTelemetrySnapshot } from "@/lib/telemetry/store";
import { extractClientIp } from "@/lib/telemetry/ip";
import { recordAdminAudit } from "@/lib/telemetry/admin-audit";

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const snapshot = await getTelemetrySnapshot();
    const analysis = await analyzePerformance(snapshot);

    await recordAdminAudit("request_optimization", {
      route: "/admin/optimize",
      adminEmail: session.email,
      ip: extractClientIp(request),
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("[admin/optimize] failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Analysis failed." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const snapshot = await getTelemetrySnapshot();
    const analysis = await analyzePerformance(snapshot);
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("[admin/optimize] failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Analysis failed." }, { status: 500 });
  }
}
