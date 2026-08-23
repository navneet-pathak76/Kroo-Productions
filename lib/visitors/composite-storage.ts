import "server-only";
import { DynamoVisitorAdapter } from "@/lib/visitors/adapters/dynamodb-adapter";
import { MemoryVisitorAdapter } from "@/lib/visitors/adapters/memory-adapter";
import type { RecordPageViewInput } from "@/lib/visitors/storage-adapter";
import type { PageViewRecord, VisitorListResult, VisitorSessionRecord } from "@/lib/visitors/types";

const memoryAdapter = new MemoryVisitorAdapter();
let dynamoAdapter: DynamoVisitorAdapter | null = null;

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
  if (dynamo.isConfigured()) {
    try {
      await dynamo.recordPageView(input);
    } catch (error) {
      console.error(
        "[visitors] DynamoDB write failed:",
        error instanceof Error ? error.message : "unknown",
      );
    }
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
