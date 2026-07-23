/**
 * Minimal fixed-window rate limiter keyed by IP address.
 *
 * This in-memory implementation is fine for a single Vercel serverless
 * instance under light traffic, but memory is not shared across
 * concurrent lambdas or deployments. If the contact form needs stronger
 * guarantees at scale, swap this for a shared store (Upstash Redis,
 * DynamoDB, etc.) behind the same `checkRateLimit` signature.
 */

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5;

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const existing = buckets.get(identifier);

  if (!existing || now - existing.windowStart > WINDOW_MS) {
    buckets.set(identifier, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (existing.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - existing.count };
}
