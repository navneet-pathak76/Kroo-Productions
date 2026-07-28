"use client";
 
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMotionValue, motion } from "framer-motion";
import {
  ArrowRight,
  Instagram,
  Linkedin,
  Mail,
} from "lucide-react";
 
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
 
const socialIconMap: Record<SocialKey, typeof Linkedin> = {
  linkedin: Linkedin,
  instagram: Instagram,
  email: Mail,
};
 
function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-30 opacity-[0.045] mix-blend-overlay"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
        backgroundSize: "3px 3px",
      }}
    />
  );
}
 
function RadialGlow({ accent }: { accent: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        background: `radial-gradient(ellipse 60% 45% at 50% 46%, ${accent}14, transparent 70%)`,
      }}
    />
  );
}
 
function Descriptors({ items }: { items: string[] }) {
  return (
    <p className="flex items-center justify-center gap-2 text-[11px] font-medium tracking-wide text-white/45">
      {items.map((word, i) => (
        <span key={word} className="flex items-center gap-2">
          {i > 0 && <span className="text-white/20">•</span>}
          {word}
        </span>
      ))}
    </p>
  );
}
 
function CtaRow({
  cta,
  socials,
  founderName,
}: {
  cta: string;
  socials: SocialKey[];
  founderName: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide"
        style={{ color: "var(--accent)" }}
      >
        {cta}
        <ArrowRight size={13} />
      </span>
      <div className="flex gap-2.5">
        {socials.map((key) => {
          const Icon = socialIconMap[key];
          return (
            <Link
              key={key}
              href="#"
              aria-label={`${founderName} ${key}`}
              className="text-white/40 transition hover:text-white"
            >
              <Icon size={14} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
 
/**
 * The founder cutout — no rectangle, no visible container, no background.
 *
 * Two supported sources:
 *  1. A pre-cut transparent PNG (e.g. "/founders/soumojit-cutout.png") with the
 *     original background already removed — the ideal path, gives a true
 *     floating-on-black silhouette with zero background bleed.
 *  2. A regular photo, heavily gradient-masked as a fallback — this fades the
 *     photo to black on every edge so it *reads* as a cutout, but any
 *     background behind the subject's silhouette in the midtones will still
 *     faintly show through. Swap in cutout PNGs when available for the true
 *     poster look.
 *
 * Either way: no box, no border, no separate "image section" — it's drawn
 * directly into the poster, interlocking with the type above it.
 */
function Cutout({
  image,
  name,
  position,
  scale,
}: {
  image?: string;
  name: string;
  position: string;
  scale: number;
}) {
  if (!image) return null;
 
  return (
    <div
      className="relative mx-auto h-full w-[72%]"
      style={{
        maskImage: `
          radial-gradient(ellipse 68% 92% at 50% 42%, black 48%, transparent 88%),
          linear-gradient(to bottom, transparent 0%, black 18%, black 72%, transparent 100%)
        `,
        WebkitMaskImage: `
          radial-gradient(ellipse 68% 92% at 50% 42%, black 48%, transparent 88%),
          linear-gradient(to bottom, transparent 0%, black 18%, black 72%, transparent 100%)
        `,
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      }}
    >
      <Image
        src={image}
        alt={name}
        fill
        style={{ objectPosition: position, transform: `scale(${scale})` }}
        className="object-contain object-top grayscale contrast-[1.15] brightness-[0.92]"
      />
    </div>
  );
}
 
function BackFaceContent({
  founder,
  content,
}: {
  founder: Founder;
  content: FounderContent;
}) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-black">
      <RadialGlow accent={content.accent} />
 
      {/* oversized background keyword — identical position/opacity for every founder */}
      <p
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[6%] z-0 w-full -translate-x-1/2 select-none text-center text-[90px] font-black uppercase leading-none tracking-tight text-white/[0.045]"
      >
        {content.keyword}
      </p>
 
      {/* one continuous composition — nothing boxed, nothing split */}
      <div className="relative z-10 flex h-full flex-col items-center px-6 pb-6 pt-7 text-center">
        <p
          className="text-[10px] font-black uppercase tracking-[0.34em]"
          style={{ color: "var(--accent)" }}
        >
          {content.keyword}
        </p>
 
        <h3 className="mt-3 text-[30px] font-black leading-[0.95] text-white">
          {content.philosophy.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </h3>
 
        {/* cutout interlocks with the philosophy above it — no gap, no divider */}
        <div className="-mt-2 h-[36%] w-full flex-shrink-0">
          <Cutout
            image={founder.image}
            name={founder.name}
            position={content.portraitPosition}
            scale={content.portraitScale}
          />
        </div>
 
        <p className="-mt-1 max-w-[220px] text-[14px] font-medium italic leading-6 text-white/80">
          "{content.quote}"
        </p>
 
        <p className="mt-4 text-[11px] font-medium text-white/40">
          {founder.name}
          <span className="mx-1.5">—</span>
          {founder.role}
        </p>
 
        <div className="mt-3">
          <Descriptors items={content.descriptors} />
        </div>
 
        <div className="mt-auto w-full pt-6">
          <CtaRow
            cta={content.cta}
            socials={content.socials}
            founderName={founder.name}
          />
        </div>
      </div>
    </div>
  );
}
 
export function FounderCard({ founder }: FounderCardProps) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const [flipped, setFlipped] = useState(false);
 
  const content = founderContent[founder.name] ?? fallbackContent;
 
  const handleMove = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 14);
    rotateX.set((0.5 - py) * 14);
  };
 
  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };
 
  return (
    <motion.div
      style={{ perspective: 1800 }}
      className="group h-full"
      onMouseMove={handleMove}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => {
        reset();
        setFlipped(false);
      }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full w-full"
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          style={{ transformStyle: "preserve-3d", transformOrigin: "center center" }}
          className="relative aspect-[3/4.7] h-full w-full"
        >
          {/* FRONT — unchanged */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(0deg)",
            }}
            className="absolute inset-0 z-10 overflow-hidden rounded-md border border-white/10 bg-[#0b0b0b]"
          >
            <div className="relative h-full">
              {founder.image ? (
                <Image
                  src={founder.image}
                  alt={founder.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-neutral-900" />
              )}
 
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
 
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
                  Founder
                </p>
                <h3 className="mt-2 text-[24px] font-black uppercase leading-none">
                  {founder.name}
                </h3>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-white/60">
                  {founder.role}
                </p>
 
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-black text-white">5+</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Years</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white">1500+</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">Projects</p>
                  </div>
                </div>
 
                <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
                    Hover
                  </span>
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </div>
              </div>
            </div>
          </div>
 
          {/* BACK — one editorial poster composition, cutout on black */}
          <div
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              ["--accent" as string]: content.accent,
            }}
            className="absolute inset-0 z-10 overflow-hidden rounded-md bg-black"
          >
            <BackFaceContent founder={founder} content={content} />
            <Grain />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
 





