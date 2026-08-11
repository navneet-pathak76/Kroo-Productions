import "server-only";
import { createHash } from "crypto";

const IP_HASH_SALT = process.env.TELEMETRY_IP_HASH_SALT ?? process.env.AUTH_SECRET ?? "kroo-telemetry-salt";

export function hashIpAddress(ip: string | null | undefined): string | undefined {
  if (!ip || ip === "unknown") return undefined;

  const normalized = ip.split(",")[0]?.trim();
  if (!normalized) return undefined;

  return createHash("sha256")
    .update(`${IP_HASH_SALT}:${normalized}`)
    .digest("hex")
    .slice(0, 16);
}

export function extractClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return undefined;
}
