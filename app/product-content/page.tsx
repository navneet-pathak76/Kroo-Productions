import type { Metadata } from "next";
import ProductContentPage from "@/components/project/product-content-page";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Premium cinematic product content created for brands, e-commerce stores and launch campaigns by Kroo Production.",
  openGraph: {
    title: "Products | Kroo Production",
    description:
      "A premium project showcase for cinematic product commercials and brand launch content.",
    url: "https://krooproduction.com/projects/product-content",
    siteName: "Kroo Production",
    type: "website",
  },
};

export default function Page() {
  return <ProductContentPage />;
}
