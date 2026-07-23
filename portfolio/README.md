# Navneet Pathak — Portfolio

Premium, dark, editorial portfolio for a video editor and motion graphics
artist. Next.js 15 (App Router) + TypeScript + Tailwind CSS + Framer Motion
+ GSAP/ScrollTrigger + Lenis.

## Stack

- **Framework:** Next.js 15 (App Router), React 19, strict TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion (component-level reveals) + GSAP/ScrollTrigger
  (scroll-driven counters, timeline, magnetic cursor)
- **Smooth scroll:** Lenis
- **Icons:** Lucide React
- **Contact form:** Next.js API Route → Zod validation → AWS SES
- **Media:** AWS S3 + Amazon CloudFront (once real footage is uploaded)
- **Hosting:** Vercel · **DNS:** Cloudflare

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in real values, see below
npm run dev
```

Open http://localhost:3000.

```bash
npm run typecheck   # strict TS, no emit
npm run lint         # eslint
npm run build        # production build
```

## Environment variables

See `.env.example`. None of these are committed — set the real values in
`.env.local` locally and in Vercel's Environment Variables panel for
Preview/Production.

| Variable | Purpose |
|---|---|
| `AWS_REGION` | Region for both SES and S3 |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | IAM user scoped to `ses:SendEmail` and S3 read on the media bucket only |
| `SES_FROM_ADDRESS` | Verified SES sender identity |
| `SES_TO_ADDRESS` | Inbox that receives contact form submissions |
| `S3_BUCKET_NAME` | Bucket holding raw video/image assets |
| `NEXT_PUBLIC_CDN_HOST` | CloudFront distribution domain, used by `next/image` |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL, used by metadata/sitemap/robots |

## AWS setup notes

1. **SES:** verify the `SES_FROM_ADDRESS` domain/identity. While in the SES
   sandbox, `SES_TO_ADDRESS` must also be verified — request production
   access before launch or the contact form will fail silently for
   unverified recipients.
2. **S3 + CloudFront:** upload real project footage/images to the S3
   bucket, put a CloudFront distribution in front of it, and point
   `NEXT_PUBLIC_CDN_HOST` at the distribution domain. Swap the placeholder
   URLs in `sections/Work.tsx` for the CloudFront URLs once assets exist.
3. **IAM:** scope the access key to exactly `ses:SendEmail` +
   `ses:SendRawEmail` and read-only S3 on the one bucket — nothing broader.

## Project structure

```
app/            routes, layout, metadata, API route
components/     shared UI (Nav, Footer, CustomCursor, Reveal, Counter…)
sections/       one file per homepage section (Hero, About, Work…)
hooks/          useLenis, useMagnetic
lib/            validation (Zod), SES client, rate limiter, cn() helper
types/          shared TypeScript interfaces
public/         static assets (replace portrait.jpg with a final export)
```

## Known follow-ups before launch

- Replace `public/portrait.jpg` with a properly cut-out, high-res export.
- Swap the four placeholder work items in `sections/Work.tsx` for real
  CloudFront-hosted video thumbnails.
- Self-host Clash Display / General Sans via `next/font/local` instead of
  the Fontshare CDN link in `app/layout.tsx`, for one less external request.
- Move the in-memory rate limiter (`lib/rate-limit.ts`) to a shared store
  if traffic grows past a single serverless instance.
- Add `public/og-image.jpg` (1200×630) referenced in the Open Graph metadata.
