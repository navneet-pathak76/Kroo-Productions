"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useInView } from "react-intersection-observer";
import { Ambient } from "@/components/ambient";
import { CursorFollower } from "@/components/cursor-follower";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";
import { useLenis } from "@/hooks/use-lenis";
import { useMagnetic } from "@/hooks/use-magnetic";
import { services } from "@/lib/content";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Instagram,
  Linkedin,
  Play,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";


const revealEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { y: 32, opacity: 0, filter: "blur(10px)" },
  visible: (i = 0) => ({
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.08,
      duration: 0.82,
      ease: revealEase,
    },
  }),
};

export type ProjectVideo = {
  id: number;
  title: string;

  thumbnail?: string;
  video?: string;

  duration: string;
  category: string;
  client: string;
  services: string[];
  description?: string;
};
type ProjectDetail = {
  title: string;
  copy: string;
  icon: LucideIcon;
};

type ProjectInfoItem = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export type ProjectPageConfig = {
  title: string;
  description: string;
  galleryType?: "video" | "image";  
  hero: {
    thumbnail: string;
    alt: string;
    icon: LucideIcon;
    accentIcon?: LucideIcon;
    label: string;
    visualTitle: string;
  };
  info: ProjectInfoItem[];
  videos: ProjectVideo[];
  gallery: {
    title: ReactNode;
    copy: string;
  };
  about: {
    intro: string;
    details: ProjectDetail[];
    marketingGoals: ReactNode;
  };
  featuredButtonLabel?: string;
  cta?: {
    title: ReactNode;
    copy: ReactNode;
    primaryLabel: string;
  };
};

function SectionIntro({
  eyebrow,
  title,
  copy,
  titleClassName,
}: {
  eyebrow: string;
  title: ReactNode;
  copy: string;
  titleClassName?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-[1480px] px-5 sm:px-8 lg:mb-14">
      <div data-reveal className="max-w-[1100px]">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
          {eyebrow}
        </p>
        <h2 className={`section-title ${titleClassName ?? ""}`}>{title}</h2>
        <p className="mt-8 max-w-[760px] text-base leading-7 text-white/60">
          {copy}
        </p>
      </div>
    </div>
  );
}

