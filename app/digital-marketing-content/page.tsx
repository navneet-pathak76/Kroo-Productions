import type { Metadata } from "next";
import DigitalMarketingContentPage from "@/components/project/digital-marketing-content-page";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/digital-marketing-content" },
  title: "Social Media",
  description:
    "Premium social media video content created for brands, agencies and marketing teams by Kroo Production.",
  openGraph: {
    title: "Social Media | Kroo Production",
    description:
      "A premium project showcase for performance ads, lead generation and brand awareness content.",
    url: "https://www.krooproduction.in/digital-marketing-content",
    siteName: "Kroo Production",
    type: "website",
  },
};

export default function Page() {
  return <DigitalMarketingContentPage />;
}
