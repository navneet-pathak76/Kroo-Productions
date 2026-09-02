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

/** Shared DynamoDB document client for all app persistence features. */
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
 * Telemetry uses its own table when provisioned. Otherwise it shares the
 * visitor table using pk=TELEMETRY, keeping datasets logically isolated
 * without requiring a second DynamoDB table or second IAM resource.
 */
export function getTelemetryTableName(): string | null {
  return process.env.TELEMETRY_DYNAMODB_TABLE || process.env.VISITOR_DYNAMODB_TABLE || null;
}

/**
 * Media metadata uses its own table when provisioned. Otherwise it shares
 * the visitor table using pk=MEDIA. The actual uploaded files remain in S3;
 * this fallback only stores the small admin metadata records.
 */
export function getMediaTableName(): string | null {
  return process.env.MEDIA_DYNAMODB_TABLE || process.env.VISITOR_DYNAMODB_TABLE || null;
}

/** Table for anonymous visitor sessions + page views. */
export function getVisitorTableName(): string | null {
  return process.env.VISITOR_DYNAMODB_TABLE || null;
}
