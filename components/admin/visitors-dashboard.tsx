"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { VisitorListItem } from "@/lib/visitors/types";
import { MetricCard, Section, EmptyState } from "@/components/admin/ui";

type Viewer = { email: string; role: string; name?: string };

type Props = {
  initialItems: VisitorListItem[];
  initialCursor?: string;
  durableStoreConfigured: boolean;
  viewer: Viewer;
};

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function formatLocation(item: VisitorListItem): string {
  const parts = [item.geo.city, item.geo.region, item.geo.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Unknown";
}

function cacheVisitorSession(item: VisitorListItem): void {
  try {
    window.localStorage.setItem(
      `kroo:visitor:${item.sessionId}`,
      JSON.stringify({ cachedAt: Date.now(), item }),
    );
  } catch {
    // localStorage can be unavailable in hardened/private browser contexts.
  }
}

function sameVisitorList(a: VisitorListItem[], b: VisitorListItem[]): boolean {
  if (a.length !== b.length) return false;
  for (let index = 0; index < a.length; index += 1) {
    const left = a[index];
    const right = b[index];
    if (
      left.sessionId !== right.sessionId ||
      left.lastSeen !== right.lastSeen ||
      left.pageCount !== right.pageCount ||
      left.durationMs !== right.durationMs ||
      left.entryPage !== right.entryPage
    ) {
      return false;
    }
  }
  return true;
}

export function VisitorsDashboard({ initialItems, initialCursor, durableStoreConfigured, viewer }: Props) {
  const [items, setItems] = useState(initialItems);
  const [cursor, setCursor] = useState(initialCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live] = useState(true);
  const refreshingRef = useRef(false);

  const uniqueVisitorCount = new Set(items.map((i) => i.visitorId)).size;
  const newVisitorCount = items.filter((i) => i.isNewVisitor).length;

  async function refreshVisitors(silent = false) {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    if (!silent) setRefreshing(true);
    if (!silent) setError(null);

    try {
      const res = await fetch("/api/admin/visitors?limit=25", {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Failed to refresh visitors.");

      const data = (await res.json()) as { items: VisitorListItem[]; nextCursor?: string };
      const freshItems = data.items ?? [];

      // Keep any additional sessions already loaded while replacing the newest
      // page with the latest server state. Avoid a React state update when the
      // actual visitor data did not change; this is important for a one-second
      // live poll because a no-op poll should cost essentially zero rendering.
      setItems((prev) => {
        const freshIds = new Set(freshItems.map((item) => item.sessionId));
        const olderLoaded = prev.filter((item) => !freshIds.has(item.sessionId));
        const next = [...freshItems, ...olderLoaded].sort(
          (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime(),
        );
        return sameVisitorList(prev, next) ? prev : next;
      });
      setCursor((prev) => (prev === data.nextCursor ? prev : data.nextCursor));
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : "Failed to refresh visitors.");
    } finally {
      refreshingRef.current = false;
      if (!silent) setRefreshing(false);
    }
  }

  // Keep one-second freshness while the dashboard is visible, but do not
  // generate background requests or rerenders while the admin tab is hidden.
  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshVisitors(true);
      }
    };

    const interval = window.setInterval(refreshIfVisible, 1000);
    document.addEventListener("visibilitychange", refreshIfVisible);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, []);

  async function handleLoadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/visitors?cursor=${encodeURIComponent(cursor)}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load more visitors.");
      const data = (await res.json()) as { items: VisitorListItem[]; nextCursor?: string };
      setItems((prev) => [...prev, ...data.items]);
      setCursor(data.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more visitors.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleRefresh() {
    await refreshVisitors(false);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-primary">Kroo Production</p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Visitors</h1>
            {live && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-primary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Live
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-white/50">
            {viewer.name ?? viewer.email} · {viewer.role}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin" className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5">
            Dashboard
          </Link>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-60"
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/55">
        Storage: {durableStoreConfigured ? "dynamodb (DynamoDB configured)" : "memory — set VISITOR_DYNAMODB_TABLE for production"}
        <span className="ml-3 text-primary/80">· Live updates every second</span>
      </div>

      <div className="space-y-10">
        <Section title="Overview">
          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard label="Sessions loaded" value={items.length} />
            <MetricCard label="Unique visitors" value={uniqueVisitorCount} />
            <MetricCard label="New visitors" value={newVisitorCount} />
          </div>
        </Section>

        <Section title="Recent sessions">
          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {items.length === 0 ? (
            <EmptyState message="No visitors recorded yet. Browse the public site to generate activity, then refresh." />
          ) : (
            <div className="cinema-panel overflow-x-auto rounded-xl">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/45">
                    <th className="px-4 py-3 font-medium">Last seen</th>
                    <th className="px-4 py-3 font-medium">Entry page</th>
                    <th className="px-4 py-3 font-medium">Pages</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Device</th>
                    <th className="px-4 py-3 font-medium">Browser</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.sessionId} className="border-b border-white/5 last:border-0 hover:bg-white/[0.03]">
                      <td className="px-4 py-3 tabular-nums text-white/80">
                        {new Date(item.lastSeen).toLocaleString()}
                        {item.isNewVisitor && (
                          <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-primary">
                            New
                          </span>
                        )}
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-3 text-white/70">{item.entryPage}</td>
                      <td className="px-4 py-3 tabular-nums text-white/70">{item.pageCount}</td>
                      <td className="px-4 py-3 tabular-nums text-white/70">{formatDuration(item.durationMs)}</td>
                      <td className="px-4 py-3 text-white/70">{formatLocation(item)}</td>
                      <td className="px-4 py-3 capitalize text-white/70">{item.client.device}</td>
                      <td className="px-4 py-3 text-white/70">{item.client.browser}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/visitors/${item.sessionId}`}
                          onClick={() => cacheVisitorSession(item)}
                          className="text-xs text-primary hover:underline"
                        >
                          View journey
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {cursor && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-60"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </Section>
      </div>
    </div>
  );
}
