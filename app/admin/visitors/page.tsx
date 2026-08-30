import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { getSessionCookieName, getSessionFromToken } from "@/lib/auth/session";
import { isAdminAuthConfigured } from "@/lib/auth/config";
import { listRecentVisitorSessions, isDurableVisitorStoreConfigured } from "@/lib/visitors/composite-storage";
import { extractIpFromHeaderMap, recordAdminAudit } from "@/lib/telemetry/admin-audit";
import { VisitorsDashboard } from "@/components/admin/visitors-dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Visitors — Admin",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 25;

export default async function AdminVisitorsPage() {
  if (!isAdminAuthConfigured()) {
    redirect("/admin/login");
  }

  const cookieStore = await cookies();
  const session = getSessionFromToken(cookieStore.get(getSessionCookieName())?.value);
  if (!session) {
    redirect("/admin/login?next=/admin/visitors");
  }

  const headerStore = await headers();
  await recordAdminAudit("view_dashboard", {
    route: "/admin/visitors",
    adminEmail: session.email,
    ip: extractIpFromHeaderMap((name) => headerStore.get(name)),
  });

  const initial = await listRecentVisitorSessions(PAGE_SIZE);

  return (
    <VisitorsDashboard
      initialItems={initial.items}
      initialCursor={initial.nextCursor}
      durableStoreConfigured={isDurableVisitorStoreConfigured()}
      viewer={{ email: session.email, role: session.role, name: session.name }}
    />
  );
}
