import "server-only";
import type { VisitorGeo } from "./types";

/**
 * Vercel populates these headers at the edge for every request in
 * production — no third-party geolocation service or lookup needed.
 * Locally (or off Vercel) they'll simply be absent and we fall back to
 * "Unknown", which the memory adapter and UI both handle gracefully.
 */
export function extractGeoFromHeaders(getHeader: (name: string) => string | null): VisitorGeo {
  const country = getHeader("x-vercel-ip-country");
  const region = getHeader("x-vercel-ip-country-region");
  const city = getHeader("x-vercel-ip-city");

  return {
    country: country || "Unknown",
    region: region || undefined,
    city: city ? decodeURIComponent(city) : undefined,
  };
}
