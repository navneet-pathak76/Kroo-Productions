import "server-only";
import { DynamoTelemetryAdapter } from "@/lib/telemetry/adapters/dynamodb-adapter";
import { MemoryTelemetryAdapter } from "@/lib/telemetry/adapters/memory-adapter";
import type { TelemetryStorageAdapter } from "@/lib/telemetry/storage-adapter";
import type { TelemetryRecord } from "@/lib/telemetry/types";

const memoryAdapter = new MemoryTelemetryAdapter();
let dynamoAdapter: DynamoTelemetryAdapter | null = null;

function getDynamoAdapter(): DynamoTelemetryAdapter {
  if (!dynamoAdapter) dynamoAdapter = new DynamoTelemetryAdapter();
  return dynamoAdapter;
}

export function getTelemetryAdapters(): TelemetryStorageAdapter[] {
  const adapters: TelemetryStorageAdapter[] = [memoryAdapter];
  const dynamo = getDynamoAdapter();
  if (dynamo.isConfigured()) adapters.push(dynamo);
  return adapters;
}

export function getPrimaryDurableAdapter(): TelemetryStorageAdapter | null {
  const dynamo = getDynamoAdapter();
  return dynamo.isConfigured() ? dynamo : null;
}

export async function persistTelemetryRecord(record: TelemetryRecord): Promise<void> {
  await memoryAdapter.write(record);
  const dynamo = getDynamoAdapter();
  if (dynamo.isConfigured()) {
    try {
      await dynamo.write(record);
    } catch (error) {
      console.error(
        "[telemetry] DynamoDB write failed:",
        error instanceof Error ? error.message : "unknown",
      );
    }
  }
}

function mergeRecords(sources: TelemetryRecord[][]): TelemetryRecord[] {
  const byId = new Map<string, TelemetryRecord>();
  for (const list of sources) {
    for (const record of list) {
      byId.set(record.id, record);
    }
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export async function loadRecentTelemetry(limit: number): Promise<TelemetryRecord[]> {
  const dynamo = getDynamoAdapter();
  const reads: Promise<TelemetryRecord[]>[] = [memoryAdapter.readRecent(limit)];

  if (dynamo.isConfigured()) {
    reads.push(
      dynamo.readRecent(limit).catch((error) => {
        console.error(
          "[telemetry] DynamoDB read failed:",
          error instanceof Error ? error.message : "unknown",
        );
        return [];
      }),
    );
  }

  const batches = await Promise.all(reads);
  return mergeRecords(batches).slice(0, limit);
}

export function isDurableTelemetryConfigured(): boolean {
  return getDynamoAdapter().isConfigured();
}
