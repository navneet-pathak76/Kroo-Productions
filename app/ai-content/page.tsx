import type { Metadata } from "next";
import AiContentPage from "@/components/project/ai-content-page";

export const metadata: Metadata = {
  title: "AI Video Production",
  description:
    "Premium AI-generated video content created for brands, agencies and product launches by Kroo Production.",
  openGraph: {
    title: "AI Video Production | Kroo Production",
    description:
      "A premium project showcase for AI-generated commercials, campaigns and concept films.",
    url: "https://krooproduction.com/projects/ai-content",
    siteName: "Kroo Production",
    type: "website",
  },
};

export default function Page() {
  return <AiContentPage />;
}
