import "server-only";
import { randomUUID } from "crypto";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoDocClient, getTelemetryTableName } from "@/lib/aws/dynamodb-client";
import { isAdminAuthConfigured } from "@/lib/auth/config";
import type { TelemetryPayload, TelemetryRecord, TelemetrySnapshot } from "./types";

const MEMORY_MAX_RECORDS = 5_000;
const memoryRecords: TelemetryRecord[] = [];

function percentile75(values: number[]): number | undefined {
  if (values.length === 0) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.floor(sorted.length * 0.75);
  return Math.round(sorted[Math.min(index, sorted.length - 1)] * 100) / 100;
}

function isErrorKind(kind: TelemetryRecord["kind"]): boolean {
  return (
    kind === "client-error" ||
    kind === "unhandled-rejection" ||
    kind === "media-error" ||
    kind === "api-error"
  );
}

function buildSnapshot(records: TelemetryRecord[]): TelemetrySnapshot {
  const durableConfigured = getDynamoDocClient() !== null;
  const webVitalBuckets: Record<string, number[]> = {
    LCP: [],
    INP: [],
    CLS: [],
    FCP: [],
    TTFB: [],
  };

  const routeMap = new Map<string, { count: number; errors: number }>();
  const tierMap = new Map<string, number>();
  const browserMap = new Map<string, number>();
  const deviceMap = new Map<string, number>();
  const pointerMap = new Map<string, number>();
  const touchMap = new Map<string, number>();
  const reducedMotionMap = new Map<string, number>();

  let webVitals = 0;
  let clientErrors = 0;
  let mediaErrors = 0;
  let apiErrors = 0;
  let adminAudit = 0;

  for (const record of records) {
    if (record.kind === "web-vital") {
      webVitals += 1;
      if (record.metric && record.value !== undefined && webVitalBuckets[record.metric]) {
        webVitalBuckets[record.metric].push(record.value);
      }
    } else if (record.kind === "client-error" || record.kind === "unhandled-rejection") {
      clientErrors += 1;
    } else if (record.kind === "media-error") {
      mediaErrors += 1;
    } else if (record.kind === "api-error") {
      apiErrors += 1;
    } else if (record.kind === "admin-audit") {
      adminAudit += 1;
    }

    const routeEntry = routeMap.get(record.route) ?? { count: 0, errors: 0 };
    routeEntry.count += 1;
    if (isErrorKind(record.kind)) routeEntry.errors += 1;
    routeMap.set(record.route, routeEntry);

    const tier = record.capability?.tier ?? "unknown";
    tierMap.set(tier, (tierMap.get(tier) ?? 0) + 1);

    const browser = record.capability?.browser ?? "unknown";
    browserMap.set(browser, (browserMap.get(browser) ?? 0) + 1);

    const device = record.capability?.device ?? "unknown";
    deviceMap.set(device, (deviceMap.get(device) ?? 0) + 1);

    const pointer = record.capability?.pointer ?? "unknown";
    pointerMap.set(pointer, (pointerMap.get(pointer) ?? 0) + 1);

    if (record.capability?.touch !== undefined) {
      const touchKey = record.capability.touch ? "touch" : "no-touch";
      touchMap.set(touchKey, (touchMap.get(touchKey) ?? 0) + 1);
    }

    if (record.capability?.reducedMotion !== undefined) {
      const motionKey = record.capability.reducedMotion ? "reduce" : "no-preference";
      reducedMotionMap.set(motionKey, (reducedMotionMap.get(motionKey) ?? 0) + 1);
    }
  }

  const webVitalsSummary: TelemetrySnapshot["webVitals"] = {};
  for (const [metric, values] of Object.entries(webVitalBuckets)) {
    const p75 = percentile75(values);
    if (p75 !== undefined) {
      webVitalsSummary[metric as keyof TelemetrySnapshot["webVitals"]] = {
        p75,
        count: values.length,
      };
    }
  }

  const sortedRecent = [...records].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

  return {
    generatedAt: new Date().toISOString(),
    health: {
      telemetryApi: "ok",
      adminAuthConfigured: isAdminAuthConfigured(),
      durableStoreConfigured: durableConfigured,
      hasRecentData: records.length > 0,
    },
    retention: {
      mode: durableConfigured ? "dynamodb" : "memory",
      maxRecords: MEMORY_MAX_RECORDS,
      durableStoreConfigured: durableConfigured,
      durableStoreRequired: durableConfigured
        ? undefined
        : "TELEMETRY_DYNAMODB_TABLE + AWS credentials",
    },
    totals: {
      records: records.length,
      webVitals,
      clientErrors,
      mediaErrors,
      apiErrors,
      adminAudit,
    },
    webVitals: webVitalsSummary,
    byRoute: [...routeMap.entries()]
      .map(([route, data]) => ({ route, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50),
    byTier: [...tierMap.entries()]
      .map(([tier, count]) => ({ tier, count }))
      .sort((a, b) => b.count - a.count),
    byBrowser: [...browserMap.entries()]
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count),
    byDevice: [...deviceMap.entries()]
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count),
    byPointer: [...pointerMap.entries()]
      .map(([pointer, count]) => ({ pointer, count }))
      .sort((a, b) => b.count - a.count),
    byTouch: [...touchMap.entries()]
      .map(([key, count]) => ({ touch: key === "touch", count }))
      .sort((a, b) => b.count - a.count),
    byReducedMotion: [...reducedMotionMap.entries()]
      .map(([key, count]) => ({ reducedMotion: key === "reduce", count }))
      .sort((a, b) => b.count - a.count),
    recent: sortedRecent.slice(0, 50),
    recentErrors: sortedRecent.filter((r) => isErrorKind(r.kind)).slice(0, 50),
  };
}

