import type { Metadata } from "next";
import GymContentPage from "@/components/project/gym-content-page";

export const metadata: Metadata = {
  title: "Gym Content",
  description:
    "Premium cinematic fitness content created for gyms, fitness brands, trainers and commercial campaigns by Kroo Production.",
  openGraph: {
    title: "Gym Content | Kroo Production",
    description:
      "A premium project showcase for cinematic gym productions and commercial fitness content.",
    url: "https://krooproduction.com/projects/gym-content",
    siteName: "Kroo Production",
    type: "website",
  },
};

export default function Page() {
  return <GymContentPage />;
}
