const BASE = "https://d3uo687t366hok.cloudfront.net/videos/digital-marketing";

export type DigitalMarketingVideo = {
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

export const digitalMarketingVideos: DigitalMarketingVideo[] = [
  {
    id: 1,
    title: "Performance Ad",
    thumbnail: "/images/digital-marketing/thumb-01.webp",
    video: `${BASE}/1.mp4`,
    description: "Direct-response ad built to drive clicks and conversions.",
    duration: "00:30",
    category: "Performance",
    client: "Marketing Teams",
    services: ["Filming", "Editing"],
  },
  {
    id: 2,
    title: "Lead Generation Campaign",
    thumbnail: "/images/digital-marketing/thumb-02.webp",
    video: `${BASE}/2.mp4`,
    description: "Full-funnel campaign edit built to capture qualified leads.",
    duration: "00:30",
    category: "Lead Gen",
    client: "Marketing Teams",
    services: ["Filming", "Editing"],
  },
  {
    id: 3,
    title: "Social Media Commercial",
    thumbnail: "/images/digital-marketing/thumb-03.webp",
    video: `${BASE}/3.mp4`,
    description: "Short-form commercial optimized for Instagram and Facebook.",
    duration: "00:30",
    category: "Social Media",
    client: "Marketing Teams",
    services: ["Filming", "Editing"],
  },
  {
    id: 4,
    title: "Brand Awareness Reel",
    thumbnail: "/images/digital-marketing/thumb-04.webp",
    video: `${BASE}/4.mp4`,
    description: "Reel-first edit built to grow reach and brand recall.",
    duration: "00:30",
    category: "Awareness",
    client: "Marketing Teams",
    services: ["Filming", "Editing"],
  },
  {
    id: 5,
    title: "Marketing Creative",
    thumbnail: "/images/digital-marketing/thumb-05.webp",
    video: `${BASE}/5.mp4`,
    description: "Creative asset built for A/B testing across ad platforms.",
    duration: "00:30",
    category: "Creative",
    client: "Marketing Teams",
    services: ["Filming", "Editing"],
  },
  {
    id: 6,
    title: "Conversion Campaign",
    thumbnail: "/images/digital-marketing/thumb-06.webp",
    video: `${BASE}/6.mp4`,
    description: "Bottom-funnel campaign focused on driving final conversions.",
    duration: "00:30",
    category: "Conversion",
    client: "Marketing Teams",
    services: ["Filming", "Editing"],
  },
];
