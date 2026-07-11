import type { Metadata } from "next";
import PrivacyPolicyContent from "@/components/legal/privacy-policy-content";

export const metadata: Metadata = {
  title: "Privacy Policy | Kroo Production",
  description:
    "Read the Privacy Policy of Kroo Production to understand how we collect, use and protect your information.",
  alternates: {
    canonical: "https://krooproduction.in/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | Kroo Production",
    description:
      "Read the Privacy Policy of Kroo Production to understand how we collect, use and protect your information.",
    url: "https://krooproduction.in/privacy-policy",
    siteName: "Kroo Production",
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}