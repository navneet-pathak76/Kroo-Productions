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
 * when dedicated tables are configured.
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
 * Table for telemetry/analytics records only.
 *
 * A dedicated TELEMETRY_DYNAMODB_TABLE is preferred. If it has not been
 * provisioned yet, fall back to the existing visitor table so production
 * telemetry still persists instead of silently disappearing. Telemetry
 * records use pk=TELEMETRY, so they remain logically isolated from visitor
 * session records in the shared table. Once TELEMETRY_DYNAMODB_TABLE is
 * added, it automatically becomes the preferred destination.
 */
export function getTelemetryTableName(): string | null {
  return process.env.TELEMETRY_DYNAMODB_TABLE || process.env.VISITOR_DYNAMODB_TABLE || null;
}

/**
 * Table for media library metadata only (records created via the admin
 * upload flow). Kept separate from telemetry when configured.
 */
export function getMediaTableName(): string | null {
  return process.env.MEDIA_DYNAMODB_TABLE || null;
}

/**
 * Table for anonymous visitor sessions + page views only. Kept separate
 * from telemetry when a dedicated telemetry table is configured, so its
 * own TTL/retention sweep and its GSI1 (date-bucketed queries used by
 * analytics/admin "recent visitors" listings) never interact with the
 * telemetry dataset.
 * See docs/visitor-tracking-infra.md for the required table + GSI shape.
 */
export function getVisitorTableName(): string | null {
  return process.env.VISITOR_DYNAMODB_TABLE || null;
}
