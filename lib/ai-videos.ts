const BASE = "https://d3uo687t366hok.cloudfront.net/videos/AI%20VIDEOS";

export type AiVideo = {
  id: number;
  title: string;
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
    video: `${BASE}/6.mp4`,
    description: "Abstract AI motion visual built for brand and mood pieces.",
    duration: "00:30",
    category: "Motion",
    client: "Emerging Brands",
    services: ["Filming", "Editing"],
  },
];