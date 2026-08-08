
import ProjectContentPage, {
  type ProjectPageConfig,
} from "@/components/project/project-content-page";
import { getFolderMedia } from "@/lib/aws/get-folder-media";
import { Boxes, Calendar, Clock3, Film, Layers3, Sparkles, Target, UserRound } from "lucide-react";

export default async function MotionGraphicsContentPage() {
  const videos = await getFolderMedia("motion-graphics", {
    category: "Commercial Production",
    client: "Brand & Motion",
    services: ["Filming", "Editing", "Color Grading", "Motion Graphics"],
  });

  const config = {
    title: "Motion Graphics Content",
    description:
      "2D & 3D motion graphics, brand animations, title sequences and digital motion design. Every edit is designed to increase engagement, brand value and conversions.",
    hero: {
      thumbnail: "/images/gym-content/hero-thumb.svg",
      alt: "Motion Graphics Content project thumbnail",
      icon: Boxes,
      label: "Commercial Production",
      visualTitle: "Motion Visual System",
    },
    info: [
      { label: "Client", value: "Brand & Motion", icon: UserRound },
      { label: "Category", value: "Commercial Production", icon: Film },
      { label: "Services", value: "Filming, Editing, Color Grading, Motion Graphics", icon: Layers3 },
      { label: "Year", value: "2026", icon: Calendar },
      { label: "Duration", value: "2 Months", icon: Clock3 },
    ],
    videos,
    gallery: {
      title: <><span>A CURATED COLLECTION OF OUR</span><br />CINEMATIC MOTION GRAPHICS PRODUCTIONS</>,
      copy: "Brand animations, title sequences and digital motion design built with rhythm, contrast and design-led intent.",
    },
    about: {
      intro:
        "This section will later contain final client-approved details. For now, it reflects the intended production approach for a premium motion graphics content system.",
      details: [
        { title: "Creative Direction", copy: "The visual direction leans into disciplined motion, premium contrast and sharp brand recall. Each sequence is planned around the rhythm of the animation and the commercial message behind the campaign.", icon: Target },
        { title: "Design And Animation", copy: "Dynamic 2D and 3D motion, locked-off type frames and controlled digital lighting create a polished motion environment without losing the clarity of the brand message.", icon: Film },
        { title: "Post Workflow", copy: "The edit is structured for retention first: fast hooks, clean pacing, sound-led transitions, precise color separation and motion graphics that support the brand instead of overpowering it.", icon: Sparkles },
      ],
      marketingGoals: <>Build instant credibility, make the brand feel aspirational,<br />and turn motion graphics content into a conversion asset across ads, reels, website sections and sales conversations.</>,
    },
  } satisfies ProjectPageConfig;

  return <ProjectContentPage config={config} />;
}