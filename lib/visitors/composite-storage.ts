import "server-only";
import { DynamoVisitorAdapter } from "@/lib/visitors/adapters/dynamodb-adapter";
import { MemoryVisitorAdapter } from "@/lib/visitors/adapters/memory-adapter";
import type { RecordPageViewInput } from "@/lib/visitors/storage-adapter";
import type { PageViewRecord, VisitorListResult, VisitorSessionRecord } from "@/lib/visitors/types";

const memoryAdapter = new MemoryVisitorAdapter();
let dynamoAdapter: DynamoVisitorAdapter | null = null;

// If AWS rejects the visitor table because of credentials/permissions, do not
// retry the same failed write for every page-view beacon in a warm instance.
// The short cooldown keeps the public site responsive while still recovering
// automatically after the IAM configuration is corrected.
const DYNAMO_FAILURE_COOLDOWN_MS = 30_000;
let dynamoDisabledUntil = 0;

function getDynamoAdapter(): DynamoVisitorAdapter {
  if (!dynamoAdapter) dynamoAdapter = new DynamoVisitorAdapter();
  return dynamoAdapter;
}

export function isDurableVisitorStoreConfigured(): boolean {
  return getDynamoAdapter().isConfigured();
}

export async function recordVisitorPageView(input: RecordPageViewInput): Promise<void> {
  await memoryAdapter.recordPageView(input);

  const dynamo = getDynamoAdapter();
  if (!dynamo.isConfigured() || Date.now() < dynamoDisabledUntil) return;

  try {
    await dynamo.recordPageView(input);
    dynamoDisabledUntil = 0;
  } catch (error) {
    dynamoDisabledUntil = Date.now() + DYNAMO_FAILURE_COOLDOWN_MS;
    console.error(
      "[visitors] DynamoDB write failed; backing off for 30s:",
      error instanceof Error ? error.message : "unknown",
    );
  }
}

/** Reads prefer the durable store when configured, falling back to memory for local dev. */
function activeReadAdapter() {
  const dynamo = getDynamoAdapter();
  return dynamo.isConfigured() ? dynamo : memoryAdapter;
}

export async function getVisitorSession(sessionId: string): Promise<VisitorSessionRecord | null> {
  try {
    return await activeReadAdapter().getSession(sessionId);
  } catch (error) {
    console.error("[visitors] getSession failed:", error instanceof Error ? error.message : "unknown");
    return memoryAdapter.getSession(sessionId);
  }
}

export async function getVisitorPageViews(sessionId: string, limit?: number): Promise<PageViewRecord[]> {
  try {
    return await activeReadAdapter().getPageViews(sessionId, limit);
  } catch (error) {
    console.error("[visitors] getPageViews failed:", error instanceof Error ? error.message : "unknown");
    return memoryAdapter.getPageViews(sessionId, limit);
  }
}

export async function listRecentVisitorSessions(limit: number, cursor?: string): Promise<VisitorListResult> {
  try {
    return await activeReadAdapter().listRecentSessions(limit, cursor);
  } catch (error) {
    console.error("[visitors] listRecentSessions failed:", error instanceof Error ? error.message : "unknown");
    return memoryAdapter.listRecentSessions(limit, cursor);
  }
}

export async function listVisitorSessionsInRange(
  sinceIso: string,
  untilIso: string,
): Promise<VisitorSessionRecord[]> {
  try {
    return await activeReadAdapter().listSessionsInRange(sinceIso, untilIso);
  } catch (error) {
    console.error(
      "[visitors] listSessionsInRange failed:",
      error instanceof Error ? error.message : "unknown",
    );
    return memoryAdapter.listSessionsInRange(sinceIso, untilIso);
  }
}
