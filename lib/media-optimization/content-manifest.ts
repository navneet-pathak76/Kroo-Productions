import "server-only";
import { randomUUID } from "crypto";
import { DeleteCommand, PutCommand, QueryCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { getDynamoDocClient, getMediaTableName } from "@/lib/aws/dynamodb-client";
import {
  PROJECT_OPTIONS,
  type MediaItemRecord,
  type MediaKind,
  type MediaProjectOption,
  type MediaStatus,
} from "@/lib/media-optimization/media-manifest-types";

const MEMORY_MAX_ITEMS = 2_000;
const memoryItems: MediaItemRecord[] = [];

/**
 * Thrown when MEDIA_DYNAMODB_TABLE *is* configured but a DynamoDB
 * operation against it fails (network error, throttling, bad
 * permissions, etc).
 */
export class MediaStorageUnavailableError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "MediaStorageUnavailableError";
    if (cause !== undefined) {
      (this as { cause?: unknown }).cause = cause;
    }
  }
}

let warnedMissingMediaTable = false;

function warnMissingMediaTableOnce(): void {
  if (warnedMissingMediaTable) return;
  warnedMissingMediaTable = true;

  // S3 remains the source of truth for public media. The optional DynamoDB
  // manifest stores admin metadata only, so its absence is a configuration
  // warning rather than a production application error.
  console.warn(
    "[media-manifest] MEDIA_DYNAMODB_TABLE is not configured. Admin media metadata will use the in-memory fallback and will not survive a server restart. Public S3 media is unaffected.",
  );
}

function toSafeTitle(value: string): string {
  return value.trim().slice(0, 140) || "Untitled asset";
}

function toSafeDescription(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 2000) : undefined;
}

function toSafeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function normalizeProjectSlug(value: string): string {
  const slug = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return slug.replace(/(^-|-$)/g, "") || "general";
}

function mergeRecords(primary: MediaItemRecord[], secondary: MediaItemRecord[]): MediaItemRecord[] {
  const byId = new Map<string, MediaItemRecord>();
  for (const record of [...primary, ...secondary]) {
    byId.set(record.id, record);
  }
  return [...byId.values()].sort((a, b) => {
    if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function writeToMemory(record: MediaItemRecord): void {
  const existingIndex = memoryItems.findIndex((item) => item.id === record.id);
  if (existingIndex >= 0) {
    memoryItems[existingIndex] = record;
  } else {
    memoryItems.unshift(record);
  }
  if (memoryItems.length > MEMORY_MAX_ITEMS) {
    memoryItems.length = MEMORY_MAX_ITEMS;
  }
}

function requireMediaClient(): { client: DynamoDBDocumentClient; tableName: string } | null {
  const tableName = getMediaTableName();
  if (!tableName) {
    warnMissingMediaTableOnce();
    return null;
  }

  const client = getDynamoDocClient();
  if (!client) {
    throw new MediaStorageUnavailableError(
      "MEDIA_DYNAMODB_TABLE is set but AWS_REGION/AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY are not configured.",
    );
  }

  return { client, tableName };
}

async function writeToDynamo(record: MediaItemRecord): Promise<void> {
  const resolved = requireMediaClient();
  if (!resolved) return;
  const { client, tableName } = resolved;

  try {
    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          pk: "MEDIA",
          sk: `${record.projectSlug}#${record.id}`,
          ...record,
        },
      }),
    );
  } catch (error) {
    throw new MediaStorageUnavailableError("Failed to write media item to DynamoDB.", error);
  }
}

async function removeFromDynamo(id: string, projectSlug: string): Promise<void> {
  const resolved = requireMediaClient();
  if (!resolved) return;
  const { client, tableName } = resolved;

  try {
    await client.send(
      new DeleteCommand({
        TableName: tableName,
        Key: {
          pk: "MEDIA",
          sk: `${projectSlug}#${id}`,
        },
      }),
    );
  } catch (error) {
    throw new MediaStorageUnavailableError("Failed to delete media item from DynamoDB.", error);
  }
}

async function readFromDynamo(): Promise<MediaItemRecord[]> {
  const resolved = requireMediaClient();
  if (!resolved) return [];
  const { client, tableName } = resolved;

  try {
    const items: MediaItemRecord[] = [];
    let exclusiveStartKey: Record<string, unknown> | undefined;

    do {
      const result = await client.send(
        new QueryCommand({
          TableName: tableName,
          KeyConditionExpression: "pk = :pk",
          ExpressionAttributeValues: { ":pk": "MEDIA" },
          ...(exclusiveStartKey ? { ExclusiveStartKey: exclusiveStartKey } : {}),
        }),
      );
      items.push(...((result.Items ?? []) as MediaItemRecord[]));
      exclusiveStartKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
    } while (exclusiveStartKey);

    return items.filter((item) => item && typeof item.id === "string");
  } catch (error) {
    throw new MediaStorageUnavailableError("Failed to query media items from DynamoDB.", error);
  }
}