function ProjectHero({ config }: { config: ProjectPageConfig }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 82]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.965]);
  const HeroIcon = config.hero.icon;
  const AccentIcon = config.hero.accentIcon ?? Activity;

  return (
    <section
      id="home"
      ref={ref}
      className="relative scroll-mt-28 overflow-hidden px-5 pb-16 pt-32 sm:px-8 lg:min-h-[92svh] lg:px-5 lg:pb-20 lg:pt-40"
    >
      <div className="pointer-events-none absolute right-[-16rem] top-10 h-[44rem] w-[44rem] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-72 bg-[radial-gradient(ellipse_at_72%_100%,rgba(255,77,18,0.44),transparent_64%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_68%,transparent)]" />

      <div className="mx-auto grid max-w-[1480px] gap-10 lg:min-h-[calc(92vh-10rem)] lg:grid-cols-[minmax(0,1.04fr)_minmax(320px,0.62fr)] lg:items-center">
        <motion.div
          className="relative z-10"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.075 }}
          style={{ y, scale }}
        >
          <motion.p
            variants={fadeUp}
            className="mb-5 text-xs font-black uppercase tracking-[0.48em] text-primary sm:text-sm"
          >
            Project showcase
          </motion.p>
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="headline text-balance"
          >
            {config.title}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-6 max-w-3xl text-base leading-7 text-white/70 sm:text-lg lg:mt-8 lg:text-xl lg:leading-8"
          >
            {config.description}
          </motion.p>
          <motion.div
            variants={fadeUp}
            custom={3}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button size="lg" asChild>
              <a href="#work">
                <Play size={18} fill="currentColor" />
                {config.featuredButtonLabel ?? "Featured videos"}
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#contact">
                Start a project
                <ArrowRight size={18} />
              </a>
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative z-10 mx-auto w-full max-w-[520px]"
          initial={{ opacity: 0, x: 48, filter: "blur(18px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.32, duration: 1.08, ease: revealEase }}
        >
          <motion.div
            className="cinema-panel relative overflow-hidden rounded-md p-3 shadow-2xl shadow-primary/10"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-black">
              <Image
                src={config.hero.thumbnail}
                alt={config.hero.alt}
                fill
                priority
                sizes="(max-width: 1023px) 90vw, 520px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
              <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/80 backdrop-blur-xl">
                2026
              </div>
              <div className="absolute bottom-5 left-5 right-5">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-glow-strong">
                  <HeroIcon size={27} />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
                  {config.hero.label}
                </p>
                <h2 className="mt-3 text-4xl font-black uppercase leading-none text-white sm:text-5xl">
                  {config.hero.visualTitle}
                </h2>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="absolute -right-5 top-10 hidden h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-black/55 text-primary shadow-glow backdrop-blur-2xl sm:flex"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            <AccentIcon size={32} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function ProjectInfo({ items }: { items: ProjectInfoItem[] }) {
  return (
    <section className="relative z-10 px-5 pb-14 sm:px-8 lg:pb-20">
      <div className="absolute left-1/2 top-1/2 -z-20 h-[420px] w-[1300px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(255,90,0,0.18)_0%,rgba(255,90,0,0.07)_34%,transparent_72%)] blur-[120px] opacity-80" />
      <div className="cinema-panel mx-auto grid max-w-[1480px] gap-4 overflow-hidden rounded-[28px] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45),0_0_80px_rgba(255,77,18,0.08)] sm:p-5 md:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              data-reveal
              className="group min-w-0 rounded-xl border border-white/10 bg-white/[0.025] p-5 transition duration-500 hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow"
            >
              <Icon
                className="mb-6 text-white/55 transition duration-300 group-hover:text-primary"
                size={24}
              />
              <p className="mb-3 text-[0.68rem] font-black uppercase tracking-[0.24em] text-primary">
                {item.label}
              </p>
              <p className="text-sm font-black uppercase leading-6 tracking-[0.1em] text-white sm:text-base">
                {item.value}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}



function useHoverIntent(onTrigger: () => void, delay = 150) {
  const onTriggerRef = useRef(onTrigger);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onTriggerRef.current = onTrigger;
  }, [onTrigger]);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    cancel();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onTriggerRef.current();
    }, delay);
  }, [cancel, delay]);

  useEffect(() => cancel, [cancel]);

  return { start, cancel };
}

const PREVIEW_EASE = "cubic-bezier(.22,.61,.36,1)";
const RISE_SCALE = 1.85;          // how much bigger than the resting cell, before clamping
const MAX_HEIGHT_MULTIPLIER = 1.6; // hard cap — can never reach the heading
const MAX_WIDTH_MULTIPLIER = 1.5;  // hard cap — can't swallow two neighbour columns

