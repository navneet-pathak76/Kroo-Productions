import "server-only";
import type { VisitorClient, VisitorDevice } from "./types";

/**
 * Deliberately dependency-free — a full UA-parsing library is unnecessary
 * weight for classifying device/browser/OS into coarse buckets for
 * analytics. Order matters below (more specific checks first).
 */

function detectDevice(ua: string): VisitorDevice {
  if (/ipad|tablet(?!.*mobile)|kindle|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) return "mobile";
  if (ua.length > 0) return "desktop";
  return "unknown";
}

function detectBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\/|opera/i.test(ua)) return "Opera";
  if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) return "Safari";
  if (/samsungbrowser/i.test(ua)) return "Samsung Internet";
  if (/msie|trident/i.test(ua)) return "Internet Explorer";
  return "Other";
}

function detectOs(ua: string): string {
  if (/windows nt/i.test(ua)) return "Windows";
  if (/mac os x/i.test(ua) && !/iphone|ipad|ipod/i.test(ua)) return "macOS";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/linux/i.test(ua)) return "Linux";
  return "Other";
}

export function parseUserAgent(userAgent: string | null | undefined): VisitorClient {
  const ua = userAgent ?? "";
  return {
    device: detectDevice(ua),
    browser: detectBrowser(ua),
    os: detectOs(ua),
  };
}
