import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
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

// Filename of the per-folder order manifest written by the admin
// "Gallery Order" panel. Lives alongside the real media objects under
// the same S3 prefix (e.g. `videos/gym/order.json`) and is always
// excluded from the media listing — it must never be treated as, or
// displayed as, a media item.
const ORDER_MANIFEST_FILENAME = "order.json";

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

export type ResolvedMediaPrefixes = {
  projectSlug: string;
  projectFolder: string;
  prefixes: string[];
};

/**
 * Resolves a project's real S3 prefixes, in probe order — the reusable
 * core of what getFolderMedia used to do inline. Both the public gallery
 * (getFolderMedia below) and the admin "Gallery Order" API routes call
 * this so they always agree on exactly which S3 location a given
 * portfolio page reads from.
 *
 * Canonical bucket structure — verified directly via `aws s3 ls` against
 * the real bucket root, not just the console UI:
 *
 *   videos/gym/, videos/clothing/, videos/PRODUCT ADS/,
 *   videos/AI VIDEOS/, videos/logo & graphics/, videos/FOOD/, etc.
 *
 * `videos/{folder}/` is the real, populated location and is tried
 * FIRST. `media/{folder}/` (where the admin upload flow at
 * app/api/admin/media/presign/route.ts writes) is tried second — today
 * it only holds incidental test uploads, but stays in the list so any
 * future admin-published media is picked up automatically once it's the
 * only/first prefix with real content.
 */
export function resolveMediaPrefixes(folder: string): ResolvedMediaPrefixes {
  const projectSlug = toProjectSlug(folder);
  const projectFolder = resolveProjectFolder(folder, projectSlug);
  const realFolder = REAL_FOLDER_OVERRIDES[projectSlug] ?? projectFolder;

  const prefixes = uniquePrefixes(
    `videos/${realFolder}/`,
    `videos/${projectFolder}/`,
    `videos/${normalizeSlug(folder)}/`,
    `media/${realFolder}/`,
    `media/${projectFolder}/`,
    `media/${normalizeSlug(folder)}/`,
  );

  return { projectSlug, projectFolder, prefixes };
}

export async function listAllObjects(prefix: string): Promise<S3Object[]> {
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
 * Tries each candidate prefix in order and returns the first one that
 * has real objects in it (the same probing behaviour previously inlined
 * in getFolderMedia). Reused by the admin "Gallery Order" routes so the
 * admin panel always lists exactly the same S3 location the public page
 * will read from.
 */
export async function locatePopulatedPrefix(
  prefixes: string[],
): Promise<{ prefix: string; objects: S3Object[] } | null> {
  for (const prefix of prefixes) {
    const listed = await listAllObjects(prefix);
    console.log(`[getFolderMedia] "${prefix}" -> ${listed.length} object(s)`);
    if (listed.length > 0) {
      return { prefix, objects: listed };
    }
  }
  return prefixes.length > 0 ? { prefix: prefixes[0], objects: [] } : null;
}

function isOrderManifestKey(key: string): boolean {
  return (key.split("/").pop() ?? key) === ORDER_MANIFEST_FILENAME;
}

export type MediaEntry = {
  key: string;
  filename: string;
  baseName: string;
  mediaType: MediaType;
  title: string;
  url: string;
};

/**
 * Converts raw S3 objects under a resolved prefix into the filtered,
 * titled, publicly-addressable entries used by both the public gallery
 * and the admin reorder panel, so the two always agree on what counts as
 * "media" for a folder. The order manifest file itself (order.json) is
 * always excluded here — it can never be listed or displayed as media.
 */
export function buildMediaEntries(
  objects: S3Object[],
  usedPrefix: string,
  projectFolder: string,
): MediaEntry[] {
  const folderLabel = toFolderLabel(projectFolder);
  const rejected: string[] = [];

  const entries = objects
    .filter((object): object is S3Object & { Key: string } => {
      if (!object.Key || object.Key === usedPrefix) return false;
      if (isOrderManifestKey(object.Key)) return false;
      const ext = getExtension(object.Key);
      const keep = IMAGE_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext);
      if (!keep) rejected.push(`${object.Key} (ext="${ext}")`);
      return keep;
    })
    .map((object) => {
      const key = object.Key;
      const ext = getExtension(key);
      const baseName = getBaseName(key);
      const mediaType: MediaType = IMAGE_EXTENSIONS.has(ext) ? "image" : "video";

      return {
        key,
        filename: key.split("/").pop() ?? key,
        baseName,
        mediaType,
        title: toTitle(baseName, folderLabel),
        url: toPublicUrl(key),
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

  return entries;
}

/**
 * Reads the S3-stored per-folder order manifest (`<prefix>order.json`),
 * written by the admin "Gallery Order" panel. A missing manifest (no
 * order has ever been saved for this folder) is the normal, expected
 * state and resolves to an empty array — never an error.
 */
export async function readOrderManifest(prefix: string): Promise<string[]> {
  const config = getS3RuntimeConfig();
  const client = getS3Client();
  if (!config || !client) return [];

  try {
    const result = await client.send(
      new GetObjectCommand({ Bucket: config.bucket, Key: `${prefix}${ORDER_MANIFEST_FILENAME}` }),
    );
    const body = await result.Body?.transformToString();
    if (!body) return [];

    const parsed = JSON.parse(body) as { order?: unknown };
    if (!Array.isArray(parsed.order)) return [];
    return parsed.order.filter((entry): entry is string => typeof entry === "string");
  } catch (error) {
    const err = error as { name?: string };
    // NoSuchKey / NotFound just means no order has been saved yet for
    // this folder — that's the default state, not a failure.
    if (err?.name !== "NoSuchKey" && err?.name !== "NotFound") {
      console.warn(
        `[getFolderMedia] Failed to read order manifest at "${prefix}${ORDER_MANIFEST_FILENAME}"`,
        error,
      );
    }
    return [];
  }
}

/**
 * Persists the admin-chosen display order for a folder to
 * `<prefix>order.json`. This only ever writes the small JSON manifest —
 * it never renames, moves, copies, or deletes the actual S3 media
 * objects in the folder.
 */
export async function writeOrderManifest(prefix: string, order: string[]): Promise<void> {
  const config = getS3RuntimeConfig();
  const client = getS3Client();
  if (!config || !client) {
    throw new Error("S3 is not configured — cannot save media order.");
  }

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: `${prefix}${ORDER_MANIFEST_FILENAME}`,
      Body: JSON.stringify({ order }, null, 2),
      ContentType: "application/json",
      CacheControl: "no-store",
    }),
  );
}

