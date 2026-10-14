import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/admin"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: "/",
      },
    ],
    host: "https://www.krooproduction.in",
    sitemap: "https://www.krooproduction.in/sitemap.xml",
  };
}