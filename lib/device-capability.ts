"use client";

/**
 * Lightweight, feature-detection-first device/browser capability engine.
 *
 * Runs ONCE on mount (never per-frame). Consumers subscribe via
 * `useDeviceCapability()` and get the same memoized snapshot until a
 * meaningful change occurs (resize crossing a breakpoint, orientation
 * change, reduced-motion preference toggling, or connection change) —
 * not on every pixel of movement.
 *
 * User-agent sniffing is used ONLY as a last-resort label (e.g. showing
 * "Safari" in an admin dashboard's device-breakdown table) — it never
 * gates a performance decision. Every performance-relevant decision
 * (tier, effects) is driven by feature detection.
 */

export type PerformanceTier = "LOW" | "MEDIUM" | "HIGH" | "ULTRA";

export type DeviceCapability = {
  /** Label only — never used to gate performance decisions. */
  deviceLabel: "iphone" | "ipad" | "android" | "desktop" | "unknown";
  /** Label only — never used to gate performance decisions. */
  browserLabel: string;
  engine: "webkit" | "blink" | "gecko" | "unknown";
  viewportWidth: number;
  dpr: number;
  touch: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  /** "slow-2g" | "2g" | "3g" | "4g" | undefined (unsupported in this browser) */
  effectiveConnectionType: string | undefined;
  webglSupported: boolean;
  hardwareConcurrency: number | undefined;
  /** GB, where the Device Memory API is available (Chromium only). */
  deviceMemoryGb: number | undefined;
  performanceTier: PerformanceTier;
};

function detectEngine(): DeviceCapability["engine"] {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/Firefox\//.test(ua)) return "gecko";
  // WebKit check MUST come before a generic "Chrome" check, since Chrome's
  // UA string also contains "AppleWebKit" — but real WebKit (Safari/iOS)
  // never contains "Chrome" or "Chromium".
  if (/AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg\//.test(ua)) return "webkit";
  if (/Chrome|Chromium|Edg\//.test(ua)) return "blink";
  return "unknown";
}

function detectDeviceLabel(): DeviceCapability["deviceLabel"] {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  // iPadOS 13+ reports as "Macintosh" with touch support — the only
  // reliable way to distinguish it from a real Mac is maxTouchPoints.
  const isIpadOs13Plus =
    /Macintosh/.test(ua) && typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1;
  if (/iPhone/.test(ua)) return "iphone";
  if (/iPad/.test(ua) || isIpadOs13Plus) return "ipad";
  if (/Android/.test(ua)) return "android";
  if (/Macintosh|Windows|Linux/.test(ua)) return "desktop";
  return "unknown";
}

function detectBrowserLabel(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/EdgiOS|Edg\//.test(ua)) return "edge";
  if (/CriOS|Chrome\//.test(ua) && /Brave/.test((navigator as { brave?: unknown }).brave ? "Brave" : "")) return "brave";
  if (/SamsungBrowser/.test(ua)) return "samsung-internet";
  if (/FxiOS|Firefox\//.test(ua)) return "firefox";
  if (/CriOS|Chrome\//.test(ua)) return "chrome";
  if (/Safari\//.test(ua) && !/Chrome|Chromium|CriOS/.test(ua)) return "safari";
  return "unknown";
}

function detectWebglSupport(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

/**
 * Tier is derived from *capability signals*, never from a device-name
 * lookup table. A high-end Android phone and an older iPhone with the
 * same DPR/memory/concurrency profile land in the same tier.
 */
function computeTier(input: {
  dpr: number;
  hardwareConcurrency: number | undefined;
  deviceMemoryGb: number | undefined;
  saveData: boolean;
  effectiveConnectionType: string | undefined;
  reducedMotion: boolean;
}): PerformanceTier {
  if (input.saveData || input.reducedMotion) return "LOW";
  if (input.effectiveConnectionType === "slow-2g" || input.effectiveConnectionType === "2g") return "LOW";

  const concurrency = input.hardwareConcurrency ?? 4; // reasonable default when unsupported
  const memory = input.deviceMemoryGb ?? 4; // Device Memory API is Chromium-only; default mid-tier elsewhere

  let score = 0;
  score += concurrency >= 8 ? 2 : concurrency >= 4 ? 1 : 0;
  score += memory >= 8 ? 2 : memory >= 4 ? 1 : 0;
  score += input.dpr >= 3 ? 1 : 0;
  score += input.effectiveConnectionType === "4g" || input.effectiveConnectionType === undefined ? 1 : 0;

  if (score >= 5) return "ULTRA";
  if (score >= 3) return "HIGH";
  if (score >= 1) return "MEDIUM";
  return "LOW";
}

function readCapabilitySnapshot(): DeviceCapability {
  const nav = typeof navigator !== "undefined" ? navigator : undefined;
  const connection = (nav as unknown as { connection?: { effectiveType?: string; saveData?: boolean } })
    ?.connection;

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const touch =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || (nav?.maxTouchPoints ?? 0) > 0);
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = Boolean(connection?.saveData);
  const effectiveConnectionType = connection?.effectiveType;
  const hardwareConcurrency = nav?.hardwareConcurrency;
  // Device Memory API: Chromium only, always undefined on Safari/Firefox —
  // computeTier() already treats "undefined" as a safe mid-tier default.
  const deviceMemoryGb = (nav as unknown as { deviceMemory?: number })?.deviceMemory;
  const viewportWidth = typeof document !== "undefined" ? document.documentElement.clientWidth : 1440;

  return {
    deviceLabel: detectDeviceLabel(),
    browserLabel: detectBrowserLabel(),
    engine: detectEngine(),
    viewportWidth,
    dpr,
    touch,
    reducedMotion,
    saveData,
    effectiveConnectionType,
    webglSupported: detectWebglSupport(),
    hardwareConcurrency,
    deviceMemoryGb,
    performanceTier: computeTier({
      dpr,
      hardwareConcurrency,
      deviceMemoryGb,
      saveData,
      effectiveConnectionType,
      reducedMotion,
    }),
  };
}

/**
 * Safe default used for the very first server-rendered paint (before any
 * client detection has run) and as the fallback if detection throws for
 * any reason. Deliberately conservative (MEDIUM, no touch, no WebGL
 * assumed) so nothing over-commits to expensive effects before capability
 * is actually known.
 */
export const SAFE_DEFAULT_CAPABILITY: DeviceCapability = {
  deviceLabel: "unknown",
  browserLabel: "unknown",
  engine: "unknown",
  viewportWidth: 1440,
  dpr: 1,
  touch: false,
  reducedMotion: false,
  saveData: false,
  effectiveConnectionType: undefined,
  webglSupported: false,
  hardwareConcurrency: undefined,
  deviceMemoryGb: undefined,
  performanceTier: "MEDIUM",
};

export function getDeviceCapability(): DeviceCapability {
  if (typeof window === "undefined") return SAFE_DEFAULT_CAPABILITY;
  try {
    return readCapabilitySnapshot();
  } catch {
    // Failsafe per spec Phase 41: detection failure must never break the page.
    return SAFE_DEFAULT_CAPABILITY;
  }
}