import "server-only";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

type AwsCredentialsConfig = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
};

function getAwsCredentialsConfig(): AwsCredentialsConfig | null {
  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return { region, accessKeyId, secretAccessKey };
}

let cachedDocClient: DynamoDBDocumentClient | null = null;

/**
 * Shared DynamoDB document client.
 *
 * AWS credentials/region are the same no matter which table a caller
 * targets, so the underlying DynamoDBClient is created once and reused
 * across every DynamoDB-backed feature (telemetry, media, etc). Callers
 * pick their own table name — see getTelemetryTableName() and
 * getMediaTableName() below — so datasets stay isolated from one another
 * even though they share this client.
 */
export function getDynamoDocClient(): DynamoDBDocumentClient | null {
  const config = getAwsCredentialsConfig();
  if (!config) return null;

  if (!cachedDocClient) {
    const client = new DynamoDBClient({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    cachedDocClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: { removeUndefinedValues: true },
    });
  }

  return cachedDocClient;
}

/**
 * Table for telemetry/analytics records only. Do not store media
 * metadata here — see getMediaTableName().
 */
export function getTelemetryTableName(): string | null {
  return process.env.TELEMETRY_DYNAMODB_TABLE || null;
}

/**
 * Table for media library metadata only (records created via the admin
 * upload flow). Kept separate from the telemetry table so the two
 * datasets can be provisioned, scaled, and queried independently, and so
 * a telemetry TTL sweep can never touch media records or vice versa.
 */
export function getMediaTableName(): string | null {
  return process.env.MEDIA_DYNAMODB_TABLE || null;
}

/**
 * Table for anonymous visitor sessions + page views only. Kept separate
 * from telemetry (web-vitals/errors) and media so its own TTL/retention
 * sweep and its GSI1 (date-bucketed queries used by analytics/admin
 * "recent visitors" listings) never interact with the other datasets.
 * See docs/visitor-tracking-infra.md for the required table + GSI shape.
 */
export function getVisitorTableName(): string | null {
  return process.env.VISITOR_DYNAMODB_TABLE || null;
}