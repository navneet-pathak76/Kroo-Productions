import "server-only";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
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
