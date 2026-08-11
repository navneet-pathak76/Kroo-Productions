"use client";

import { getDeviceCapability } from "@/lib/device-capability";
import type { TelemetryPayload } from "@/lib/telemetry/types";

function buildCapability() {
  const cap = getDeviceCapability();
  return {
    tier: cap.performanceTier,
    browser: cap.browserLabel,
    engine: cap.engine,
    device: cap.deviceLabel,
    pointer: cap.pointer,
    reducedMotion: cap.reducedMotion,
    saveData: cap.saveData,
  };
}

export async function reportClientTelemetry(payload: Omit<TelemetryPayload, "capability">): Promise<void> {
  try {
    await fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        capability: buildCapability(),
      }),
      keepalive: true,
    });
  } catch {
    // never throw
  }
}

export async function reportApiError(route: string, message: string): Promise<void> {
  await reportClientTelemetry({
    kind: "api-error",
    route,
    message: message.slice(0, 2000),
    source: "fetch",
  });
}
