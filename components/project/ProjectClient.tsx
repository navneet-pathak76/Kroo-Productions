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
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Maximize, Play } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useDeviceCapability } from "@/hooks/use-device-capability";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";
import { useLenis } from "@/hooks/use-lenis";
import { useMagnetic } from "@/hooks/use-magnetic";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Shared plain, serializable data shape                              */
/* ------------------------------------------------------------------ */

/**
 * The ONLY shape ProjectContentPage (the Server Component) ever passes
 * into ProjectGallery below. Plain strings/numbers/string arrays — no
 * icons, no JSX, no functions.
 */
export type ProjectVideo = {
  id: number;
  title: string;
  thumbnail?: string;
  video?: string;
  mediaType: "image" | "video";
  duration: string;
  category: string;
  client: string;
  services: string[];
  description?: string;
};

/* ------------------------------------------------------------------ */
/*  ProjectPageEffects — page-wide DOM effects, renders nothing        */
/* ------------------------------------------------------------------ */

/**
 * Mounts Lenis smooth scroll, GSAP `[data-reveal]` scroll animations, and
 * magnetic buttons. These touch `window`/DOM so they must run client-side.
 * They operate globally on the DOM, so it's fine that the elements they
 * animate are rendered by the Server Component tree above — by the time
 * this mounts, those elements already exist in the page.
 */
export function ProjectPageEffects() {
  useLenis();
  useGsapReveal();
  useMagnetic();
  return null;
}

/* ------------------------------------------------------------------ */
/*  ProjectHero — scroll parallax + entrance animation                 */
/* ------------------------------------------------------------------ */

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

export type ProjectHeroProps = {
  title: string;
  description: string;
  thumbnail: string;
  alt: string;
  label: string;
  visualTitle: string;
  featuredButtonLabel?: string;
  /** Pre-rendered on the server as `<config.hero.icon size={27} />`. */
  heroIcon: ReactNode;
  /** Pre-rendered on the server as `<config.hero.accentIcon size={32} />`. */
  accentIcon: ReactNode;
};

