import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionFromRequest } from "@/lib/auth/session";
import { headObject } from "@/lib/aws/s3-client";
import { getMediaCdnBase } from "@/lib/media-optimization/pipeline";
import { createMediaItem, MediaStorageUnavailableError } from "@/lib/media-optimization/content-manifest";

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = await request.json();
    const metadata = body?.metadata;
    if (!metadata || typeof metadata !== "object") {
      return NextResponse.json({ error: "Missing upload metadata." }, { status: 400 });
    }

    const objectKey = typeof body?.objectKey === "string" ? body.objectKey : "";

    // PHASE D — verify upload integrity before this media item can ever
    // be published. A single PUT that "succeeded" from the browser's
    // point of view (HTTP 2xx) can still be a truncated object if the
    // connection was interrupted mid-body on some proxies — HeadObject
    // is the source of truth for what actually landed in the bucket.
    const expectedFileSize = typeof metadata.fileSize === "number" ? metadata.fileSize : 0;
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

    const cdnUrl = `${getMediaCdnBase().replace(/\/$/, "")}/${objectKey.replace(/^\//, "")}`;

    const item = await createMediaItem({
      projectSlug: metadata.projectSlug,
      projectTitle: metadata.projectTitle,
      category: metadata.projectTitle,
      route: metadata.route,
      title: metadata.title,
      description: metadata.description,
      tags: metadata.tags,
      altText: metadata.altText,
      mediaKind: metadata.mediaKind,
      mimeType: metadata.mimeType,
      fileName: metadata.fileName,
      s3Key: objectKey,
      cdnUrl,
      fileSize: info.contentLength,
      status: "draft",
      uploadedBy: session.email,
      replaceMediaId: metadata.replaceMediaId,
    });

    if (item.route) revalidatePath(item.route);
    revalidatePath("/admin");
    return NextResponse.json({ item });
  } catch (error) {
    console.error("[admin/media/complete] failed", error);
    const message =
      error instanceof MediaStorageUnavailableError
        ? "The file uploaded, but saving its metadata failed because media storage is configured but currently unavailable. Please retry."
        : "Failed to finalize upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}