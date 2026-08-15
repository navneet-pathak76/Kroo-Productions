import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import {
  ListObjectsV2Command,
  type _Object as S3Object,
} from "@aws-sdk/client-s3";
import { listMediaItems } from "@/lib/media-optimization/content-manifest";
import {
  PROJECT_OPTIONS,
  type MediaItemRecord,
} from "@/lib/media-optimization/media-manifest-types";
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
const CDN_BASE = CDN_BASE_URL.replace(/\/$/, "");

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
  return `${CDN_BASE}/${encodedPath}`;
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toProjectSlug(folder: string): string {
  const normalized = normalizeSlug(folder);
  const aliasMap: Record<string, string> = {
    "ai-videos": "ai",
    "digital-marketing": "digital-marketing",
    "social-media": "digital-marketing",
    "logo-graphics": "logo-graphics",
    "logo-and-graphics": "logo-graphics",
    "product-ads": "product",
    "products": "product",
    "food": "restaurant",
  };

  return aliasMap[normalized] ?? normalized;
}

function resolveProjectFolder(folder: string, projectSlug: string): string {
  const project = PROJECT_OPTIONS.find((option) => option.slug === projectSlug);
  return project?.folder ?? normalizeSlug(folder);
}

// Real S3 folder names that don't match their PROJECT_OPTIONS slug — verified
// directly against the bucket. Without these, dynamic discovery silently scans
// an empty prefix and falls through to the static dataset even when real,
// current media exists in S3. Add an entry here whenever a category's actual
// upload folder differs from its route slug.
const REAL_FOLDER_OVERRIDES: Record<string, string> = {
  product: "PRODUCT ADS",
  ai: "AI VIDEOS",
  "logo-graphics": "logo & graphics",
};

function uniquePrefixes(...prefixes: string[]): string[] {
  return [...new Set(prefixes.filter(Boolean))];
}

/**
 * Shape of the legacy, hard-coded per-project datasets (e.g. `gymVideos`,
 * `restaurantVideos`). These already contain fully-formed CDN URLs, so the
 * only normalization needed is filling in `mediaType`.
 */
export type StaticFallbackItem = {
  id: number;
  title: string;
  thumbnail?: string;
  video?: string;
  description?: string;
  duration?: string;
  category?: string;
  client?: string;
  services?: string[];
};

function toManifestMediaItem(record: MediaItemRecord): MediaItem {
  const mediaType: MediaType = record.mediaKind === "video" ? "video" : "image";
  const thumbnail = mediaType === "image" ? record.cdnUrl : undefined;
  const video = mediaType === "video" ? record.cdnUrl : undefined;

  return {
    id: Number(record.displayOrder || 1),
    title: record.title,
    thumbnail,
    video,
    mediaType,
    duration: record.durationSeconds ? `${record.durationSeconds}s` : "",
    category: record.category,
    client: record.projectTitle,
    services: record.tags,
  };
}

