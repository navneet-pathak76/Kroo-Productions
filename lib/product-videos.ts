import { videoUrl } from "@/lib/media-config";

const BASE = videoUrl("product", "").replace(/\/$/, "");

export type ProductVideo = {
  id: number;
  title: string;
  thumbnail: string;
  description: string;
  duration: string;
  category: string;
  client: string;
  services: string[];
};

export const productVideos: ProductVideo[] = Array.from(
  { length: 20 },
  (_, index) => ({
    id: index + 1,
    title: `Product Ad ${index + 1}`,
    thumbnail: `${BASE}/${index + 1}.jpg`,
    description: "Premium product advertisement.",
    duration: "",
    category: "Product",
    client: "Consumer Brands",
    services: ["Product Photography"],
  })
);
