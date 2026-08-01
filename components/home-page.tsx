"use client";
import { FounderCard } from "@/components/founder-card";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Play,
  Quote,
  Youtube,
} from "lucide-react";
import { Ambient } from "@/components/ambient";
import { CursorFollower } from "@/components/cursor-follower";
import { Loader } from "@/components/loader";
import { KrooMark } from "@/components/scene/kroo-mark";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  animate,
  type MotionValue,
} from "framer-motion";
import {
  brandMarks,
  capabilities,
  founders,
  projects,
  services,
  stats,
  testimonials,
} from "@/lib/content";
import { cn } from "@/lib/utils";
import { useGsapReveal } from "@/hooks/use-gsap-reveal";
import { useLenis } from "@/hooks/use-lenis";
import { useMagnetic } from "@/hooks/use-magnetic";

const revealEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { y: 32, opacity: 0, filter: "blur(10px)" },
  visible: (i = 0) => ({
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.075,
      duration: 0.82,
      ease: revealEase,
    },
  }),
};
/* ============================================================
   SPATIAL CARD STACK — CONFIGURATION
   All geometry, camera, and stage values live here. Nothing in
   SpatialCard/SpatialCardStack computes slot numbers inline —
   everything reads from these tables. Values below are chosen
   to reproduce the CURRENT visual output exactly (same numbers
   as the old magnitude-based formula), just centralized instead
   of computed inline, so they're editable without touching logic.
   ============================================================ */

type SlotOffset = -3 | -2 | -1 | 0 | 1 | 2 | 3;
type SlotMagnitude = 0 | 1 | 2 | 3;

interface SlotConfigEntry {
  /** x/z/rotateY are expressed as a MULTIPLE of `spread` (unitless),
   *  so they still scale responsively with viewport width. */
  xFactor: number;
  zFactor: number;
  rotateYDeg: number; // base angle in degrees, before the spread-based angleMult
  scale: number;
  opacity: number;
  blurPx: number;
  zIndex: number;
}

/**
 * One entry per unsigned distance from the active card (0..3).
 * This is the single source of truth for slot geometry. To change
 * how far/deep/rotated/faded a slot is, edit ONLY this table —
 * nothing else in the component computes these numbers.
 */
/**
 * Geometry is derived from a circular orbit (x = R·sinθ, z = -Rz·(1-cosθ))
 * with the per-slot angle θ increasing by a SHRINKING step (22°, 16°, 12°)
 * as slots get further out — the same way points spaced along a circle's
 * arc foreshorten toward the silhouette. That's what keeps x/z/rotation
 * increasing smoothly with no abrupt jump between any two slots, keeps
 * the far cards from going edge-on/thin, and makes the whole stack read
 * as one continuous curved orbit instead of a flat fan that stretches.
 * Scale and opacity taper on their own gentle, evenly-stepped curves so
 * every slot — including ±3 — stays clearly readable.
 */
const SLOT_CONFIG = {
  0: {
    xFactor: 0,
    zFactor: 0,
    rotateYDeg: 0,
    scale: 1,
    opacity: 1,
    blurPx: 0,
    zIndex: 100,
  },

  1: {
    xFactor: 0.75, // R·sin(22°), R = 2
    zFactor: -0.11, // -Rz·(1-cos22°), Rz = 1.5
    rotateYDeg: 22,
    scale: 0.93,
    opacity: 0.86,
    blurPx: 0,
    zIndex: 90,
  },

  2: {
    xFactor: 1.23, // R·sin(38°)
    zFactor: -0.32, // -Rz·(1-cos38°)
    rotateYDeg: 38,
    scale: 0.86,
    opacity: 0.68,
    blurPx: 0,
    zIndex: 80,
  },

  3: {
    xFactor: 1.53, // R·sin(50°)
    zFactor: -0.54, // -Rz·(1-cos50°)
    rotateYDeg: 50,
    scale: 0.79,
    opacity: 0.5,
    blurPx: 0,
    zIndex: 70,
  },
};

/** Cards beyond this magnitude are not rendered at all. */
const MAX_VISIBLE_OFFSET = 3;

/** Far-edge cards (magnitude === MAX_VISIBLE_OFFSET) get an extra opacity cap
 *  so they don't pop in too strongly right at the edge of visibility. Set
 *  just above SLOT_CONFIG[3].opacity so it's a safety ceiling, not a second
 *  dimming pass stacked on top of an already-tapered value. */
const FAR_EDGE_OPACITY_CAP = 0.5;

const CAROUSEL_CONFIG = {
  autoplayMs: 5000,
  inactivityResumeMs: 3200,
  velocityThreshold: 350,
  spring: { stiffness: 220, damping: 30, mass: 0.9 },
  reducedMotionSpring: { stiffness: 400, damping: 40 },
  dragSpring: { stiffness: 800, damping: 50, mass: 0.5 },
};
const SPREAD_CONFIG = {
  ratio: 0.17,
  min: 170,
  max: 360,
  base: 220,
};

function computeSpread(viewportWidth: number): number {
  return Math.max(
    SPREAD_CONFIG.min,
    Math.min(SPREAD_CONFIG.max, viewportWidth * SPREAD_CONFIG.ratio),
  );
}

const CAMERA_CONFIG = {
  /** Perspective (camera distance) expressed as a multiple of spread.
   *  NOTE: this used to be defined here but the render code below
   *  ignored it and hardcoded `spread * 5` — a camera far too close
   *  for the geometry, which is what made the far cards distort so
   *  hard. Now actually wired through, and retuned (13x, vs the old
   *  broken 5x / the old comment's stale 21x) to match the new,
   *  more compact SLOT_CONFIG: enough distance for a flat, premium
   *  falloff without the outer cards collapsing into slivers. */
  perspectiveFactor: 13,
  perspectiveOrigin: "50% 50%",
};

const STAGE_CONFIG = {
  maxWidthClassName: "max-w-[1800px] mx-auto",
  heightClassName: "h-[720px]",
  overflowClassName: "overflow-visible",
};

