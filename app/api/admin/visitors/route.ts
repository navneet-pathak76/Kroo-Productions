import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { listRecentVisitorSessions } from "@/lib/visitors/composite-storage";

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

// The admin UI polls every second for a live experience. Coalesce the hot
// first-page read so a single open dashboard does not turn into a DynamoDB
// query every second. Auth is still checked on every request.
const HOT_PAGE_CACHE_MS = 1_500;
let hotPageCache: { expiresAt: number; limit: number; json: string } | null = null;

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") ?? undefined;
  const rawLimit = Number.parseInt(searchParams.get("limit") ?? "", 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), MAX_LIMIT) : DEFAULT_LIMIT;

  try {
    if (!cursor && hotPageCache && hotPageCache.expiresAt > Date.now() && hotPageCache.limit === limit) {
      return new NextResponse(hotPageCache.json, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "private, no-store",
          "X-Visitor-Cache": "HIT",
        },
      });
    }

    const result = await listRecentVisitorSessions(limit, cursor);
    const json = JSON.stringify(result);

    if (!cursor) {
      hotPageCache = {
        expiresAt: Date.now() + HOT_PAGE_CACHE_MS,
        limit,
        json,
      };
    }

    return new NextResponse(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "private, no-store",
        "X-Visitor-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("[admin/visitors] list failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to load visitors." }, { status: 500 });
  }
}
