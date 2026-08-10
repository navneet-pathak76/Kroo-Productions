import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import {
  ListObjectsV2Command,
  type _Object as S3Object,
} from "@aws-sdk/client-s3";
import { getS3Client, getS3RuntimeConfig } from "./s3-client";

export type MediaType = "image" | "video";

export type MediaItem = {
  id: number;
  title: string;
  thumbnail?: string;
  video?: string;
  mediaType: MediaType;
  duration: string;
  category: string;
  client: string;
  services: string[];
};

// FIX: added "webm" / "m4v" — AI-generated clips are very often exported
// as .webm, which the original allowlist silently dropped in the filter
// below, producing an empty `videos` array with no error anywhere.
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "m4v"]);

const CDN_BASE_URL =
  process.env.NEXT_PUBLIC_S3_BASE_URL ??
  "https://d3uo687t366hok.cloudfront.net";

function getExtension(key: string): string {
  const lastDot = key.lastIndexOf(".");
  return lastDot === -1 ? "" : key.slice(lastDot + 1).toLowerCase();
}

function getBaseName(key: string): string {
  const fileName = key.split("/").pop() ?? key;
  const lastDot = fileName.lastIndexOf(".");
  return lastDot === -1 ? fileName : fileName.slice(0, lastDot);
}

function extractLeadingNumber(baseName: string): number {
  const match = baseName.match(/\d+/);
  return match ? parseInt(match[0], 10) : Number.POSITIVE_INFINITY;
}

function toFolderLabel(folder: string): string {
  return folder
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) =>
      word === "&" ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

function toTitle(baseName: string, folderLabel: string): string {
  if (/^\d+$/.test(baseName)) {
    return `${folderLabel} ${baseName}`;
  }
  const words = baseName
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return words.length > 0 ? words.join(" ") : folderLabel;
}

function toPublicUrl(key: string): string {
  const encodedPath = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${CDN_BASE_URL}/${encodedPath}`;
}

async function listAllObjects(prefix: string): Promise<S3Object[]> {
  const config = getS3RuntimeConfig();
  const s3Client = getS3Client();

  if (!config || !s3Client) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[getFolderMedia] Missing S3 runtime configuration; returning no media. Required: AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME.",
      );
    }
    return [];
  }

  const objects: S3Object[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: config.bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    if (response.Contents) {
      objects.push(...response.Contents);
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);

  return objects;
}

/**
 * Lists every media file under `videos/{folder}/` in S3 and returns
 * ready-to-render gallery items, sorted numerically by filename.
 * Always fetches fresh from S3 — never cached — so new uploads appear
 * immediately with no code changes.
 */
export async function getFolderMedia(
  folder: string,
  meta: { category: string; client: string; services: string[] }
): Promise<MediaItem[]> {
  noStore();

  const prefix = `videos/${folder}/`;

  const objects = await listAllObjects(prefix);

  const folderLabel = toFolderLabel(folder);

  const rejected: string[] = [];

  const items = objects
    .filter((object): object is S3Object & { Key: string } => {
      if (!object.Key || object.Key === prefix) return false;
      const ext = getExtension(object.Key);
      const keep = IMAGE_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext);
      if (!keep) rejected.push(`${object.Key} (ext="${ext}")`);
      return keep;
    })
    .map((object) => {
      const key = object.Key;
      const ext = getExtension(key);
      const baseName = getBaseName(key);
      const mediaType: MediaType = IMAGE_EXTENSIONS.has(ext)
        ? "image"
        : "video";
      const url = toPublicUrl(key);

      return {
        baseName,
        mediaType,
        title: toTitle(baseName, folderLabel),
        thumbnail: mediaType === "image" ? url : undefined,
        video: mediaType === "video" ? url : undefined,
      };
    })
    .sort((a, b) => {
      const diff = extractLeadingNumber(a.baseName) - extractLeadingNumber(b.baseName);
      return diff !== 0 ? diff : a.baseName.localeCompare(b.baseName);
    });

  if (rejected.length > 0) {
    console.warn(
      `[getFolderMedia] Ignored ${rejected.length} unsupported media object(s) under "${prefix}".`,
    );
  }

  const videos = items.map((item, index) => ({
    id: index + 1,
    title: item.title,
    thumbnail: item.thumbnail,
    video: item.video,
    mediaType: item.mediaType,
    duration: "",
    category: meta.category,
    client: meta.client,
    services: meta.services,
  }));

  return videos;
}
