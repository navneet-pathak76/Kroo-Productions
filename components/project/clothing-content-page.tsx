import ProjectContentPage, {
  type ProjectPageConfig,
} from "@/components/project/project-content-page";
import { getFolderMedia } from "@/lib/aws/get-folder-media";
import { clothingVideos } from "@/lib/clothing-videos";
import { Calendar, Clock3, Film, Layers3, Shirt, Sparkles, Target, UserRound } from "lucide-react";

export default async function ClothingContentPage() {
  const videos = await getFolderMedia(
    "clothing",
    {
      category: "Commercial Production",
      client: "Fashion Industry",
      services: ["Filming", "Editing", "Color Grading", "Motion Graphics"],
    },
    clothingVideos,
  );

  const config = {
    title: "Clothing Content",
    description:
      "Premium fashion campaigns, apparel commercials, lifestyle storytelling and product films. Every edit is designed to increase engagement, brand value and conversions.",
    hero: {
      thumbnail: "/images/gym-content/hero-thumb.svg",
      alt: "Clothing Content project thumbnail",
      icon: Shirt,
      label: "Commercial Production",
      visualTitle: "Fashion Visual System",
    },
    info: [
      { label: "Client", value: "Fashion Industry", icon: UserRound },
      { label: "Category", value: "Commercial Production", icon: Film },
      { label: "Services", value: "Filming, Editing, Color Grading, Motion Graphics", icon: Layers3 },
      { label: "Year", value: "2026", icon: Calendar },
      { label: "Duration", value: "2 Months", icon: Clock3 },
    ],
    videos,
    gallery: {
      title: <><span>A CURATED COLLECTION OF OUR</span><br />CINEMATIC CLOTHING PRODUCTIONS</>,
      copy: "Campaign films, social edits and lifestyle stories built with rhythm, contrast and premium fashion intent.",
    },
    about: {
      intro:
        "This section will later contain final client-approved details. For now, it reflects the intended production approach for a premium clothing content system.",
      details: [
        { title: "Creative Direction", copy: "The visual direction leans into elevated styling, premium contrast and sharp brand recall. Each sequence is planned around the movement of the garment and the commercial message behind the campaign.", icon: Target },
        { title: "Camera And Lighting", copy: "Dynamic gimbal movement, locked-off product frames and controlled practical lighting create a polished fashion environment without losing the texture of real fabric.", icon: Film },
        { title: "Post Workflow", copy: "The edit is structured for retention first: fast hooks, clean pacing, sound-led transitions, precise color separation and motion graphics that support the brand instead of overpowering it.", icon: Sparkles },
      ],
      marketingGoals: <>Build instant credibility, make the brand feel aspirational,<br />and turn clothing content into a conversion asset across ads, reels, website sections and sales conversations.</>,
    },
  } satisfies ProjectPageConfig;

  return <ProjectContentPage config={config} />;
}