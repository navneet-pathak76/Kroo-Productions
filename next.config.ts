import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Content-Security-Policy",
    value: `
      default-src 'self';
      base-uri 'self';
      object-src 'none';
      frame-ancestors 'self';

      script-src
        'self'
        'unsafe-inline'
        https://www.googletagmanager.com
        https://www.google-analytics.com;

      style-src
        'self'
        'unsafe-inline';

      img-src
        'self'
        data:
        blob:
        https:
        http:;

      font-src
        'self'
        data:
        https:;

      media-src
        'self'
        blob:
        https:;

      connect-src
        'self'
        https://www.google-analytics.com
        https://region1.google-analytics.com
        https://www.googletagmanager.com
        https://*.google-analytics.com
        https://d3uo687t366hok.cloudfront.net;

      worker-src
        'self'
        blob:;

      manifest-src
        'self';

      child-src
        'self';

      frame-src
        'self';

      form-action
        'self';

      upgrade-insecure-requests;
    `
      .replace(/\n/g, "")
      .replace(/\s{2,}/g, " ")
      .trim(),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "gsap",
    ],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [100],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  async headers() {
    // 🚀 Disable CSP during development
    if (process.env.NODE_ENV === "development") {
      return [];
    }

    // ✅ Enable CSP only in production
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;