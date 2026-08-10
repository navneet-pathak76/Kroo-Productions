import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

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
