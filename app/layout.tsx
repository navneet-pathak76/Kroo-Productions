import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://krooproduction.com"),
  title: {
    default: "Kroo Production | Cinematic Production House",
    template: "%s | Kroo Production",
  },
  description:
    "Kroo Production crafts cinematic visuals, branded storytelling, and high-impact digital experiences for ambitious brands.",
  keywords: [
    "Kroo Production",
    "video production",
    "film production",
    "post production",
    "aerial cinematography",
    "digital marketing",
    "cinematic storytelling",
  ],
  openGraph: {
    title: "Kroo Production",
    description:
      "Cinematic storytelling, premium execution, and modern digital craft.",
    url: "https://krooproduction.com",
    siteName: "Kroo Production",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kroo Production",
    description:
      "Cinematic visuals and digital experiences for brands that move culture.",
  },
  robots: {
    index: true,
    follow: true,
  },
  // icons omitted to keep a single hero logo image in the app
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
    </html>
  );
}
