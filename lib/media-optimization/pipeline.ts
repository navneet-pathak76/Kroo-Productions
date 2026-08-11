import "server-only";

/**
 * Media optimization pipeline architecture.
 *
 * Original masters remain in S3. Processing produces optimized variants
 * served via CloudFront. The browser never compresses production video.
 *
 *   Original → S3 → Processing → Optimized variants → CloudFront → Browser
 */

export type MediaVariant = {
  format: "avif" | "webp" | "jpeg" | "mp4" | "webm" | "hls";
  width?: number;
  quality?: number;
  url: string;
};

export type MediaAsset = {
  id: string;
  originalKey: string;
  variants: MediaVariant[];
  processedAt?: string;
};

export function getMediaCdnBase(): string {
  return (
    process.env.NEXT_PUBLIC_S3_BASE_URL ??
    "https://d3uo687t366hok.cloudfront.net"
  );
}

export function buildOptimizedImageUrl(
  path: string,
  options?: { format?: "avif" | "webp"; width?: number },
): string {
  const base = getMediaCdnBase().replace(/\/$/, "");
  const cleanPath = path.replace(/^\//, "");

  if (!options?.format && !options?.width) {
    return `${base}/${cleanPath}`;
  }

  const params = new URLSearchParams();
  if (options.format) params.set("format", options.format);
  if (options.width) params.set("w", String(options.width));

  return `${base}/${cleanPath}?${params.toString()}`;
}

export function isMediaProcessingConfigured(): boolean {
  return Boolean(
    process.env.AWS_S3_BUCKET_NAME &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_REGION,
  );
}

export function getMediaPipelineStatus(): {
  cdnConfigured: boolean;
  processingConfigured: boolean;
  message: string;
} {
  const cdnConfigured = Boolean(process.env.NEXT_PUBLIC_S3_BASE_URL);
  const processingConfigured = isMediaProcessingConfigured();

  let message = "CDN serving via CloudFront.";
  if (!processingConfigured) {
    message += " S3 processing pipeline requires AWS credentials and bucket configuration.";
  }

  return { cdnConfigured, processingConfigured, message };
}
