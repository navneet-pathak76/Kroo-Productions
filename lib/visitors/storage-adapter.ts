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
  ip?: string;
  ipHash?: string;
  timestamp: string;
};

export interface VisitorStorageAdapter {
  readonly mode: VisitorStorageMode;
  isConfigured(): boolean;
  recordPageView(input: RecordPageViewInput): Promise<void>;
  getSession(sessionId: string): Promise<VisitorSessionRecord | null>;
  getPageViews(sessionId: string, limit?: number): Promise<PageViewRecord[]>;
  listRecentSessions(limit: number, cursor?: string): Promise<VisitorListResult>;
  listSessionsInRange(sinceIso: string, untilIso: string): Promise<VisitorSessionRecord[]>;
}