interface SlotStyle {
  x: number;
  z: number;
  rotateY: number;
  scale: number;
  opacity: number;
  blur: number;
  zIndex: number;
}

/**
 * Derives a slot's full style from SLOT_CONFIG. Sign is applied ONLY to
 * x and rotateY (the two properties that differ between left/right);
 * z/scale/opacity/blur/zIndex come straight from the magnitude entry,
 * so slot(-n) and slot(+n) are guaranteed identical apart from sign —
 * there is no way to edit one side without editing both, by construction.
 */
function getSlotStyle(offset: SlotOffset, spread: number): SlotStyle {
  const magnitude = Math.abs(offset) as SlotMagnitude;
  const sign = Math.sign(offset);
  const entry = SLOT_CONFIG[magnitude];

  const angleMult = 0.75 + 0.25 * (spread / SPREAD_CONFIG.base);

  return {
    x: sign * entry.xFactor * spread,
    z: entry.zFactor * spread,
    rotateY: sign * entry.rotateYDeg * angleMult,
    scale: entry.scale,
    opacity: entry.opacity,
    blur: entry.blurPx,
    zIndex: entry.zIndex,
  };
}

function normalizeOffset(rawOffset: number, total: number): number {
  let o = rawOffset % total;
  if (o > total / 2) o -= total;
  if (o < -total / 2) o += total;
  return o;
}

interface SpatialCardStackProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => ReactNode;
  getKey: (item: T, index: number) => string;
  className?: string;
  cardWidthClassName?: string;
}

function SpatialCardStack<T>({
  items,
  renderCard,
  getKey,
  className,
  cardWidthClassName = "w-[min(82vw,700px)]",
}: SpatialCardStackProps<T>) {
  const total = items.length;
  const [active, setActive] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [spread, setSpread] = useState<number>(() =>
    typeof window === "undefined" ? SPREAD_CONFIG.base : computeSpread(window.innerWidth),
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayTimer = useRef<number | null>(null);
  const inactivityTimer = useRef<number | null>(null);
  const reducedMotionRef = useRef(reducedMotion);
  const spreadRef = useRef(spread);
  reducedMotionRef.current = reducedMotion;
  spreadRef.current = spread;

  const wheelCooldown = useRef(false);
  const wheelAccum = useRef(0);

  const dragStartX = useRef(0);
  const dragLastX = useRef(0);
  const dragLastT = useRef(0);
  const dragVelocity = useRef(0);
  const isDragging = useRef(false);

  /**
   * SINGLE SOURCE OF TRUTH.
   * carouselOffset = signed, continuous, fractional distance (in
   * card-widths) between the active card and where the carousel is
   * currently rendered. It is the ONLY motion value that ever moves
   * a card horizontally at runtime. Card drag, timeline drag, wheel,
   * keyboard, autoplay, and goTo() ALL funnel through this one value
   * (either by writing to it directly during a continuous gesture, or
   * by leaving it at 0 and changing `active` for a discrete jump).
   * There is no second/parallel position state anywhere else.
   */
  const carouselOffset = useMotionValue(0);
  const carouselOffsetSpring = useSpring(carouselOffset, CAROUSEL_CONFIG.dragSpring);

  const parallaxX = useMotionValue(0);
  const parallaxY = useMotionValue(0);
  useSpring(parallaxY, { stiffness: 60, damping: 18, mass: 0.6 });
  useSpring(parallaxX, { stiffness: 60, damping: 18, mass: 0.6 });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setSpread(computeSpread(window.innerWidth)));
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const advance = useCallback(
    (direction: 1 | -1) => {
      if (isAnimating || total === 0) return;
      setIsAnimating(true);
      setActive((prev) => (prev + direction + total) % total);
      window.setTimeout(() => setIsAnimating(false), 620);
    },
    [isAnimating, total],
  );

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      const next = ((index % total) + total) % total;
      setIsAnimating(true);
      setActive(next);
      window.setTimeout(() => setIsAnimating(false), 620);
    },
    [total],
  );

  const pauseAutoplay = useCallback(() => {
    if (autoplayTimer.current) {
      window.clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }
    if (inactivityTimer.current) {
      window.clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    if (autoplayTimer.current) window.clearInterval(autoplayTimer.current);
    autoplayTimer.current = window.setInterval(() => advance(1), CAROUSEL_CONFIG.autoplayMs);
  }, [advance]);

  const scheduleResume = useCallback(
    (delay = CAROUSEL_CONFIG.inactivityResumeMs) => {
      if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
      inactivityTimer.current = window.setTimeout(() => {
        inactivityTimer.current = null;
        if (!reducedMotionRef.current) startAutoplay();
      }, delay);
    },
    [startAutoplay],
  );

  useEffect(() => {
    if (reducedMotion) return;
    startAutoplay();
    return () => {
      if (autoplayTimer.current) window.clearInterval(autoplayTimer.current);
      if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
    };
  }, [startAutoplay, reducedMotion]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelCooldown.current) return;

      const dx = e.deltaX;
      const dy = e.deltaY;
      const horizontal = e.shiftKey || Math.abs(dx) > Math.abs(dy);
      wheelAccum.current += horizontal
        ? Math.abs(dx) > Math.abs(dy)
          ? dx
          : dy
        : dy;

      const THRESHOLD = 18;
      if (Math.abs(wheelAccum.current) < THRESHOLD) return;

      const direction = wheelAccum.current > 0 ? 1 : -1;
      wheelAccum.current = 0;
      wheelCooldown.current = true;
      advance(direction);
      window.setTimeout(() => {
        wheelCooldown.current = false;
      }, 600);
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [advance]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      advance(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      advance(1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(total - 1);
    }
  };

  // ---- Card drag: writes carouselOffset in CARD-WIDTH units (not px) ----
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    pauseAutoplay();
    dragStartX.current = e.clientX;
    dragLastX.current = e.clientX;
    dragLastT.current = performance.now();
    dragVelocity.current = 0;
    carouselOffset.set(0);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const now = performance.now();
    const dt = Math.max(now - dragLastT.current, 1);
    const dx = e.clientX - dragLastX.current;
    dragVelocity.current = (dx / dt) * 1000;
    dragLastX.current = e.clientX;
    dragLastT.current = now;

    const totalDeltaPx = e.clientX - dragStartX.current;
    const spreadNow = spreadRef.current;
    const clampedPx = Math.max(
      -spreadNow * 1.5,
      Math.min(spreadNow * 1.5, totalDeltaPx * 0.8),
    );
    // Convert px -> card-width units, sign-flipped: dragging right (+px)
    // reveals the PREVIOUS card, i.e. moves the carousel backward.
    carouselOffset.set(-clampedPx / spreadNow);
  };

  const endDrag = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const velocity = dragVelocity.current;
    const currentOffset = carouselOffset.get();

    let delta = 0;
    if (Math.abs(velocity) > CAROUSEL_CONFIG.velocityThreshold) {
      delta = velocity < 0 ? 1 : -1;
    } else {
      const snapped = Math.round(currentOffset);
      if (snapped !== 0) delta = snapped;
    }

    carouselOffset.set(0);
    if (delta !== 0) setActive((prev) => (prev + delta + total) % total);
    scheduleResume();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    parallaxX.set(relX * 6);
    parallaxY.set(relY * -6);
  };

  const handleMouseEnter = () => {
    pauseAutoplay();
  };

  const handleMouseLeave = () => {
    parallaxX.set(0);
    parallaxY.set(0);
    scheduleResume(1200);
  };

  // ---- Timeline scrub: writes the SAME carouselOffset, in the SAME
  // card-width units, as card drag above. No separate pipeline. ----
  const handleTimelineScrubStart = useCallback(() => {
    pauseAutoplay();
  }, [pauseAutoplay]);

  const handleTimelineScrubMove = useCallback(
    (fractionalDeltaFromActive: number) => {
      carouselOffset.set(fractionalDeltaFromActive);
    },
    [carouselOffset],
  );

  const handleTimelineScrubEnd = useCallback(
    (fractionalDeltaFromActive: number) => {
      const nearest = Math.round(fractionalDeltaFromActive);
      carouselOffset.set(0);
      if (nearest !== 0) {
        setActive((prev) => (prev + nearest + total) % total);
      }
      scheduleResume();
    },
    [carouselOffset, total, scheduleResume],
  );

  const visibleEntries = useMemo(() => {
    const entries: { item: T; index: number; offset: number }[] = [];
    if (total === 0) return entries;

    const span = Math.min(MAX_VISIBLE_OFFSET, Math.floor((total - 1) / 2) || 0);
    for (let d = -span; d <= span; d++) {
      const index = ((active + d) % total + total) % total;
      const offset = normalizeOffset(d, total);
      entries.push({ item: items[index], index, offset });
    }
    return entries;
  }, [active, items, total]);

