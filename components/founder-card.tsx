"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useMotionValue, useSpring, useTransform, motion } from "framer-motion";
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

/** Premium-glass shell — unchanged from the approved design. */
const glassShell =
  "relative h-full w-full overflow-hidden rounded-[22px] border border-white/[0.14] " +
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
      className="group relative h-full"
      onMouseMove={isTouch ? undefined : handleMove}
      onMouseLeave={isTouch ? undefined : resetTilt}
    >
      {/* ambient orange glow — strengthens on hover via opacity only */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] opacity-40 blur-3xl transition-opacity duration-[450ms] ease-out group-hover:opacity-90"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 55%, ${content.accent}33, transparent 72%)`,
        }}
      />

      {/* elevation shadow — a static blurred shape that only fades in, so
          the "lift off the table" reads without animating box-shadow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-8 bottom-0 -z-10 h-8 rounded-full bg-black/70 opacity-0 blur-xl transition-opacity duration-[450ms] ease-out group-hover:opacity-70"
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
aspect-[3/5.25]
sm:aspect-[3/4.7]
[transform:translateZ(0)]
"
      >
        <div className={`${glassShell} bg-[#0b0b0b]`}>
          <div className="relative h-full">
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

            {/* name + label + badge */}
            <div className="absolute left-5 right-14 top-5 z-10">
              <h3 className="flex items-start text-[16px] sm:text-[28px] font-bold leading-none text-white">
                {founder.name}
                <span
                  className="ml-1 mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: "var(--accent)" }}
                />
              </h3>
              <p
                className="mt-2 text-[10px] sm:text-[13px] font-black uppercase tracking-[0.28em]"
                style={{ color: "var(--accent)" }}
              >
                Founder
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)]">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: "var(--accent)" }}
                />
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/85">
                  {founder.role}
                </span>
              </div>
            </div>

            {/* three-dot menu */}
            <button
              type="button"
              aria-label="More options"
              className="absolute right-4 top-5 z-10 text-white/50 transition-opacity duration-[450ms] hover:text-white"
            >
              <MoreVertical size={18} />
            </button>

            {/* floating glass dock */}
           {/* floating glass dock */}
<div className="absolute left-2 right-2 bottom-2 z-10 flex flex-col gap-1.5 rounded-[26px] border border-white/15 bg-white/[0.07] p-1.5 sm:inset-x-4 sm:bottom-4 sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_40px_-12px_rgba(0,0,0,0.7)] [backdrop-filter:blur(26px)] [-webkit-backdrop-filter:blur(26px)]">
  <div className="relative w-full sm:w-auto sm:min-w-0 sm:flex-1">
    {/* glow — static shadow value, only its opacity animates */}
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-[450ms] ease-out group-hover:opacity-100"
      style={{ boxShadow: `0 0 22px ${content.accent}66` }}
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
        py-2.5
        sm:py-3
        px-4
        sm:px-3
        text-center
        text-[11px]
        sm:text-[12px]
        font-black
        uppercase
        tracking-[0.16em]
        sm:tracking-[0.18em]
        whitespace-nowrap
        text-white
      "
    >
      CONNECT&nbsp;US
    </button>
  </div>

  <div className="flex w-full items-center justify-center gap-3 sm:w-auto sm:flex-none sm:justify-start sm:gap-1">
              <a

      href={socials.instagram}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] opacity-80 transition-all duration-300 hover:scale-110 hover:opacity-100"
      style={{ color: "var(--accent)" }}
    >
      <Instagram
        className="h-[13px] w-[13px] sm:h-[15px] sm:w-[15px]"
        strokeWidth={2.3}
      />
    </a>

     <a
      href={socials.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] opacity-80 transition-all duration-300 hover:scale-110 hover:opacity-100"
      style={{ color: "var(--accent)" }}
    >
      <FaWhatsapp className="h-[13px] w-[13px] sm:h-[15px] sm:w-[15px]" />
    </a>

     <a
      href={socials.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] opacity-80 transition-all duration-300 hover:scale-110 hover:opacity-100"
      style={{ color: "var(--accent)" }}
    >
      <Linkedin
        className="h-[13px] w-[13px] sm:h-[15px] sm:w-[15px]"
        strokeWidth={2.3}
      />
    </a>
  </div>
</div>
            </div>
        

          <CursorSpotlight />
          <Grain />
        </div>
      </motion.div>
    </div>
  );
}