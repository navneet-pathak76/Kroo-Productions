import ProjectContentPage, {
  type ProjectPageConfig,
} from "@/components/project/project-content-page";
import { getFolderMedia } from "@/lib/aws/get-folder-media";
import { Calendar, ChefHat, Clock3, Film, Flame, Layers3, Sparkles, Target, UserRound } from "lucide-react";

export default async function RestaurantContentPage() {
  const videos = await getFolderMedia(
    "restaurant",
    {
      category: "Restaurant Marketing",
      client: "Hospitality Industry",
      services: ["Filming", "Food Styling", "Editing", "Motion Graphics", "Color Grading", "Drone"],
    }
  );

  const config = {
    title: "Restaurant Content",
    description:
      "Cinematic restaurant films, food storytelling and hospitality content that turns viewers into customers.",
    hero: {
      thumbnail: "/images/gym-content/hero-thumb.svg",
      alt: "Restaurant Content project thumbnail",
      icon: ChefHat,
      accentIcon: Flame,
      label: "Hospitality Production",
      visualTitle: "Fine Dining Visual System",
    },
    info: [
      { label: "Client", value: "Hospitality Industry", icon: UserRound },
      { label: "Category", value: "Restaurant Marketing", icon: Film },
      { label: "Services", value: "Filming, Food Styling, Editing, Motion Graphics, Color Grading, Drone", icon: Layers3 },
      { label: "Year", value: "2026", icon: Calendar },
      { label: "Timeline", value: "3 Weeks", icon: Clock3 },
    ],
    videos,
    featuredButtonLabel: "View projects",
    gallery: {
      title: <>A CURATED COLLECTION OF OUR<br />CINEMATIC RESTAURANT PRODUCTIONS</>,
      copy: "Brand films, chef stories and food-forward social edits built to make every dish feel irresistible.",
    },
    about: {
      intro:
        "This section will later contain final client-approved details. For now, it reflects the intended production approach for a premium restaurant content system.",
      details: [
        { title: "Creative Direction", copy: "The visual direction leans into warmth, texture and appetite appeal. Each sequence is planned around plating, ambience and the story the restaurant wants to tell before a guest ever sits down.", icon: Target },
        { title: "Food Cinematography", copy: "Macro detail shots, steam, sauce pours and controlled practical lighting turn every dish into a hero moment without losing the honesty of real ingredients.", icon: Flame },
        { title: "Post Production", copy: "The edit is structured for craving first: fast hooks, clean pacing, sound-led transitions, rich color separation and motion graphics that support the menu instead of overpowering it.", icon: Sparkles },
      ],
      marketingGoals: <>Build instant appetite, make the restaurant feel like a destination,<br />and turn food content into a reservation-driving asset across ads, reels, website sections and delivery apps.</>,
    },
    cta: {
      title: <>Let&apos;s Make People Hungry Before They Visit.</>,
      copy: <>Let&apos;s create cinematic food content that fills tables and builds a brand people crave.</>,
      primaryLabel: "Start Restaurant Project",
    },
  } satisfies ProjectPageConfig;

  return <ProjectContentPage config={config} />;
}