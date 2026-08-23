import "server-only";
import type { PageViewRecord, VisitorListResult, VisitorSessionRecord } from "@/lib/visitors/types";
import type {
  RecordPageViewInput,
  VisitorStorageAdapter,
} from "@/lib/visitors/storage-adapter";

const MAX_SESSIONS = 5_000;
const MAX_PAGE_VIEWS_PER_SESSION = 500;

const sessions = new Map<string, VisitorSessionRecord>();
const pageViews = new Map<string, PageViewRecord[]>();
// Insertion-ordered session ids, most-recent-last; used for cheap "recent" listing.
const sessionOrder: string[] = [];

function touchOrder(sessionId: string): void {
  const idx = sessionOrder.indexOf(sessionId);
  if (idx !== -1) sessionOrder.splice(idx, 1);
  sessionOrder.push(sessionId);
  if (sessionOrder.length > MAX_SESSIONS) {
    const evicted = sessionOrder.shift();
    if (evicted) {
      sessions.delete(evicted);
      pageViews.delete(evicted);
    }
  }
}

export class MemoryVisitorAdapter implements VisitorStorageAdapter {
  readonly mode = "memory" as const;

  isConfigured(): boolean {
    return true;
  }

  async recordPageView(input: RecordPageViewInput): Promise<void> {
    const existing = sessions.get(input.sessionId);

    if (existing) {
      existing.lastSeen = input.timestamp;
      existing.exitPage = input.path;
      existing.pageCount += 1;
      existing.durationMs = Math.max(
        0,
        new Date(input.timestamp).getTime() - new Date(existing.firstSeen).getTime(),
      );
    } else {
      const session: VisitorSessionRecord = {
        sessionId: input.sessionId,
        visitorId: input.visitorId,
        isNewVisitor: true,
        firstSeen: input.timestamp,
        lastSeen: input.timestamp,
        entryPage: input.path,
        exitPage: input.path,
        pageCount: 1,
        durationMs: 0,
        referrer: input.referrer,
        geo: input.geo,
        client: input.client,
        ipHash: input.ipHash,
      };
      sessions.set(input.sessionId, session);
    }

    const views = pageViews.get(input.sessionId) ?? [];
    views.push({
      sessionId: input.sessionId,
      path: input.path,
      referrer: input.referrer,
      timestamp: input.timestamp,
    });
    if (views.length > MAX_PAGE_VIEWS_PER_SESSION) views.shift();
    pageViews.set(input.sessionId, views);

    touchOrder(input.sessionId);
  }

  async getSession(sessionId: string): Promise<VisitorSessionRecord | null> {
    return sessions.get(sessionId) ?? null;
  }

  async getPageViews(sessionId: string, limit = 500): Promise<PageViewRecord[]> {
    const views = pageViews.get(sessionId) ?? [];
    return views.slice(-limit);
  }

  async listRecentSessions(limit: number, cursor?: string): Promise<VisitorListResult> {
    const ordered = [...sessionOrder].reverse();
    const offset = cursor ? Number.parseInt(Buffer.from(cursor, "base64url").toString("utf8"), 10) : 0;
    const slice = ordered.slice(offset, offset + limit);
    const items = slice
      .map((id) => sessions.get(id))
      .filter((s): s is VisitorSessionRecord => Boolean(s));

    const nextOffset = offset + limit;
    const nextCursor =
      nextOffset < ordered.length ? Buffer.from(String(nextOffset)).toString("base64url") : undefined;

    return { items, nextCursor };
  }

  async listSessionsInRange(sinceIso: string, untilIso: string): Promise<VisitorSessionRecord[]> {
    const since = new Date(sinceIso).getTime();
    const until = new Date(untilIso).getTime();
    return [...sessions.values()].filter((s) => {
      const t = new Date(s.lastSeen).getTime();
      return t >= since && t < until;
    });
  }
}

export function getMemoryVisitorSessions(): VisitorSessionRecord[] {
  return [...sessions.values()];
}

export const MEMORY_VISITOR_MAX_SESSIONS = MAX_SESSIONS;
