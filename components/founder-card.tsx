"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMotionValue, useSpring, motion } from "framer-motion";
import {
  Linkedin,
  Instagram,
  MoreVertical,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

type Founder = {
  name: string;
  role: string;
  image?: string;
  tone?: string;
};

interface FounderCardProps {
  founder: Founder;
}

type SocialKey = "linkedin" | "instagram" | "email";

type FounderContent = {
  keyword: string;
  philosophy: string[];
  quote: string;
  descriptors: string[];
  cta: string;
  socials: SocialKey[];
  accent: string;
  /** CSS object-position for the cutout — crop/framing only, never a layout change */
  portraitPosition: string;
  /** 0.95–1.1 — subtle scale variance only */
  portraitScale: number;
};

const founderContent: Record<string, FounderContent> = {
  "Soumojit Das": {
    keyword: "Vision",
    philosophy: ["Built", "to be", "remembered."],
    quote: "Every frame should earn its place.",
    descriptors: ["Story", "Emotion", "Identity"],
    cta: "View Work",
    socials: ["linkedin", "instagram", "email"],
    accent: "#FF4D12",
    portraitPosition: "50% 15%",
    portraitScale: 1,
  },
  "Rajbir Singh": {
    keyword: "Lead",
    philosophy: ["Beyond", "the", "frame."],
    quote: "Every shot should say something.",
    descriptors: ["Light", "Rhythm", "Composition"],
    cta: "View Work",
    socials: ["linkedin", "instagram", "email"],
    accent: "#D4A017",
    portraitPosition: "50% 12%",
    portraitScale: 1.05,
  },
  "Vivek Das": {
    keyword: "Focus",
    philosophy: ["Think", "before you", "create."],
    quote: "Every great visual starts with a stronger idea.",
    descriptors: ["Idea", "Concept", "Direction"],
    cta: "View Work",
    socials: ["linkedin", "instagram", "email"],
    accent: "#F5A623",
    portraitPosition: "50% 18%",
    portraitScale: 0.97,
  },
  "Navneet Pathak": {
    keyword: "Build",
    philosophy: ["Creating", "what", "creates."],
    quote: "Building the systems behind the stories.",
    descriptors: ["Systems", "AI", "Automation"],
    cta: "View Work",
    socials: ["linkedin", "email"],
    accent: "#B87333",
    portraitPosition: "50% 14%",
    portraitScale: 1.03,
  },
};

type FounderSocials = {
  instagram?: string;
  whatsapp?: string;
  linkedin?: string;
};

const founderSocials: Record<string, FounderSocials> = {
  "Navneet Pathak": {
    instagram: "https://www.instagram.com/theunrealatable.monk/",
    whatsapp: "https://wa.me/919088564713",
    linkedin: "https://www.linkedin.com/in/navneetpathak76/",
  },

  "Vivek Das": {
    instagram: "https://www.instagram.com/frames_manipulator/",
    whatsapp: "https://wa.me/917439484935",
    linkedin: "https://www.linkedin.com/in/vivek-kumar-das-1bb5b6266/",
  },

  "Soumojit Das": {
    instagram: "https://www.instagram.com/crafted_by_sj/",
    whatsapp: "https://wa.me/917003087985",
    linkedin: "https://www.linkedin.com/in/soumojitdesigns/",
  },

  "Rajbir Singh": {
    instagram: "https://www.instagram.com/rajvir_rs/",
    whatsapp: "https://wa.me/916291252126",
    linkedin: "https://www.linkedin.com/in/rajbir-singh-4639b5324/",
  },
};

/**
 * Footer/dock accent is intentionally a SINGLE shared constant, not
 * `content.accent`. Each founder has a different accent used for the
 * name dot and portrait rim light, which is fine — but the bottom CTA
 * dock (glass, button, social icons) must be pixel-identical across
 * every card (glow colour, icon colour, everything), so it reads from
 * this one value instead of the per-founder accent.
 */
const FOOTER_ACCENT = "#FF4D12";

const fallbackContent: FounderContent = {
  keyword: "Create",
  philosophy: ["Craft", "over", "everything."],
  quote: "Good work speaks for itself.",
  descriptors: ["Craft", "Detail", "Intent"],
  cta: "View Work",
  socials: ["linkedin", "email"],
  accent: "#FF4D12",
  portraitPosition: "50% 15%",
  portraitScale: 1,
};

/** Premium-glass shell — corner radius is smaller/tighter on true mobile
 *  only (more rectangular, less "bubble" rounding); unchanged from the
 *  approved design at md (tablet) and above. */
const glassShell =
  "relative h-full w-full overflow-hidden rounded-lg md:rounded-[22px] border border-white/[0.14] " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.09),inset_0_-1px_0_rgba(0,0,0,0.5),0_30px_70px_-20px_rgba(0,0,0,0.85)] " +
  "[backdrop-filter:blur(18px)] [-webkit-backdrop-filter:blur(18px)] [will-change:transform]";

