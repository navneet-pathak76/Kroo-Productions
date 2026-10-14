import type { MetadataRoute } from "next";

const baseUrl = "https://www.krooproduction.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes: Array<{ path: string; priority: number; changeFrequency: "weekly" | "monthly" }> = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/gym-content", priority: 0.9, changeFrequency: "monthly" },
    { path: "/clothing-content", priority: 0.9, changeFrequency: "monthly" },
    { path: "/clubs-content", priority: 0.9, changeFrequency: "monthly" },
    { path: "/motion-graphics-content", priority: 0.9, changeFrequency: "monthly" },
    { path: "/restaurant-content", priority: 0.9, changeFrequency: "monthly" },
    { path: "/digital-marketing-content", priority: 0.7, changeFrequency: "monthly" },
    { path: "/real-estate", priority: 0.7, changeFrequency: "monthly" },
    { path: "/product-content", priority: 0.7, changeFrequency: "monthly" },
    { path: "/ai-content", priority: 0.7, changeFrequency: "monthly" },
  ];

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
