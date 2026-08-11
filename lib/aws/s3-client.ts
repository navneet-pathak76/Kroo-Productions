import "server-only";
import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListPartsCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type S3RuntimeConfig = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

export function getS3RuntimeConfig(): S3RuntimeConfig | null {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.AWS_S3_BUCKET_NAME;

  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    return null;
  }

  return {
    region,
    accessKeyId,
    secretAccessKey,
    bucket,
  };
}

let cachedClient: S3Client | null = null;

export function getS3Client(): S3Client | null {
  const config = getS3RuntimeConfig();
  if (!config) return null;

  if (!cachedClient) {
    cachedClient = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  return cachedClient;
}

export async function getPresignedUploadUrl(input: {
  key: string;
  contentType: string;
  bucket?: string;
  fileName?: string;
  cacheControl?: string;
}): Promise<{ url: string; key: string } | null> {
  const config = getS3RuntimeConfig();
  const client = getS3Client();
  if (!config || !client) return null;

  const command = new PutObjectCommand({
    Bucket: input.bucket ?? config.bucket,
    Key: input.key,
    ContentType: input.contentType,
    CacheControl: input.cacheControl ?? "public, max-age=31536000, immutable",
    ContentDisposition: input.fileName
      ? `inline; filename="${input.fileName.replace(/["\\]/g, "-")}"`
      : "inline",
  });

  const url = await getSignedUrl(client, command, { expiresIn: 900 });
  return { url, key: input.key };
}

export async function getPresignedDownloadUrl(key: string, expiresIn = 900): Promise<string | null> {
  const config = getS3RuntimeConfig();
  const client = getS3Client();
  if (!config || !client) return null;

  const command = new GetObjectCommand({ Bucket: config.bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn });
}

/**
 * Confirms an uploaded object actually landed in S3 with the expected
 * size before we ever mark an upload "complete" / publishable. This is
 * what prevents a truncated/aborted large upload from silently becoming
 * a broken "Video unavailable" card later — the failure surfaces here,
 * synchronously, at upload time instead of at playback time.
 */
export async function headObject(
  key: string,
): Promise<{ contentLength: number; contentType?: string } | null> {
  const config = getS3RuntimeConfig();
  const client = getS3Client();
  if (!config || !client) return null;

  const result = await client.send(new HeadObjectCommand({ Bucket: config.bucket, Key: key }));
  return {
    contentLength: result.ContentLength ?? 0,
    contentType: result.ContentType,
  };
}

// ---------------------------------------------------------------------
// Multipart upload
//
// Large media (multi-GB showreels) cannot reliably go through a single
// PutObject presigned URL: the URL has a fixed expiry (15 min here), and
// any single dropped TCP connection kills the entire upload with no way
// to resume. S3 multipart upload splits the object into independently
// retryable parts, each with its own short-lived presigned URL, so a
// slow network or a single failed part never invalidates the whole
// upload.
// ---------------------------------------------------------------------

const MIN_PART_SIZE_BYTES = 8 * 1024 * 1024; // S3's own minimum is 5MB; keep headroom.
const MAX_PART_COUNT = 9500; // S3 hard limit is 10,000 parts.
const PART_URL_EXPIRES_SECONDS = 3600; // generous — parts are signed individually and retried independently.

/** Picks a part size that keeps the part count comfortably under the S3 limit. */
export function choosePartSize(fileSizeBytes: number): number {
  let partSize = MIN_PART_SIZE_BYTES;
  while (Math.ceil(fileSizeBytes / partSize) > MAX_PART_COUNT) {
    partSize *= 2;
  }
  return partSize;
}

export async function createMultipartUpload(input: {
  key: string;
  contentType: string;
  bucket?: string;
  fileName?: string;
  cacheControl?: string;
}): Promise<{ uploadId: string; key: string } | null> {
  const config = getS3RuntimeConfig();
  const client = getS3Client();
  if (!config || !client) return null;

  const command = new CreateMultipartUploadCommand({
    Bucket: input.bucket ?? config.bucket,
    Key: input.key,
    ContentType: input.contentType,
    CacheControl: input.cacheControl ?? "public, max-age=31536000, immutable",
    ContentDisposition: input.fileName
      ? `inline; filename="${input.fileName.replace(/["\\]/g, "-")}"`
      : "inline",
  });

  const result = await client.send(command);
  if (!result.UploadId) return null;
  return { uploadId: result.UploadId, key: input.key };
}

export async function getPresignedUploadPartUrl(input: {
  key: string;
  uploadId: string;
  partNumber: number;
  bucket?: string;
}): Promise<string | null> {
  const config = getS3RuntimeConfig();
  const client = getS3Client();
  if (!config || !client) return null;

  const command = new UploadPartCommand({
    Bucket: input.bucket ?? config.bucket,
    Key: input.key,
    UploadId: input.uploadId,
    PartNumber: input.partNumber,
  });

  return getSignedUrl(client, command, { expiresIn: PART_URL_EXPIRES_SECONDS });
}

export async function completeMultipartUpload(input: {
  key: string;
  uploadId: string;
  parts: { partNumber: number; eTag: string }[];
  bucket?: string;
}): Promise<{ location?: string } | null> {
  const config = getS3RuntimeConfig();
  const client = getS3Client();
  if (!config || !client) return null;

  const sortedParts = [...input.parts].sort((a, b) => a.partNumber - b.partNumber);

  const command = new CompleteMultipartUploadCommand({
    Bucket: input.bucket ?? config.bucket,
    Key: input.key,
    UploadId: input.uploadId,
    MultipartUpload: {
      Parts: sortedParts.map((part) => ({ PartNumber: part.partNumber, ETag: part.eTag })),
    },
  });

  const result = await client.send(command);
  return { location: result.Location };
}

export async function abortMultipartUpload(input: {
  key: string;
  uploadId: string;
  bucket?: string;
}): Promise<void> {
  const config = getS3RuntimeConfig();
  const client = getS3Client();
  if (!config || !client) return;

  await client.send(
    new AbortMultipartUploadCommand({
      Bucket: input.bucket ?? config.bucket,
      Key: input.key,
      UploadId: input.uploadId,
    }),
  );
}

/** Used to verify which parts S3 actually has before completing — lets the client resume instead of restarting from scratch. */
export async function listUploadedParts(input: {
  key: string;
  uploadId: string;
  bucket?: string;
}): Promise<{ partNumber: number; eTag: string; size: number }[]> {
  const config = getS3RuntimeConfig();
  const client = getS3Client();
  if (!config || !client) return [];

  const parts: { partNumber: number; eTag: string; size: number }[] = [];
  let partNumberMarker: string | undefined;

  do {
    const result = await client.send(
      new ListPartsCommand({
        Bucket: input.bucket ?? config.bucket,
        Key: input.key,
        UploadId: input.uploadId,
        PartNumberMarker: partNumberMarker,
      }),
    );
    for (const part of result.Parts ?? []) {
      if (part.PartNumber && part.ETag) {
        parts.push({ partNumber: part.PartNumber, eTag: part.ETag, size: part.Size ?? 0 });
      }
    }
    partNumberMarker = result.IsTruncated ? result.NextPartNumberMarker : undefined;
  } while (partNumberMarker);

  return parts;
}
