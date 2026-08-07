import { videoUrl } from "@/lib/media-config";

export type ClubsVideo = {
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

export const clubsVideos: ClubsVideo[] = [
  { id: 1, title: "Cinematic Club Promo", thumbnail: "/images/gym-content/thumb-01.svg", video: videoUrl("clubs", "1.mp4"), description: "Commercial launch film for a premium nightlife venue.", duration: "1:12", category: "Commercial", client: "Nightlife Industry", services: ["Filming", "Editing", "Color Grading"] },
  { id: 2, title: "DJ Night Campaign", thumbnail: "/images/gym-content/thumb-02.svg", video: videoUrl("clubs", "2.mp4"), description: "High-contrast event sequence built for paid social.", duration: "0:48", category: "Campaign", client: "Nightlife Industry", services: ["Filming", "Editing", "Motion Graphics"] },
  { id: 3, title: "Resident DJ Brand Film", thumbnail: "/images/gym-content/thumb-03.svg", video: videoUrl("clubs", "3.mp4"), description: "Personal brand story focused on trust and authority.", duration: "1:34", category: "Brand Film", client: "Nightlife Industry", services: ["Creative Direction", "Filming", "Color Grading"] },
  { id: 4, title: "Venue Walkthrough", thumbnail: "/images/gym-content/thumb-04.svg", video: videoUrl("clubs", "4.mp4"), description: "Premium club walkthrough with cinematic movement.", duration: "1:05", category: "Showcase", client: "Nightlife Industry", services: ["Filming", "Editing", "Sound Design"] },
  { id: 5, title: "Aftermovie Reels", thumbnail: "/images/gym-content/thumb-05.svg", video: videoUrl("clubs", "5.mp4"), description: "Short-form edits designed for retention and saves.", duration: "0:29", category: "Social", client: "Nightlife Industry", services: ["Editing", "Color Grading", "Motion Graphics"] },
  { id: 6, title: "Event Launch Edit", thumbnail: "/images/gym-content/thumb-06.svg", video: videoUrl("clubs", "6.mp4"), description: "Fast-cut event launch film with aggressive rhythm.", duration: "0:42", category: "Launch", client: "Nightlife Industry", services: ["Filming", "Editing", "Motion Graphics"] },
  { id: 7, title: "Concert Highlight Spot", thumbnail: "/images/gym-content/thumb-07.svg", video: videoUrl("clubs", "7.mp4"), description: "Performance-focused concert film for commercial placement.", duration: "0:56", category: "Product", client: "Nightlife Industry", services: ["Filming", "Color Grading", "Editing"] },
  { id: 8, title: "Guest Story", thumbnail: "/images/gym-content/thumb-08.svg", video: videoUrl("clubs", "8.mp4"), description: "Emotional testimonial cut with premium documentary tone.", duration: "2:08", category: "Story", client: "Nightlife Industry", services: ["Interview", "Editing", "Color Grading"] },
  { id: 9, title: "Crowd Energy Montage", thumbnail: "/images/gym-content/thumb-09.svg", video: videoUrl("clubs", "9.mp4"), description: "Cinematic crowd montage for organic brand growth.", duration: "1:21", category: "Montage", client: "Nightlife Industry", services: ["Filming", "Editing", "Sound Design"] },
];
