
import ProjectContentPage, {
  type ProjectPageConfig,
} from "@/components/project/project-content-page";
import { getFolderMedia } from "@/lib/aws/get-folder-media";
import { Calendar, Clock3, Film, Layers3, PenTool, Sparkles, Target, UserRound } from "lucide-react";

export default async function LogoGraphicsContentPage() {
  const videos = await getFolderMedia("logo & graphics", {
    category: "Motion Production",
    client: "Emerging Brands",
    services: ["Design", "Animation", "Editing", "Sound Design"],
  });

  const config = {
    title: "Logo & Graphics",
    description:
      "Premium motion graphics and logo animation content created for brands, agencies and product launches. Every reveal is designed to increase engagement, brand value and recall.",
    hero: {
      thumbnail: "/images/logo-graphics/hero-thumb.svg",
      alt: "Logo & Graphics project thumbnail",
      icon: PenTool,
      label: "Motion Production",
      visualTitle: "Brand Visual System",
    },
    info: [
      { label: "Client", value: "Emerging Brands", icon: UserRound },
      { label: "Category", value: "Motion Production", icon: Film },
      { label: "Services", value: "Design, Animation, Editing, Sound Design", icon: Layers3 },
      { label: "Year", value: "2026", icon: Calendar },
      { label: "Duration", value: "2 Months", icon: Clock3 },
    ],
    videos,
    gallery: {
      title: <><span>A CURATED COLLECTION OF OUR</span><br />CINEMATIC MOTION PRODUCTIONS</>,
      copy: "Logo reveals, brand identity animations and motion graphics reels built with rhythm, contrast and performance-led intent.",
    },
    about: {
      intro:
        "A cinematic content system designed to position the brand as a premium visual identity through strategic storytelling, disciplined production, and high-impact visual execution.",
      details: [
        { title: "Creative Direction", copy: "The visual direction leans into disciplined typography, premium contrast and sharp brand recall. Each sequence is planned around the mark and the commercial message behind the brand.", icon: Target },
        { title: "Camera And Lighting", copy: "Dynamic camera moves, locked-off reveal frames and controlled lighting create a polished motion graphics piece without losing the precision of the design.", icon: Film },
        { title: "Post Workflow", copy: "The edit is structured for retention first: fast hooks, clean pacing, sound-led transitions, precise color separation and motion graphics that support the brand instead of overpowering it.", icon: Sparkles },
      ],
      marketingGoals: <>Build instant credibility, make every reveal feel aspirational,<br />and turn brand content into a conversion asset across ads, reels, website sections and sales conversations.</>,
    },
  } satisfies ProjectPageConfig;

  return <ProjectContentPage config={config} />;
}