export async function listMediaItems(options?: {
  projectSlug?: string;
  status?: MediaStatus;
  type?: MediaKind;
  search?: string;
  sort?: "newest" | "oldest" | "name" | "order";
}): Promise<MediaItemRecord[]> {
  const dynamoItems = await readFromDynamo();
  const merged = mergeRecords(dynamoItems, memoryItems.slice());

  let items = merged.filter((item) => item && !item.replacedById);

  if (options?.projectSlug) {
    const projectSlug = normalizeProjectSlug(options.projectSlug);
    items = items.filter((item) => item.projectSlug === projectSlug);
  }

  if (options?.status) {
    items = items.filter((item) => item.status === options.status);
  }

  if (options?.type) {
    items = items.filter((item) => item.mediaKind === options.type);
  }

  if (options?.search) {
    const query = options.search.toLowerCase();
    items = items.filter((item) => {
      return [item.title, item.description, item.fileName, item.tags.join(" "), item.projectTitle]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }

  switch (options?.sort) {
    case "oldest":
      items = [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case "name":
      items = [...items].sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "order":
      items = [...items].sort((a, b) => a.displayOrder - b.displayOrder || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case "newest":
    default:
      items = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  return items;
}

export async function createMediaItem(input: {
  projectSlug: string;
  projectTitle: string;
  category: string;
  route: string;
  title: string;
  description?: string;
  tags?: string[];
  altText?: string;
  mediaKind: MediaKind;
  mimeType: string;
  fileName: string;
  s3Key: string;
  cdnUrl: string;
  fileSize: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  posterUrl?: string;
  thumbnailUrl?: string;
  status?: MediaStatus;
  uploadedBy?: string;
  replaceMediaId?: string;
}): Promise<MediaItemRecord> {
  const normalizedProjectSlug = normalizeProjectSlug(input.projectSlug);
  const existingItems = await listMediaItems({ projectSlug: normalizedProjectSlug, sort: "order" });
  const nextOrder = existingItems.length > 0 ? Math.max(...existingItems.map((item) => item.displayOrder)) + 1 : 1;

  const record: MediaItemRecord = {
    id: randomUUID(),
    projectSlug: normalizedProjectSlug,
    projectTitle: toSafeTitle(input.projectTitle),
    category: toSafeTitle(input.category),
    route: input.route || `/projects/${normalizedProjectSlug}`,
    title: toSafeTitle(input.title),
    description: toSafeDescription(input.description ?? ""),
    tags: toSafeTags(input.tags),
    altText: input.altText?.trim().slice(0, 200),
    mediaKind: input.mediaKind,
    mimeType: input.mimeType,
    fileName: input.fileName.trim().slice(0, 200),
    s3Key: input.s3Key,
    cdnUrl: input.cdnUrl,
    fileSize: input.fileSize,
    width: input.width,
    height: input.height,
    durationSeconds: input.durationSeconds,
    posterUrl: input.posterUrl,
    thumbnailUrl: input.thumbnailUrl,
    displayOrder: nextOrder,
    status: input.status ?? "draft",
    uploadedBy: input.uploadedBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    replacedById: input.replaceMediaId,
  };

  writeToMemory(record);
  await writeToDynamo(record);
  return record;
}

export async function updateMediaItem(
  id: string,
  updates: Partial<MediaItemRecord> & {
    status?: MediaStatus;
    title?: string;
    description?: string;
    tags?: string[];
    altText?: string;
    displayOrder?: number;
    replacedById?: string;
  },
): Promise<MediaItemRecord | null> {
  const records = await listMediaItems({ sort: "order" });
  const current = records.find((item) => item.id === id);
  if (!current) return null;

  const updated: MediaItemRecord = {
    ...current,
    ...updates,
    title: updates.title ? toSafeTitle(updates.title) : current.title,
    description: updates.description !== undefined ? toSafeDescription(updates.description) : current.description,
    tags: updates.tags ? toSafeTags(updates.tags) : current.tags,
    altText: updates.altText !== undefined ? updates.altText.trim().slice(0, 200) : current.altText,
    updatedAt: new Date().toISOString(),
  };

  writeToMemory(updated);
  await writeToDynamo(updated);
  return updated;
}

export async function deleteMediaItem(id: string): Promise<boolean> {
  const records = await listMediaItems({ sort: "order" });
  const current = records.find((item) => item.id === id);
  if (!current) return false;

  const archived: MediaItemRecord = { ...current, status: "archived", updatedAt: new Date().toISOString() };
  writeToMemory(archived);
  await writeToDynamo(archived);
  return true;
}

export async function reorderMediaItems(projectSlug: string, orderedIds: string[]): Promise<MediaItemRecord[]> {
  const records = await listMediaItems({ projectSlug, sort: "order" });
  const byId = new Map(records.map((item) => [item.id, item]));
  const updated: MediaItemRecord[] = [];

  for (const [index, id] of orderedIds.entries()) {
    const item = byId.get(id);
    if (!item) continue;
    const next: MediaItemRecord = { ...item, displayOrder: index + 1, updatedAt: new Date().toISOString() };
    updated.push(next);
    writeToMemory(next);
    await writeToDynamo(next);
  }

  return updated;
}

export function getProjectOptions(): MediaProjectOption[] {
  return PROJECT_OPTIONS;
}

export function getProjectOptionBySlug(slug: string): MediaProjectOption | undefined {
  return PROJECT_OPTIONS.find((option) => option.slug === normalizeProjectSlug(slug));
}

export { removeFromDynamo as hardDeleteMediaItemFromDynamo };
