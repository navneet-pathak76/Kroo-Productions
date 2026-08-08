import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

const region = process.env.AWS_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
  throw new Error(
    "Missing AWS credentials. Set AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in your environment."
  );
}

export const s3Client = new S3Client({
  region,
  credentials: { accessKeyId, secretAccessKey },
});

export const S3_BUCKET_NAME = (() => {
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  if (!bucket) {
    throw new Error("Missing AWS_S3_BUCKET_NAME environment variable.");
  }
  return bucket;
})();