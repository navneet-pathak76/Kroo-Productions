import "server-only";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoDocClient, getTelemetryTableName } from "@/lib/aws/dynamodb-client";
import type { TelemetryRecord } from "@/lib/telemetry/types";
import type { TelemetryStorageAdapter } from "@/lib/telemetry/storage-adapter";

const TTL_SECONDS = 60 * 60 * 24 * 30;

export class DynamoTelemetryAdapter implements TelemetryStorageAdapter {
  readonly mode = "dynamodb" as const;

  isConfigured(): boolean {
    return getDynamoDocClient() !== null && getTelemetryTableName() !== null;
  }

  async write(record: TelemetryRecord): Promise<void> {
    const client = getDynamoDocClient();
    const tableName = getTelemetryTableName();
    if (!client || !tableName) return;

    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: {
          pk: "TELEMETRY",
          sk: `${record.timestamp}#${record.id}`,
          ...record,
          ttl: Math.floor(Date.now() / 1000) + TTL_SECONDS,
        },
      }),
    );
  }

  async readRecent(limit: number): Promise<TelemetryRecord[]> {
    const client = getDynamoDocClient();
    const tableName = getTelemetryTableName();
    if (!client || !tableName) return [];

    const result = await client.send(
      new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: { ":pk": "TELEMETRY" },
        Limit: Math.min(Math.max(limit, 1), 500),
        ScanIndexForward: false,
      }),
    );

    const items = (result.Items ?? []) as TelemetryRecord[];
    return items.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }
}
