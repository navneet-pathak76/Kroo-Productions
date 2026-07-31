const BASE = "https://d3uo687t366hok.cloudfront.net/videos/real-estate";

export type RealEstateVideo = {
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

export const realEstateVideos: RealEstateVideo[] = [
  {
    id: 1,
    title: "Luxury Apartment Tour",
    thumbnail: "/images/real-estate/thumb-01.webp",
    video: `${BASE}/1.mp4`,
    description: "Premium apartment walkthrough filmed for listing and social campaigns.",
    duration: "00:45",
    category: "Walkthrough",
    client: "Real Estate Industry",
    services: ["Filming", "Editing"],
  },
  {
    id: 2,
    title: "Luxury Villa Showcase",
    thumbnail: "/images/real-estate/thumb-02.webp",
    video: `${BASE}/2.mp4`,
    description: "Cinematic villa tour highlighting scale, light and finishes.",
    duration: "01:00",
    category: "Showcase",
    client: "Real Estate Industry",
    services: ["Filming", "Editing"],
  },
  {
    id: 3,
    title: "Property Walkthrough",
    thumbnail: "/images/real-estate/thumb-03.webp",
    video: `${BASE}/3.mp4`,
    description: "Complete guided walkthrough built for buyer confidence.",
    duration: "00:45",
    category: "Walkthrough",
    client: "Real Estate Industry",
    services: ["Filming", "Editing"],
  },
  {
    id: 4,
    title: "Builder Promotion",
    thumbnail: "/images/real-estate/thumb-04.webp",
    video: `${BASE}/4.mp4`,
    description: "Short-form campaign promoting a builder's latest project.",
    duration: "00:30",
    category: "Promotion",
    client: "Real Estate Industry",
    services: ["Filming", "Editing"],
  },
  {
    id: 5,
    title: "Commercial Space Reel",
    thumbnail: "/images/real-estate/thumb-05.webp",
    video: `${BASE}/5.mp4`,
    description: "Commercial space reel built for leasing and brand outreach.",
    duration: "00:30",
    category: "Commercial",
    client: "Real Estate Industry",
    services: ["Filming", "Editing"],
  },
  {
    id: 6,
    title: "Interior Showcase",
    thumbnail: "/images/real-estate/thumb-06.webp",
    video: `${BASE}/6.mp4`,
    description: "Detail-led interior showcase focused on craftsmanship and light.",
    duration: "00:30",
    category: "Interior",
    client: "Real Estate Industry",
    services: ["Filming", "Editing"],
  },
];
