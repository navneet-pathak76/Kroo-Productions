import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.krooproduction.in"),

 title: {
  default: "Video Production Company in Kolkata | Kroo Production",
  template: "%s | Kroo Production",
},

description:
  "Kroo Production is a creative video production company in Kolkata specializing in brand films, commercial videos, social media content, product advertisements, motion graphics, and cinematic storytelling for ambitious brands.",
  
  keywords: [
  "Video Production Company Kolkata",
  "Video Production Kolkata",
  "Production House Kolkata",
  "Creative Agency Kolkata",
  "Brand Films",
  "Corporate Videos",
  "Commercial Video Production",
  "Product Advertisement",
  "Social Media Content",
  "Motion Graphics",
  "Drone Videography",
  "Real Estate Video Production",
  "Gym Video Production",
  "Restaurant Video Production",
  "Fashion Video Production",
  "Club Promotion Videos",
  "Content Creation Agency",
  "Creative Video Agency India",
  "Cinematic Storytelling",
  "Kroo Production",
],

  applicationName: "Kroo Production",

  alternates: {
    canonical: "https://www.krooproduction.in",
  },

  openGraph: {
  title: "Video Production Company in Kolkata | Kroo Production",

  description:
    "Kroo Production is a creative video production company in Kolkata specializing in brand films, commercial videos, social media content, product advertisements, motion graphics, and cinematic storytelling for ambitious brands.",

  url: "https://www.krooproduction.in",

  siteName: "Kroo Production",

  images: [
    {
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "Kroo Production",
    },
  ],

  locale: "en_US",

  type: "website",
},

  twitter: {
  card: "summary_large_image",
  title: "Video Production Company in Kolkata | Kroo Production",
  description:
    "Kroo Production is a creative video production company in Kolkata specializing in brand films, commercial videos, social media content, product advertisements, motion graphics, and cinematic storytelling for ambitious brands.",
  images: ["/og-image.jpg"],
},

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#020202",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
      <GoogleAnalytics gaId="G-9WBJV41K0G" />
    </html>
  );
}