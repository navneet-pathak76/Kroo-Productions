import type { Metadata } from "next";
import DisclaimerContent from "@/components/legal/disclaimer-content";

export const metadata: Metadata = {
  title: "Disclaimer | Kroo Production",
  description:
    "Read the legal disclaimer governing the use of the Kroo Production website and services.",
  alternates: {
    canonical: "https://krooproduction.in/disclaimer",
  },
  openGraph: {
    title: "Disclaimer | Kroo Production",
    description:
      "Read the legal disclaimer governing the use of the Kroo Production website and services.",
    url: "https://krooproduction.in/disclaimer",
    siteName: "Kroo Production",
    type: "website",
  },
};

export default function DisclaimerPage() {
  return <DisclaimerContent />;
}