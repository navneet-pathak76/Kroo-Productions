import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = await request.json();
    return NextResponse.json({
      error: "This endpoint is deprecated. Use /api/admin/media/presign instead.",
      metadata: body,
    }, { status: 400 });
  } catch (error) {
    console.error("[admin/media/upload] failed", error);
    return NextResponse.json({ error: "Failed to prepare upload." }, { status: 500 });
  }
}
