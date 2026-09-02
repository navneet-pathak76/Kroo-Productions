import "server-only";
import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoDocClient, getVisitorTableName } from "@/lib/aws/dynamodb-client";
import type { PageViewRecord, VisitorListResult, VisitorSessionRecord } from "@/lib/visitors/types";
import type { RecordPageViewInput, VisitorStorageAdapter } from "@/lib/visitors/storage-adapter";

// Visitor history is intentionally retained for 30 days. The application also
// enforces this window on reads so expired records are never shown even if
// DynamoDB TTL cleanup has not run yet.
const RETENTION_DAYS = 30;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

function ttlFor(timestamp: string): number {
  return Math.floor(new Date(timestamp).getTime() / 1000) + RETENTION_DAYS * 24 * 60 * 60;
}

function isWithinRetention(timestamp: string, now = Date.now()): boolean {
  const time = new Date(timestamp).getTime();
  return Number.isFinite(time) && time >= now - RETENTION_MS && time <= now;
}

function dayBucket(iso: string): string { return iso.slice(0, 10); }

function toSession(item: Record<string, unknown>): VisitorSessionRecord {
  return {
    sessionId: item.sessionId as string,
    visitorId: item.visitorId as string,
    isNewVisitor: Boolean(item.isNewVisitor),
    firstSeen: item.firstSeen as string,
    lastSeen: item.lastSeen as string,
    entryPage: item.entryPage as string,
    exitPage: item.exitPage as string,
    pageCount: Number(item.pageCount ?? 0),
    durationMs: Number(item.durationMs ?? 0),
    referrer: item.referrer as string | undefined,
    geo: (item.geo as VisitorSessionRecord["geo"]) ?? {},
    client: (item.client as VisitorSessionRecord["client"]) ?? { device: "unknown", browser: "Unknown", os: "Unknown" },
    ip: item.ip as string | undefined,
    ipHash: item.ipHash as string | undefined,
  };
}

function encodeCursor(state: { dayOffset: number; lek?: Record<string, unknown> }): string {
  return Buffer.from(JSON.stringify(state)).toString("base64url");
}

