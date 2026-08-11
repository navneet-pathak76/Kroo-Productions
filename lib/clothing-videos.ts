import { videoUrl } from "@/lib/media-config";

export type ClothingVideo = {
  id: number;
  title: string;
  /**
   * No dedicated clothing thumbnail assets exist yet (see public/images —
   * only gym-content has per-video thumb-0N.svg files). Leaving this
   * unset is correct: VideoThumbnail (ProjectClient.tsx) renders the
   * video's own first frame for video-type items and never reads this
   * field, so a placeholder here would be dead, misleading data rather
   * than a real thumbnail. Set this once real clothing thumbnails exist.
   */
  thumbnail?: string;
  video: string;
  description: string;
  duration: string;
  category: string;
  client: string;
  services: string[];
};

// Exactly 6 items — this is the intended Clothing Content catalog.
export const clothingVideos: ClothingVideo[] = [
  { id: 1, title: "Cinematic Apparel Promo", video: videoUrl("clothing", "1.mp4"), description: "Commercial launch film for a premium apparel brand.", duration: "1:12", category: "Commercial", client: "Fashion Industry", services: ["Filming", "Editing", "Color Grading"] },
  { id: 2, title: "Seasonal Drop Campaign", video: videoUrl("clothing", "2.mp4"), description: "High-contrast lookbook sequence built for paid social.", duration: "0:48", category: "Campaign", client: "Fashion Industry", services: ["Filming", "Editing", "Motion Graphics"] },
  { id: 3, title: "Designer Brand Film", video: videoUrl("clothing", "3.mp4"), description: "Personal brand story focused on craft and authority.", duration: "1:34", category: "Brand Film", client: "Fashion Industry", services: ["Creative Direction", "Filming", "Color Grading"] },
  { id: 4, title: "Showroom Walkthrough", video: videoUrl("clothing", "4.mp4"), description: "Premium showroom walkthrough with cinematic movement.", duration: "1:05", category: "Showcase", client: "Fashion Industry", services: ["Filming", "Editing", "Sound Design"] },
  { id: 5, title: "Lookbook Reels", video: videoUrl("clothing", "5.mp4"), description: "Short-form edits designed for retention and saves.", duration: "0:29", category: "Social", client: "Fashion Industry", services: ["Editing", "Color Grading", "Motion Graphics"] },
  { id: 6, title: "Collection Launch Edit", video: videoUrl("clothing", "6.mp4"), description: "Fast-cut collection launch film with aggressive rhythm.", duration: "0:42", category: "Launch", client: "Fashion Industry", services: ["Filming", "Editing", "Motion Graphics"] },
];
