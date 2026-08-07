import { videoUrl } from "@/lib/media-config";

export type RestaurantVideo = {
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

export const restaurantVideos: RestaurantVideo[] = [
  { id: 1, title: "Fine Dining Commercial", thumbnail: "/images/gym-content/thumb-01.svg", video: videoUrl("restaurant", "1.mp4"), description: "Cinematic commercial built to elevate a fine dining brand.", duration: "1:18", category: "Commercial", client: "Hospitality Industry", services: ["Filming", "Food Styling", "Color Grading"] },
  { id: 2, title: "Cafe Launch Film", thumbnail: "/images/gym-content/thumb-02.svg", video: videoUrl("restaurant", "2.mp4"), description: "Warm, inviting launch film introducing a new cafe brand.", duration: "0:52", category: "Launch", client: "Hospitality Industry", services: ["Filming", "Editing", "Motion Graphics"] },
  { id: 3, title: "Luxury Menu Showcase", thumbnail: "/images/gym-content/thumb-03.svg", video: videoUrl("restaurant", "3.mp4"), description: "Macro-detail menu showcase built for premium perception.", duration: "1:04", category: "Showcase", client: "Hospitality Industry", services: ["Food Styling", "Filming", "Color Grading"] },
  { id: 4, title: "Chef Documentary", thumbnail: "/images/gym-content/thumb-04.svg", video: videoUrl("restaurant", "4.mp4"), description: "Intimate documentary profile following a signature chef.", duration: "2:41", category: "Documentary", client: "Hospitality Industry", services: ["Interview", "Filming", "Sound Design"] },
  { id: 5, title: "Signature Dish Story", thumbnail: "/images/gym-content/thumb-05.svg", video: videoUrl("restaurant", "5.mp4"), description: "Short-form story told entirely through a single dish.", duration: "0:34", category: "Social", client: "Hospitality Industry", services: ["Editing", "Color Grading", "Motion Graphics"] },
  { id: 6, title: "Restaurant Brand Film", thumbnail: "/images/gym-content/thumb-06.svg", video: videoUrl("restaurant", "6.mp4"), description: "Full brand film covering atmosphere, craft and service.", duration: "1:47", category: "Brand Film", client: "Hospitality Industry", services: ["Creative Direction", "Filming", "Editing"] },
  { id: 7, title: "Cloud Kitchen Campaign", thumbnail: "/images/gym-content/thumb-07.svg", video: videoUrl("restaurant", "7.mp4"), description: "Fast-cut delivery-first campaign built for paid social.", duration: "0:41", category: "Campaign", client: "Hospitality Industry", services: ["Filming", "Editing", "Motion Graphics"] },
  { id: 8, title: "Hotel Dining Experience", thumbnail: "/images/gym-content/thumb-08.svg", video: videoUrl("restaurant", "8.mp4"), description: "Ambient walkthrough of a hotel's signature dining room.", duration: "1:22", category: "Walkthrough", client: "Hospitality Industry", services: ["Filming", "Drone", "Color Grading"] },
  { id: 9, title: "Dessert Commercial", thumbnail: "/images/gym-content/thumb-09.svg", video: videoUrl("restaurant", "9.mp4"), description: "High-gloss dessert commercial shot for maximum craving.", duration: "0:29", category: "Commercial", client: "Hospitality Industry", services: ["Food Styling", "Filming", "Editing"] },
];
