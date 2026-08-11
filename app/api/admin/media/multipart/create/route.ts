import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { choosePartSize, createMultipartUpload } from "@/lib/aws/s3-client";
import { MAX_VIDEO_SIZE_BYTES } from "@/lib/media-optimization/upload-limits";

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = await request.json();
    const objectKey = typeof body?.objectKey === "string" ? body.objectKey : "";
    const contentType = typeof body?.contentType === "string" ? body.contentType : "";
    const fileName = typeof body?.fileName === "string" ? body.fileName : undefined;
    const fileSize = typeof body?.fileSize === "number" ? body.fileSize : 0;

    if (!objectKey || !contentType) {
      return NextResponse.json({ error: "Missing objectKey or contentType." }, { status: 400 });
    }
    if (!objectKey.startsWith("media/")) {
      return NextResponse.json({ error: "Invalid object key." }, { status: 400 });
    }
    if (fileSize <= 0 || fileSize > MAX_VIDEO_SIZE_BYTES) {
      return NextResponse.json({ error: "File size out of range for multipart upload." }, { status: 400 });
    }

    const initiated = await createMultipartUpload({
      key: objectKey,
      contentType,
      fileName,
    });

    if (!initiated) {
      return NextResponse.json({ error: "S3 upload is not configured for this environment." }, { status: 503 });
    }

    const partSize = choosePartSize(fileSize);
    const partCount = Math.max(1, Math.ceil(fileSize / partSize));

    return NextResponse.json({
      uploadId: initiated.uploadId,
      objectKey,
      partSize,
      partCount,
    });
  } catch (error) {
    console.error("[admin/media/multipart/create] failed", error);
    return NextResponse.json({ error: "Failed to initiate multipart upload." }, { status: 500 });
  }
}
