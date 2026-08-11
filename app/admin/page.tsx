import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { getSessionCookieName, getSessionFromToken } from "@/lib/auth/session";
import { isAdminAuthConfigured } from "@/lib/auth/config";
import { getTelemetrySnapshot } from "@/lib/telemetry/store";
import { getMediaCdnBase } from "@/lib/media-optimization/pipeline";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { extractIpFromHeaderMap, recordAdminAudit } from "@/lib/telemetry/admin-audit";

export default async function AdminPage() {
  if (!isAdminAuthConfigured()) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="cinema-panel max-w-lg rounded-2xl p-8 text-center">
          <h1 className="text-xl font-bold">Admin Not Configured</h1>
          <p className="mt-3 text-sm text-white/60">
            Set AUTH_SECRET and ADMIN_USERS environment variables to enable the dashboard.
          </p>
        </div>
      </main>
    );
  }

  const cookieStore = await cookies();
  const session = getSessionFromToken(cookieStore.get(getSessionCookieName())?.value);

  if (!session) {
    redirect("/admin/login");
  }

  const headerStore = await headers();
  await recordAdminAudit("view_dashboard", {
    route: "/admin",
    adminEmail: session.email,
    ip: extractIpFromHeaderMap((name) => headerStore.get(name)),
  });

  const snapshot = await getTelemetrySnapshot();

  return (
    <AdminDashboard
      snapshot={snapshot}
      viewer={{ email: session.email, role: session.role, name: session.name }}
      mediaCdnBase={getMediaCdnBase()}
    />
  );
}
