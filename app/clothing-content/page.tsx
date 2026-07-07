import type { Metadata } from "next";
import ClothingContentPage from "@/components/project/clothing-content-page";

export const metadata: Metadata = {
  title: "Clothing Content",
  description:
    "Premium fashion campaigns, apparel commercials, lifestyle storytelling and product films by Kroo Production.",
  openGraph: {
    title: "Clothing Content | Kroo Production",
    description:
      "A premium project showcase for cinematic clothing productions and fashion campaign content.",
    url: "https://krooproduction.com/projects/clothing-content",
    siteName: "Kroo Production",
    type: "website",
  },
};

export default function Page() {
  return <ClothingContentPage />;
}
