import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import {
  ListObjectsV2Command,
  type _Object as S3Object,
} from "@aws-sdk/client-s3";
import { PROJECT_OPTIONS } from "@/lib/media-optimization/media-manifest-types";
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
// an empty prefix and finds nothing even when real, current media exists in
// S3 under a differently-named folder. Add an entry here whenever a
// category's actual upload folder differs from its route slug.
const REAL_FOLDER_OVERRIDES: Record<string, string> = {
  product: "PRODUCT ADS",
  ai: "AI VIDEOS",
  "logo-graphics": "logo & graphics",
  restaurant: "FOOD",
};

function uniquePrefixes(...prefixes: string[]): string[] {
  return [...new Set(prefixes.filter(Boolean))];
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

/**
 * Resolves the gallery for a project by listing the real S3 bucket
 * directly — the bucket is the single, unconditional source of truth.
 *
 * There is intentionally NO admin/DynamoDB-manifest priority layer and NO
 * static/fake fallback dataset: if S3 has one real video, the page shows
 * one video; if S3 has zero, the page shows zero with an explicit empty
 * state. An S3 failure is logged and treated as "no media found" — it
 * must never be silently upgraded into invented or stale placeholder
 * cards.
 */
export async function getFolderMedia(
  folder: string,
  meta: { category: string; client: string; services: string[] },
): Promise<MediaItem[]> {
  noStore();

  const projectSlug = toProjectSlug(folder);
  const projectFolder = resolveProjectFolder(folder, projectSlug);

  // Canonical bucket structure — verified directly via `aws s3 ls` against
  // the real bucket root, not just the console UI (a console screenshot
  // earlier looked like these were root-level folders, but the breadcrumb
  // was actually one level deeper — this was double-checked with the CLI):
  //
  //   videos/gym/, videos/clothing/, videos/PRODUCT ADS/,
  //   videos/AI VIDEOS/, videos/logo & graphics/, videos/FOOD/, etc.
  //
  // `videos/{folder}/` is the real, populated location and is tried
  // FIRST. `media/{folder}/` (where the admin upload flow at
  // app/api/admin/media/presign/route.ts writes) is tried second — today
  // it only holds incidental test uploads, but stays in the list so any
  // future admin-published media is picked up automatically once it's the
  // only/first prefix with real content.
  const realFolder = REAL_FOLDER_OVERRIDES[projectSlug] ?? projectFolder;
  const prefixes = uniquePrefixes(
    `videos/${realFolder}/`,
    `videos/${projectFolder}/`,
    `videos/${normalizeSlug(folder)}/`,
    `media/${realFolder}/`,
    `media/${projectFolder}/`,
    `media/${normalizeSlug(folder)}/`,
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
      `[media] S3 listing threw for "${projectSlug}" (${err?.name ?? "Error"}: ${err?.message ?? String(error)}) — rendering empty state, not fake media.`,
    );
    return [];
  }

  if (objects.length === 0) {
    console.warn(`[media] No S3 objects found under any tried prefix for "${projectSlug}" — rendering empty state.`);
    return [];
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