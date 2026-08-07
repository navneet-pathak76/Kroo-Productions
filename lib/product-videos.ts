import { videoUrl } from "@/lib/media-config";

const BASE = videoUrl("products", "").replace(/\/$/, "");

export type ProductVideo = {
  id: number;
  title: string;
  thumbnail: string;
  video: string;
  description: string;
  duration: string;
  category: string;
  client: string;
  services: string[];
};

export const productVideos: ProductVideo[] = [
  {
    id: 1,
    title: "Premium Product Commercial",
    thumbnail: "/images/products/thumb-01.webp",
    video: `${BASE}/1.mp4`,
    description: "High-end product commercial built for premium brand positioning.",
    duration: "00:30",
    category: "Commercial",
    client: "Consumer Brands",
    services: ["Filming", "Editing"],
  },
  {
    id: 2,
    title: "Lifestyle Product Shoot",
    thumbnail: "/images/products/thumb-02.webp",
    video: `${BASE}/2.mp4`,
    description: "Lifestyle-driven shoot placing the product in real-world context.",
    duration: "00:30",
    category: "Lifestyle",
    client: "Consumer Brands",
    services: ["Filming", "Editing"],
  },
  {
    id: 3,
    title: "Launch Campaign",
    thumbnail: "/images/products/thumb-03.webp",
    video: `${BASE}/3.mp4`,
    description: "Full campaign edit built around a flagship product launch.",
    duration: "00:30",
    category: "Campaign",
    client: "Consumer Brands",
    services: ["Filming", "Editing"],
  },
  {
    id: 4,
    title: "Brand Commercial",
    thumbnail: "/images/products/thumb-04.webp",
    video: `${BASE}/4.mp4`,
    description: "Brand-focused commercial designed for multi-platform distribution.",
    duration: "00:30",
    category: "Commercial",
    client: "Consumer Brands",
    services: ["Filming", "Editing"],
  },
  {
    id: 5,
    title: "Product Showcase",
    thumbnail: "/images/products/thumb-05.webp",
    video: `${BASE}/5.mp4`,
    description: "Detail-led showcase highlighting design and craftsmanship.",
    duration: "00:30",
    category: "Showcase",
    client: "Consumer Brands",
    services: ["Filming", "Editing"],
  },
  {
    id: 6,
    title: "Studio Commercial",
    thumbnail: "/images/products/thumb-06.webp",
    video: `${BASE}/6.mp4`,
    description: "Studio-shot commercial with controlled lighting and staging.",
    duration: "00:30",
    category: "Studio",
    client: "Consumer Brands",
    services: ["Filming", "Editing"],
  },
];
