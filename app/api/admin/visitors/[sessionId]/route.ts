import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { getVisitorPageViews, getVisitorSession } from "@/lib/visitors/composite-storage";

export async function GET(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { sessionId } = await params;

  try {
    const [visitorSession, pageViews] = await Promise.all([
      getVisitorSession(sessionId),
      getVisitorPageViews(sessionId),
    ]);

    if (!visitorSession) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    return NextResponse.json({ session: visitorSession, pageViews });
  } catch (error) {
    console.error("[admin/visitors/journey] failed:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Failed to load visitor journey." }, { status: 500 });
  }
}
