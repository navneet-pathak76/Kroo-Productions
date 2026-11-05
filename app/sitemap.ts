import type { MetadataRoute } from "next";

const baseUrl = "https://krooproduction.in";

const projectRoutes = [
  "/gym-content",
  "/clothing-content",
  "/clubs-content",
  "/motion-graphics-content",
  "/restaurant-content",
  "/real-estate",
  "/product-content",
  "/ai-content",
  "/digital-marketing-content",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...projectRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
