# Kroo Production

A cinematic production house website for KROO PRODUCTION, built with Next.js 15, TypeScript, TailwindCSS, Framer Motion, GSAP, Lenis, React Three Fiber, Shadcn-style UI primitives, and Lucide icons.

## Structure

```txt
app/
  layout.tsx           SEO metadata and global font setup
  page.tsx             Server entry for the homepage
  robots.ts            Search crawler rules
  sitemap.ts           Sitemap metadata
  globals.css          Tailwind layers, design tokens, cinematic utilities
components/
  ambient.tsx          Mouse-follow glow, grid overlay, grain texture
  cursor-follower.tsx  Cursor follower interaction
  home-page.tsx        Complete landing experience
  loader.tsx           Animated logo loader
  scene/kroo-mark.tsx  React Three Fiber hero mark
  site-nav.tsx         Responsive navigation
  ui/                  Shadcn-style Button, Input, Textarea primitives
hooks/
  use-gsap-reveal.ts   ScrollTrigger reveal and parallax system
  use-lenis.ts         Smooth scrolling setup
  use-magnetic.ts      Magnetic hover system
lib/
  content.ts           Reusable site data
  utils.ts             Class merging utilities
public/
  icon.svg             App icon
vercel.json            Vercel project defaults
```

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Deploy on Vercel

1. Push this folder to a Git repository.
2. Import the repository in Vercel.
3. Use the default Next.js settings.
4. Build command: `npm run build`
5. Output directory: `.next`

The app is designed for Vercel with Next.js metadata, optimized package imports, responsive layouts, lazy client-only motion systems, and a clean component architecture.
