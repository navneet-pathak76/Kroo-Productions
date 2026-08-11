export type MediaKind = "image" | "video" | "asset";
export type MediaStatus = "draft" | "published" | "archived";

export type MediaItemRecord = {
  id: string;
  projectSlug: string;
  projectTitle: string;
  category: string;
  route: string;
  title: string;
  description?: string;
  tags: string[];
  altText?: string;
  mediaKind: MediaKind;
  mimeType: string;
  fileName: string;
  s3Key: string;
  cdnUrl: string;
  fileSize: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
  posterUrl?: string;
  thumbnailUrl?: string;
  displayOrder: number;
  status: MediaStatus;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
  replacedById?: string;
};

export type MediaProjectOption = {
  slug: string;
  title: string;
  route: string;
  folder: string;
};

export const PROJECT_OPTIONS: MediaProjectOption[] = [
  { slug: "gym", title: "Gym Content", route: "/gym-content", folder: "gym" },
  { slug: "clothing", title: "Clothing Content", route: "/clothing-content", folder: "clothing" },
  { slug: "clubs", title: "Clubs Content", route: "/clubs-content", folder: "clubs" },
  { slug: "motion-graphics", title: "Motion Graphics & Logo Animation", route: "/motion-graphics-content", folder: "motion-graphics" },
  { slug: "restaurant", title: "Restaurant Content", route: "/restaurant-content", folder: "restaurant" },
  { slug: "real-estate", title: "Real Estate", route: "/real-estate", folder: "real-estate" },
  { slug: "product", title: "Products", route: "/product-content", folder: "product" },
  { slug: "ai", title: "AI Videos", route: "/ai-content", folder: "ai" },
  { slug: "digital-marketing", title: "Social Media", route: "/digital-marketing-content", folder: "digital-marketing" },
  { slug: "logo-graphics", title: "Logo & Graphics", route: "/logo-graphics-content", folder: "logo-graphics" },
];

export function getProjectOptions(): MediaProjectOption[] {
  return PROJECT_OPTIONS;
}
