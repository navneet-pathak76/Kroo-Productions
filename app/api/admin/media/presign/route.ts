import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionFromRequest } from "@/lib/auth/session";
import { getPresignedUploadUrl } from "@/lib/aws/s3-client";
import { getProjectOptionBySlug } from "@/lib/media-optimization/content-manifest";

const MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024;
const MAX_VIDEO_SIZE_BYTES = 5 * 1024 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "video/mp4",
  "video/x-m4v",
  "video/webm",
  "video/quicktime",
  "video/x-matroska",
]);

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  mkv: "video/x-matroska",
};

function normalizeFileName(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, "-");
  return trimmed.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 140) || "upload";
}

function getExtension(fileName: string): string {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

function normalizeMimeType(mimeType: string, fileName: string): string {
  const trimmed = mimeType.trim().toLowerCase();
  if (trimmed && ALLOWED_MIME_TYPES.has(trimmed)) {
    return trimmed === "video/x-m4v" ? "video/mp4" : trimmed;
  }
  return MIME_BY_EXTENSION[getExtension(fileName)] ?? trimmed;
}

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
    const upload = await getPresignedUploadUrl({
      key: objectKey,
      contentType: mimeType,
      fileName,
    });

    if (!upload) {
      return NextResponse.json({ error: "S3 upload is not configured for this environment." }, { status: 503 });
    }

    revalidatePath("/admin");
    return NextResponse.json({
      uploadMode: "direct",
      uploadUrl: upload.url,
      objectKey,
      project,
      metadata: {
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
      },
    });
  } catch (error) {
    console.error("[admin/media/presign] failed", error);
    return NextResponse.json({ error: "Failed to prepare upload." }, { status: 500 });
  }
}
