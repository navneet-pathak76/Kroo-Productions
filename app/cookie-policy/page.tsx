import type { Metadata } from "next";
import CookiePolicyContent from "@/components/legal/cookie-policy-content";

export const metadata: Metadata = {
  title: "Cookie Policy | Kroo Production",
  description:
    "Learn how Kroo Production uses cookies and similar technologies on krooproduction.in.",
  alternates: {
    canonical: "https://krooproduction.in/cookie-policy",
  },
  openGraph: {
    title: "Cookie Policy | Kroo Production",
    description:
      "Learn how Kroo Production uses cookies and similar technologies on krooproduction.in.",
    url: "https://krooproduction.in/cookie-policy",
    siteName: "Kroo Production",
    type: "website",
  },
};

export default function CookiePolicyPage() {
  return <CookiePolicyContent />;
}