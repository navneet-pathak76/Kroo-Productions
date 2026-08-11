import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import { getPresignedUploadUrl } from "@/lib/aws/s3-client";
import { getProjectOptionBySlug } from "@/lib/media-optimization/content-manifest";
import {
  ALLOWED_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  MULTIPART_THRESHOLD_BYTES,
  normalizeFileName,
  normalizeMimeType,
} from "@/lib/media-optimization/upload-limits";

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = await request.json();
    const fileName = typeof body?.fileName === "string" ? body.fileName : "";
    const rawMimeType = typeof body?.mimeType === "string" ? body.mimeType : "";
    const fileSize = typeof body?.fileSize === "number" ? body.fileSize : 0;
    const projectSlug = typeof body?.projectSlug === "string" ? body.projectSlug : "";
    const title = typeof body?.title === "string" ? body.title : fileName;
    const description = typeof body?.description === "string" ? body.description : "";
    const tags = Array.isArray(body?.tags)
      ? (body.tags as unknown[]).filter((item): item is string => typeof item === "string")
      : [];
    const altText = typeof body?.altText === "string" ? body.altText : "";
    const mediaKind = body?.mediaKind === "video" ? "video" : body?.mediaKind === "asset" ? "asset" : "image";
    const replaceMediaId = typeof body?.replaceMediaId === "string" ? body.replaceMediaId : undefined;

    const mimeType = normalizeMimeType(rawMimeType, fileName);

    if (!fileName || !mimeType || !projectSlug) {
      return NextResponse.json({ error: "Missing upload metadata." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
    }

    const maxSize = mediaKind === "video" ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
    if (fileSize > maxSize) {
      const limitLabel = mediaKind === "video" ? "5 GB" : "50 MB";
      return NextResponse.json({ error: `File exceeds the supported size limit for ${mediaKind === "video" ? "videos" : "images"} (${limitLabel}).` }, { status: 413 });
    }

    const project = getProjectOptionBySlug(projectSlug);
    if (!project) {
      return NextResponse.json({ error: "Unknown project." }, { status: 400 });
    }

    const objectKey = `media/${project.folder}/${Date.now()}-${normalizeFileName(fileName)}`;
    const metadata = {
      projectSlug: project.slug,
      projectTitle: project.title,
      route: project.route,
      title,
      description,
      tags,
      altText,
      mediaKind,
      mimeType,
      fileName,
      fileSize,
      uploadedBy: session.email,
      replaceMediaId,
    };

    // Anything at/above the multipart threshold must NOT use a single
    // presigned PUT — a fixed-expiry, non-resumable URL is exactly what
    // was causing large showreels to fail (connection drop or upload
    // duration > URL expiry = total failure with no retry path). Tell
    // the client to initiate a multipart upload instead; it will call
    // /api/admin/media/multipart/create next.
    if (fileSize >= MULTIPART_THRESHOLD_BYTES) {
      return NextResponse.json({
        uploadMode: "multipart",
        objectKey,
        project,
        metadata,
      });
    }

    const upload = await getPresignedUploadUrl({
      key: objectKey,
      contentType: mimeType,
      fileName,
    });

    if (!upload) {
      return NextResponse.json({ error: "S3 upload is not configured for this environment." }, { status: 503 });
    }

    return NextResponse.json({
      uploadMode: "direct",
      uploadUrl: upload.url,
      objectKey,
      project,
      metadata,
    });
  } catch (error) {
    console.error("[admin/media/presign] failed", error);
    return NextResponse.json({ error: "Failed to prepare upload." }, { status: 500 });
  }
}
