import type { Metadata } from "next";
import MotionGraphicsContentPage from "@/components/project/motion-graphics-content-page";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/motion-graphics-content" },
  title: "Motion Graphics & Logo Animation",
  description:
    "2D & 3D motion graphics, brand animations, title sequences and digital motion design by Kroo Production.",
  openGraph: {
    title: "Motion Graphics & Logo Animation | Kroo Production",
    description:
      "A premium project showcase for cinematic motion graphics and digital motion design content.",
    url: "https://www.krooproduction.in/motion-graphics-content",
    siteName: "Kroo Production",
    type: "website",
  },
};

export default function Page() {
  return <MotionGraphicsContentPage />;
}