async function writeToDynamo(record: TelemetryRecord): Promise<void> {
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
        ttl: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      },
    }),
  );
}

async function readFromDynamo(limit = MEMORY_MAX_RECORDS): Promise<TelemetryRecord[]> {
  const client = getDynamoDocClient();
  const tableName = getTelemetryTableName();
  if (!client || !tableName) return [];

  const result = await client.send(
    new ScanCommand({
      TableName: tableName,
      FilterExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": "TELEMETRY" },
      Limit: limit,
    }),
  );

  const items = (result.Items ?? []) as TelemetryRecord[];
  return items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

function writeToMemory(record: TelemetryRecord): void {
  memoryRecords.unshift(record);
  if (memoryRecords.length > MEMORY_MAX_RECORDS) {
    memoryRecords.length = MEMORY_MAX_RECORDS;
  }
}

export async function recordTelemetry(
  payload: TelemetryPayload,
  ipHash?: string,
): Promise<TelemetryRecord> {
  const record: TelemetryRecord = {
    ...payload,
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    ipHash,
  };

  writeToMemory(record);

  try {
    await writeToDynamo(record);
  } catch (error) {
    console.error("[telemetry] DynamoDB write failed:", error instanceof Error ? error.message : "unknown");
  }

  return record;
}

function mergeTelemetryRecords(primary: TelemetryRecord[], secondary: TelemetryRecord[]): TelemetryRecord[] {
  const byId = new Map<string, TelemetryRecord>();
  for (const record of [...primary, ...secondary]) {
    byId.set(record.id, record);
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export async function getRecentTelemetry(limit = 100): Promise<TelemetryRecord[]> {
  let dynamoRecords: TelemetryRecord[] = [];

  if (getDynamoDocClient()) {
    try {
      dynamoRecords = await readFromDynamo(MEMORY_MAX_RECORDS);
    } catch (error) {
      console.error("[telemetry] DynamoDB read failed:", error instanceof Error ? error.message : "unknown");
    }
  }

  const merged = mergeTelemetryRecords(dynamoRecords, memoryRecords);
  return merged.slice(0, limit);
}

export async function getTelemetrySnapshot(): Promise<TelemetrySnapshot> {
  const records = await getRecentTelemetry(MEMORY_MAX_RECORDS);
  return buildSnapshot(records);
}

export async function getTelemetryByRoute(route: string): Promise<TelemetryRecord[]> {
  const records = await getRecentTelemetry(MEMORY_MAX_RECORDS);
  return records.filter((r) => r.route === route);
}

export async function getTelemetryByBrowser(browser: string): Promise<TelemetryRecord[]> {
  const records = await getRecentTelemetry(MEMORY_MAX_RECORDS);
  return records.filter((r) => (r.capability?.browser ?? "unknown") === browser);
}

export async function getTelemetryByDevice(device: string): Promise<TelemetryRecord[]> {
  const records = await getRecentTelemetry(MEMORY_MAX_RECORDS);
  return records.filter((r) => (r.capability?.device ?? "unknown") === device);
}

export async function getTelemetryByTier(tier: string): Promise<TelemetryRecord[]> {
  const records = await getRecentTelemetry(MEMORY_MAX_RECORDS);
  return records.filter((r) => (r.capability?.tier ?? "unknown") === tier);
}

export function isDurableStoreConfigured(): boolean {
  return getDynamoDocClient() !== null;
}
