/**
 * Shared upload-size policy for the admin media pipeline. Single source
 * of truth so the presign route, the multipart routes, and the client
 * uploader all agree on what "large" means and what the hard ceilings
 * are — a mismatch here is exactly how "works for small files, breaks
 * for large ones" bugs get reintroduced.
 */

export const MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_VIDEO_SIZE_BYTES = 5 * 1024 * 1024 * 1024; // 5GB

/**
 * Any file at or above this size uses S3 multipart upload instead of a
 * single PutObject presigned URL. A single presigned PUT is signed for
 * a fixed 15-minute window and has no resumability — one dropped
 * connection on a multi-hundred-MB/multi-GB file (typical for a
 * showreel) kills the whole upload. Multipart splits the object into
 * independently-retryable ~8MB+ chunks instead.
 */
export const MULTIPART_THRESHOLD_BYTES = 24 * 1024 * 1024; // 24MB

export const ALLOWED_MIME_TYPES = new Set([
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

export const MIME_BY_EXTENSION: Record<string, string> = {
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

export function normalizeFileName(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, "-");
  return trimmed.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 140) || "upload";
}

export function getExtension(fileName: string): string {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

export function normalizeMimeType(mimeType: string, fileName: string): string {
  const trimmed = mimeType.trim().toLowerCase();
  if (trimmed && ALLOWED_MIME_TYPES.has(trimmed)) {
    return trimmed === "video/x-m4v" ? "video/mp4" : trimmed;
  }
  return MIME_BY_EXTENSION[getExtension(fileName)] ?? trimmed;
}
