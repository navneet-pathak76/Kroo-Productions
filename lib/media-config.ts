const DEFAULT_MEDIA_BASE_URL = "https://d3uo687t366hok.cloudfront.net";

/**
 * Single source of truth for the S3 / CloudFront media CDN.
 * Set NEXT_PUBLIC_S3_BASE_URL in .env.local to override (e.g. direct S3 or a different CloudFront distribution).
 */
export const MEDIA_BASE_URL = (
  process.env.NEXT_PUBLIC_S3_BASE_URL ?? DEFAULT_MEDIA_BASE_URL
).replace(/\/$/, "");

/** Build a full CDN URL from a path relative to the media root. */
export function mediaUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${MEDIA_BASE_URL}${normalized}`;
}

/** Build a video URL inside a category folder under /videos/. */
export function videoUrl(category: string, filename: string): string {
  const encodedCategory = category
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const base = `${MEDIA_BASE_URL}/videos/${encodedCategory}`;
  return filename ? `${base}/${filename}` : base;
}

/** Build a thumbnail URL under /thumbnails/. */
export function thumbnailUrl(path: string): string {
  const normalized = path.startsWith("/") ? path.slice(1) : path;
  return mediaUrl(`/thumbnails/${normalized}`);
}
