import type { Metadata } from "next";
import RestaurantContent from "@/components/project/RestaurantContent";

export const metadata: Metadata = {
  title: "Restaurant Content",
  description:
    "Premium restaurant films, food cinematography, café branding, luxury dining visuals and hospitality storytelling by Kroo Production.",
  keywords: [
    "Restaurant Content",
    "Food Videography",
    "Restaurant Commercial",
    "Food Photography",
    "Hospitality Marketing",
    "Cafe Content",
    "Luxury Dining",
    "Food Reels",
    "Restaurant Social Media",
    "Kroo Production",
  ],
  openGraph: {
    title: "Restaurant Content | Kroo Production",
    description:
      "Premium restaurant commercials, food cinematography and hospitality storytelling.",
    url: "https://krooproduction.in/restaurant-content",
    siteName: "Kroo Production",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Restaurant Content | Kroo Production",
    description:
      "Premium restaurant films, food commercials and hospitality storytelling.",
  },
};

export default function Page() {
  return <RestaurantContent />;
}