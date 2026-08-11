import "server-only";
import type { TelemetryKind, TelemetryPayload } from "./types";

const ALLOWED_KINDS: TelemetryKind[] = [
  "web-vital",
  "client-error",
  "unhandled-rejection",
  "media-error",
  "api-error",
  "navigation-timing",
];

const ALLOWED_METRICS = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);
const ALLOWED_RATINGS = new Set(["good", "needs-improvement", "poor"]);
const MAX_PAYLOAD_BYTES = 16_384;
const MAX_ROUTE_LENGTH = 512;
const MAX_MESSAGE_LENGTH = 2_000;
const MAX_SOURCE_LENGTH = 512;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeString(value: unknown, maxLen: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, maxLen);
  return trimmed.length > 0 ? trimmed : undefined;
}

function sanitizeCapability(raw: unknown): TelemetryPayload["capability"] | undefined {
  if (!isPlainObject(raw)) return undefined;

  const capability: NonNullable<TelemetryPayload["capability"]> = {};
  const tier = sanitizeString(raw.tier, 16);
  const browser = sanitizeString(raw.browser, 64);
  const engine = sanitizeString(raw.engine, 32);
  const device = sanitizeString(raw.device, 32);
  const pointer = sanitizeString(raw.pointer, 16);

  if (tier) capability.tier = tier;
  if (browser) capability.browser = browser;
  if (engine) capability.engine = engine;
  if (device) capability.device = device;
  if (pointer) capability.pointer = pointer;
  if (typeof raw.reducedMotion === "boolean") capability.reducedMotion = raw.reducedMotion;
  if (typeof raw.saveData === "boolean") capability.saveData = raw.saveData;
  if (typeof raw.touch === "boolean") capability.touch = raw.touch;

  return Object.keys(capability).length > 0 ? capability : undefined;
}

export type ValidationResult =
  | { ok: true; payload: TelemetryPayload }
  | { ok: false; error: string };

export function validateTelemetryPayload(raw: unknown): ValidationResult {
  if (!isPlainObject(raw)) {
    return { ok: false, error: "Payload must be an object." };
  }

  const kind = raw.kind as TelemetryKind;
  if (!ALLOWED_KINDS.includes(kind)) {
    return { ok: false, error: "Invalid or disallowed event kind." };
  }

  const route = sanitizeString(raw.route, MAX_ROUTE_LENGTH);
  if (!route || !route.startsWith("/")) {
    return { ok: false, error: "Route must be a valid path starting with /." };
  }

  const payload: TelemetryPayload = { kind, route };

  const metric = sanitizeString(raw.metric, 32);
  if (metric) {
    if (kind === "web-vital" && !ALLOWED_METRICS.has(metric)) {
      return { ok: false, error: "Invalid web vital metric." };
    }
    payload.metric = metric;
  }

  if (raw.value !== undefined) {
    if (typeof raw.value !== "number" || !Number.isFinite(raw.value) || raw.value < 0) {
      return { ok: false, error: "Value must be a finite non-negative number." };
    }
    payload.value = raw.value;
  }

  const rating = sanitizeString(raw.rating, 32);
  if (rating) {
    if (!ALLOWED_RATINGS.has(rating)) {
      return { ok: false, error: "Invalid rating." };
    }
    payload.rating = rating as TelemetryPayload["rating"];
  }

  const message = sanitizeString(raw.message, MAX_MESSAGE_LENGTH);
  if (message) payload.message = message;

  const source = sanitizeString(raw.source, MAX_SOURCE_LENGTH);
  if (source) payload.source = source;

  payload.capability = sanitizeCapability(raw.capability);

  if (kind === "web-vital" && (!payload.metric || payload.value === undefined)) {
    return { ok: false, error: "Web vital events require metric and value." };
  }

  if (
    (kind === "client-error" || kind === "unhandled-rejection" || kind === "media-error" || kind === "api-error") &&
    !payload.message
  ) {
    return { ok: false, error: "Error events require a message." };
  }

  return { ok: true, payload };
}

export function validatePayloadSize(body: string): boolean {
  return body.length <= MAX_PAYLOAD_BYTES;
}

export function validateTelemetryBatch(raw: unknown): ValidationResult[] {
  if (!Array.isArray(raw)) {
    return [validateTelemetryPayload(raw)];
  }

  if (raw.length === 0 || raw.length > 20) {
    return [{ ok: false, error: "Batch must contain 1–20 events." }];
  }

  return raw.map((item) => validateTelemetryPayload(item));
}
