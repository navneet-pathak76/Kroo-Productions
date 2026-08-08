"use client";

import ProjectContentPage, {
  type ProjectPageConfig,
} from "@/components/project/project-content-page";
import { realEstateVideos } from "@/lib/real-estate-videos";
import {
  Building2,
  Calendar,
  Clock3,
  Film,
  Layers3,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

const config = {
  title: "Real Estate Content",
  description:
    "Premium cinematic real estate content created for builders, developers, agencies and luxury property brands. Every walkthrough is designed to increase interest, trust and conversions.",
    galleryType: "video",
  hero: {
    thumbnail: "/images/real-estate/hero-thumb.svg",
    alt: "Real Estate Content project thumbnail",
    icon: Building2,
    label: "Property Production",
    visualTitle: "Real Estate Visual System",
  },
  info: [
    { label: "Client", value: "Real Estate Industry", icon: UserRound },
    { label: "Category", value: "Property Production", icon: Film },
    {
      label: "Services",
      value: "Filming, Drone, Editing, Color Grading",
      icon: Layers3,
    },
    { label: "Year", value: "2026", icon: Calendar },
    { label: "Duration", value: "2 Months", icon: Clock3 },
  ],
  videos: realEstateVideos,
  gallery: {
    title: <><span>A CURATED COLLECTION OF OUR</span><br />CINEMATIC REAL ESTATE PRODUCTIONS</>,
    copy: "Property walkthroughs, drone footage and builder promotions built with rhythm, contrast and performance-led intent.",
  },
  about: {
    intro:
      "A cinematic content system designed to position the brand as a premium real estate destination through strategic storytelling, disciplined production, and high-impact visual execution.",
    details: [
      {
        title: "Creative Direction",
        copy: "The visual direction leans into spatial storytelling, premium contrast and sharp brand recall. Each sequence is planned around the flow of the property and the story behind the listing.",
        icon: Target,
      },
      {
        title: "Camera And Lighting",
        copy: "Dynamic gimbal movement, drone aerials and controlled practical lighting create a polished real estate presentation without losing the warmth of the space.",
        icon: Film,
      },
      {
        title: "Post Workflow",
        copy: "The edit is structured for retention first: fast hooks, clean pacing, sound-led transitions, precise color separation and motion graphics that support the brand instead of overpowering it.",
        icon: Sparkles,
      },
    ],
    marketingGoals: <>Build instant credibility, make every property feel aspirational,<br />and turn real estate content into a conversion asset across ads, reels, website sections and sales conversations.</>,
  },
} satisfies ProjectPageConfig;

export default function RealEstateContentPage() {
  return <ProjectContentPage config={config} />;
}
