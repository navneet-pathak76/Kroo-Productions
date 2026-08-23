import "server-only";
import type { VisitorTrackPayload } from "./types";

const MAX_PAYLOAD_BYTES = 4_096;
const MAX_PATH_LENGTH = 512;
const MAX_REFERRER_LENGTH = 512;
// Client generates these as crypto.randomUUID() — validate shape, don't trust content.
const ID_PATTERN = /^[a-zA-Z0-9-]{8,64}$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeString(value: unknown, maxLen: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, maxLen);
  return trimmed.length > 0 ? trimmed : undefined;
}

export type ValidationResult =
  | { ok: true; payload: VisitorTrackPayload }
  | { ok: false; error: string };

export function validatePayloadSize(body: string): boolean {
  return body.length <= MAX_PAYLOAD_BYTES;
}

export function validateVisitorTrackPayload(raw: unknown): ValidationResult {
  if (!isPlainObject(raw)) {
    return { ok: false, error: "Payload must be an object." };
  }

  const sessionId = sanitizeString(raw.sessionId, 64);
  if (!sessionId || !ID_PATTERN.test(sessionId)) {
    return { ok: false, error: "Invalid sessionId." };
  }

  const visitorId = sanitizeString(raw.visitorId, 64);
  if (!visitorId || !ID_PATTERN.test(visitorId)) {
    return { ok: false, error: "Invalid visitorId." };
  }

  const path = sanitizeString(raw.path, MAX_PATH_LENGTH);
  if (!path || !path.startsWith("/")) {
    return { ok: false, error: "Path must be a valid path starting with /." };
  }
  // Never track the admin surface — visitor analytics must not leak who is
  // browsing admin-only pages, and admin traffic would pollute the numbers.
  if (path.startsWith("/admin")) {
    return { ok: false, error: "Admin routes are not tracked." };
  }

  const payload: VisitorTrackPayload = { sessionId, visitorId, path };

  const referrer = sanitizeString(raw.referrer, MAX_REFERRER_LENGTH);
  if (referrer) payload.referrer = referrer;

  if (typeof raw.screenWidth === "number" && Number.isFinite(raw.screenWidth) && raw.screenWidth > 0) {
    payload.screenWidth = Math.round(raw.screenWidth);
  }
  if (typeof raw.screenHeight === "number" && Number.isFinite(raw.screenHeight) && raw.screenHeight > 0) {
    payload.screenHeight = Math.round(raw.screenHeight);
  }

  return { ok: true, payload };
}
