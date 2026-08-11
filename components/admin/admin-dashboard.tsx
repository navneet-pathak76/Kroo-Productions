"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TelemetrySnapshot } from "@/lib/telemetry/types";
import { OptimizationPanel } from "@/components/admin/optimization-panel";
import { MediaManager } from "@/components/admin/media-manager";

type Viewer = {
  email: string;
  role: string;
  name?: string;
};

type Props = {
  snapshot: TelemetrySnapshot;
  viewer: Viewer;
  mediaCdnBase: string;
};

function MetricCard({ label, value, unit }: { label: string; value?: number; unit?: string }) {
  return (
    <div className="cinema-panel rounded-xl p-4">
      <p className="text-xs uppercase tracking-wider text-white/45">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums">
        {value !== undefined ? `${value}${unit ?? ""}` : "—"}
      </p>
    </div>
  );
}

function TextValueCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="cinema-panel rounded-xl p-4">
      <p className="text-xs uppercase tracking-wider text-white/45">{label}</p>
      <p className="mt-2 break-all text-sm font-medium text-white/80">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/55">{title}</h2>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-sm text-white/50">{message}</p>;
}

export function AdminDashboard({ snapshot, viewer, mediaCdnBase }: Props) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  async function handleRefresh() {
    setRefreshing(true);
    router.refresh();
    setRefreshing(false);
  }

  const auditEvents = snapshot.recent.filter((r) => r.kind === "admin-audit");
  const recentClientEvents = snapshot.recent.filter((r) => r.kind !== "admin-audit").slice(0, 12);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-primary">Kroo Production</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Performance Dashboard</h1>
          <p className="mt-1 text-sm text-white/50">
            {viewer.name ?? viewer.email} · {viewer.role}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5 disabled:opacity-60"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/55">
        Storage: {snapshot.retention.mode}
        {snapshot.retention.durableStoreConfigured
          ? " (DynamoDB configured)"
          : ` — ${snapshot.retention.durableStoreRequired ?? "No durable store"}`}
        {" · "}
        Generated {new Date(snapshot.generatedAt).toLocaleString()}
      </div>

      <div className="space-y-10">
        <Section title="Overview">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Total Events" value={snapshot.totals.records} />
            <MetricCard label="Web Vitals" value={snapshot.totals.webVitals} />
            <MetricCard label="Client Errors" value={snapshot.totals.clientErrors} />
            <MetricCard label="Media Errors" value={snapshot.totals.mediaErrors} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="cinema-panel rounded-xl p-4 text-sm">
              <p className="text-xs uppercase tracking-wider text-white/45">Health</p>
              <ul className="mt-2 space-y-1 text-white/75">
                <li>Telemetry API: {snapshot.health.telemetryApi}</li>
                <li>Admin auth: {snapshot.health.adminAuthConfigured ? "configured" : "missing"}</li>
                <li>Durable store: {snapshot.health.durableStoreConfigured ? "connected" : "not configured"}</li>
              </ul>
            </div>
            <div className="cinema-panel rounded-xl p-4 text-sm sm:col-span-2">
              <p className="text-xs uppercase tracking-wider text-white/45">Recent Events</p>
              {recentClientEvents.length === 0 ? (
                <p className="mt-2 text-white/50">No data available</p>
              ) : (
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs text-white/70">
                  {recentClientEvents.map((event) => (
                    <li key={event.id} className="flex flex-wrap gap-2">
                      <span className="uppercase text-white/45">{event.kind}</span>
                      <span className="font-mono">{event.route}</span>
                      <span>{new Date(event.timestamp).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Section>

        <Section title="Performance">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Total Events" value={snapshot.totals.records} />
            <MetricCard label="Client Errors" value={snapshot.totals.clientErrors + snapshot.totals.apiErrors} />
            <MetricCard label="Media Errors" value={snapshot.totals.mediaErrors} />
            <TextValueCard label="Top Route" value={snapshot.byRoute[0]?.route ?? "No data available"} />
          </div>
        </Section>

        <Section title="Web Vitals">
          {Object.keys(snapshot.webVitals).length === 0 ? (
            <EmptyState message="No data available — Web Vitals will appear as visitors browse the site." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard label="LCP" value={snapshot.webVitals.LCP?.p75} unit="ms" />
              <MetricCard label="INP" value={snapshot.webVitals.INP?.p75} unit="ms" />
              <MetricCard label="CLS" value={snapshot.webVitals.CLS?.p75} />
              <MetricCard label="FCP" value={snapshot.webVitals.FCP?.p75} unit="ms" />
              <MetricCard label="TTFB" value={snapshot.webVitals.TTFB?.p75} unit="ms" />
            </div>
          )}
        </Section>

        <Section title="Devices">
          {snapshot.byTier.length === 0 ? (
            <EmptyState message="No data available" />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-white/45">
                  <tr>
                    <th className="px-4 py-3">Tier</th>
                    <th className="px-4 py-3">Events</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.byTier.map((row) => (
                    <tr key={row.tier} className="border-t border-white/8">
                      <td className="px-4 py-3">{row.tier}</td>
                      <td className="px-4 py-3 tabular-nums">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {snapshot.byDevice.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-white/45">
                  <tr>
                    <th className="px-4 py-3">Device Category</th>
                    <th className="px-4 py-3">Events</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.byDevice.map((row) => (
                    <tr key={row.device} className="border-t border-white/8">
                      <td className="px-4 py-3">{row.device}</td>
                      <td className="px-4 py-3 tabular-nums">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {(snapshot.byPointer.length > 0 || snapshot.byTouch.length > 0) && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {snapshot.byPointer.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="min-w-full text-sm">
                    <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-white/45">
                      <tr>
                        <th className="px-4 py-3">Pointer</th>
                        <th className="px-4 py-3">Events</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshot.byPointer.map((row) => (
                        <tr key={row.pointer} className="border-t border-white/8">
                          <td className="px-4 py-3">{row.pointer}</td>
                          <td className="px-4 py-3 tabular-nums">{row.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              {snapshot.byTouch.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="min-w-full text-sm">
                    <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-white/45">
                      <tr>
                        <th className="px-4 py-3">Input</th>
                        <th className="px-4 py-3">Events</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshot.byTouch.map((row) => (
                        <tr key={String(row.touch)} className="border-t border-white/8">
                          <td className="px-4 py-3">{row.touch ? "Touch" : "Non-touch"}</td>
                          <td className="px-4 py-3 tabular-nums">{row.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          )}
          {snapshot.byReducedMotion.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-white/45">
                  <tr>
                    <th className="px-4 py-3">Motion Preference</th>
                    <th className="px-4 py-3">Events</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.byReducedMotion.map((row) => (
                    <tr key={String(row.reducedMotion)} className="border-t border-white/8">
                      <td className="px-4 py-3">{row.reducedMotion ? "Reduce motion" : "No preference"}</td>
                      <td className="px-4 py-3 tabular-nums">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title="Browsers">
          {snapshot.byBrowser.length === 0 ? (
            <EmptyState message="No data available" />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-white/45">
                  <tr>
                    <th className="px-4 py-3">Browser</th>
                    <th className="px-4 py-3">Events</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.byBrowser.map((row) => (
                    <tr key={row.browser} className="border-t border-white/8">
                      <td className="px-4 py-3">{row.browser}</td>
                      <td className="px-4 py-3 tabular-nums">{row.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title="Routes">
          {snapshot.byRoute.length === 0 ? (
            <EmptyState message="No data available" />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-white/45">
                  <tr>
                    <th className="px-4 py-3">Route</th>
                    <th className="px-4 py-3">Events</th>
                    <th className="px-4 py-3">Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.byRoute.map((row) => (
                    <tr key={row.route} className="border-t border-white/8">
                      <td className="px-4 py-3 font-mono text-xs">{row.route}</td>
                      <td className="px-4 py-3 tabular-nums">{row.count}</td>
                      <td className="px-4 py-3 tabular-nums text-red-300">{row.errors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title="Errors">
          {snapshot.recentErrors.length === 0 ? (
            <EmptyState message="No errors recorded" />
          ) : (
            <div className="space-y-2">
              {snapshot.recentErrors.slice(0, 20).map((event) => (
                <div key={event.id} className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/45">
                    <span className="uppercase">{event.kind}</span>
                    <span>{new Date(event.timestamp).toLocaleString()}</span>
                    <span className="font-mono">{event.route}</span>
                  </div>
                  <p className="mt-1 break-words text-white/85">{event.message}</p>
                  {event.source ? <p className="mt-1 text-xs text-white/45">{event.source}</p> : null}
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Media Library">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <TextValueCard label="CDN Base" value={mediaCdnBase || "Not configured"} />
            <MetricCard label="Media Errors" value={snapshot.totals.mediaErrors} />
            <TextValueCard label="Latest Media Event" value={snapshot.recentErrors.find((event) => event.kind === "media-error")?.route ?? "No media failures"} />
          </div>
          <div className="mt-4">
            <MediaManager />
          </div>
        </Section>

        <Section title="Admin Audit">
          {auditEvents.length === 0 ? (
            <EmptyState message="No admin audit events recorded" />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-white/45">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Admin</th>
                    <th className="px-4 py-3">Route</th>
                  </tr>
                </thead>
                <tbody>
                  {auditEvents.slice(0, 30).map((event) => (
                    <tr key={event.id} className="border-t border-white/8">
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(event.timestamp).toLocaleString()}</td>
                      <td className="px-4 py-3">{event.message}</td>
                      <td className="px-4 py-3">{event.source ?? "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs">{event.route}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <Section title="Infrastructure">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="cinema-panel rounded-xl p-4 text-sm">
              <p className="text-xs uppercase tracking-wider text-white/45">Telemetry Storage</p>
              <p className="mt-2">
                {snapshot.retention.durableStoreConfigured
                  ? "DynamoDB connected"
                  : "In-memory only (configure TELEMETRY_DYNAMODB_TABLE for production persistence)"}
              </p>
            </div>
            <div className="cinema-panel rounded-xl p-4 text-sm">
              <p className="text-xs uppercase tracking-wider text-white/45">Media CDN</p>
              <p className="mt-2 font-mono text-xs break-all">{mediaCdnBase}</p>
            </div>
          </div>
        </Section>

        <OptimizationPanel />
      </div>
    </div>
  );
}
