"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const VISITOR_ID_KEY = "kroo_vid";
const SESSION_ID_KEY = "kroo_sid";
const SESSION_EXPIRY_KEY = "kroo_sid_exp";
const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function safeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    // Storage can throw in private-browsing modes / disabled-storage settings.
    return null;
  }
}

function getOrCreateVisitorId(storage: Storage | null): string {
  if (!storage) return generateId();
  const existing = storage.getItem(VISITOR_ID_KEY);
  if (existing) return existing;
  const created = generateId();
  storage.setItem(VISITOR_ID_KEY, created);
  return created;
}

function getOrCreateSessionId(storage: Storage | null): string {
  if (!storage) return generateId();

  const now = Date.now();
  const existing = storage.getItem(SESSION_ID_KEY);
  const expiry = Number(storage.getItem(SESSION_EXPIRY_KEY) ?? "0");

  if (existing && expiry > now) {
    storage.setItem(SESSION_EXPIRY_KEY, String(now + SESSION_IDLE_TIMEOUT_MS));
    return existing;
  }

  const created = generateId();
  storage.setItem(SESSION_ID_KEY, created);
  storage.setItem(SESSION_EXPIRY_KEY, String(now + SESSION_IDLE_TIMEOUT_MS));
  return created;
}

function sendPageView(path: string, referrer: string | undefined): void {
  const storage = safeStorage();
  const body = JSON.stringify({
    sessionId: getOrCreateSessionId(storage),
    visitorId: getOrCreateVisitorId(storage),
    path,
    referrer,
    screenWidth: window.screen?.width,
    screenHeight: window.screen?.height,
  });

  try {
    if ("sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/visitors/track", blob);
      if (sent) return;
    }
  } catch {
    // fall through to fetch
  }

  void fetch("/api/visitors/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // Visitor tracking must never surface an error to the visitor.
  });
}

export function VisitorTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef<string | null>(null);
  const referrerRef = useRef<string>(typeof document !== "undefined" ? document.referrer : "");

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname === lastPathRef.current) return;

    sendPageView(pathname, referrerRef.current || undefined);
    // Only the first page view of the browsing session carries the
    // external referrer — subsequent in-app navigations are same-site.
    referrerRef.current = "";
    lastPathRef.current = pathname;
  }, [pathname]);

  return null;
}