function KrooWatermark() {
  const krooRef = useRef<HTMLSpanElement>(null);
  const prodRef = useRef<HTMLSpanElement>(null);
  const [scaleX, setScaleX] = useState(1);

  useEffect(() => {
    const krooEl = krooRef.current;
    const prodEl = prodRef.current;
    if (!krooEl || !prodEl) return;

    const measure = () => {
      // offsetWidth ignores CSS transforms, so this stays accurate
      // even after scaleX has already been applied on a previous run.
      const krooWidth = krooEl.offsetWidth;
      const prodWidth = prodEl.offsetWidth;
      if (krooWidth > 0 && prodWidth > 0) {
        setScaleX(krooWidth / prodWidth);
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(krooEl);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex select-none flex-col items-center gap-1 pt-3">
      <span
        ref={krooRef}
        className="text-[13px] font-black uppercase leading-none tracking-[0.08em] text-white opacity-20"
      >
        KROO
      </span>
      <span
        ref={prodRef}
        className="whitespace-nowrap text-[8px] font-bold uppercase leading-none tracking-[0.5em] text-white opacity-20"
        style={{ transform: `scaleX(${scaleX})`, transformOrigin: "center top" }}
      >
        PRODUCTION
      </span>
    </div>
  );
}

function VideoThumbnail({
  src,
  active,
  previewing = false,
}: {
  src: string;
  active: boolean;
  /** Silent hover preview — distinct from `active`, which is the clicked-open player with audio. */
  previewing?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [restingSize, setRestingSize] = useState({ width: 0, height: 0 });
  const [nativeAspect, setNativeAspect] = useState<number | null>(null); // width / height

  // Only mount the actual <video> element once the card is near the
  // viewport. Without this, every video on the page (e.g. all 16 on the
  // Gym gallery) starts fetching metadata simultaneously on mount, which is
  // what causes the page to feel like it's lagging/not loading — unlike
  // ImageThumbnail, which already gates on inView below.
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    rootMargin: "400px",
  });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        setRestingSize({ width: rect.width, height: rect.width * 0.75 });
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The <video> element intentionally has NO `muted` attribute in the JSX below.
  // If it did, React would re-apply `muted={true}` on every re-render this
  // component gets (e.g. the ResizeObserver-driven `restingSize` updates above),
  // stomping over any imperative `video.muted = false` we set for the active/audio
  // player. Muting is fully owned here, imperatively, so it survives re-renders.
  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el) {
      // Start silent by default so the browser's autoplay policy allows the
      // hover preview to play without a user gesture.
      el.muted = true;
      el.defaultMuted = true;
    }
  }, []);

  // useLayoutEffect (not useEffect) runs synchronously right after the DOM
  // commit, which keeps play() as close as possible to the click that
  // triggered `active` — important for browsers that only allow unmuted
  // autoplay when it's tied to a user gesture.
  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (active) {
      // Clicked open: play WITH audio.
      video.muted = false;
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Some browsers refuse unmuted autoplay here; fall back to silent
          // playback rather than leaving the player frozen.
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    } else if (previewing) {
      // Hover preview: always silent, never touches the active/audio path.
      video.muted = true;
      const playPromise = video.play();
      if (playPromise) playPromise.catch(() => {});
    } else {
      video.pause();
      // Reset to the silent baseline for the next preview/open — this only
      // affects this video's own future playback, it doesn't "leak" mute
      // state to any other card.
      video.muted = true;
      if (Math.abs(video.currentTime - 0.1) > 0.05) {
        video.currentTime = 0.1;
      }
    }
  }, [active, previewing]);

  const handleLoadedMetadata = (
    event: React.SyntheticEvent<HTMLVideoElement>
  ) => {
    const video = event.currentTarget;
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      setNativeAspect(video.videoWidth / video.videoHeight);
    }
    if (video.currentTime === 0) video.currentTime = 0.1;
  };

  let expandedWidth = restingSize.width;
  let expandedHeight = restingSize.height;

  if (nativeAspect && restingSize.width > 0) {
    const maxHeight = restingSize.height * MAX_HEIGHT_MULTIPLIER;
    const maxWidth = restingSize.width * MAX_WIDTH_MULTIPLIER;

    if (nativeAspect < 1) {
      expandedHeight = Math.min(restingSize.height * RISE_SCALE, maxHeight);
      expandedWidth = expandedHeight * nativeAspect;
      if (expandedWidth > maxWidth) {
        expandedWidth = maxWidth;
        expandedHeight = expandedWidth / nativeAspect;
      }
    } else {
      expandedWidth = Math.min(restingSize.width * RISE_SCALE, maxWidth);
      expandedHeight = expandedWidth / nativeAspect;
      if (expandedHeight > maxHeight) {
        expandedHeight = maxHeight;
        expandedWidth = expandedHeight * nativeAspect;
      }
    }
  }

  const width = active ? expandedWidth : restingSize.width;
  const height = active ? expandedHeight : restingSize.height;

  return (
    <div
      ref={(el) => {
        wrapRef.current = el;
        inViewRef(el);
      }}
      className="absolute inset-0"
    >
      <div
        className="absolute bottom-0 left-1/2 overflow-hidden rounded-[14px] bg-black"
        style={{
          width: width > 0 ? width : "100%",
          height: height > 0 ? height : "100%",
          transform: "translateX(-50%)",
          boxShadow: active ? "0 24px 60px rgba(0,0,0,0.4)" : "0 0 0 rgba(0,0,0,0)",
          transition: `width 320ms ${PREVIEW_EASE}, height 320ms ${PREVIEW_EASE}, box-shadow 320ms ${PREVIEW_EASE}`,
        }}
      >
        {inView && (
          <video
            ref={setVideoRef}
            src={src}
            loop
            playsInline
            preload="metadata"
            aria-hidden
            tabIndex={-1}
            onLoadedMetadata={handleLoadedMetadata}
            className={cn(
              "absolute inset-0 h-full w-full rounded-[14px]",
              active ? "object-contain" : "object-cover"
            )}
          />
        )}
        <KrooWatermark />
      </div>
    </div>
  );
}
function ImageThumbnail({
  src,
  active,
}: {
  src: string;
  active: boolean;
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "400px",
  });

  return (
    <div ref={ref} className="absolute inset-0">
      <div
        className="absolute bottom-0 left-1/2 overflow-hidden rounded-[14px] bg-black"
        style={{
          width: active ? "110%" : "100%",
          height: active ? "110%" : "100%",
          transform: "translateX(-50%)",
          transition: "all 320ms ease",
        }}
      >
        {inView && (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            loading="lazy"
            sizes="(max-width:768px) 100vw, 33vw"
            className={active ? "object-contain" : "object-cover"}
          />
        )}

        <KrooWatermark />
      </div>
    </div>
  );
}
function VideoCard({
  video,
  isActive,
  onToggle,
  galleryType,
}: {
  video: ProjectVideo;
  isActive: boolean;
  onToggle: () => void;
  galleryType: "video" | "image";
}) {
  const cellRef = useRef<HTMLDivElement>(null);

  // Hover-preview state is fully separate from `isActive` (the clicked-open,
  // audio-playing state). Only desktop mouse hover should start it — touch
  // input on mobile is filtered out below so tapping always goes straight to
  // the click/open behavior instead of triggering a preview first.
  const [isPreviewing, setIsPreviewing] = useState(false);
  const previewIntent = useHoverIntent(() => setIsPreviewing(true), 150);

  useEffect(() => {
    if (!isActive) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (cellRef.current && !cellRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isActive, onToggle]);

  // Once a card is opened (active), it owns playback with audio — the silent
  // hover preview should not keep running underneath it.
  useEffect(() => {
    if (isActive) {
      previewIntent.cancel();
      setIsPreviewing(false);
    }
  }, [isActive, previewIntent]);

  const handlePointerEnter = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "mouse" || isActive) return;
    previewIntent.start();
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "mouse") return;
    previewIntent.cancel();
    // Leaving the preview only stops *this* card's silent playback — it does
    // not touch `muted` on any other video, and does not affect the active
    // player's audio if one is open elsewhere.
    setIsPreviewing(false);
  };

  return (
    <div
      ref={cellRef}
      className="relative aspect-[4/3] w-full overflow-visible"
      style={{ zIndex: isActive ? 40 : 0 }}
    >
      <button
        type="button"
        onClick={onToggle}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        aria-pressed={isActive}
        aria-label={`Play preview for ${video.title}`}
        className="absolute inset-0 h-full w-full cursor-pointer overflow-visible rounded-[14px] p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        {galleryType === "image" ? (
          <ImageThumbnail src={video.thumbnail!} active={isActive} />
        ) : (
          <VideoThumbnail
            src={video.video!}
            active={isActive}
            previewing={isPreviewing}
          />
        )}
      </button>
    </div>
  );
}

