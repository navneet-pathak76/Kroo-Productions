import "server-only";
import { hashIpAddress } from "@/lib/telemetry/ip";
import { recordTelemetry } from "@/lib/telemetry/store";
import type { AdminAuditAction } from "@/lib/telemetry/types";

export async function recordAdminAudit(
  action: AdminAuditAction,
  options: {
    route: string;
    adminEmail?: string;
    ip?: string | null;
    detail?: string;
  },
): Promise<void> {
  const ipHash = hashIpAddress(options.ip ?? undefined);
  await recordTelemetry(
    {
      kind: "admin-audit",
      route: options.route,
      message: action,
      source: options.adminEmail,
    },
    ipHash,
  );
}

export function extractIpFromHeaderMap(getHeader: (name: string) => string | null): string | undefined {
  const forwarded = getHeader("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim();
  }
  const realIp = getHeader("x-real-ip");
  if (realIp) return realIp.trim();
  return undefined;
}