const perspective = spread * CAMERA_CONFIG.perspectiveFactor;

  return (
    <div className={className}>
      <div
        ref={containerRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured projects"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative mx-auto touch-pan-y select-none rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-4 focus-visible:ring-offset-black",
          STAGE_CONFIG.heightClassName,
          "w-full",
          STAGE_CONFIG.maxWidthClassName,
          STAGE_CONFIG.overflowClassName,
        )}
        style={{ perspective: `${perspective}px`, perspectiveOrigin: CAMERA_CONFIG.perspectiveOrigin }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <motion.div
          className="relative h-full w-full overflow-visible"
          style={{ transformStyle: "preserve-3d" }}
        >
          {visibleEntries.map(({ item, index, offset }) => (
            <SpatialCard
              key={getKey(item, index)}
              offset={offset}
              isActive={offset === 0}
              cardWidthClassName={cardWidthClassName}
              reducedMotion={reducedMotion}
              carouselOffsetSpring={carouselOffsetSpring}
              spread={spread}
            >
              {renderCard(item, index)}
            </SpatialCard>
          ))}
        </motion.div>
      </div>

      <CarouselTimeline
        total={total}
        active={active}
        reducedMotion={reducedMotion}
        onSelect={goTo}
        onScrubStart={handleTimelineScrubStart}
        onScrubMove={handleTimelineScrubMove}
        onScrubEnd={handleTimelineScrubEnd}
        sharedOffset={carouselOffsetSpring}
      />
    </div>
  );
}