async function listAllObjects(prefix: string): Promise<S3Object[]> {
  const config = getS3RuntimeConfig();
  const s3Client = getS3Client();

  if (!config || !s3Client) {
    console.warn(
      `[getFolderMedia] ⚠️  Missing S3 runtime configuration — cannot list "${prefix}". ` +
      `Required env vars (AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME) ` +
      `are not all set. Present: region=${!!process.env.AWS_REGION} accessKeyId=${!!process.env.AWS_ACCESS_KEY_ID} ` +
      `secretAccessKey=${!!process.env.AWS_SECRET_ACCESS_KEY} bucket=${!!process.env.AWS_S3_BUCKET_NAME}.`,
    );
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

/** Normalizes a legacy static dataset entry into the shape the gallery renders. */
function toStaticMediaItem(
  item: StaticFallbackItem,
  index: number,
  meta: { category: string; client: string; services: string[] },
): MediaItem {
  const mediaType: MediaType = item.video ? "video" : "image";
  return {
    id: index + 1,
    title: item.title,
    thumbnail: item.thumbnail,
    video: item.video,
    mediaType,
    duration: item.duration ?? "",
    category: item.category ?? meta.category,
    client: item.client ?? meta.client,
    services: item.services ?? meta.services,
  };
}

/**
 * Resolves the gallery for a project, in priority order:
 *
 *  1. PRIMARY   — published admin-managed media from DynamoDB.
 *  2. SECONDARY — a direct listing of the canonical `media/{folder}/`
 *                 S3 prefix (the same prefix the admin uploader writes to).
 *  3. FALLBACK  — the legacy hard-coded static dataset for this project,
 *                 if one was supplied.
 *
 * AWS/DynamoDB failures are always caught here — a public project page must
 * never throw or render empty just because a dependency is unavailable.
 */
export async function getFolderMedia(
  folder: string,
  meta: { category: string; client: string; services: string[] },
  fallback: StaticFallbackItem[] = [],
): Promise<MediaItem[]> {
  noStore();

  const projectSlug = toProjectSlug(folder);
  const projectFolder = resolveProjectFolder(folder, projectSlug);
  const toFallback = () => fallback.map((item, index) => toStaticMediaItem(item, index, meta));

  let manifestItems: MediaItemRecord[] = [];
  try {
    manifestItems = await listMediaItems({
      projectSlug,
      status: "published",
      sort: "order",
    });
  } catch (error) {
    // A DynamoDB failure here must NOT skip straight to the static
    // fallback — that bypasses the real S3 listing (step 2) and serves
    // fully invented placeholder data even when real media exists in
    // the bucket. Log it and fall through to the S3 listing below,
    // exactly as if the manifest had simply returned no items.
    console.warn(`[media] Manifest lookup failed for ${projectSlug}, falling through to direct S3 listing`, error);
    manifestItems = [];
  }

  if (manifestItems.length > 0) {
    return manifestItems.map((item, index) => ({
      ...toManifestMediaItem(item),
      id: index + 1,
      category: meta.category,
      client: meta.client,
      services: meta.services, 
    }));
  }

  // Canonical S3 structure: admin uploads and public discovery both use
  // `media/{project.folder}/` (see app/api/admin/media/presign/route.ts).
  // A secondary `/videos/{folder}/` scan keeps the older static public
  // library discoverable when DynamoDB metadata is not available. When a
  // category's real S3 folder name differs from its slug (see
  // REAL_FOLDER_OVERRIDES above), that real name is scanned too.
  const realFolder = REAL_FOLDER_OVERRIDES[projectSlug];
  const prefixes = uniquePrefixes(
    `media/${projectFolder}/`,
    `media/${normalizeSlug(folder)}/`,
    `videos/${projectFolder}/`,
    `videos/${normalizeSlug(folder)}/`,
    ...(realFolder ? [`media/${realFolder}/`, `videos/${realFolder}/`] : []),
  );

  console.log(`[getFolderMedia] "${projectSlug}" — trying prefixes: ${prefixes.join(", ")}`);

  let objects: S3Object[] = [];
  let usedPrefix = prefixes[0] ?? "";
  try {
    for (const prefix of prefixes) {
      const listed = await listAllObjects(prefix);
      console.log(`[getFolderMedia] "${prefix}" -> ${listed.length} object(s)`);
      if (listed.length > 0) {
        objects = listed;
        usedPrefix = prefix;
        break;
      }
    }
  } catch (error) {
    const err = error as { name?: string; message?: string };
    console.warn(
      `[media] S3 listing threw for "${projectSlug}" (${err?.name ?? "Error"}: ${err?.message ?? String(error)}) — falling back to static portfolio media.`,
    );
    return toFallback();
  }

  if (objects.length === 0 && fallback.length > 0) {
    console.warn(`[media] No S3 objects found under any tried prefix for "${projectSlug}" — falling back to static portfolio media.`);
    return toFallback();
  }

  const folderLabel = toFolderLabel(projectFolder);

  const rejected: string[] = [];

  const items = objects
    .filter((object): object is S3Object & { Key: string } => {
      if (!object.Key || object.Key === usedPrefix) return false;
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
      `[getFolderMedia] Ignored ${rejected.length} unsupported media object(s) under "${usedPrefix}".`,
    );
  }

  if (items.length === 0 && fallback.length > 0) {
    console.warn(`[media] Falling back to static portfolio media for ${projectSlug}`);
    return toFallback();
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