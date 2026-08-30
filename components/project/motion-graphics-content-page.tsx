import ProjectContentPage, {
  type ProjectPageConfig,
} from "@/components/project/project-content-page";
import { getFolderMedia } from "@/lib/aws/get-folder-media";
import { Boxes, Calendar, Clock3, Film, Layers3, PenTool, Sparkles, Target, UserRound } from "lucide-react";

export default async function MotionGraphicsContentPage() {
  const [motionVideos, logoVideos] = await Promise.all([
    getFolderMedia("motion-graphics", {
      category: "Commercial Production",
      client: "Brand & Motion",
      services: ["Filming", "Editing", "Color Grading", "Motion Graphics"],
    }),
    getFolderMedia("logo & graphics", {
      category: "Motion Production",
      client: "Emerging Brands",
      services: ["Design", "Animation", "Editing", "Sound Design"],
    }),
  ]);

  const videos = [...motionVideos, ...logoVideos];

  const config = {
    title: "Motion Graphics & Animation",
    description:
      "2D & 3D motion graphics, logo animation, brand reveals, title sequences and digital motion design. Every edit is designed to increase engagement, brand value, recall and conversions.",
    hero: {
      thumbnail: "/images/gym-content/hero-thumb.svg",
      alt: "Motion Graphics & Animation project thumbnail",
      icon: Boxes,
      label: "Motion & Visual Production",
      visualTitle: "Motion Visual System",
    },
    info: [
      { label: "Client", value: "Brand & Motion / Emerging Brands", icon: UserRound },
      { label: "Category", value: "Commercial & Motion Production", icon: Film },
      { label: "Services", value: "Design, Animation, Filming, Editing, Color Grading, Motion Graphics, Sound Design", icon: Layers3 },
      { label: "Year", value: "2026", icon: Calendar },
      { label: "Duration", value: "2 Months", icon: Clock3 },
    ],
    videos,
    gallery: {
      title: <><span>A CURATED COLLECTION OF OUR</span><br />CINEMATIC MOTION & BRAND PRODUCTIONS</>,
      copy: "Logo reveals, brand identity animations, title sequences, 2D & 3D motion graphics and digital motion design built with rhythm, contrast and performance-led intent.",
    },
    about: {
      intro:
        "A cinematic content system designed to position brands through strategic storytelling, disciplined production, precise design and high-impact visual execution. The combined work spans motion graphics, logo animation, brand reveals and digital motion design.",
      details: [
        {
          title: "Creative Direction",
          copy: "The visual direction leans into disciplined typography, premium contrast and sharp brand recall. Each sequence is planned around the mark, the animation rhythm and the commercial message behind the campaign.",
          icon: Target,
        },
        {
          title: "Design, Camera And Lighting",
          copy: "Dynamic 2D and 3D motion, camera moves, locked-off reveal frames and controlled digital lighting create polished visual pieces without losing the precision and clarity of the design.",
          icon: PenTool,
        },
        {
          title: "Post Workflow",
          copy: "The edit is structured for retention first: fast hooks, clean pacing, sound-led transitions, precise color separation and motion graphics that support the brand instead of overpowering it.",
          icon: Sparkles,
        },
      ],
      marketingGoals: <>Build instant credibility, make every reveal feel aspirational,<br />and turn motion and brand content into a conversion asset across ads, reels, website sections and sales conversations.</>,
    },
  } satisfies ProjectPageConfig;

  return <ProjectContentPage config={config} />;
}
