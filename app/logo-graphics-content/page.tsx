import type { Metadata } from "next";
import LogoGraphicsContentPage from "@/components/project/logo-graphics-content-page";

export const metadata: Metadata = {
  title: "Logo & Graphics",
  description:
    "Premium motion graphics and logo animation content created for brands, agencies and product launches by Kroo Production.",
  openGraph: {
    title: "Logo & Graphics | Kroo Production",
    description:
      "A premium project showcase for logo animations, brand reveals and motion graphics reels.",
    url: "https://krooproduction.com/projects/logo-graphics-content",
    siteName: "Kroo Production",
    type: "website",
  },
};

export default function Page() {
  return <LogoGraphicsContentPage />;
}
