import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://krooproduction.in"),

  title: {
    default: "Kroo Production | Cinematic Production House",
    template: "%s | Kroo Production",
  },

  description:
    "Kroo Production crafts cinematic visuals, branded storytelling, commercial films, photography, motion graphics, and high-impact digital experiences for ambitious brands.",

  keywords: [
    "Kroo Production",
    "Video Production",
    "Film Production",
    "Commercial Films",
    "Photography",
    "Motion Graphics",
    "Content Creation",
    "Digital Marketing",
    "Brand Storytelling",
    "Production House Kolkata",
    "Video Production Kolkata",
    "Creative Agency India",
  ],

  applicationName: "Kroo Production",

  alternates: {
    canonical: "https://krooproduction.in",
  },

  openGraph: {
    title: "Kroo Production",
    description:
      "Premium cinematic production house specializing in commercials, branded storytelling, photography and motion graphics.",

    url: "https://krooproduction.in",

    siteName: "Kroo Production",

    locale: "en_US",

    type: "website",
  },

  twitter: {
    card: "summary_large_image",

    title: "Kroo Production",

    description:
      "Premium cinematic production house for ambitious brands.",
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