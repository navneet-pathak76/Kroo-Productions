import ProjectContentPage, {
  type ProjectPageConfig,
} from "@/components/project/project-content-page";
import { getFolderMedia } from "@/lib/aws/get-folder-media";
import { digitalMarketingVideos } from "@/lib/digital-marketing-videos";
import { Calendar, Clock3, Film, Layers3, Megaphone, Sparkles, Target, UserRound } from "lucide-react";

export default async function DigitalMarketingContentPage() {
  const videos = await getFolderMedia(
    "digital-marketing",
    {
      category: "Marketing Production",
      client: "Marketing Teams",
      services: ["Strategy", "Filming", "Editing", "Motion Graphics"],
    },
    digitalMarketingVideos,
  );

  const config = {
    title: "Social Media",
    description:
      "Premium social media video content created for brands, agencies and marketing teams. Every edit is designed to increase engagement, brand value and conversions.",
    hero: {
      thumbnail: "/images/digital-marketing/hero-thumb.svg",
      alt: "Social Media project thumbnail",
      icon: Megaphone,
      label: "Marketing Production",
      visualTitle: "Marketing Visual System",
    },
    info: [
      { label: "Client", value: "Marketing Teams", icon: UserRound },
      { label: "Category", value: "Marketing Production", icon: Film },
      { label: "Services", value: "Strategy, Filming, Editing, Motion Graphics", icon: Layers3 },
      { label: "Year", value: "2026", icon: Calendar },
      { label: "Duration", value: "2 Months", icon: Clock3 },
    ],
    videos,
    gallery: {
      title: <><span>A CURATED COLLECTION OF OUR</span><br />CINEMATIC MARKETING PRODUCTIONS</>,
      copy: "Performance ads, lead generation campaigns and brand stories built with rhythm, contrast and performance-led intent.",
    },
    about: {
      intro:
        "A cinematic content system designed to position the brand as a premium marketing destination through strategic storytelling, disciplined production, and high-impact visual execution.",
      details: [
        { title: "Creative Direction", copy: "The visual direction leans into disciplined hooks, premium contrast and sharp brand recall. Each sequence is planned around the funnel stage and the commercial message behind the campaign.", icon: Target },
        { title: "Camera And Lighting", copy: "Dynamic handheld movement, locked-off product frames and controlled practical lighting create a polished marketing asset built for scroll-stopping attention.", icon: Film },
        { title: "Post Workflow", copy: "The edit is structured for retention first: fast hooks, clean pacing, sound-led transitions, precise color separation and motion graphics that support the brand instead of overpowering it.", icon: Sparkles },
      ],
      marketingGoals: <>Build instant credibility, make every campaign feel aspirational,<br />and turn marketing content into a conversion asset across ads, reels, website sections and sales conversations.</>,
    },
  } satisfies ProjectPageConfig;

  return <ProjectContentPage config={config} />;
}
