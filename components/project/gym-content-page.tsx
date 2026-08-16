import ProjectContentPage, {
  type ProjectPageConfig,
} from "@/components/project/project-content-page";
import { getFolderMedia } from "@/lib/aws/get-folder-media";
import { Calendar, Clock3, Dumbbell, Film, Layers3, Sparkles, Target, UserRound } from "lucide-react";

export default async function GymContentPage() {
  const videos = await getFolderMedia(
    "gym",
    {
      category: "Commercial Production",
      client: "Fitness Industry",
      services: ["Filming", "Editing", "Color Grading", "Motion Graphics"],
    }
  );

  const config = {
    title: "Gym Content",
    description:
      "Premium cinematic fitness content created for gyms, fitness brands, trainers and commercial campaigns. Every edit is designed to increase engagement, brand value and conversions.",
    hero: {
      thumbnail: "/images/gym-content/hero-thumb.svg",
      alt: "Gym Content project thumbnail",
      icon: Dumbbell,
      label: "Commercial Production",
      visualTitle: "Fitness Visual System",
    },
    info: [
      { label: "Client", value: "Fitness Industry", icon: UserRound },
      { label: "Category", value: "Commercial Production", icon: Film },
      { label: "Services", value: "Filming, Editing, Color Grading, Motion Graphics", icon: Layers3 },
      { label: "Year", value: "2026", icon: Calendar },
      { label: "Duration", value: "2 Months", icon: Clock3 },
    ],
    videos,
    gallery: {
      title: <><span>A CURATED COLLECTION OF OUR</span><br />CINEMATIC GYM PRODUCTIONS</>,
      copy: "Commercial films, social edits and brand stories built with rhythm, contrast and performance-led intent.",
    },
    about: {
      intro:
        "A cinematic content system designed to position the brand as a premium fitness destination through strategic storytelling, disciplined production, and high-impact visual execution.",
      details: [
        { title: "Creative Direction", copy: "The visual direction leans into disciplined movement, premium contrast and sharp brand recall. Each sequence is planned around the energy of the athlete and the commercial message behind the campaign.", icon: Target },
        { title: "Camera And Lighting", copy: "Dynamic gimbal movement, locked-off strength frames and controlled practical lighting create a polished fitness environment without losing the grit of real training.", icon: Film },
        { title: "Post Workflow", copy: "The edit is structured for retention first: fast hooks, clean pacing, sound-led transitions, precise color separation and motion graphics that support the brand instead of overpowering it.", icon: Sparkles },
      ],
      marketingGoals: <>Build instant credibility, make the facility feel aspirational,<br />and turn fitness content into a conversion asset across ads, reels, website sections and sales conversations.</>,
    },
  } satisfies ProjectPageConfig;

  return <ProjectContentPage config={config} />;
}