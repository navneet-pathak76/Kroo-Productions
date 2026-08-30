import "server-only";
import { recordVisitorPageView } from "@/lib/visitors/composite-storage";
import { extractGeoFromHeaders } from "@/lib/visitors/geo";
import { parseUserAgent } from "@/lib/visitors/ua-parse";
import { hashIpAddress } from "@/lib/telemetry/ip";
import type { VisitorTrackPayload } from "@/lib/visitors/types";

function extractClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  return forwarded?.split(",")[0]?.trim() || realIp?.trim() || undefined;
}

export async function trackVisitorPageView(
  payload: VisitorTrackPayload,
  request: Request,
): Promise<void> {
  const ip = extractClientIp(request);

  await recordVisitorPageView({
    sessionId: payload.sessionId,
    visitorId: payload.visitorId,
    path: payload.path,
    referrer: payload.referrer,
    geo: extractGeoFromHeaders((name) => request.headers.get(name)),
    client: parseUserAgent(request.headers.get("user-agent")),
    ip,
    ipHash: hashIpAddress(ip),
    timestamp: new Date().toISOString(),
  });
}