function VideoGallery({ config }: { config: ProjectPageConfig }) {
  const [activeId, setActiveId] = useState<number | null>(null);

  return (
    <section id="work" className="relative scroll-mt-28 overflow-visible px-2 py-16 sm:px-8 lg:py-20">
      <SectionIntro
        eyebrow="Featured Videos"
        title={config.gallery.title}
        titleClassName="max-w-[1100px] text-[clamp(2.4rem,3.6vw,4.2rem)] leading-[0.92]"
        copy={config.gallery.copy}
      />
      <div className="mx-auto grid max-w-[1480px] grid-cols-2 gap-3 overflow-visible sm:grid-cols-3 sm:gap-4 lg:gap-5">
        {config.videos.map((video) => (
<VideoCard
  key={video.id}
  video={video}
  galleryType={config.galleryType ?? "video"}
  isActive={activeId === video.id}
  onToggle={() =>
    setActiveId((prev) => (prev === video.id ? null : video.id))
  }
/>
        ))}
      </div>
    </section>
  );
}
function AboutProject({ about }: { about: ProjectPageConfig["about"] }) {
  return (
    <section id="about" className="relative scroll-mt-28 px-5 py-16 sm:px-8 lg:py-24">
      <div className="pointer-events-none absolute left-0 top-0 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-[120px]" />
      <div className="mx-auto max-w-[1480px]">
        <div data-reveal className="max-w-[1660px]">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
            About the project
          </p>
          <h2 className="text-[clamp(3.6rem,4.8vw,5rem)] font-black uppercase leading-[0.92] tracking-tight">
            About This Production
          </h2>
          <p className="mt-7 max-w-[700px] text-base leading-7 text-white/60">
            {about.intro}
          </p>
        </div>

        <div className="mt-14 border-t border-white/10 pt-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {about.details.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="mt-20 border-t border-white/10 pt-16">
                  <article
                    data-reveal
                    className="cinema-panel flex min-h-[300px] flex-col rounded-md p-8"
                  >
                    <Icon
                      className="mb-8 text-white/55 transition duration-300 group-hover:text-primary"
                      size={34}
                    />
                    <h3 className="text-3xl font-black uppercase leading-none">
                      {item.title}
                    </h3>
                    <p className="mt-auto pt-6 text-base leading-7 text-white/62">
                      {item.copy}
                    </p>
                  </article>
                </div>
              );
            })}

            <article data-reveal className="cinema-panel rounded-md p-10 py-7 lg:col-span-3">
              <p className="mb-5 text-xs font-black uppercase tracking-[0.28em] text-primary">
                Marketing goals
              </p>
              <p className="max-w-full text-[clamp(1.9rem,2.6vw,2.8rem)] font-black leading-[1.12] tracking-tight text-white">
                {about.marketingGoals}
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectCTA({ cta }: { cta?: ProjectPageConfig["cta"] }) {
  const content = cta ?? {
    title: "Ready To Build Your Brand?",
    copy: "Let's create cinematic content that makes your business impossible to ignore.",
    primaryLabel: "Start a Project",
  };

  return (
    <section id="contact" className="relative scroll-mt-28 overflow-hidden px-5 py-20 sm:px-8 lg:py-28">
      <div className="absolute inset-x-0 bottom-0 h-80 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,77,18,0.3),transparent_66%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:linear-gradient(to_bottom,transparent,black_28%,black_74%,transparent)]" />
      <div data-reveal className="relative mx-auto max-w-[1320px] border-y border-white/10 py-16 text-center">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
          Start project
        </p>
        <h2 className="section-title max-w-none whitespace-nowrap">{content.title}</h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/64 sm:text-lg">
          {content.copy}
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <a href="mailto:team@krooproduction.com">
              {content.primaryLabel}
              <ArrowUpRight size={17} />
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="tel:+916291252126">Book a Discovery Call</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ProjectFooter() {
  return (
    <footer className="relative border-t border-white/10 px-5 py-10 sm:px-8">
      <div className="mx-auto grid max-w-[1480px] gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="text-4xl font-black text-primary">K</span>
            <span className="text-lg font-black uppercase tracking-[0.12em]">Kroo</span>
          </div>
          <p className="max-w-xs text-sm leading-6 text-white/50">
            Cinematic storytelling through powerful visuals and purposeful execution.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white">Quick links</h3>
          {["Home", "Work", "Team", "Services", "About", "Contact"].map((item) => (
            <Link
              key={item}
              href={`/#${item.toLowerCase()}`}
              className="block rounded-sm py-1 text-sm text-white/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
            >
              {item}
            </Link>
          ))}
        </div>
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white">Services</h3>
          {services.map((service) => (
            <Link
              key={service.title}
              href="/#services"
              className="block rounded-sm py-1 text-sm text-white/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
            >
              {service.title}
            </Link>
          ))}
        </div>
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white">Follow us</h3>
          <div className="flex gap-3">
            {[Instagram, Youtube, Linkedin].map((Icon, index) => (
              <a
                key={index}
                href="#"
                aria-label="Social link"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
          <p className="mt-6 text-sm text-white/40">&copy; 2026 Kroo Production. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function ProjectContentPage({ config }: { config: ProjectPageConfig }) {
  useLenis();
  useGsapReveal();
  useMagnetic();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020202] text-white">
      <Ambient />
      <CursorFollower />
      <SiteNav />
      <div className="relative z-10">
        <ProjectHero config={config} />
        <ProjectInfo items={config.info} />
        <VideoGallery config={config} />
        <AboutProject about={config.about} />
        <ProjectCTA cta={config.cta} />
        <ProjectFooter />
      </div>
    </main>
  );
}