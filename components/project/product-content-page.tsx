import ProjectContentPage, {
  type ProjectPageConfig,
} from "@/components/project/project-content-page";
import { getFolderMedia } from "@/lib/aws/get-folder-media";
import { productVideos } from "@/lib/product-videos";
import { Calendar, Clock3, Film, Layers3, Package, Sparkles, Target, UserRound } from "lucide-react";

export default async function ProductContentPage() {
  const videos = await getFolderMedia(
    "product",
    {
      category: "Product Production",
      client: "Consumer Brands",
      services: ["Filming", "Styling", "Editing", "Color Grading"],
    },
    productVideos,
  );

  const config = {
    title: "Products",
    description:
      "Premium cinematic product content created for brands, e-commerce stores and launch campaigns. Every edit is designed to increase engagement, brand value and conversions.",
    hero: {
      thumbnail: "/images/gym-content/hero-thumb.svg",
      alt: "Product Content project thumbnail",
      icon: Package,
      label: "Product Production",
      visualTitle: "Product Visual System",
    },
    info: [
      { label: "Client", value: "Consumer Brands", icon: UserRound },
      { label: "Category", value: "Product Production", icon: Film },
      { label: "Services", value: "Filming, Styling, Editing, Color Grading", icon: Layers3 },
      { label: "Year", value: "2026", icon: Calendar },
      { label: "Duration", value: "2 Months", icon: Clock3 },
    ],
    videos,
    gallery: {
      title: <><span>A CURATED COLLECTION OF OUR</span><br />CINEMATIC PRODUCT PRODUCTIONS</>,
      copy: "Commercial films, lifestyle shoots and launch campaigns built with rhythm, contrast and performance-led intent.",
    },
    about: {
      intro:
        "A cinematic content system designed to position the brand as a premium product destination through strategic storytelling, disciplined production, and high-impact visual execution.",
      details: [
        { title: "Creative Direction", copy: "The visual direction leans into disciplined product staging, premium contrast and sharp brand recall. Each sequence is planned around the product's form and the story behind the launch.", icon: Target },
        { title: "Camera And Lighting", copy: "Macro detail, locked-off hero frames and controlled practical lighting create a polished product presentation without losing the texture of the material.", icon: Film },
        { title: "Post Workflow", copy: "The edit is structured for retention first: fast hooks, clean pacing, sound-led transitions, precise color separation and motion graphics that support the brand instead of overpowering it.", icon: Sparkles },
      ],
      marketingGoals: <>Build instant credibility, make every product feel aspirational,<br />and turn product content into a conversion asset across ads, reels, website sections and sales conversations.</>,
    },
  } satisfies ProjectPageConfig;

  return <ProjectContentPage config={config} />;
}