/**
 * Applies a saved order to a list of media entries: entries named in
 * `order` come first, in that order. Anything not listed — new uploads
 * that haven't been manually reordered yet, or a manifest entry whose
 * file no longer exists — falls back to its existing relative order and
 * is appended after the explicitly-ordered entries. Filenames in `order`
 * that no longer exist in `entries` (deleted directly from S3) are
 * silently skipped.
 */
export function applySavedOrder<T extends { filename: string }>(entries: T[], order: string[]): T[] {
  if (order.length === 0) return entries;

  const byFilename = new Map(entries.map((entry) => [entry.filename, entry]));
  const seen = new Set<string>();
  const ordered: T[] = [];

  for (const filename of order) {
    const match = byFilename.get(filename);
    if (match && !seen.has(filename)) {
      ordered.push(match);
      seen.add(filename);
    }
  }

  const remaining = entries.filter((entry) => !seen.has(entry.filename));
  return [...ordered, ...remaining];
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
 *
 * On top of the live listing, an optional S3-stored `order.json`
 * manifest (managed from the admin "Gallery Order" panel) is applied to
 * control display order without ever renaming/moving the underlying S3
 * objects — see applySavedOrder / readOrderManifest above.
 */
export async function getFolderMedia(
  folder: string,
  meta: { category: string; client: string; services: string[] },
): Promise<MediaItem[]> {
  noStore();

  const { projectSlug, projectFolder, prefixes } = resolveMediaPrefixes(folder);

  console.log(`[getFolderMedia] "${projectSlug}" — trying prefixes: ${prefixes.join(", ")}`);

  let located: { prefix: string; objects: S3Object[] } | null;
  try {
    located = await locatePopulatedPrefix(prefixes);
  } catch (error) {
    const err = error as { name?: string; message?: string };
    console.warn(
      `[media] S3 listing threw for "${projectSlug}" (${err?.name ?? "Error"}: ${err?.message ?? String(error)}) — rendering empty state, not fake media.`,
    );
    return [];
  }

  if (!located || located.objects.length === 0) {
    console.warn(`[media] No S3 objects found under any tried prefix for "${projectSlug}" — rendering empty state.`);
    return [];
  }

  const { prefix: usedPrefix, objects } = located;
  const entries = buildMediaEntries(objects, usedPrefix, projectFolder);
  const orderList = await readOrderManifest(usedPrefix);
  const orderedEntries = applySavedOrder(entries, orderList);

  return orderedEntries.map((entry, index) => ({
    id: index + 1,
    title: entry.title,
    thumbnail: entry.mediaType === "image" ? entry.url : undefined,
    video: entry.mediaType === "video" ? entry.url : undefined,
    mediaType: entry.mediaType,
    duration: "",
    category: meta.category,
    client: meta.client,
    services: meta.services,
  }));
}