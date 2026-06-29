import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "gsap"],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [100],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
