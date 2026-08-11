import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionFromRequest } from "@/lib/auth/session";
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
      fileSize: metadata.fileSize,
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