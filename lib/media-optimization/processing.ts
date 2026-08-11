import "server-only";
import { HeadObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getS3Client, getS3RuntimeConfig } from "@/lib/aws/s3-client";
import { getMediaCdnBase, type MediaVariant } from "@/lib/media-optimization/pipeline";

export type MediaProcessingJobStatus = "queued" | "processing" | "completed" | "failed";

export type MediaProcessingJob = {
  id: string;
  originalKey: string;
  status: MediaProcessingJobStatus;
  createdAt: string;
  variants: MediaVariant[];
  error?: string;
};

/**
 * S3 key layout (preserves originals):
 *   originals/{path}           — master uploads
 *   optimized/{path}.webp      — image variants
 *   optimized/{path}.avif
 *   optimized/video/{path}.mp4 — transcoded video
 *   optimized/video/{path}.webm
 *   hls/{path}/index.m3u8      — optional HLS
 */
export function buildOriginalKey(relativePath: string): string {
  return `originals/${relativePath.replace(/^\//, "")}`;
}

export function buildOptimizedImageKeys(relativePath: string): { webp: string; avif: string } {
  const base = relativePath.replace(/^\//, "").replace(/\.[^.]+$/, "");
  return {
    webp: `optimized/${base}.webp`,
    avif: `optimized/${base}.avif`,
  };
}

export function buildOptimizedVideoKeys(relativePath: string): { mp4: string; webm: string } {
  const base = relativePath.replace(/^\//, "").replace(/\.[^.]+$/, "");
  return {
    mp4: `optimized/video/${base}.mp4`,
    webm: `optimized/video/${base}.webm`,
  };
}

export function buildHlsKey(relativePath: string): string {
  const base = relativePath.replace(/^\//, "").replace(/\.[^.]+$/, "");
  return `hls/${base}/index.m3u8`;
}

export function resolveCdnUrl(s3Key: string): string {
  const base = getMediaCdnBase().replace(/\/$/, "");
  return `${base}/${s3Key}`;
}

export type MediaPipelineOverview = {
  cdnBase: string;
  processingConfigured: boolean;
  bucket?: string;
  optimizedObjectCount?: number;
  originalObjectCount?: number;
  message: string;
};

export async function getMediaPipelineOverview(): Promise<MediaPipelineOverview> {
  const config = getS3RuntimeConfig();
  const cdnBase = getMediaCdnBase();
  const client = getS3Client();

  if (!config || !client) {
    return {
      cdnBase,
      processingConfigured: false,
      message:
        "S3 processing not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME.",
    };
  }

  try {
    const [optimized, originals] = await Promise.all([
      client.send(
        new ListObjectsV2Command({
          Bucket: config.bucket,
          Prefix: "optimized/",
          MaxKeys: 1000,
        }),
      ),
      client.send(
        new ListObjectsV2Command({
          Bucket: config.bucket,
          Prefix: "originals/",
          MaxKeys: 1000,
        }),
      ),
    ]);

    return {
      cdnBase,
      processingConfigured: true,
      bucket: config.bucket,
      optimizedObjectCount: optimized.KeyCount ?? optimized.Contents?.length ?? 0,
      originalObjectCount: originals.KeyCount ?? originals.Contents?.length ?? 0,
      message: "Originals preserved under originals/. Optimized variants served via CloudFront.",
    };
  } catch (error) {
    return {
      cdnBase,
      processingConfigured: true,
      bucket: config.bucket,
      message: `S3 connected but listing failed: ${error instanceof Error ? error.message : "unknown"}`,
    };
  }
}

export async function originalExists(relativePath: string): Promise<boolean> {
  const config = getS3RuntimeConfig();
  const client = getS3Client();
  if (!config || !client) return false;

  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: config.bucket,
        Key: buildOriginalKey(relativePath),
      }),
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Enqueue is a server-side hook for an external worker (Lambda/MediaConvert/FFmpeg).
 * This app does not transcode in the visitor browser or on the Next.js runtime.
 */
export function createMediaProcessingJob(originalKey: string): MediaProcessingJob {
  const id = `job_${Date.now()}`;
  const relative = originalKey.replace(/^originals\//, "");
  const imageKeys = buildOptimizedImageKeys(relative);
  const videoKeys = buildOptimizedVideoKeys(relative);

  const isVideo = /\.(mp4|mov|webm|mkv)$/i.test(relative);

  const variants: MediaVariant[] = isVideo
    ? [
        { format: "mp4", url: resolveCdnUrl(videoKeys.mp4) },
        { format: "webm", url: resolveCdnUrl(videoKeys.webm) },
        { format: "hls", url: resolveCdnUrl(buildHlsKey(relative)) },
      ]
    : [
        { format: "webp", url: resolveCdnUrl(imageKeys.webp) },
        { format: "avif", url: resolveCdnUrl(imageKeys.avif) },
      ];

  return {
    id,
    originalKey,
    status: "queued",
    createdAt: new Date().toISOString(),
    variants,
  };
}
