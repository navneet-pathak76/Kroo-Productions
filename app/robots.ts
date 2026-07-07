import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
      },
    ],
    host: "https://krooproduction.in",
    sitemap: "https://krooproduction.in/sitemap.xml",
  };
}