function decodeCursor(cursor: string | undefined): { dayOffset: number; lek?: Record<string, unknown> } {
  if (!cursor) return { dayOffset: 0 };
  try { return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")); }
  catch { return { dayOffset: 0 }; }
}

function daysBetween(sinceIso: string, untilIso: string): string[] {
  const days: string[] = [];
  const cursor = new Date(dayBucket(sinceIso));
  const end = new Date(dayBucket(untilIso));
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

export class DynamoVisitorAdapter implements VisitorStorageAdapter {
  readonly mode = "dynamodb" as const;

  isConfigured(): boolean { return getDynamoDocClient() !== null && getVisitorTableName() !== null; }

  async recordPageView(input: RecordPageViewInput): Promise<void> {
    const client = getDynamoDocClient();
    const tableName = getVisitorTableName();
    if (!client || !tableName) return;

    // Keep the hot path to two writes. The previous implementation performed
    // a Get before every page view, which added a round trip and made a busy
    // visitor generate unnecessary DynamoDB reads. UpdateCommand atomically
    // creates the session on the first event and updates it thereafter.
    const nowMs = new Date(input.timestamp).getTime();
    const sessionItem = {
      pk: `SESSION#${input.sessionId}`,
      sk: "META",
      gsi1pk: `DAY#${dayBucket(input.timestamp)}`,
      gsi1sk: `${input.timestamp}#${input.sessionId}`,
      sessionId: input.sessionId,
      visitorId: input.visitorId,
      path: input.path,
      referrer: input.referrer,
      geo: input.geo,
      client: input.client,
      ip: input.ip,
      ipHash: input.ipHash,
      timestamp: input.timestamp,
      ttl: ttlFor(input.timestamp),
      nowMs,
    };

    // DynamoDB rejects undefined expression values even when the document
    // client's removeUndefinedValues option is enabled. Normalize optional
    // referrers before putting them into ExpressionAttributeValues.
    const referrer = sessionItem.referrer ?? "";

    await Promise.all([
      client.send(new UpdateCommand({
        TableName: tableName,
        Key: { pk: sessionItem.pk, sk: sessionItem.sk },
        UpdateExpression: [
          "SET firstSeen = if_not_exists(firstSeen, :timestamp)",
          "firstSeenMs = if_not_exists(firstSeenMs, :nowMs)",
          "lastSeen = :timestamp",
          "entryPage = if_not_exists(entryPage, :path)",
          "exitPage = :path",
          "pageCount = if_not_exists(pageCount, :zero) + :one",
          "durationMs = :nowMs - if_not_exists(firstSeenMs, :nowMs)",
          "visitorId = if_not_exists(visitorId, :visitorId)",
          "isNewVisitor = if_not_exists(isNewVisitor, :true)",
          "referrer = if_not_exists(referrer, :referrer)",
          "geo = if_not_exists(geo, :geo)",
          "client = if_not_exists(client, :client)",
          "ip = if_not_exists(ip, :ip)",
          "ipHash = if_not_exists(ipHash, :ipHash)",
          "gsi1pk = :gsi1pk",
          "gsi1sk = :gsi1sk",
          "#ttl = :ttl",
        ].join(", "),
        ExpressionAttributeNames: {
          "#ttl": "ttl",
        },
        ExpressionAttributeValues: {
          ":timestamp": sessionItem.timestamp,
          ":nowMs": sessionItem.nowMs,
          ":path": sessionItem.path,
          ":zero": 0,
          ":one": 1,
          ":visitorId": sessionItem.visitorId,
          ":true": true,
          ":referrer": referrer,
          ":geo": sessionItem.geo,
          ":client": sessionItem.client,
          ":ip": sessionItem.ip,
          ":ipHash": sessionItem.ipHash,
          ":gsi1pk": sessionItem.gsi1pk,
          ":gsi1sk": sessionItem.gsi1sk,
          ":ttl": sessionItem.ttl,
        },
      })),
      client.send(new PutCommand({
        TableName: tableName,
        Item: {
          pk: `SESSION#${input.sessionId}`,
          sk: `VIEW#${input.timestamp}#${Math.random().toString(36).slice(2, 8)}`,
          sessionId: input.sessionId,
          path: input.path,
          referrer: input.referrer,
          timestamp: input.timestamp,
          ttl: ttlFor(input.timestamp),
        },
      })),
    ]);
  }

  async getSession(sessionId: string): Promise<VisitorSessionRecord | null> {
    const client = getDynamoDocClient();
    const tableName = getVisitorTableName();
    if (!client || !tableName) return null;
    const result = await client.send(new GetCommand({ TableName: tableName, Key: { pk: `SESSION#${sessionId}`, sk: "META" } }));
    if (!result.Item) return null;
    const session = toSession(result.Item);
    return isWithinRetention(session.lastSeen) ? session : null;
  }

  async getPageViews(sessionId: string, limit = 500): Promise<PageViewRecord[]> {
    const client = getDynamoDocClient();
    const tableName = getVisitorTableName();
    if (!client || !tableName) return [];
    const result = await client.send(new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
      ExpressionAttributeValues: { ":pk": `SESSION#${sessionId}`, ":prefix": "VIEW#" },
      Limit: limit,
      ScanIndexForward: true,
    }));
    return (result.Items ?? [])
      .map((item) => ({
        sessionId: item.sessionId as string,
        path: item.path as string,
        referrer: item.referrer as string | undefined,
        timestamp: item.timestamp as string,
      }))
      .filter((view) => isWithinRetention(view.timestamp));
  }

  async listRecentSessions(limit: number, cursor?: string): Promise<VisitorListResult> {
    const client = getDynamoDocClient();
    const tableName = getVisitorTableName();
    if (!client || !tableName) return { items: [] };
    const MAX_DAYS_BACK = 30;
    const state = decodeCursor(cursor);
    const items: VisitorSessionRecord[] = [];
    let dayOffset = state.dayOffset;
    let lek = state.lek;

    while (items.length < limit && dayOffset < MAX_DAYS_BACK) {
      const day = new Date();
      day.setUTCDate(day.getUTCDate() - dayOffset);
      const dayStr = day.toISOString().slice(0, 10);
      const result = await client.send(new QueryCommand({
        TableName: tableName,
        IndexName: "gsi1",
        KeyConditionExpression: "gsi1pk = :pk",
        ExpressionAttributeValues: { ":pk": `DAY#${dayStr}` },
        ScanIndexForward: false,
        Limit: limit - items.length,
        ...(lek ? { ExclusiveStartKey: lek } : {}),
      }));
      items.push(...(result.Items ?? []).map(toSession).filter((session) => isWithinRetention(session.lastSeen)));
      if (result.LastEvaluatedKey) return { items, nextCursor: encodeCursor({ dayOffset, lek: result.LastEvaluatedKey as Record<string, unknown> }) };
      dayOffset += 1;
      lek = undefined;
    }
    return { items, nextCursor: dayOffset < MAX_DAYS_BACK ? encodeCursor({ dayOffset }) : undefined };
  }

  async listSessionsInRange(sinceIso: string, untilIso: string): Promise<VisitorSessionRecord[]> {
    const client = getDynamoDocClient();
    const tableName = getVisitorTableName();
    if (!client || !tableName) return [];
    const days = daysBetween(sinceIso, untilIso);
    const since = new Date(sinceIso).getTime();
    const until = new Date(untilIso).getTime();
    const retentionStart = Date.now() - RETENTION_MS;
    const effectiveSince = Math.max(since, retentionStart);
    const results = await Promise.all(days.map(async (day) => {
      const out: VisitorSessionRecord[] = [];
      let exclusiveStartKey: Record<string, unknown> | undefined;
      do {
        const result = await client.send(new QueryCommand({
          TableName: tableName,
          IndexName: "gsi1",
          KeyConditionExpression: "gsi1pk = :pk",
          ExpressionAttributeValues: { ":pk": `DAY#${day}` },
          ...(exclusiveStartKey ? { ExclusiveStartKey: exclusiveStartKey } : {}),
        }));
        out.push(...(result.Items ?? []).map(toSession));
        exclusiveStartKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
      } while (exclusiveStartKey);
      return out;
    }));
    return results.flat().filter((s) => {
      const t = new Date(s.lastSeen).getTime();
      return t >= effectiveSince && t < until && isWithinRetention(s.lastSeen);
    });
  }
}
