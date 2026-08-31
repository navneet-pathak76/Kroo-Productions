import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { getSessionCookieName, getSessionFromToken } from "@/lib/auth/session";
import { isAdminAuthConfigured } from "@/lib/auth/config";
import { getVisitorPageViews, getVisitorSession } from "@/lib/visitors/composite-storage";
import { extractIpFromHeaderMap, recordAdminAudit } from "@/lib/telemetry/admin-audit";
import { VisitorJourney } from "@/components/admin/visitor-journey";

export const metadata: Metadata = {
  title: "Visitor journey — Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ sessionId: string }> };

export default async function AdminVisitorJourneyPage({ params }: Props) {
  if (!isAdminAuthConfigured()) redirect("/admin/login");

  const cookieStore = await cookies();
  const session = getSessionFromToken(cookieStore.get(getSessionCookieName())?.value);
  if (!session) redirect("/admin/login?next=/admin/visitors");

  const { sessionId } = await params;
  const [visitorSession, pageViews] = await Promise.all([
    getVisitorSession(sessionId),
    getVisitorPageViews(sessionId),
  ]);

  const headerStore = await headers();
  await recordAdminAudit("view_dashboard", {
    route: `/admin/visitors/${sessionId}`,
    adminEmail: session.email,
    ip: extractIpFromHeaderMap((name) => headerStore.get(name)),
  });

  return (
    <VisitorJourney
      session={visitorSession}
      pageViews={pageViews}
      sessionId={sessionId}
      viewer={{ email: session.email, role: session.role, name: session.name }}
    />
  );
}
