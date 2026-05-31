import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://krooproduction.com",
      lastModified: new Date("2026-05-26"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
