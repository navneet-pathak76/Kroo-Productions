import type { Metadata } from "next";
import { Suspense } from "react";
import AdminLoginPage from "./login-client";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginRoute() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-white/50">Loading…</div>}>
      <AdminLoginPage />
    </Suspense>
  );
}