export function ProjectHero({
  title,
  description,
  thumbnail,
  alt,
  label,
  visualTitle,
  featuredButtonLabel,
  heroIcon,
  accentIcon,
}: ProjectHeroProps) {
  const capability = useDeviceCapability();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 82]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.965]);
  const reduceEffects =
    capability.reducedMotion ||
    capability.performanceTier === "LOW" ||
    capability.saveData;

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
          style={{ y: reduceEffects ? 0 : y, scale: reduceEffects ? 1 : scale }}
        >
          <motion.p
            variants={fadeUp}
            className="mb-5 text-xs font-black uppercase tracking-[0.48em] text-primary sm:text-sm"
          >
            Project showcase
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="headline text-balance">
            {title}
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-6 max-w-3xl text-base leading-7 text-white/70 sm:text-lg lg:mt-8 lg:text-xl lg:leading-8"
          >
            {description}
          </motion.p>
          <motion.div
            variants={fadeUp}
            custom={3}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button size="lg" asChild>
              <a href="#work">
                <Play size={18} fill="currentColor" />
                {featuredButtonLabel ?? "Featured videos"}
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
            animate={reduceEffects ? { y: 0 } : { y: [0, -12, 0] }}
            transition={reduceEffects ? { duration: 0 } : { duration: 5.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-black">
              <Image
                src={thumbnail}
                alt={alt}
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
                  {heroIcon}
                </div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
                  {label}
                </p>
                <h2 className="mt-3 text-4xl font-black uppercase leading-none text-white sm:text-5xl">
                  {visualTitle}
                </h2>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="absolute -right-5 top-10 hidden h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-black/55 text-primary shadow-glow backdrop-blur-2xl sm:flex"
            animate={reduceEffects ? { rotate: 0 } : { rotate: 360 }}
            transition={reduceEffects ? { duration: 0 } : { duration: 18, repeat: Infinity, ease: "linear" }}
          >
            {accentIcon}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  ProjectGallery — all video/image gallery interactivity             */
/* ------------------------------------------------------------------ */

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
const RISE_SCALE = 1.85; // how much bigger than the resting cell, before clamping
const MAX_HEIGHT_MULTIPLIER = 1.6; // hard cap — can never reach the heading
const MAX_WIDTH_MULTIPLIER = 1.5; // hard cap — can't swallow two neighbour columns

function KrooWatermark() {
  const krooRef = useRef<HTMLSpanElement>(null);
  const prodRef = useRef<HTMLSpanElement>(null);
  const [scaleX, setScaleX] = useState(1);

  useEffect(() => {
    const krooEl = krooRef.current;
    const prodEl = prodRef.current;
    if (!krooEl || !prodEl) return;

    const measure = () => {
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
  previewing?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [restingSize, setRestingSize] = useState({ width: 0, height: 0 });
  const [nativeAspect, setNativeAspect] = useState<number | null>(null);

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

  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el) {
      el.muted = true;
      el.defaultMuted = true;
    }
  }, []);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (active) {
      video.muted = false;
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    } else if (previewing) {
      video.muted = true;
      const playPromise = video.play();
      if (playPromise) playPromise.catch(() => {});
    } else {
      video.pause();
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

  const handleFullscreen = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      // Stop this from bubbling up to the card's own click/toggle handler.
      event.stopPropagation();
      event.preventDefault();

      const video = videoRef.current;
      if (!video) return;

      type FullscreenableVideo = HTMLVideoElement & {
        webkitEnterFullscreen?: () => void;
        webkitRequestFullscreen?: () => Promise<void> | void;
        webkitSupportsFullscreen?: boolean;
        mozRequestFullScreen?: () => Promise<void> | void;
        msRequestFullscreen?: () => Promise<void> | void;
      };
      const el = video as FullscreenableVideo;

      try {
        if (video.requestFullscreen) {
          // Standard Fullscreen API — Chrome/Firefox/desktop Safari, Android Chrome.
          await video.requestFullscreen();
        } else if (el.webkitEnterFullscreen) {
          // iOS Safari only exposes fullscreen on the <video> element itself,
          // via the native player rather than the Fullscreen API.
          el.webkitEnterFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
          await el.mozRequestFullScreen();
        } else if (el.msRequestFullscreen) {
          await el.msRequestFullscreen();
        }
      } catch {
        // Fullscreen can be rejected (e.g. missing user-activation edge cases);
        // fail silently and leave inline playback as-is.
      }

      // A user explicitly requesting fullscreen wants to actually watch/hear
      // it — unmute (this is a direct user gesture, so browsers allow it)
      // and make sure playback keeps going once fullscreen opens.
      video.muted = false;
      const playAttempt = video.play();
      if (playAttempt) {
        playAttempt.catch(() => {
          // Autoplay-with-sound can still be blocked in edge cases; fall
          // back to muted playback rather than leaving the video paused.
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    },
    []
  );

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
              // While the browser has this exact <video> fullscreened, always
              // letterbox/pillarbox instead of cropping — regardless of the
              // card's own active/resting object-fit.
              "[&:fullscreen]:object-contain [&:fullscreen]:!h-full [&:fullscreen]:!w-full",
              "[&:-webkit-full-screen]:object-contain [&:-webkit-full-screen]:!h-full [&:-webkit-full-screen]:!w-full",
              active ? "object-contain" : "object-cover"
            )}
          />
        )}
        <KrooWatermark />
        {inView && (
          <button
            type="button"
            onClick={handleFullscreen}
            onPointerDown={(event) => event.stopPropagation()}
            aria-label="Watch fullscreen"
            className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white/85 backdrop-blur-md transition duration-200 hover:border-primary hover:bg-black/75 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <Maximize size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function ImageThumbnail({ src, active }: { src: string; active: boolean }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "400px",
  });
  const [errored, setErrored] = useState(false);

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
        {inView && !errored && (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            loading="lazy"
            sizes="(max-width:768px) 100vw, 33vw"
            className={active ? "object-contain" : "object-cover"}
            onError={() => setErrored(true)}
          />
        )}
        {inView && errored && (
          <div className="flex h-full w-full items-center justify-center bg-white/[0.03] text-xs text-white/30">
            Image unavailable
          </div>
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
}: {
  video: ProjectVideo;
  isActive: boolean;
  onToggle: () => void;
}) {
  const cellRef = useRef<HTMLDivElement>(null);

  const [isPreviewing, setIsPreviewing] = useState(false);
  const previewIntent = useHoverIntent(() => setIsPreviewing(true), 150);

  useEffect(() => {
    if (!isActive) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (cellRef.current && !cellRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isActive, onToggle]);

  useEffect(() => {
    if (isActive) {
      previewIntent.cancel();
      setIsPreviewing(false);
    }
  }, [isActive, previewIntent]);

  const handlePointerEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || isActive) return;
    previewIntent.start();
  };

  const handlePointerLeave = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    previewIntent.cancel();
    setIsPreviewing(false);
  };

  return (
    <div
      ref={cellRef}
      className="relative aspect-[4/3] w-full overflow-visible"
      style={{ zIndex: isActive ? 40 : 0 }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle();
          }
        }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        aria-pressed={isActive}
        aria-label={`Play preview for ${video.title}`}
        className="absolute inset-0 h-full w-full cursor-pointer overflow-visible rounded-[14px] p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        {video.mediaType === "image" ? (
          <ImageThumbnail src={video.thumbnail!} active={isActive} />
        ) : (
          <VideoThumbnail
            src={video.video!}
            active={isActive}
            previewing={isPreviewing}
          />
        )}
      </div>
    </div>
  );
}

/**
 * The only thing in this file's tree that ProjectContentPage feeds with
 * data (as opposed to pre-rendered elements): a plain `ProjectVideo[]`.
 */
export function ProjectGallery({ videos }: { videos: ProjectVideo[] }) {
  const [activeId, setActiveId] = useState<number | null>(null);

  if (videos.length === 0) {
    return (
      <div className="mx-auto max-w-[1480px] rounded-md border border-white/10 bg-white/[0.025] px-5 py-10 text-center text-sm leading-6 text-white/55">
        Media is not available in this environment.
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1480px] grid-cols-2 gap-3 overflow-visible sm:grid-cols-3 sm:gap-4 lg:gap-5">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          isActive={activeId === video.id}
          onToggle={() =>
            setActiveId((prev) => (prev === video.id ? null : video.id))
          }
        />
      ))}
    </div>
  );
}
