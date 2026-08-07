import { videoUrl } from "@/lib/media-config";

export type MotionGraphicsVideo = {
  id: number;
  title: string;
  thumbnail: string;
  video: string;
  description: string;
  duration: string;
  category: string;
  client: string;
  services: string[];
};

export const motionGraphicsVideos: MotionGraphicsVideo[] = [
  { id: 1, title: "Cinematic Brand Promo", thumbnail: "/images/gym-content/thumb-01.svg", video: videoUrl("motion-graphics", "1.mp4"), description: "Commercial launch animation for premium brand identity.", duration: "1:12", category: "Commercial", client: "Brand & Motion", services: ["Motion Design", "Editing", "Color Grading"] },
  { id: 2, title: "Title Sequence Campaign", thumbnail: "/images/gym-content/thumb-02.svg", video: videoUrl("motion-graphics", "2.mp4"), description: "High-contrast title sequence built for paid social.", duration: "0:48", category: "Campaign", client: "Brand & Motion", services: ["Motion Design", "Editing", "Motion Graphics"] },
  { id: 3, title: "3D Brand Film", thumbnail: "/images/gym-content/thumb-03.svg", video: videoUrl("motion-graphics", "3.mp4"), description: "Dimensional brand story focused on trust and authority.", duration: "1:34", category: "Brand Film", client: "Brand & Motion", services: ["Creative Direction", "3D Animation", "Color Grading"] },
  { id: 4, title: "Product Reveal Walkthrough", thumbnail: "/images/gym-content/thumb-04.svg", video: videoUrl("motion-graphics", "4.mp4"), description: "Premium 3D product reveal with cinematic movement.", duration: "1:05", category: "Showcase", client: "Brand & Motion", services: ["3D Animation", "Editing", "Sound Design"] },
  { id: 5, title: "Animated Reels", thumbnail: "/images/gym-content/thumb-05.svg", video: videoUrl("motion-graphics", "5.mp4"), description: "Short-form edits designed for retention and saves.", duration: "0:29", category: "Social", client: "Brand & Motion", services: ["Editing", "Color Grading", "Motion Graphics"] },
  { id: 6, title: "Brand Launch Edit", thumbnail: "/images/gym-content/thumb-06.svg", video: videoUrl("motion-graphics", "6.mp4"), description: "Fast-cut brand launch animation with aggressive rhythm.", duration: "0:42", category: "Launch", client: "Brand & Motion", services: ["Motion Design", "Editing", "Motion Graphics"] },
  { id: 7, title: "Product Motion Spot", thumbnail: "/images/gym-content/thumb-07.svg", video: videoUrl("motion-graphics", "7.mp4"), description: "Product-focused motion film for commercial placement.", duration: "0:56", category: "Product", client: "Brand & Motion", services: ["Motion Design", "Color Grading", "Editing"] },
  { id: 8, title: "Explainer Story", thumbnail: "/images/gym-content/thumb-08.svg", video: videoUrl("motion-graphics", "8.mp4"), description: "Narrative explainer cut with premium documentary tone.", duration: "2:08", category: "Story", client: "Brand & Motion", services: ["Motion Design", "Editing", "Color Grading"] },
  { id: 9, title: "Kinetic Type Montage", thumbnail: "/images/gym-content/thumb-09.svg", video: videoUrl("motion-graphics", "9.mp4"), description: "Cinematic kinetic type montage for organic brand growth.", duration: "1:21", category: "Montage", client: "Brand & Motion", services: ["Motion Design", "Editing", "Sound Design"] },
];