const cardEase = [0.22, 1, 0.36, 1] as [number, number, number, number];
const cardTransition = { duration: 0.45, ease: cardEase };

function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-30 opacity-[0.045] mix-blend-overlay [transform:translateZ(0)] [will-change:transform]"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
        backgroundSize: "3px 3px",
      }}
    />
  );
}

/** Soft light that tracks the cursor, read from CSS vars set directly on the
 *  card root (no re-render on every mouse move — cheap, GPU-friendly). */
function CursorSpotlight() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-[450ms] ease-out group-hover:opacity-100 [transform:translateZ(0)] [will-change:transform]"
      style={{
        background:
          "radial-gradient(480px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.10), transparent 45%)",
        mixBlendMode: "overlay",
      }}
    />
  );
}

export function FounderCard({ founder }: FounderCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isTouch, setIsTouch] = useState(false);

  const content = founderContent[founder.name] ?? fallbackContent;
  const socials =
    founderSocials[founder.name] ?? {
      instagram: "#",
      whatsapp: "#",
      linkedin: "#",
    };

  // Raw mouse-driven tilt, smoothed through a spring so the tilt "smoothly
  // influences" rotation rather than snapping frame to frame.
  const rawTiltX = useMotionValue(0);
  const rawTiltY = useMotionValue(0);
  const tiltX = useSpring(rawTiltX, { stiffness: 220, damping: 22, mass: 0.4 });
  const tiltY = useSpring(rawTiltY, { stiffness: 220, damping: 22, mass: 0.4 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    setIsTouch(mq.matches);
  }, []);

  const setSpotVars = (px: number, py: number) => {
    rootRef.current?.style.setProperty("--mx", `${px * 100}%`);
    rootRef.current?.style.setProperty("--my", `${py * 100}%`);
  };

  const handleMove = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    // max 4deg either direction
    rawTiltY.set((px - 0.5) * 8);
    rawTiltX.set((0.5 - py) * 8);
    setSpotVars(px, py);
  };

  const resetTilt = () => {
    rawTiltX.set(0);
    rawTiltY.set(0);
    setSpotVars(0.5, 0.5);
  };

  return (
    <div
      ref={rootRef}
      style={{
        perspective: 1800,
        ["--accent" as string]: content.accent,
      }}
      className="group relative h-full w-full min-w-0 max-w-none"
      onMouseMove={isTouch ? undefined : handleMove}
      onMouseLeave={isTouch ? undefined : resetTilt}
    >
      {/* ambient orange glow — strengthens on hover via opacity only */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-[clamp(1px,0.4vw,6px)] -z-10 rounded-[2rem] opacity-40 blur-[clamp(6px,2vw,32px)] transition-opacity duration-[450ms] ease-out group-hover:opacity-90"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 55%, ${content.accent}33, transparent 72%)`,
        }}
      />

      {/* elevation shadow — a static blurred shape that only fades in, so
          the "lift off the table" reads without animating box-shadow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[clamp(3px,1.1vw,16px)] bottom-0 -z-10 h-[clamp(3px,1.1vw,16px)] rounded-full bg-black/70 opacity-0 blur-[clamp(3px,1vw,16px)] transition-opacity duration-[450ms] ease-out group-hover:opacity-70"
      />

      <motion.div
        style={{
          rotateX: tiltX,
          rotateY: tiltY,
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
          willChange: "transform",
        }}
        whileHover={{ y: -10, scale: 1.02 }}
        transition={cardTransition}
className="
relative
w-full
aspect-[2.6/4]
sm:aspect-[2.8/4.2]
md:aspect-[3/4.7]
[transform:translateZ(0)]
"
      >
        <div className={`${glassShell} bg-[#0b0b0b]`}>
          <div className="relative h-full">
            {/* ================================================================ */}
            {/* DESKTOP LAYOUT — untouched, pixel-identical to the approved design */}
            {/* Rendered md: and up (tablet + desktop) — tablet reuses the exact   */}
            {/* same desktop card, per spec: "tablet = same desktop proportions".  */}
            {/* At real desktop widths (≥1024px) this renders identically to      */}
            {/* before — nothing inside this block was changed.                   */}
            {/* ================================================================ */}
            <div className="hidden h-full md:block">
              {/* portrait — full bleed, scales up slightly on hover */}
              {founder.image ? (
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    style={{
                      objectPosition: content.portraitPosition,
                      transform: `scale(${content.portraitScale})`,
                    }}
                    className="object-cover transition-transform duration-[450ms] group-hover:scale-[1.03]"
                  />
                </div>
              ) : (
                <div className="h-full w-full bg-neutral-900" />
              )}

              {/* soft vignette + orange rim light — unchanged, static */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/70" />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 mix-blend-overlay"
                style={{
                  background: `linear-gradient(120deg, transparent 55%, ${content.accent}40 100%)`,
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ boxShadow: "inset 0 0 90px rgba(0,0,0,0.55)" }}
              />
              {/* bottom orange ambient glow, behind the dock */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
                style={{
                  background: `radial-gradient(ellipse 80% 100% at 50% 100%, ${content.accent}38, transparent 70%)`,
                }}
              />

              {/* glass brightness lift — a white wash that only fades in */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-white opacity-0 mix-blend-overlay transition-opacity duration-[450ms] ease-out group-hover:opacity-[0.08]"
              />

              {/* name + label */}
              <div className="absolute left-[clamp(4px,1.3vw,20px)] right-[clamp(20px,3.7vw,56px)] top-[clamp(4px,1.3vw,20px)] z-10">
                <h3 className="flex items-start text-[clamp(7px,1.85vw,28px)] font-bold leading-tight text-white">
                  {founder.name}
                  <span
                    className="ml-1 mt-1 h-[clamp(3px,0.53vw,8px)] w-[clamp(3px,0.53vw,8px)] shrink-0 rounded-full"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                </h3>
                <p
                  className="mt-1 text-[clamp(4px,0.86vw,13px)] font-black uppercase tracking-[0.24em]"
                  style={{ color: "var(--accent)" }}
                >
                  Founder
                </p>
              </div>

              {/* three-dot menu */}
              <button
                type="button"
                aria-label="More options"
                className="absolute right-[clamp(6px,1.06vw,16px)] top-[clamp(5px,1.32vw,20px)] z-10 text-[clamp(9px,1.19vw,18px)] text-white/50 transition-opacity duration-[450ms] hover:text-white"
              >
                <MoreVertical size="1em" />
              </button>

              {/* floating glass dock — always the horizontal pill, only its scale changes */}
              <div className="absolute inset-x-[clamp(3px,1.06vw,16px)] bottom-[clamp(3px,1.06vw,16px)] z-10 flex flex-row items-center gap-[clamp(1px,0.53vw,8px)] rounded-full border border-white/15 bg-white/[0.07] p-[clamp(1px,0.53vw,8px)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_40px_-12px_rgba(0,0,0,0.7)] [backdrop-filter:blur(26px)] [-webkit-backdrop-filter:blur(26px)]">
                <div className="relative min-w-0 flex-1">
                  {/* glow — static shadow value, only its opacity animates */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-[450ms] ease-out group-hover:opacity-100"
                    style={{ boxShadow: `0 0 22px ${FOOTER_ACCENT}66` }}
                  />
                  <button
                    type="button"
                    className="
                      relative
                      w-full
                      min-w-0
                      rounded-full
                      border
                      border-white/10
                      bg-white/[0.05]
                      py-[clamp(1px,0.79vw,12px)]
                      px-[clamp(2px,0.79vw,12px)]
                      text-center
                      text-[clamp(4px,0.79vw,12px)]
                      font-black
                      uppercase
                      tracking-[0.16em]
                      whitespace-nowrap
                      text-white
                    "
                  >
                    CONNECT&nbsp;US
                  </button>
                </div>

                <div className="flex flex-none items-center justify-start gap-[clamp(1px,0.26vw,4px)]">
                  <a
                    href={socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-[clamp(10px,2.38vw,36px)] w-[clamp(10px,2.38vw,36px)] items-center justify-center rounded-full border border-white/15 bg-white/[0.04] opacity-80 transition-all duration-300 hover:scale-110 hover:opacity-100"
                    style={{ color: FOOTER_ACCENT }}
                  >
                    <Instagram
                      className="h-[clamp(5px,0.99vw,15px)] w-[clamp(5px,0.99vw,15px)]"
                      strokeWidth={2.3}
                    />
                  </a>

                  <a
                    href={socials.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-[clamp(10px,2.38vw,36px)] w-[clamp(10px,2.38vw,36px)] items-center justify-center rounded-full border border-white/15 bg-white/[0.04] opacity-80 transition-all duration-300 hover:scale-110 hover:opacity-100"
                    style={{ color: FOOTER_ACCENT }}
                  >
                    <FaWhatsapp className="h-[clamp(5px,0.99vw,15px)] w-[clamp(5px,0.99vw,15px)]" />
                  </a>

                  <a
                    href={socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-[clamp(10px,2.38vw,36px)] w-[clamp(10px,2.38vw,36px)] items-center justify-center rounded-full border border-white/15 bg-white/[0.04] opacity-80 transition-all duration-300 hover:scale-110 hover:opacity-100"
                    style={{ color: FOOTER_ACCENT }}
                  >
                    <Linkedin
                      className="h-[clamp(5px,0.99vw,15px)] w-[clamp(5px,0.99vw,15px)]"
                      strokeWidth={2.3}
                    />
                  </a>
                </div>
              </div>
            </div>

            {/* ================================================================ */}
            {/* MOBILE LAYOUT — true mobile only (<768px). Every internal size    */}
            {/* recalculated from scratch for the narrowest columns; not the      */}
            {/* tablet layout shrunk. The footer is hardened so it can never      */}
            {/* overflow: overflow-hidden on the pill, min-w-0 on the button's    */}
            {/* flex child, flex-shrink-0 on every icon.                          */}
            {/* ================================================================ */}
            <div className="relative h-full w-full md:hidden">
              {/* bottom ambient glow, behind the image */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2"
                style={{
                  background: `radial-gradient(ellipse 80% 100% at 50% 100%, ${content.accent}38, transparent 70%)`,
                }}
              />

              {/* portrait — full bleed (absolute inset-0), exactly like desktop.
                  The footer sits on top of it near the bottom instead of the
                  image being boxed into a fixed-height slot above a gap. */}
              <div className="absolute inset-0 overflow-hidden">
                {founder.image ? (
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    style={{
                      objectPosition: content.portraitPosition,
                      transform: `scale(${content.portraitScale})`,
                    }}
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-neutral-900" />
                )}

                {/* vignette + rim light, scoped to the image block */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/70" />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 mix-blend-overlay"
                  style={{
                    background: `linear-gradient(120deg, transparent 55%, ${content.accent}40 100%)`,
                  }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{ boxShadow: "inset 0 0 30px rgba(0,0,0,0.55)" }}
                />
              </div>

              {/* name + single Founder badge (no duplicate pill) — reduced type */}
              <div className="absolute left-2 right-6 top-2 min-w-0 z-10">
                <h3 className="flex min-w-0 items-start truncate whitespace-nowrap text-[10px] leading-tight font-bold leading-tight text-white">
                  {founder.name}
                  <span
                    className="ml-1 mt-[3px] h-[3px] w-[3px] shrink-0 rounded-full"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                </h3>
                <p
                  className="mt-0.5 text-[7px] font-black uppercase tracking-[0.14em]"
                  style={{ color: "var(--accent)" }}
                >
                  Founder
                </p>
              </div>

              {/* three-dot menu */}
              <button
                type="button"
                aria-label="More options"
                className="absolute right-1.5 top-2 z-10 shrink-0 text-white/50"
              >
                <MoreVertical size={12} />
              </button>

              {/* footer dock — absolutely positioned near the bottom so it
                  overlaps the image directly, matching desktop. ONE glass
                  surface only; button and icons sit inside it as plain
                  children, no nested pill, no spacer. */}
              <div className="absolute inset-x-1 bottom-1 z-10 flex min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-white/15 bg-white/[0.07] px-1.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_18px_-8px_rgba(0,0,0,0.7)] [backdrop-filter:blur(16px)] [-webkit-backdrop-filter:blur(16px)]">
                <button
                  type="button"
                  className="min-w-0 flex-1 truncate rounded-full border border-white/10 bg-transparent py-1.5 px-1 text-center text-[6px] font-black uppercase tracking-[0.04em] text-white"
                >
                  CONNECT&nbsp;US
                </button>

                <div className="flex shrink-0 items-center gap-0.5">
                  <a
                    href={socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] opacity-90"
                    style={{ color: FOOTER_ACCENT }}
                  >
                    <Instagram className="h-[8px] w-[8px] shrink-0" strokeWidth={2.3} />
                  </a>

                  <a
                    href={socials.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] opacity-90"
                    style={{ color: FOOTER_ACCENT }}
                  >
                    <FaWhatsapp className="h-[8px] w-[8px] shrink-0" />
                  </a>

                  <a
                    href={socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] opacity-90"
                    style={{ color: FOOTER_ACCENT }}
                  >
                    <Linkedin className="h-[8px] w-[8px] shrink-0" strokeWidth={2.3} />
                  </a>
                </div>
              </div>
            </div>

            <CursorSpotlight />
            <Grain />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ==================================================================== */
/* FoundersGrid — renders all four cards.                               */
/* Mobile (<768) and tablet (768–1023) both get a 2×2 grid.              */
/* Desktop (≥1024) is the original single-row, 4-column layout.          */
/* ==================================================================== */

const founders: Founder[] = [
  { name: "Soumojit Das", role: "Founder", image: "/founders/soumojit.jpg" },
  { name: "Rajbir Singh", role: "Founder", image: "/founders/rajbir.jpg" },
  { name: "Vivek Das", role: "Founder", image: "/founders/vivek.jpg" },
  { name: "Navneet Pathak", role: "Founder", image: "/founders/navneet.jpg" },
];

export function FoundersGrid() {
  return (
    // True CSS Grid — this is the actual fix. The previous version never
    // applied `grid`/`grid-cols-*` at all (and had invalid JSX referencing
    // `founder.name` outside the map callback), so the cards were never
    // arranged in a grid to begin with.
    //
    // <768  (mobile, FounderCard renders its `md:hidden` mobile block):
    //   grid-cols-2 -> exactly the required 2x2.
    // >=768 (tablet + desktop, FounderCard renders its `hidden md:block`
    //   desktop block, unchanged): grid-cols-4 -> single row of 4, matching
    //   the existing md:/lg: switch already baked into FounderCard itself.
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 md:grid-cols-4 md:gap-6 lg:gap-8">
      {founders.map((founder) => (
        // min-w-0 overrides the grid item's implicit "min-width: auto" so the
        // cell is free to shrink to its 1fr share instead of growing to fit
        // its content. w-full (and NOT max-w-[...px]) means the card fills
        // exactly its 1fr grid cell — the grid's column tracks are what size
        // the card, the card never imposes its own width cap. Both
        // grid-cols-2 columns are equal-width, so every card gets an
        // identical cell -> identical width/height automatically.
        <div key={founder.name} className="w-full min-w-0">
          <FounderCard founder={founder} />
        </div>
      ))}
    </div>
  );
}