function SpatialCard({
  offset,
  isActive,
  children,
  cardWidthClassName,
  reducedMotion,
  carouselOffsetSpring,
  spread,
}: {
  offset: number;
  isActive: boolean;
  children: ReactNode;
  cardWidthClassName: string;
  reducedMotion: boolean;
  carouselOffsetSpring: MotionValue<number>;
  spread: number;
}) {
  const clampedOffset = Math.max(-3, Math.min(3, offset)) as SlotOffset;
  const style = getSlotStyle(clampedOffset, spread);
  const isFarEdge = Math.abs(offset) >= MAX_VISIBLE_OFFSET;

  const springConfig = reducedMotion
    ? CAROUSEL_CONFIG.reducedMotionSpring
    : CAROUSEL_CONFIG.spring;

  // Base resting x for this slot (eases toward its target when `offset`
  // changes, e.g. on keyboard/wheel/autoplay/goTo).
  const restingX = useMotionValue(style.x);
  useEffect(() => {
    restingX.set(style.x);
  }, [style.x, restingX]);
  const restingXSpring = useSpring(restingX, springConfig);

  // Final x = resting slot position + this card's share of the live,
  // continuous carouselOffsetSpring (card-width units -> px via spread).
  // Every card reads the SAME shared motion value; a positive shared
  // offset shifts every card's x by the same +spread*offset px amount,
  // which is exactly what "the whole stack rotates continuously" means.
  const x = useTransform<number, string>(
    [restingXSpring, carouselOffsetSpring],
    ([restX, sharedOffset]) => `calc(-50% + ${(restX ?? 0) + (sharedOffset ?? 0) * spread}px)`,
  );

  return (
    <motion.div
      className={`absolute left-1/2 top-1/2 flex-none ${cardWidthClassName}`}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform, filter, opacity",
        zIndex: style.zIndex,
        filter: style.blur ? `blur(${style.blur}px)` : "none",
        pointerEvents: isActive ? "auto" : "none",
        x: reducedMotion ? undefined : x,
      }}
      initial={false}
      animate={
        reducedMotion
          ? { opacity: isActive ? 1 : 0, x: "-50%", y: "-50%" }
          : {
              y: "-50%",
              z: style.z,
              rotateY: style.rotateY,
              scale: style.scale,
              opacity: isFarEdge ? Math.min(style.opacity, FAR_EDGE_OPACITY_CAP) : style.opacity,
            }
      }
      transition={
        reducedMotion
          ? { duration: 0.01 }
          : { type: "spring", ...CAROUSEL_CONFIG.spring }
      }
    >
      <motion.div
        animate={
          isActive && !reducedMotion
            ? {
                scale: [1, 1.015, 1],
                boxShadow: [
                  "0 30px 80px rgba(0,0,0,0.55)",
                  "0 40px 110px rgba(0,0,0,0.65)",
                  "0 30px 80px rgba(0,0,0,0.55)",
                ],
              }
            : {
                boxShadow: isActive
                  ? "0 30px 80px rgba(0,0,0,0.55)"
                  : `0 ${14 - Math.abs(offset) * 3}px ${40 - Math.abs(offset) * 6}px rgba(0,0,0,0.35)`,
              }
        }
        transition={
          isActive && !reducedMotion
            ? { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
        }
        style={{
          borderRadius: "inherit",
          filter: isActive ? "brightness(1)" : `brightness(${1 - Math.abs(offset) * 0.08})`,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function CarouselTimeline({
  total,
  active,
  reducedMotion,
  onSelect,
  onScrubStart,
  onScrubMove,
  onScrubEnd,
  sharedOffset,
}: {
  total: number;
  active: number;
  reducedMotion: boolean;
  onSelect: (index: number) => void;
  onScrubStart: () => void;
  onScrubMove: (fractionalDeltaFromActive: number) => void;
  onScrubEnd: (fractionalDeltaFromActive: number) => void;
  /** The SAME motion value driving every card's x position. */
  sharedOffset: MotionValue<number>;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrubbing = useRef(false);
  const hasMoved = useRef(false);
  const baseActive = useRef(active);
  const denom = Math.max(total - 1, 1);

  /**
   * SINGLE SHARED MOTION VALUE for the knob + progress fill, built from
   * exactly the same two ingredients that place the cards:
   *   1. `activeIndex` — mirrors the discrete `active` index, but instead
   *      of jumping, animates to each new value with the SAME spring
   *      physics as SpatialCard's restingXSpring (CAROUSEL_CONFIG.spring).
   *      This is what the old code was missing: it sprang the *progress
   *      percentage* through its own separate, differently-tuned spring
   *      (timelineSpring), which is why the knob always felt a beat off
   *      from the cards. Springing the index with the cards' own physics
   *      keeps them moving in lockstep on every advance/goTo/autoplay step.
   *   2. `sharedOffset` — the exact MotionValue that also shifts every
   *      card during a drag/scrub. Adding it straight through (no extra
   *      spring layer) means live dragging has zero added lag: the knob
   *      moves in the same frame, by the same amount, as the cards.
   * displayIndex = activeIndex + sharedOffset is then the one continuous
   * number both the fill width and the knob position read from.
   */
  const activeIndex = useMotionValue(active);
  const prevActiveRef = useRef(active);
  useEffect(() => {
    if (prevActiveRef.current === active) return;
    prevActiveRef.current = active;
    const controls = animate(
      activeIndex,
      active,
      reducedMotion ? CAROUSEL_CONFIG.reducedMotionSpring : CAROUSEL_CONFIG.spring,
    );
    return () => controls.stop();
  }, [active, reducedMotion, activeIndex]);

  const displayIndex = useTransform<number, number>(
    [activeIndex, sharedOffset],
    ([a, offsetUnits]) => a + offsetUnits,
  );
  const progress = useTransform<number, number>(
    displayIndex,
    (idx) => (idx / denom) * 100,
  );

  const percentFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return (active / denom) * 100;
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return frac * 100;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    scrubbing.current = true;
    hasMoved.current = false;
    baseActive.current = active;
    onScrubStart();
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrubbing.current) return;
    hasMoved.current = true;
    const percent = percentFromClientX(e.clientX);
    const fractionalIndex = (percent / 100) * denom;
    onScrubMove(fractionalIndex - baseActive.current); // continuous, unrounded
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrubbing.current) return;
    scrubbing.current = false;

    if (!hasMoved.current) {
      const percent = percentFromClientX(e.clientX);
      onSelect(Math.round((percent / 100) * denom));
      onScrubEnd(0);
      return;
    }

    const percent = percentFromClientX(e.clientX);
    const fractionalIndex = (percent / 100) * denom;
    onScrubEnd(fractionalIndex - baseActive.current); // snap happens here, on release
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (e.key === "ArrowLeft") next = active - 1;
    else if (e.key === "ArrowRight") next = active + 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = total - 1;
    if (next === null) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(Math.min(total - 1, Math.max(0, next)));
  };

  return (
    <div className="relative mx-auto mt-10 w-full max-w-[560px] px-6">
      <div className="mb-3 flex items-center justify-between">
        <span
          aria-live="polite"
          className="font-mono text-xs font-black tracking-[0.2em] text-primary"
        >
          {String(active + 1).padStart(2, "0")}
        </span>
        <span className="font-mono text-xs font-black tracking-[0.2em] text-white/30">
          {String(total).padStart(2, "0")}
        </span>
      </div>

      <div
        ref={trackRef}
        role="slider"
        aria-label="Project carousel position"
        aria-valuemin={0}
        aria-valuemax={total - 1}
        aria-valuenow={active}
        aria-valuetext={`Project ${active + 1} of ${total}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        className="relative flex h-8 cursor-pointer touch-none items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      >
        <div className="h-px w-full bg-white/15" />
        <motion.div
          aria-hidden
          className="absolute left-0 h-px bg-primary shadow-[0_0_8px_rgba(255,102,0,0.6)]"
          style={{ width: progress }}
        />
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute h-1 w-1 -translate-x-1/2 rounded-full bg-white/25"
            style={{ left: `${(i / denom) * 100}%` }}
          />
        ))}
        <motion.div
          aria-hidden
          className="absolute h-3.5 w-3.5 rounded-full border-2 border-black bg-primary shadow-[0_0_14px_rgba(255,102,0,0.9)]"
          style={{ left: progress, x: "-50%" }}
        />
      </div>
    </div>
  );
}

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / 1350, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}



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
      <div data-reveal>
        <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
          {eyebrow}
        </p>

        <h2 className={cn("section-title max-w-[1200px]", titleClassName)}>
          {title}
        </h2>

        <p className="mt-6 max-w-xl text-base leading-7 text-white/60">
          {copy}
        </p>
      </div>
    </div>
  );
}
const cardEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

function CapabilityCard({ item }: { item: (typeof capabilities)[number] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const orbX = useSpring(mouseX, { stiffness: 150, damping: 20, mass: 0.4 });
  const orbY = useSpring(mouseY, { stiffness: 150, damping: 20, mass: 0.4 });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(relX * 20);
    mouseY.set(relY * 20);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const cardVariants = {
    rest: {
      y: 0,
      borderColor: "rgba(255,255,255,0.1)",
      boxShadow: "0 0 0px rgba(255,102,0,0)",
      transition: { duration: 0.45, ease: cardEase },
    },
    hover: {
      y: -6,
      borderColor: "rgba(255,102,0,0.3)",
      boxShadow: "0 0 40px rgba(255,102,0,0.18)",
      transition: { duration: 0.45, ease: cardEase },
    },
  };

  const sweepVariants = {
    rest: { x: "-20%", opacity: 0 },
    hover: {
      x: "260%",
      opacity: [0, 1, 0],
      transition: { duration: 0.8, ease: "linear" },
    },
  };

  const orbVariants = {
    rest: { opacity: 0, scale: 1, transition: { duration: 0.45, ease: cardEase } },
    hover: { opacity: 0.5, scale: 1.4, transition: { duration: 0.45, ease: cardEase } },
  };

  const iconVariants = {
    rest: { rotate: 0, scale: 1, y: 0, filter: "drop-shadow(0 0 0px rgba(255,102,0,0))", transition: { duration: 0.45, ease: cardEase } },
    hover: { rotate: 8, scale: 1.12, y: -3, filter: "drop-shadow(0 0 8px rgba(255,102,0,0.6))", transition: { duration: 0.45, ease: cardEase } },
  };

  const labelVariants = {
    rest: { x: 0, opacity: 0.85, transition: { duration: 0.45, ease: cardEase } },
    hover: { x: 6, opacity: 1, transition: { duration: 0.45, ease: cardEase } },
  };

  const accentVariants = {
    rest: { width: "0%", transition: { duration: 0.6, ease: cardEase } },
    hover: { width: "100%", transition: { duration: 0.6, ease: cardEase } },
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial="rest"
      animate="rest"
      whileHover={reducedMotion ? undefined : "hover"}
      variants={cardVariants}
      className="cinema-panel relative min-h-[110px] min-w-0 overflow-hidden rounded-xl border p-4 text-white/70 [will-change:transform]"
    >
      {!reducedMotion && (
        <>
          <motion.span
            aria-hidden
            variants={sweepVariants}
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(100deg,transparent,rgba(255,102,0,0.16),transparent)] blur-md"
          />
          <motion.span
            aria-hidden
            variants={orbVariants}
            style={{ x: orbX, y: orbY }}
            className="pointer-events-none absolute left-4 top-4 h-16 w-16 rounded-full bg-primary/60 blur-2xl"
          />
        </>
      )}

      <motion.div
        variants={iconVariants}
        className="relative z-10 mb-4 inline-block text-primary"
      >
        <item.icon size={20} />
      </motion.div>

      <motion.p
        variants={labelVariants}
        className="relative z-10 text-xs font-bold uppercase tracking-[0.12em] break-words"
      >
        {item.label}
      </motion.p>

      {!reducedMotion && (
        <motion.span
          aria-hidden
          variants={accentVariants}
          className="pointer-events-none absolute bottom-0 left-0 h-[2px] bg-primary"
        />
      )}
    </motion.div>
  );
}

function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 92]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.965]);

  return (
   <section
    id="home"
    ref={ref}
    className="relative min-h-[85svh] scroll-mt-28 overflow-hidden px-5 pb-16 pt-28 sm:min-h-[90svh] sm:px-8 lg:min-h-0 lg:pt-36 xl:pt-40"
    >
      <div className="pointer-events-none absolute right-[-16rem] top-16 h-[42rem] w-[42rem] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-72 bg-[radial-gradient(ellipse_at_72%_100%,rgba(255,77,18,0.44),transparent_64%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_68%,transparent)]" />

      <div
       className="
       mx-auto
       grid
       max-w-[1640px]
       items-center
       grid-cols-1
       gap-4
       lg:min-h-[calc(88vh-8rem)]
       lg:grid-cols-2
       lg:gap-2
       xl:gap-4
       "
      >
        <motion.div
          className="relative z-10 min-w-0 order-2 [container-type:inline-size] lg:order-1"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.075 }}
          style={{ y, scale }}
        >
          <motion.p
            variants={fadeUp}
            className="mb-5 text-xs font-black uppercase tracking-[0.48em] text-primary sm:text-sm"
          >
            We bring
          </motion.p>
<h1
  className="leading-[0.96]
    font-black
    tracking-tight
    max-w-[1550px]
    text-[clamp(1.15rem,6.8cqw,3.4rem)]
  "
>
  IF YOU'RE HERE TO HIRE US
  <br />
  <span>—WELCOME.</span>
  <br />
  <br />
  IF YOU'RE HERE TO COPY US
  <br />
  <span>—GOOD LUCK.</span>
</h1>
          <motion.p
            variants={fadeUp}
            custom={4}
            className="mt-5 max-w-[560px] text-base leading-7 text-white/70 sm:text-lg lg:text-lg lg:leading-8"
          >
            Kroo Production crafts cinematic visuals, branded storytelling, and
            high-impact digital experiences for brands that move culture.
          </motion.p>
         <motion.div
          variants={fadeUp}
          custom={6}
          className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2"
          >
            <Button size="lg" asChild>
              <a href="#work">
                <Play size={18} fill="currentColor" />
                Watch showreel
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#contact">
                Start project
                <ArrowRight size={18} />
              </a>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={6}
            className="mt-6 grid max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {capabilities.map((item) => (
              <CapabilityCard key={item.label} item={item} />
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="relative z-10 flex min-w-0 items-center justify-center order-1 lg:order-2"
          initial={{ opacity: 0, x: 48, filter: "blur(18px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.32, duration: 1.08, ease: revealEase }}
        >
          <KrooMark />
        </motion.div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="relative z-10 scroll-mt-28 px-5 py-12 sm:px-8 lg:py-16">
      <div className="absolute left-1/2 top-1/2 -z-20 h-[560px] w-[1400px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(255,90,0,0.18)_0%,rgba(255,90,0,0.08)_30%,rgba(255,255,255,0.015)_55%,transparent_80%)] blur-[120px] opacity-70" />
      <div className="absolute left-1/2 top-1/2 -z-20 h-[620px] w-[1520px] -translate-x-1/2 -translate-y-1/2 rounded-[32px] bg-black/10 opacity-25 shadow-[inset_0_0_140px_rgba(0,0,0,0.6)]" />
      <div className="relative z-20 mx-auto grid max-w-[1480px] translate-y-[-40px] grid-cols-2 gap-4 rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),rgba(10,10,10,0.75)] px-5 py-8 shadow-[0_20px_80px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.04),0_0_80px_rgba(255,77,18,0.08)] backdrop-blur-xl sm:grid-cols-4 sm:px-8 sm:py-10 xl:px-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            data-reveal
            className="relative min-h-[96px] border border-transparent bg-transparent p-2.5 transition duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 sm:min-h-40 sm:p-7"
            >
              <stat.icon className="mb-7 text-primary" size={24} />
            <p className="text-xl sm:text-5xl font-black leading-none text-white sm:text-5xl">
              <CountUp value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.08em] text-white/60 sm:mt-3 sm:text-sm">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShowreelSection() {
  return (
    <section id="work" className="relative scroll-mt-28 px-2 py-6 sm:px-16 lg:px-24 lg:py-32">
      <div className="mx-auto mb-10 max-w-[1480px] px-5 sm:px-8">
  <p className="mb-2 text-xs font-black uppercase tracking-[0.32em] text-primary">
    SHOWREEL
  </p>

  <h2 className="section-title max-w-[1500px]">
    THIS ISN'T A SHOWREEL.
    <br />
    IT'S A REASON TO HIRE US.
  </h2>

  <p className="mt-6 max-w-md text-base leading-7 text-white/60">
    Cinematic campaign systems, high-impact launch films, and motion-led
    storytelling built to hold attention.
  </p>
</div>
      <div
        data-reveal
        data-scale-on-scroll
        className="group mx-auto max-w-[1280px] overflow-hidden rounded-md border border-white/10 bg-black shadow-2xl shadow-primary/10"
      >
        <div className="relative aspect-[16/9] min-h-[120px] overflow-hidden sm:min-h-[220px]">
          <video
  controls
  preload="metadata"
  playsInline
  controlsList="nodownload"
  className="h-full w-full bg-black object-cover rounded-[inherit]"
            onClick={(event) => {
              const video = event.currentTarget;

              if (video.paused) {
                void video.play();
              } else {
                video.pause();
              }
            }}
          >
            <source
              src="https://d3uo687t366hok.cloudfront.net/TCF_LANSCAPE_4K_30FPS.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  return null;
}

function FoundersSection() {
  return (
    <section id="team" className="flex scroll-mt-28 flex-col px-4 py-16 sm:px-8 lg:block lg:py-20">
     <div className="mx-auto mb-10 w-full px-0 lg:mb-14 lg:px-8" style={{ maxWidth: "1980px" }}>
      <div data-reveal>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.32em] text-primary">
          Meet the founders
        </p>
        <h2 className="section-title max-w-[1200px] text-[clamp(1.8rem,3.4vw,3.75rem)]">
            GOOD LUCK TO YOUR COMPETITORS.
        <br />
            YOU FOUND US FIRST.
        </h2>
        <p className="mt-6 max-w-xl text-base leading-7 text-white/60">
            A leadership team built around cinematic taste, production discipline, and modern distribution craft.
        </p>
        </div>
      </div>
      <div className="
    mx-auto
    grid
    w-full
    max-w-none
    grid-cols-2
    gap-3
    px-2
    sm:grid-cols-2
    lg:max-w-[1480px]
    lg:grid-cols-4
    lg:gap-5
  "
>
        {founders.map((founder) => (
        <FounderCard key={founder.name} founder={founder} /> ))}
           
      
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="scroll-mt-28 px-5 py-16 sm:px-8 lg:py-20">
{/* ServicesSection */}
    <SectionIntro
      eyebrow="What we do"
      title={
        <>
        WE CREATE THE REASON
        <br />
        PEOPLE REMEMBER YOU.
      </>
    }
  copy="From creative strategy to delivery masters, every frame is treated like a brand asset with cultural weight."
/>
      <div className="mx-auto grid max-w-[1480px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service, index) => (
          <article
            key={service.title}
            data-reveal
            className={cn(
              "group cinema-panel relative min-h-72 min-w-0 snap-start overflow-hidden rounded-md p-6 transition duration-500 will-change-transform hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow sm:p-7",
              service.span,
            )}
          >
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/0 blur-3xl transition duration-500 group-hover:bg-primary/20" />
            <service.icon className="relative mb-10 text-white/70 transition duration-300 group-hover:text-primary" size={42} />
            <p className="relative mb-3 text-xs font-black uppercase tracking-[0.24em] text-primary">
              0{index + 1}
            </p>
            <h3 className="relative text-3xl font-black uppercase">
              {service.title}
            </h3>
            <p className="relative mt-5 max-w-xl text-base leading-7 text-white/60">
              {service.description}
            </p>
            
          </article>
          
        ))}
      </div>
    </section>
  );
}
function ProjectsSection() {
  return (
    <section className="scroll-mt-28 overflow-visible py-20">
      {/* Top Marquee */}
      <div className="mb-10 overflow-hidden border-y border-primary/20 py-4">
        <div className="animate-project-marquee whitespace-nowrap text-sm font-black uppercase tracking-[0.35em] text-primary">
          FEATURED PROJECTS • GYM COMMERCIALS • PRODUCT ADS • BRAND FILMS • REELS •
          FEATURED PROJECTS • GYM COMMERCIALS • PRODUCT ADS • BRAND FILMS • REELS •
          FEATURED PROJECTS • GYM COMMERCIALS • PRODUCT ADS • BRAND FILMS • REELS •
        </div>
      </div>

      <SectionIntro
        eyebrow="Featured Projects"
        title={
          <>
            SCROLL IF YOU'RE CURIOUS.
            <br />
            STOP IF YOU'RE IMPRESSED.
          </>
        }
        copy="A selection of visual systems designed to travel from cinema screens to thumb-stopping social edits."
      />

      <SpatialCardStack
        items={projects}
        getKey={(project, index) => `${project.title}-${index}`}
        cardWidthClassName="w-[clamp(520px,36vw,640px)]"
        renderCard={(project, index) => (
          <Link
            href={project.href}
            className="group relative block w-full overflow-hidden rounded-md border border-white/10 bg-black"
          >
            <div className="relative aspect-[1.15] overflow-hidden">
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(max-width:768px) 100vw, 700px"
                className="object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-black/35" />

              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.24)_48%,transparent_58%)] opacity-0 transition duration-700 group-hover:opacity-100" />

              <div className="absolute left-5 top-5 max-w-[calc(100%-2.5rem)] rounded-full border border-white/20 px-3 py-2 text-[0.65rem] font-black uppercase tracking-[0.14em] text-white/80 sm:left-8 sm:top-8 sm:px-4 sm:text-xs sm:tracking-[0.18em]">
                {project.category}
              </div>

              <div className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-8">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-primary sm:text-sm sm:tracking-[0.2em]">
                  Case 0{(index % projects.length) + 1}
                </p>

                <h3 className="text-[clamp(2rem,7vw,3rem)] font-black uppercase leading-none">
                  {project.title}
                </h3>

                <div className="mt-6">
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary/10 px-5 py-2 text-xs font-black uppercase tracking-[0.14em] text-white transition-all duration-300 group-hover:bg-primary group-hover:text-black">
                    View Project
                    <ArrowRight size={16} />
                  </span>
                </div>
              </div>

              <p className="absolute right-5 top-16 text-2xl font-black text-white/20 sm:right-8 sm:top-8 sm:text-4xl">
                {project.metric}
              </p>
            </div>
          </Link>
        )}
      />
    </section>
  );
}

function TestimonialsSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % testimonials.length),
      4500,
    );
    return () => window.clearInterval(timer);
  }, []);

  const testimonial = testimonials[active];

  return (
    <section id="about" className="scroll-mt-28 px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto grid max-w-[1480px] gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
  <div data-reveal className="[container-type:inline-size]">
    <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
      Client response
    </p>

    <h2 className="section-title max-w-[700px] text-[clamp(1.6rem,7.2cqw,3.25rem)]">
      OUR WORK SPEAKS.
      <br />
      THEY CONFIRM.
    </h2>
  </div>

  
    <div data-reveal className="cinema-panel relative overflow-hidden rounded-md p-8 sm:p-12">
          <Quote className="mb-8 text-primary" size={42} />
          <motion.p
            key={testimonial.quote}
            initial={{ y: 24, opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.55, ease: revealEase }}
            className="text-2xl font-bold leading-tight text-white sm:text-4xl"
          >
            {testimonial.quote}
          </motion.p>
          <div className="mt-10 flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-white/60 via-zinc-600 to-primary/50" />
            <div>
              <p className="font-black uppercase tracking-[0.08em]">
                {testimonial.name}
              </p>
              <p className="text-sm text-white/60">{testimonial.company}</p>
            </div>
          </div>
          <div className="mt-10 flex gap-2">
            {testimonials.map((item, index) => (
              <button
                key={item.name}
                aria-label={`Show testimonial ${index + 1}`}
                onClick={() => setActive(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black",
                  active === index ? "w-12 bg-primary" : "w-5 bg-white/20",
                )}
              />
            ))}
          </div>
        </div>
      </div>
      
    </section>
  );
}

function ContactSection() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");

  return (
    <section id="contact" className="relative scroll-mt-28 px-5 py-20 sm:px-8 lg:py-24">
      <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,77,18,0.24),transparent_66%)]" />
      <div className="relative mx-auto max-w-[1480px]">
        <div data-reveal className="mb-10 lg:mb-14">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
            Start project
          </p>
          <h2 className="section-title max-w-[1200px]">
            YOU'VE SEEN OUR STORIES.
            <br />
            NOW LET'S HEAR YOURS.
          </h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div data-reveal>
            <div className="space-y-5 text-white/70">
  <a
    href="mailto:team@krooproduction.in"
    className="flex min-w-0 items-center gap-4 rounded-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
  >
    <Mail className="shrink-0 text-primary" />
    <span className="min-w-0 break-words">
      team@krooproduction.in
    </span>
  </a>

  <a
    href="tel:+916291252126"
    className="flex min-w-0 items-center gap-4 rounded-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
  >
    <Phone className="shrink-0 text-primary" />
    <span>+91 62912 52126</span>
  </a>

  <p className="flex min-w-0 items-center gap-4">
    <MapPin className="shrink-0 text-primary" />
    <span>Kolkata, India</span>
  </p>
</div>

           <div className="mt-8 flex gap-3">
  {[
    {
      icon: Instagram,
      href: "https://www.instagram.com/kroo.production/",
    },
    {
      icon: Youtube,
      href: "https://youtube.com/@krooproduction",
    },
    {
      icon: Facebook,
      href: "https://facebook.com/",
    },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/company/krooproduction/",
    },
  ].map(({ icon: Icon, href }, index) => (
    <a
      key={index}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Kroo social channel"
      className="magnetic-target flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 transition duration-300 hover:border-primary hover:text-primary hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
    >
      <Icon size={19} />
    </a>
  ))}
</div>
</div> 
          <form
            data-reveal
            className="cinema-panel rounded-md p-5 sm:p-8"
            onSubmit={async (event) => {
              event.preventDefault();
              setLoading(true);
              try {
                const response = await fetch("/api/contact", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    name,
                    email,
                    company,
                    budget,
                    message,
                  }),
                });
                const data = await response.json();
                if (!response.ok) {
                  throw new Error(data.error || "Failed");
                }
                setSent(true);
                setName("");
                setEmail("");
                setCompany("");
                setBudget("");
                setMessage("");
              } catch (err) {
                alert("Failed to send project request.");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                aria-label="Name"
                required
              />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
                aria-label="Email"
                required
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company"
                aria-label="Company"
              />
              <Input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Budget range"
                aria-label="Budget range"
              />
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-4"
              placeholder="Project brief"
              aria-label="Project brief"
              required
            />
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex min-w-0 items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-white/70">
                <CheckCircle2 size={16} className="shrink-0 text-primary" />
                {sent ? "Brief received. We will reply shortly." : "Response within 24 hours."}
              </p>
              <Button type="submit" size="lg" disabled={loading} className="min-w-[240px] w-full sm:w-auto">
                {loading ? "Sending..." : "START YOUR PROJECT"}
                <ArrowUpRight size={17} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-white/10 px-5 py-10 sm:px-8 lg:py-14">
      <div className="mx-auto grid max-w-[1480px] grid-cols-2 gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.75fr)_minmax(0,0.75fr)_minmax(0,0.75fr)_minmax(0,0.8fr)]">

        {/* Logo */}
        <div className="col-span-2 md:col-span-1">
          <div className="mb-5 flex items-center">
            <Image
              src="/images/logo.png"
              alt="Kroo Production"
              width={170}
              height={60}
              priority
              className="h-12 w-auto"
            />
          </div>

          <p className="max-w-xs text-sm leading-6 text-white/50">
            Cinematic storytelling through powerful visuals and purposeful
            execution.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white">
            Quick Links
          </h3>

          {["Home", "Work", "Services", "Team", "About", "Contact"].map(
            (item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block rounded-sm py-1 text-sm text-white/50 transition hover:text-primary"
              >
                {item}
              </a>
            )
          )}
        </div>

        {/* Services */}
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white">
            Services
          </h3>

          {services.map((service) => (
            <a
              key={service.title}
              href="#services"
              className="block rounded-sm py-1 text-sm text-white/50 transition hover:text-primary"
            >
              {service.title}
            </a>
          ))}
        </div>

        {/* Legal */}
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white">
            Legal
          </h3>

          <a
            href="/privacy-policy"
            className="block rounded-sm py-1 text-sm text-white/50 transition hover:text-primary"
          >
            Privacy Policy
          </a>

          <a
            href="/terms-of-service"
            className="block rounded-sm py-1 text-sm text-white/50 transition hover:text-primary"
          >
            Terms of Service
          </a>

          <a
            href="/cookie-policy"
            className="block rounded-sm py-1 text-sm text-white/50 transition hover:text-primary"
          >
            Cookie Policy
          </a>

          <a
            href="/disclaimer"
            className="block rounded-sm py-1 text-sm text-white/50 transition hover:text-primary"
          >
            Disclaimer
          </a>
        </div>

        {/* Follow Us */}
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white">
            Follow Us
          </h3>

          <div className="flex flex-wrap gap-3">

            <a
              href="https://www.instagram.com/kroo.production/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-primary hover:text-primary"
            >
              <Instagram size={17} />
            </a>

            <a
              href="https://youtube.com/@krooproduction"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-primary hover:text-primary"
            >
              <Youtube size={17} />
            </a>

            <a
              href="https://www.linkedin.com/company/krooproduction/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-primary hover:text-primary"
            >
              <Linkedin size={17} />
            </a>

          </div>

          <p className="mt-6 text-sm text-white/40">
            &copy; 2026 Kroo Production. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default function HomePage() {
  useLenis();
  useGsapReveal();
  useMagnetic();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020202] text-white">
      <Ambient />
      <Loader />
      <CursorFollower />
      <SiteNav />
      <div className="relative z-10">
        <HeroSection />
        <StatsSection />
        <ShowreelSection />
        <LogoStrip />
        <FoundersSection />
        <ServicesSection />
        <ProjectsSection />
        <TestimonialsSection />
        <ContactSection />
        <Footer />
      </div>
    </main>
  );
}