import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { abortMultipartUpload } from "@/lib/aws/s3-client";

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = await request.json();
    const objectKey = typeof body?.objectKey === "string" ? body.objectKey : "";
    const uploadId = typeof body?.uploadId === "string" ? body.uploadId : "";

    if (!objectKey || !uploadId) {
      return NextResponse.json({ error: "Missing objectKey or uploadId." }, { status: 400 });
    }

    await abortMultipartUpload({ key: objectKey, uploadId });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/media/multipart/abort] failed", error);
    // Aborting is best-effort cleanup (avoids leaving orphaned S3 parts
    // that silently accrue storage cost) — never block the UI on it.
    return NextResponse.json({ ok: false });
  }
}
