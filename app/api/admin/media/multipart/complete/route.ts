import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { completeMultipartUpload, headObject } from "@/lib/aws/s3-client";

type PartInput = { partNumber: number; eTag: string };

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = await request.json();
    const objectKey = typeof body?.objectKey === "string" ? body.objectKey : "";
    const uploadId = typeof body?.uploadId === "string" ? body.uploadId : "";
    const expectedFileSize = typeof body?.fileSize === "number" ? body.fileSize : 0;
    const rawParts = Array.isArray(body?.parts) ? (body.parts as unknown[]) : [];

    const parts: PartInput[] = rawParts
      .map((part) => {
        if (!part || typeof part !== "object") return null;
        const p = part as Record<string, unknown>;
        const partNumber = typeof p.partNumber === "number" ? p.partNumber : NaN;
        const eTag = typeof p.eTag === "string" ? p.eTag : "";
        if (!Number.isInteger(partNumber) || !eTag) return null;
        return { partNumber, eTag };
      })
      .filter((p): p is PartInput => p !== null);

    if (!objectKey || !uploadId || parts.length === 0) {
      return NextResponse.json({ error: "Missing objectKey, uploadId, or parts." }, { status: 400 });
    }

    await completeMultipartUpload({ key: objectKey, uploadId, parts });

    // PHASE D — verify upload integrity. Never trust that "S3 accepted
    // the CompleteMultipartUpload call" means the object is a full,
    // correct copy of the source file: confirm the object exists and
    // that its stored ContentLength matches what the browser reported
    // for the original file before this upload is allowed to be
    // published anywhere.
    const info = await headObject(objectKey);
    if (!info) {
      return NextResponse.json({ error: "Could not verify the uploaded object." }, { status: 502 });
    }
    if (expectedFileSize > 0 && info.contentLength !== expectedFileSize) {
      return NextResponse.json(
        {
          error: `Uploaded object size (${info.contentLength} bytes) does not match the source file (${expectedFileSize} bytes). Upload marked as failed — refusing to publish a truncated file.`,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, objectKey, verifiedSize: info.contentLength });
  } catch (error) {
    console.error("[admin/media/multipart/complete] failed", error);
    return NextResponse.json({ error: "Failed to complete multipart upload." }, { status: 500 });
  }
}
