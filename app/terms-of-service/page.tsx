import type { Metadata } from "next";
import TermsOfServiceContent from "@/components/legal/terms-of-service-content";

export const metadata: Metadata = {
  title: "Terms of Service | Kroo Production",
  description:
    "Read the Terms of Service governing the use of Kroo Production's website and creative services.",
  alternates: {
    canonical: "https://krooproduction.in/terms-of-service",
  },
  openGraph: {
    title: "Terms of Service | Kroo Production",
    description:
      "Read the Terms of Service governing the use of Kroo Production's website and creative services.",
    url: "https://krooproduction.in/terms-of-service",
    siteName: "Kroo Production",
    type: "website",
  },
};

export default function TermsOfServicePage() {
  return <TermsOfServiceContent />;
}