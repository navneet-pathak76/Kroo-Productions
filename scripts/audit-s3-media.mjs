#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  CopyObjectCommand,
  GetBucketCorsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutBucketCorsCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const args = new Set(process.argv.slice(2));
const APPLY = args.has("--apply");
const APPLY_CORS = args.has("--cors");
const ROOT = process.cwd();
const PREFIXES = ["media/", "videos/", "thumbnails/"];

loadEnvFile(".env.local");
loadEnvFile(".env");

const MIME_BY_EXTENSION = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  mkv: "video/x-matroska",
};

const VIDEO_EXTENSIONS = new Set(["mp4", "m4v", "mov", "webm", "mkv"]);

function loadEnvFile(fileName) {
  const filePath = path.join(ROOT, fileName);
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function getConfig() {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.AWS_S3_BUCKET_NAME;

  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "Missing AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, or AWS_S3_BUCKET_NAME.",
    );
  }

  return { region, accessKeyId, secretAccessKey, bucket };
}

function extensionForKey(key) {
  const match = key.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? "";
}

function expectedContentType(key) {
  return MIME_BY_EXTENSION[extensionForKey(key)] ?? "application/octet-stream";
}

function shouldAudit(key) {
  return Boolean(MIME_BY_EXTENSION[extensionForKey(key)]);
}

function expectedCacheControl(key) {
  return VIDEO_EXTENSIONS.has(extensionForKey(key))
    ? "public, max-age=31536000, immutable"
    : "public, max-age=31536000, immutable";
}

function encodeCopySource(bucket, key) {
  return `/${bucket}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

async function listAllObjects(client, bucket, prefix) {
  const objects = [];
  let ContinuationToken;

  do {
    const result = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken,
      }),
    );
    objects.push(...(result.Contents ?? []));
    ContinuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
  } while (ContinuationToken);

  return objects.filter((object) => object.Key && shouldAudit(object.Key));
}

async function repairObjectMetadata(client, bucket, key, head) {
  const ContentType = expectedContentType(key);
  const CacheControl = expectedCacheControl(key);

  await client.send(
    new CopyObjectCommand({
      Bucket: bucket,
      Key: key,
      CopySource: encodeCopySource(bucket, key),
      MetadataDirective: "REPLACE",
      ContentType,
      CacheControl,
      ContentDisposition: `inline; filename="${path.basename(key).replace(/["\\]/g, "-")}"`,
      Metadata: head.Metadata,
    }),
  );
}

async function ensureCors(client, bucket) {
  const corsRules = [
    {
      AllowedOrigins: [
        "https://krooproduction.in",
        "https://www.krooproduction.in",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ],
      AllowedMethods: ["GET", "HEAD", "PUT"],
      AllowedHeaders: ["*"],
      ExposeHeaders: [
        "Accept-Ranges",
        "Content-Length",
        "Content-Range",
        "Content-Type",
        "ETag",
      ],
      MaxAgeSeconds: 86400,
    },
  ];

  if (!APPLY || !APPLY_CORS) {
    try {
      const existing = await client.send(new GetBucketCorsCommand({ Bucket: bucket }));
      console.log(`CORS currently has ${existing.CORSRules?.length ?? 0} rule(s). Use --apply --cors to replace with the media-safe rule.`);
    } catch {
      console.log("CORS is not configured or could not be read. Use --apply --cors to set the media-safe rule.");
    }
    return;
  }

  try {
    await client.send(
      new PutBucketCorsCommand({
        Bucket: bucket,
        CORSConfiguration: { CORSRules: corsRules },
      }),
    );
    console.log("Updated bucket CORS for browser uploads and media diagnostics.");
  } catch (error) {
    console.warn(
      `Could not update bucket CORS: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }
}

async function main() {
  const config = getConfig();
  const client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  await ensureCors(client, config.bucket);

  let checked = 0;
  let repaired = 0;
  const issues = [];

  for (const prefix of PREFIXES) {
    const objects = await listAllObjects(client, config.bucket, prefix);
    for (const object of objects) {
      const key = object.Key;
      const head = await client.send(
        new HeadObjectCommand({
          Bucket: config.bucket,
          Key: key,
        }),
      );

      checked += 1;
      const expectedType = expectedContentType(key);
      const expectedCache = expectedCacheControl(key);
      const actualType = head.ContentType ?? "";
      const actualCache = head.CacheControl ?? "";

      const needsRepair =
        actualType.toLowerCase() !== expectedType ||
        !actualCache.toLowerCase().includes("max-age=");

      if (needsRepair) {
        issues.push({ key, actualType, expectedType, actualCache, expectedCache });
        if (APPLY) {
          await repairObjectMetadata(client, config.bucket, key, head);
          repaired += 1;
        }
      }
    }
  }

  console.log(`Checked ${checked} media object(s).`);
  console.log(`${issues.length} object(s) need metadata repair.`);
  for (const issue of issues.slice(0, 30)) {
    console.log(
      `- ${issue.key}: Content-Type ${issue.actualType || "<missing>"} -> ${issue.expectedType}; Cache-Control ${issue.actualCache || "<missing>"} -> ${issue.expectedCache}`,
    );
  }
  if (issues.length > 30) {
    console.log(`...and ${issues.length - 30} more.`);
  }
  if (APPLY) console.log(`Repaired ${repaired} object(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
