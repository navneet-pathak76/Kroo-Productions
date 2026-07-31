const BASE = "https://d3uo687t366hok.cloudfront.net/videos/ai-videos";

export type AiVideo = {
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

export const aiVideos: AiVideo[] = [
  {
    id: 1,
    title: "AI Brand Commercial",
    thumbnail: "/images/ai-videos/thumb-01.webp",
    video: `${BASE}/1.mp4`,
    description: "AI-generated commercial built for premium brand positioning.",
    duration: "00:30",
    category: "Commercial",
    client: "Emerging Brands",
    services: ["Filming", "Editing"],
  },
  {
    id: 2,
    title: "AI Product Visualization",
    thumbnail: "/images/ai-videos/thumb-02.webp",
    video: `${BASE}/2.mp4`,
    description: "Photoreal AI visualization showcasing product design and detail.",
    duration: "00:30",
    category: "Visualization",
    client: "Emerging Brands",
    services: ["Filming", "Editing"],
  },
  {
    id: 3,
    title: "AI Fashion Campaign",
    thumbnail: "/images/ai-videos/thumb-03.webp",
    video: `${BASE}/3.mp4`,
    description: "AI-generated fashion campaign built for social-first distribution.",
    duration: "00:30",
    category: "Campaign",
    client: "Emerging Brands",
    services: ["Filming", "Editing"],
  },
  {
    id: 4,
    title: "AI Concept Film",
    thumbnail: "/images/ai-videos/thumb-04.webp",
    video: `${BASE}/4.mp4`,
    description: "Concept film exploring a bold creative idea entirely through AI.",
    duration: "00:45",
    category: "Concept",
    client: "Emerging Brands",
    services: ["Filming", "Editing"],
  },
  {
    id: 5,
    title: "AI Advertisement",
    thumbnail: "/images/ai-videos/thumb-05.webp",
    video: `${BASE}/5.mp4`,
    description: "Short-form AI advertisement optimized for performance channels.",
    duration: "00:30",
    category: "Advertisement",
    client: "Emerging Brands",
    services: ["Filming", "Editing"],
  },
  {
    id: 6,
    title: "AI Motion Visual",
    thumbnail: "/images/ai-videos/thumb-06.webp",
    video: `${BASE}/6.mp4`,
    description: "Abstract AI motion visual built for brand and mood pieces.",
    duration: "00:30",
    category: "Motion",
    client: "Emerging Brands",
    services: ["Filming", "Editing"],
  },
];
