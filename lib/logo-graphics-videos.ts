const BASE = "https://d3uo687t366hok.cloudfront.net/videos/logo-graphics";

export type LogoGraphicsVideo = {
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

export const logoGraphicsVideos: LogoGraphicsVideo[] = [
  {
    id: 1,
    title: "Logo Animation",
    thumbnail: "/images/logo-graphics/thumb-01.webp",
    video: `${BASE}/1.mp4`,
    description: "Clean logo animation built for intros and brand stings.",
    duration: "00:15",
    category: "Animation",
    client: "Emerging Brands",
    services: ["Filming", "Editing"],
  },
  {
    id: 2,
    title: "Brand Identity Reveal",
    thumbnail: "/images/logo-graphics/thumb-02.webp",
    video: `${BASE}/2.mp4`,
    description: "Full identity reveal introducing a brand's core visual system.",
    duration: "00:30",
    category: "Reveal",
    client: "Emerging Brands",
    services: ["Filming", "Editing"],
  },
  {
    id: 3,
    title: "Motion Graphics Reel",
    thumbnail: "/images/logo-graphics/thumb-03.webp",
    video: `${BASE}/3.mp4`,
    description: "Showreel of motion graphics work across recent campaigns.",
    duration: "00:30",
    category: "Reel",
    client: "Emerging Brands",
    services: ["Filming", "Editing"],
  },
  {
    id: 4,
    title: "Typography Animation",
    thumbnail: "/images/logo-graphics/thumb-04.webp",
    video: `${BASE}/4.mp4`,
    description: "Kinetic typography piece built for message-first storytelling.",
    duration: "00:20",
    category: "Typography",
    client: "Emerging Brands",
    services: ["Filming", "Editing"],
  },
  {
    id: 5,
    title: "3D Logo Reveal",
    thumbnail: "/images/logo-graphics/thumb-05.webp",
    video: `${BASE}/5.mp4`,
    description: "Dimensional logo reveal built with 3D motion design.",
    duration: "00:20",
    category: "3D",
    client: "Emerging Brands",
    services: ["Filming", "Editing"],
  },
  {
    id: 6,
    title: "Corporate Brand Intro",
    thumbnail: "/images/logo-graphics/thumb-06.webp",
    video: `${BASE}/6.mp4`,
    description: "Corporate intro sequence built for presentations and events.",
    duration: "00:30",
    category: "Corporate",
    client: "Emerging Brands",
    services: ["Filming", "Editing"],
  },
];
