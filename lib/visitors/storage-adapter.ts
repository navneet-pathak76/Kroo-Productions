import "server-only";
import type { PageViewRecord, VisitorListResult, VisitorSessionRecord } from "./types";

export type VisitorStorageMode = "memory" | "dynamodb";

export type RecordPageViewInput = {
  sessionId: string;
  visitorId: string;
  path: string;
  referrer?: string;
  geo: VisitorSessionRecord["geo"];
  client: VisitorSessionRecord["client"];
  ipHash?: string;
  timestamp: string;
};

export interface VisitorStorageAdapter {
  readonly mode: VisitorStorageMode;
  isConfigured(): boolean;

  /** Upsert the session aggregate + append a page view row. Must be idempotent-safe on retry. */
  recordPageView(input: RecordPageViewInput): Promise<void>;

  getSession(sessionId: string): Promise<VisitorSessionRecord | null>;
  getPageViews(sessionId: string, limit?: number): Promise<PageViewRecord[]>;

  /** Most recently active sessions, newest first. Cursor is an opaque base64 token. */
  listRecentSessions(limit: number, cursor?: string): Promise<VisitorListResult>;

  /** Sessions whose lastSeen falls within [sinceIso, untilIso). Used by analytics. */
  listSessionsInRange(sinceIso: string, untilIso: string): Promise<VisitorSessionRecord[]>;
}
