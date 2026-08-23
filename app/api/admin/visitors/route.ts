import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { listRecentVisitorSessions } from "@/lib/visitors/composite-storage";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const rawLimit = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), MAX_LIMIT) : DEFAULT_LIMIT;

  try {
    const result = await listRecentVisitorSessions(limit, cursor);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin/visitors] list failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to load visitors." }, { status: 500 });
  }
}
