import type { Metadata } from "next";
import ClothingContentPage from "@/components/project/clothing-content-page";

export const metadata: Metadata = {
  title: "Fashion Content",
  description:
    "Premium fashion campaigns, apparel commercials, lifestyle storytelling and product films by Kroo Production.",
  openGraph: {
    title: "Fashion Content | Kroo Production",
    description:
      "A premium project showcase for cinematic fashion productions and fashion campaign content.",
    url: "https://krooproduction.com/projects/clothing-content",
    siteName: "Kroo Production",
    type: "website",
  },
};

export default function Page() {
  return <ClothingContentPage />;
}
