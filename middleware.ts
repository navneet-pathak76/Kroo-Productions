import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { parseSessionFromCookieHeaderEdge } from "@/lib/auth/session-edge";

const PUBLIC_ADMIN_PAGE_PATHS = ["/admin/login"];
const PUBLIC_ADMIN_API_PATHS = ["/api/admin/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const isPublic =
    PUBLIC_ADMIN_PAGE_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    ) ||
    PUBLIC_ADMIN_API_PATHS.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );

  const secret = process.env.AUTH_SECRET ?? null;
  const session = await parseSessionFromCookieHeaderEdge(
    request.headers.get("cookie"),
    secret,
  );

  if (isPublic) {
    if (session && pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
