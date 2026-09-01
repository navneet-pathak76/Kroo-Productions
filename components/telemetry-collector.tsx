"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals";
import { getDeviceCapability } from "@/lib/device-capability";
import type { TelemetryPayload } from "@/lib/telemetry/types";

// Telemetry is diagnostic data, not a real-time feature. Flush in batches so
// analytics never competes with the public site's rendering/network budget.
const FLUSH_INTERVAL_MS = 10_000;
const MAX_QUEUE = 20;

function buildCapability() {
  const cap = getDeviceCapability();
  return {
    tier: cap.performanceTier,
    browser: cap.browserLabel,
    engine: cap.engine,
    device: cap.deviceLabel,
    pointer: cap.pointer,
    touch: cap.touch,
    reducedMotion: cap.reducedMotion,
    saveData: cap.saveData,
  };
}

function metricRating(metric: Metric): TelemetryPayload["rating"] {
  return metric.rating as TelemetryPayload["rating"];
}

async function sendEvents(events: TelemetryPayload[]): Promise<void> {
  if (events.length === 0) return;

  try {
    await fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(events.length === 1 ? events[0] : events),
      keepalive: true,
    });
  } catch {
    // Swallow — telemetry must never break the page
  }
}

export function TelemetryCollector() {
  const pathname = usePathname();
  const queueRef = useRef<TelemetryPayload[]>([]);
  const routeRef = useRef(pathname);

  useEffect(() => {
    routeRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const enqueue = (payload: TelemetryPayload) => {
      queueRef.current.push(payload);
      if (queueRef.current.length >= MAX_QUEUE) {
        const batch = queueRef.current.splice(0, MAX_QUEUE);
        void sendEvents(batch);
      }
    };

    const originalFetch = window.fetch.bind(window);
    const getRouteFromInput = (input: RequestInfo | URL) => {
      if (typeof input === "string") {
        try {
          return new URL(input, window.location.origin).pathname;
        } catch {
          return undefined;
        }
      }
      if (input instanceof Request) {
        return new URL(input.url).pathname;
      }
      if (input instanceof URL) {
        return input.pathname;
      }
      return undefined;
    };

    const wrapFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const route = getRouteFromInput(input);
      try {
        const response = await originalFetch(input, init);
        if (!response.ok && route && !route.startsWith("/api/telemetry") && !route.startsWith("/_next")) {
          enqueue({
            kind: "api-error",
            route: routeRef.current || route,
            message: `HTTP ${response.status} ${response.statusText || "request failed"}`.slice(0, 2000),
            source: init?.method?.toUpperCase() ?? "fetch",
            capability: buildCapability(),
          });
        }
        return response;
      } catch (error) {
        if (route && !route.startsWith("/api/telemetry") && !route.startsWith("/_next")) {
          enqueue({
            kind: "api-error",
            route: routeRef.current || route,
            message: error instanceof Error ? error.message : "Network request failed",
            source: "fetch",
            capability: buildCapability(),
          });
        }
        throw error;
      }
    };

    window.fetch = wrapFetch as typeof window.fetch;

    const reportWebVital = (metric: Metric) => {
      enqueue({
        kind: "web-vital",
        route: routeRef.current,
        metric: metric.name,
        value: metric.value,
        rating: metricRating(metric),
        capability: buildCapability(),
      });
    };

    onLCP(reportWebVital);
    onINP(reportWebVital);
    onCLS(reportWebVital);
    onFCP(reportWebVital);
    onTTFB(reportWebVital);

    const onError = (event: ErrorEvent) => {
      enqueue({
        kind: "client-error",
        route: routeRef.current,
        message: event.message?.slice(0, 2000) ?? "Unknown error",
        source: event.filename ? `${event.filename}:${event.lineno}` : undefined,
        capability: buildCapability(),
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason =
        event.reason instanceof Error
          ? event.reason.message
          : typeof event.reason === "string"
            ? event.reason
            : "Unhandled rejection";
      enqueue({
        kind: "unhandled-rejection",
        route: routeRef.current,
        message: reason.slice(0, 2000),
        capability: buildCapability(),
      });
    };

    const onMediaError = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLMediaElement)) return;
      enqueue({
        kind: "media-error",
        route: routeRef.current,
        message: `Media failed: ${target.currentSrc || target.src || "unknown"}`,
        source: target.tagName.toLowerCase(),
        capability: buildCapability(),
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    document.addEventListener("error", onMediaError, true);

    const flushTimer = window.setInterval(() => {
      if (queueRef.current.length === 0) return;
      const batch = queueRef.current.splice(0, MAX_QUEUE);
      void sendEvents(batch);
    }, FLUSH_INTERVAL_MS);

    const reportNavigationTiming = () => {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (!nav) return;

      enqueue({
        kind: "navigation-timing",
        route: routeRef.current,
        metric: "TTFB",
        value: nav.responseStart - nav.requestStart,
        capability: buildCapability(),
      });
    };

    if (document.readyState === "complete") {
      reportNavigationTiming();
    } else {
      window.addEventListener("load", reportNavigationTiming, { once: true });
    }

    const flushOnHide = () => {
      if (queueRef.current.length === 0) return;
      const batch = queueRef.current.splice(0, MAX_QUEUE);
      void sendEvents(batch);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushOnHide();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.fetch = originalFetch;
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      document.removeEventListener("error", onMediaError, true);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.clearInterval(flushTimer);
      flushOnHide();
    };
  }, []);

  return null;
}
