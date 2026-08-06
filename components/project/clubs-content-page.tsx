"use client";

import ProjectContentPage, {
  type ProjectPageConfig,
} from "@/components/project/project-content-page";
import { clubsVideos } from "@/lib/clubs-videos";
import {
  Calendar,
  Clock3,
  Disc3,
  Film,
  Layers3,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

export { clubsVideos } from "@/lib/clubs-videos";

const config = {
  title: "Clubs Content",
  description:
    "Nightlife promotions, DJ events, concerts, cinematic club films and aftermovies. Every edit is designed to increase engagement, brand value and conversions.",
  hero: {
    thumbnail: "/images/gym-content/hero-thumb.svg",
    alt: "Clubs Content project thumbnail",
    icon: Disc3,
    label: "Commercial Production",
    visualTitle: "Nightlife Visual System",
  },
  info: [
    { label: "Client", value: "Nightlife Industry", icon: UserRound },
    { label: "Category", value: "Commercial Production", icon: Film },
    {
      label: "Services",
      value: "Filming, Editing, Color Grading, Motion Graphics",
      icon: Layers3,
    },
    { label: "Year", value: "2026", icon: Calendar },
    { label: "Duration", value: "2 Months", icon: Clock3 },
  ],
  videos: clubsVideos,
  gallery: {
    title: <><span>A CURATED COLLECTION OF OUR</span><br />CINEMATIC CLUB PRODUCTIONS</>,
    copy: "Event films, aftermovies and social edits built with rhythm, contrast and nightlife-led intent.",
  },
  about: {
    intro:
      "This section will later contain final client-approved details. For now, it reflects the intended production approach for a premium club content system.",
    details: [
      {
        title: "Creative Direction",
        copy: "The visual direction leans into high-energy movement, premium contrast and sharp brand recall. Each sequence is planned around the energy of the crowd and the commercial message behind the event.",
        icon: Target,
      },
      {
        title: "Camera And Lighting",
        copy: "Dynamic gimbal movement, low-light crowd frames and controlled practical lighting create a polished nightlife environment without losing the energy of the real event.",
        icon: Film,
      },
      {
        title: "Post Workflow",
        copy: "The edit is structured for retention first: fast hooks, clean pacing, sound-led transitions, precise color separation and motion graphics that support the brand instead of overpowering it.",
        icon: Sparkles,
      },
    ],
    marketingGoals: <>Build instant credibility, make the venue feel aspirational,<br />and turn club content into a conversion asset across ads, reels, website sections and sales conversations.</>,
  },
} satisfies ProjectPageConfig;

export default function ClubsContentPage() {
  return <ProjectContentPage config={config} />;
}
