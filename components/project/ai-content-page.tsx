"use client";

import ProjectContentPage, {
  type ProjectPageConfig,
} from "@/components/project/project-content-page";
import { aiVideos } from "@/lib/ai-videos";
import {
  Calendar,
  Clock3,
  Cpu,
  Film,
  Layers3,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

const config = {
  title: "AI Video Production",
  description:
    "Premium AI-generated video content created for brands, agencies and product launches. Every generation is designed to increase engagement, brand value and conversions.",
  hero: {
    thumbnail: "/images/ai-videos/hero-thumb.svg",
    alt: "AI Video Production project thumbnail",
    icon: Cpu,
    label: "AI Production",
    visualTitle: "AI Visual System",
  },
  info: [
    { label: "Client", value: "Emerging Brands", icon: UserRound },
    { label: "Category", value: "AI Production", icon: Film },
    {
      label: "Services",
      value: "Prompting, Generation, Editing, Motion Graphics",
      icon: Layers3,
    },
    { label: "Year", value: "2026", icon: Calendar },
    { label: "Duration", value: "6 Weeks", icon: Clock3 },
  ],
  videos: aiVideos,
  gallery: {
    title: <><span>A CURATED COLLECTION OF OUR</span><br />CINEMATIC AI PRODUCTIONS</>,
    copy: "AI-generated commercials, product visuals and concept films built with rhythm, contrast and performance-led intent.",
  },
  about: {
    intro:
      "A cinematic content system designed to position the brand as a premium AI-first destination through strategic storytelling, disciplined production, and high-impact visual execution.",
    details: [
      {
        title: "Creative Direction",
        copy: "The visual direction leans into disciplined prompting, premium contrast and sharp brand recall. Each sequence is planned around the concept and the commercial message behind the campaign.",
        icon: Target,
      },
      {
        title: "Camera And Lighting",
        copy: "Virtual camera movement, generated lighting and controlled scene composition create a polished AI production without losing believability.",
        icon: Film,
      },
      {
        title: "Post Workflow",
        copy: "The edit is structured for retention first: fast hooks, clean pacing, sound-led transitions, precise color separation and motion graphics that support the brand instead of overpowering it.",
        icon: Sparkles,
      },
    ],
    marketingGoals: <>Build instant credibility, make every concept feel aspirational,<br />and turn AI content into a conversion asset across ads, reels, website sections and sales conversations.</>,
  },
} satisfies ProjectPageConfig;

export default function AiContentPage() {
  return <ProjectContentPage config={config} />;
}
