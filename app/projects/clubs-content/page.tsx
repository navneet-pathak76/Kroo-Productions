import type { Metadata } from "next";
import ClubsContentPage from "@/components/project/clubs-content-page";

export const metadata: Metadata = {
  title: "Clubs Content",
  description:
    "Nightlife promotions, DJ events, concerts, cinematic club films and aftermovies by Kroo Production.",
  openGraph: {
    title: "Clubs Content | Kroo Production",
    description:
      "A premium project showcase for cinematic club productions and nightlife event content.",
    url: "https://krooproduction.com/projects/clubs-content",
    siteName: "Kroo Production",
    type: "website",
  },
};

export default function Page() {
  return <ClubsContentPage />;
}
