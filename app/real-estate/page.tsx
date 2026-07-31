import type { Metadata } from "next";
import RealEstateContentPage from "@/components/project/real-estate-content-page";

export const metadata: Metadata = {
  title: "Real Estate Content",
  description:
    "Premium cinematic real estate content created for builders, developers, agencies and luxury property brands by Kroo Production.",
  openGraph: {
    title: "Real Estate Content | Kroo Production",
    description:
      "A premium project showcase for cinematic real estate walkthroughs and commercial property content.",
    url: "https://krooproduction.com/projects/real-estate-content",
    siteName: "Kroo Production",
    type: "website",
  },
};

export default function Page() {
  return <RealEstateContentPage />;
}
