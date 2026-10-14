# Kroo Productions — Performance Optimization Report

**Date:** 14 October 2026  
**Working branch:** `fix/performance-seo-audit`  
**Production status:** Not changed by this patch. Changes are proposed through the existing draft pull request and require preview validation before merge.

## Baseline from the supplied reports

| Tool / device | Performance | LCP | TBT | Other |
|---|---:|---:|---:|---|
| PageSpeed Insights mobile | 52/100 | 4.9 s | 830 ms | FCP 3.3 s; Speed Index 5.6 s; CLS 0 |
| PageSpeed Insights desktop | 65/100 | 1.7 s | 600 ms | FCP 0.3 s; Speed Index 2.2 s; CLS 0.014 |
| GTmetrix (Seattle, Chrome) | 50% | 2.5 s | 878 ms | 12.4 MB page payload; 826 DOM elements; 15 long tasks |

The tests use different devices, network throttles and Lighthouse versions. Scores should be compared within the same tool and test configuration.

## Changes in this patch

### 1. Removed the blocking full-screen intro from the homepage
- Removed the `Loader` import/render from the homepage.
- Removed the hero copy's initial staggered opacity transition and scroll transform; removed the hero logo's initial blur and horizontal entrance animation.
- **Reason:** the mobile report identified 2.77 seconds of LCP element render delay, and the page was putting a full-screen overlay and entrance effects between the visitor and the main content.
- **Expected outcome:** hero content can paint immediately instead of waiting for an intro animation. The change is intended to improve initial rendering and LCP; the exact score change is not yet measured.

### 2. Made the showreel load on demand
- Added a small, local SVG title-card poster with an explicit Play button.
- The MP4 player and its source are not mounted until the visitor chooses to play the showreel. Once started, the player uses `preload="none"`, a poster, native controls and the existing media fallback.
- **Reason:** avoid spending initial-load bandwidth on below-the-fold video metadata/media when the visitor may not play it.
- **Expected outcome:** less competition between the showreel and critical first-screen assets; potentially lower initial transfer size. GTmetrix's 12.4 MB total is not assumed to be entirely caused by this video; that must be checked in the Waterfall.

### 3. Improved responsive image source selection for the hero and portfolio cards
- Marked the above-the-fold brand mark as a priority image and adjusted its responsive `sizes`/quality.
- Matched the carousel image `sizes` declaration to its responsive card width.
- **Reason:** the supplied mobile report flagged the logo and Gym Content thumbnail as larger than displayed dimensions required.
- **Expected outcome:** earlier loading of the visible logo and a better chance of selecting a closer-sized portfolio image. Confirm the requested `/_next/image` widths in the retest.

### 4. Deferred Google Analytics network loading
- Replaced the default Analytics wrapper with a small client component that loads the same GA4 ID using Next.js `lazyOnload`.
- Preserved route-change `page_view` events for Next.js client-side navigation. The initial bootstrap only queues events; it does not request the GA network script immediately.
- **Reason:** the mobile report attributes about 409 ms CPU time to Google Analytics and reports substantial unused JavaScript from the tag.
- **Expected outcome:** less third-party script contention during initial rendering. Analytics collection can start later, and very early route transitions before the script loads may be represented only by the latest path.

### 5. Deferred Web Vitals library loading
- Changed the statically imported `web-vitals` module to a dynamic import scheduled after the page `load` event and an idle callback (with a timeout fallback).
- Preserved the existing custom telemetry payloads and error handling.
- **Reason:** performance telemetry is diagnostic and does not need to compete with first paint.
- **Expected outcome:** less eager JavaScript loading during the initial route. Field-metric reporting may be registered later; validate that reports still arrive.

## What has not been fixed by this patch

- The homepage remains a large Client Component. Bundle analysis and a staged Server Component/client-island refactor are still needed to address the full 600–878 ms TBT range with confidence.
- The showreel MP4 itself has not been transcoded in this patch. A lower-bitrate 1080p rendition and a CDN poster derived from an approved video frame should be evaluated separately.
- GTmetrix's reported 12.4 MB total payload and 614 KB cache savings still need a waterfall/resource-by-resource audit; neither number is attributed to a single asset without evidence.
- Accessibility issues, browser console errors, security header audits and the repository's dependency/lockfile alignment are outside this performance patch.
- No performance score improvement is claimed before a successful preview build and repeat test.

## Validation required before production

1. Confirm Vercel preview build reaches **Ready** without build/runtime errors.
2. Run `npm ci`, `npm run typecheck`, `npm run lint`, and `npm run build` in a network-enabled CI environment.
3. Test showreel play/fallback, contact form, navigation, carousel interactions, mobile layout, and client-side route analytics.
4. Re-run PageSpeed Insights on the same production URL and same mobile/desktop settings; repeat GTmetrix in the same location/settings.
5. Compare LCP, TBT, Speed Index, transferred bytes, image variants, and console errors. Merge only after preview validation passes.

## Outcome statement

This patch removes known startup work (blocking loader/hero animation and immediate third-party/telemetry imports) and prevents automatic mounting of the showreel player. These are code-level optimizations based on the supplied audits. **The final performance score and real-world benefit remain unverified until the preview is built, tested, and retested.**
