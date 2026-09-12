import "server-only";
import type { TelemetrySnapshot } from "@/lib/telemetry/types";

const SNAPSHOT_CACHE_TTL_MS = 5_000;

let cachedSnapshot: TelemetrySnapshot | null = null;
let cachedAt = 0;
let pending: Promise<TelemetrySnapshot> | null = null;

export async function getCachedTelemetrySnapshot(
  loader: () => Promise<TelemetrySnapshot>,
): Promise<TelemetrySnapshot> {
  const now = Date.now();
  if (cachedSnapshot && now - cachedAt < SNAPSHOT_CACHE_TTL_MS) return cachedSnapshot;

  if (pending) return pending;

  pending = loader()
    .then((snapshot) => {
      cachedSnapshot = snapshot;
      cachedAt = Date.now();
      return snapshot;
    })
    .finally(() => {
      pending = null;
    });

  return pending;
}
