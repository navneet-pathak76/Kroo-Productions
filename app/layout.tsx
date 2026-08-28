import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { CapabilityRoot } from "@/components/capability-root";
import { TelemetryCollector } from "@/components/telemetry-collector";
import { VisitorTracker } from "@/components/visitor-tracker";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  // 400-800 cover the standard hierarchy (body -> hero headings). 900 is
  // loaded too because the existing design uses font-black/950 for display
  // headlines (.headline, .section-title) — loading it as a real static
  // weight avoids the browser synthesizing a fake bold on top of 800.
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.krooproduction.in"),

 title: {
  default: "Video Production Company in India | Commercial Films & Brand Content | Kroo Production",
  template: "%s | Kroo Production",
},

description:
  "Kroo Production is a leading video production company in India creating commercial films, brand videos, corporate films, social media content, product photography, motion graphics and post-production services.",

creator: "Kroo Production",
publisher: "Kroo Production",
category: "Video Production",  

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
  title: "Video Production Company in India | Commercial Films & Brand Content | Kroo Production",

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
  title: "Video Production Company in India | Commercial Films & Brand Content | Kroo Production",
  description:
    "Kroo Production is a creative video production company in Kolkata specializing in brand films, commercial videos, social media content, product advertisements, motion graphics, and cinematic storytelling for ambitious brands.",
  images: ["/og-image.jpg"],
},
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Kroo Production",
  url: "https://www.krooproduction.in",
  logo: "https://www.krooproduction.in/logo.png",
  email: "team@krooproduction.in",
  telephone: "+917003087985",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kolkata",
    addressRegion: "West Bengal",
    addressCountry: "IN",
  },
  sameAs: [
  "https://www.instagram.com/kroo.production/",
  "https://www.linkedin.com/company/krooproduction/",
  "https://youtube.com/@krooproduction",
],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
      </head>

      <body>
        <CapabilityRoot />
        <TelemetryCollector />
        <VisitorTracker />
        {children}
      </body>

      <GoogleAnalytics gaId="G-9WBJV41K0G" />
    </html>
  );
}
