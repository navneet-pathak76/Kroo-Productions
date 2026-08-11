import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { getPresignedUploadPartUrl } from "@/lib/aws/s3-client";

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = await request.json();
    const objectKey = typeof body?.objectKey === "string" ? body.objectKey : "";
    const uploadId = typeof body?.uploadId === "string" ? body.uploadId : "";
    const partNumber = typeof body?.partNumber === "number" ? body.partNumber : 0;

    if (!objectKey || !uploadId || !Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10000) {
      return NextResponse.json({ error: "Invalid part request." }, { status: 400 });
    }
    if (!objectKey.startsWith("media/")) {
      return NextResponse.json({ error: "Invalid object key." }, { status: 400 });
    }

    const url = await getPresignedUploadPartUrl({ key: objectKey, uploadId, partNumber });
    if (!url) {
      return NextResponse.json({ error: "S3 upload is not configured for this environment." }, { status: 503 });
    }

    return NextResponse.json({ url, partNumber });
  } catch (error) {
    console.error("[admin/media/multipart/sign-part] failed", error);
    return NextResponse.json({ error: "Failed to sign upload part." }, { status: 500 });
  }
}
