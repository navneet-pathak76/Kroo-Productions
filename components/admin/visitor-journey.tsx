"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PageViewRecord, VisitorSessionRecord } from "@/lib/visitors/types";
import { MetricCard, TextValueCard, Section, EmptyState } from "@/components/admin/ui";

type Viewer = { email: string; role: string; name?: string };

type Props = {
  session: VisitorSessionRecord | null;
  pageViews: PageViewRecord[];
  sessionId: string;
  viewer: Viewer;
};

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

function formatLocation(session: VisitorSessionRecord): string {
  const parts = [session.geo.city, session.geo.region, session.geo.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Unknown";
}

function readCachedSession(sessionId: string): VisitorSessionRecord | null {
  try {
    const raw = window.sessionStorage.getItem(`kroo:visitor:${sessionId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VisitorSessionRecord;
    return parsed?.sessionId === sessionId ? parsed : null;
  } catch {
    return null;
  }
}

export function VisitorJourney({ session: initialSession, pageViews: initialPageViews, sessionId, viewer }: Props) {
  const [session, setSession] = useState<VisitorSessionRecord | null>(initialSession);
  const [pageViews, setPageViews] = useState<PageViewRecord[]>(initialPageViews);
  const [loading, setLoading] = useState(!initialSession);

  useEffect(() => {
    let cancelled = false;

    async function loadJourney() {
      // The visitors list already contains the complete session record. Keep
      // it locally so the journey page still works when a serverless request
      // lands on another instance and the in-memory fallback is unavailable.
      const cached = readCachedSession(sessionId);
      if (cached && !cancelled) setSession((current) => current ?? cached);

      try {
        const response = await fetch(`/api/admin/visitors/${encodeURIComponent(sessionId)}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
          const data = (await response.json()) as {
            session?: VisitorSessionRecord;
            pageViews?: PageViewRecord[];
          };
          if (!cancelled) {
            if (data.session) setSession(data.session);
            if (Array.isArray(data.pageViews)) setPageViews(data.pageViews);
          }
        }
      } catch {
        // Keep the cached/server-provided session details. Page history is
        // optional when the durable store is temporarily unavailable.
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadJourney();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-primary">Kroo Production</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Visitor journey</h1>
          <p className="mt-1 text-sm text-white/50">{viewer.name ?? viewer.email} · {viewer.role}</p>
        </div>
        <Link href="/admin/visitors" className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5">
          Back to visitors
        </Link>
      </header>

      {loading && !session ? (
        <div className="cinema-panel rounded-xl p-6 text-sm text-white/55">Loading visitor details…</div>
      ) : !session ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-6 text-sm text-red-300">
          This visitor session could not be loaded. Return to Visitors and open the journey again.
        </div>
      ) : (
        <div className="space-y-10">
          <Section title="Visitor information">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <TextValueCard label="IP address" value={session.ip ?? "Unavailable for this session"} />
              <TextValueCard label="Location" value={formatLocation(session)} />
              <TextValueCard label="Operating system" value={session.client.os} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <TextValueCard label="Device" value={session.client.device} />
              <TextValueCard label="Browser" value={session.client.browser} />
              <TextValueCard label="Country / region" value={[session.geo.country, session.geo.region].filter(Boolean).join(" · ") || "Unknown"} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <TextValueCard label="Visitor ID" value={session.visitorId} />
              <TextValueCard label="Session ID" value={session.sessionId} />
              <TextValueCard label="IP hash" value={session.ipHash ?? "Unavailable"} />
            </div>
          </Section>

          <Section title="Session overview">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Pages viewed" value={session.pageCount} />
              <MetricCard label="Duration" value={formatDuration(session.durationMs)} />
              <TextValueCard label="First seen" value={new Date(session.firstSeen).toLocaleString()} />
              <TextValueCard label="Last seen" value={new Date(session.lastSeen).toLocaleString()} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextValueCard label="Entry page" value={session.entryPage} />
              <TextValueCard label="Exit page" value={session.exitPage} />
            </div>
            {session.referrer && <TextValueCard label="Referrer" value={session.referrer} />}
          </Section>

          <Section title="Page-by-page journey">
            {pageViews.length === 0 ? (
              <EmptyState message="No page views are available for this session. Session/device details are still shown above." />
            ) : (
              <ol className="space-y-3">
                {pageViews.map((view, index) => (
                  <li key={`${view.timestamp}-${index}`} className="cinema-panel flex items-start gap-4 rounded-xl p-4">
                    <div className="flex flex-col items-center pt-1">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">{index + 1}</span>
                      {index < pageViews.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-white/10" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white/90">{view.path}</p>
                      <p className="mt-1 text-xs text-white/45">
                        {new Date(view.timestamp).toLocaleString()}
                        {view.referrer && ` · from ${view.referrer}`}
                      </p>
                    </div>
                  </li>
                ))}
                <li className="cinema-panel rounded-xl p-4 text-center text-xs uppercase tracking-wider text-white/40">Exit</li>
              </ol>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}
