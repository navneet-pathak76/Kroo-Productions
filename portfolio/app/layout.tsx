import type { Metadata } from "next";
import { CustomCursor } from "@/components/CustomCursor";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.navneetpathak.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Navneet Pathak — Video Editor & Motion Designer",
    template: "%s — Navneet Pathak",
  },
  description:
    "Navneet Pathak is a video editor and motion graphics artist crafting cinematic brand films, commercial ads and reels for luxury, hospitality and lifestyle brands.",
  keywords: [
    "video editor",
    "motion graphics artist",
    "commercial film editor",
    "brand content creator",
    "luxury brand video editing",
  ],
  authors: [{ name: "Navneet Pathak" }],
  creator: "Navneet Pathak",
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Navneet Pathak — Video Editor & Motion Designer",
    description:
      "Cinematic stories that convert — commercial ads, brand films and motion design for premium brands.",
    siteName: "Navneet Pathak",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Navneet Pathak" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Navneet Pathak — Video Editor & Motion Designer",
    description: "Cinematic stories that convert.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/*
          Display/body faces (Clash Display, General Sans) are Fontshare fonts, not
          available via next/font/google. Loaded here for now — for production,
          prefer self-hosting the .woff2 files through next/font/local to avoid
          the extra external request and get automatic font-display/optimization.
        */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-body antialiased"
        style={
          {
            "--font-display": "'Clash Display', 'General Sans', sans-serif",
            "--font-body": "'General Sans', sans-serif",
          } as React.CSSProperties
        }
      >
        <SmoothScrollProvider>
          <CustomCursor />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
