export type ClothingVideo = {
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

export const clothingVideos: ClothingVideo[] = [
  { id: 1, title: "Cinematic Apparel Promo", thumbnail: "/images/gym-content/thumb-01.svg", video: "https://d3uo687t366hok.cloudfront.net/videos/clothing/1.mp4", description: "Commercial launch film for a premium apparel brand.", duration: "1:12", category: "Commercial", client: "Fashion Industry", services: ["Filming", "Editing", "Color Grading"] },
  { id: 2, title: "Seasonal Drop Campaign", thumbnail: "/images/gym-content/thumb-02.svg", video: "https://d3uo687t366hok.cloudfront.net/videos/clothing/2.mp4", description: "High-contrast lookbook sequence built for paid social.", duration: "0:48", category: "Campaign", client: "Fashion Industry", services: ["Filming", "Editing", "Motion Graphics"] },
  { id: 3, title: "Designer Brand Film", thumbnail: "/images/gym-content/thumb-03.svg", video: "https://d3uo687t366hok.cloudfront.net/videos/clothing/3.mp4", description: "Personal brand story focused on craft and authority.", duration: "1:34", category: "Brand Film", client: "Fashion Industry", services: ["Creative Direction", "Filming", "Color Grading"] },
  { id: 4, title: "Showroom Walkthrough", thumbnail: "/images/gym-content/thumb-04.svg", video: "https://d3uo687t366hok.cloudfront.net/videos/clothing/4.mp4", description: "Premium showroom walkthrough with cinematic movement.", duration: "1:05", category: "Showcase", client: "Fashion Industry", services: ["Filming", "Editing", "Sound Design"] },
  { id: 5, title: "Lookbook Reels", thumbnail: "/images/gym-content/thumb-05.svg", video: "https://d3uo687t366hok.cloudfront.net/videos/clothing/5.mp4", description: "Short-form edits designed for retention and saves.", duration: "0:29", category: "Social", client: "Fashion Industry", services: ["Editing", "Color Grading", "Motion Graphics"] },
  { id: 6, title: "Collection Launch Edit", thumbnail: "/images/gym-content/thumb-06.svg", video: "https://d3uo687t366hok.cloudfront.net/videos/clothing/6.mp4", description: "Fast-cut collection launch film with aggressive rhythm.", duration: "0:42", category: "Launch", client: "Fashion Industry", services: ["Filming", "Editing", "Motion Graphics"] },
  { id: 7, title: "Apparel Product Spot", thumbnail: "/images/gym-content/thumb-07.svg", video: "", description: "Product-focused fashion film for commercial placement.", duration: "0:56", category: "Product", client: "Fashion Industry", services: ["Filming", "Color Grading", "Editing"] },
  { id: 8, title: "Model Story", thumbnail: "/images/gym-content/thumb-08.svg", video: "", description: "Emotional testimonial cut with premium documentary tone.", duration: "2:08", category: "Story", client: "Fashion Industry", services: ["Interview", "Editing", "Color Grading"] },
  { id: 9, title: "Runway Montage", thumbnail: "/images/gym-content/thumb-09.svg", video: "", description: "Cinematic runway montage for organic brand growth.", duration: "1:21", category: "Montage", client: "Fashion Industry", services: ["Filming", "Editing", "Sound Design"] },
];
