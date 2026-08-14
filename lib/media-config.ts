const DEFAULT_MEDIA_BASE_URL = "https://d3uo687t366hok.cloudfront.net";

/**
 * Single source of truth for the S3 / CloudFront media CDN.
 * Set NEXT_PUBLIC_S3_BASE_URL in .env.local to override (e.g. direct S3 or a different CloudFront distribution).
 */
export const MEDIA_BASE_URL = (
  process.env.NEXT_PUBLIC_S3_BASE_URL?.trim() || DEFAULT_MEDIA_BASE_URL
).replace(/\/$/, "");

function encodeMediaPath(path: string): string {
  return path
    .replace(/^\/+/, "")
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

/** Build a full CDN URL from a path relative to the media root. */
export function mediaUrl(path: string): string {
  return `${MEDIA_BASE_URL}/${encodeMediaPath(path)}`;
}

/** Build a video URL inside a category folder under /videos/. */
export function videoUrl(category: string, filename: string): string {
  const base = `${MEDIA_BASE_URL}/videos/${encodeMediaPath(category)}`;
  return filename ? `${base}/${encodeMediaPath(filename)}` : base;
}

/** Build a thumbnail URL under /thumbnails/. */
export function thumbnailUrl(path: string): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return mediaUrl(`/thumbnails/${normalized}`);
}

/**
 * Given a full CDN (CloudFront) URL previously produced by mediaUrl /
 * videoUrl / thumbnailUrl, recover the raw S3 object key
 * ("media/gym/1.mp4", "videos/gym/1.mp4", etc). Returns null for
 * anything that isn't a same-origin CDN URL — callers use this to
 * decide whether a signed-URL fallback request even makes sense for a
 * given <video>/<img> src.
 */
export function mediaKeyFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url, MEDIA_BASE_URL);
    const base = new URL(MEDIA_BASE_URL);
    if (parsed.hostname !== base.hostname) return null;
    const key = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
    return key || null;
  } catch {
    return null;
  }
}