import type { Metadata } from "next";
import MotionGraphicsContentPage from "@/components/project/motion-graphics-content-page";

export const metadata: Metadata = {
  title: "Motion Graphics Content",
  description:
    "2D & 3D motion graphics, brand animations, title sequences and digital motion design by Kroo Production.",
  openGraph: {
    title: "Motion Graphics Content | Kroo Production",
    description:
      "A premium project showcase for cinematic motion graphics and digital motion design content.",
    url: "https://krooproduction.com/projects/motion-graphics-content",
    siteName: "Kroo Production",
    type: "website",
  },
};

export default function Page() {
  return <MotionGraphicsContentPage />;
}
