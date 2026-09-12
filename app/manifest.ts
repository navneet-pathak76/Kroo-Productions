import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kroo Production",
    short_name: "Kroo",
    description: "Kroo Production — cinematic video production and creative content.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#020202",
    theme_color: "#020202",
    orientation: "portrait-primary",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
