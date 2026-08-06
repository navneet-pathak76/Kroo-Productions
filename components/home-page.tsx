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

/**
 * Rebuilt from scratch as a proper orbit projection instead of a table of
 * hand-picked pixel offsets. Every slot's x/z position is DERIVED from its
 * rotateY angle and two constants (ORBIT_CONFIG below) — there is no
 * per-tier magic number for position left in this file. Only rotateY,
 * scale, and opacity are set directly (opacity carried over unchanged
 * from the approved design — it was never flagged as wrong).
 *
 *   CENTER      scale 1.00  rotateY  0°   opacity 1.00
 *   L1 / R1     scale 0.88  rotateY ±25°  opacity 0.72
 *   L2 / R2     scale 0.76  rotateY ±42°  opacity 0.38
 *   L3 / R3     scale 0.64  rotateY ±55°  opacity 0.18
 *
 * Left cards get POSITIVE rotateY, right cards get NEGATIVE rotateY (the
 * two sides are exact mirror images of each other by construction, so
 * "L1↔CENTER equals CENTER↔R1" etc. can't drift out of sync — there is
 * no second place that could disagree with this table).
 */
const SLOT_CONFIG = {
  0: { rotateYDeg: 0, scale: 1, opacity: 1, zIndex: 100 },
  1: { rotateYDeg: 25, scale: 0.88, opacity: 0.72, zIndex: 90 },
  2: { rotateYDeg: 42, scale: 0.76, opacity: 0.38, zIndex: 80 },
  3: { rotateYDeg: 55, scale: 0.64, opacity: 0.18, zIndex: 70 },
};

/** Cards beyond this magnitude are not rendered — hidden, not just faded. */
const MAX_VISIBLE_OFFSET = 3;

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

/**
 * ORIGINAL desktop formula, restored exactly. A previous pass split this
 * by breakpoint to independently tune mobile card width — that changed
 * desktop's own spacing as a side effect and is reverted here. Desktop
 * (and every other width) reads from this ONE formula again.
 */
function computeSpread(viewportWidth: number): number {
  // Original formula, unchanged, for every viewport >= 530px (tablet and
  // desktop render identically to before). The 170px floor was tuned for
  // tablet-class widths; on a ~360-390px phone it's disproportionately
  // large and pushes the side cards past the screen edge. This adds a
  // lower floor ONLY below 530px so phones get a tighter, non-overflowing
  // stack, without touching the desktop numbers.
  const min = viewportWidth < 530 ? 90 : SPREAD_CONFIG.min;
  return Math.max(
    min,
    Math.min(SPREAD_CONFIG.max, viewportWidth * SPREAD_CONFIG.ratio),
  );
}

/**
 * ORIGINAL card width formula, restored exactly: `clamp(280px, 82vw,
 * 640px)`, computed here in JS (instead of a Tailwind arbitrary class)
 * so it can feed the same width value used elsewhere. A previous pass
 * replaced this with a spread-derived width to avoid overlap at certain
 * viewport widths — that wasn't asked for here and changed desktop's own
 * card size, so it's reverted. Because this formula is vw-based, mobile
 * already shrinks proportionally on its own (82vw), exactly like the
 * original — no separate mobile system needed.
 */
const CARD_WIDTH_CONFIG = {
  minPx: 280,
  vwPercent: 0.82,
  maxPx: 640,
};

function computeCardWidth(viewportWidth: number): number {
  // Same 280px floor for every viewport >= 530px (tablet and desktop
  // unchanged). Below 530px the 280px floor leaves almost no side margin
  // (e.g. 280px card on a 320px phone), which is what pushed the active
  // card's edges — and its decorative overlays — past the viewport. This
  // adds a lower floor ONLY below 530px, mirroring computeSpread above.
  const minPx = viewportWidth < 530 ? 220 : CARD_WIDTH_CONFIG.minPx;
  return Math.max(
    minPx,
    Math.min(CARD_WIDTH_CONFIG.maxPx, viewportWidth * CARD_WIDTH_CONFIG.vwPercent),
  );
}

/**
 * ORBIT_CONFIG is the ONLY place x/z distance comes from. Every slot sits
 * on a circle of radius `xRadius` (lateral) / `zRadius` (depth), read off
 * at its own rotateY angle — x = xRadius·sin(θ), z = -zRadius·(1-cos(θ)).
 * That's what "recalculate the entire positioning system" / "no random
 * offsets" means in practice: change ONE number here and every slot's
 * spacing updates together, still perfectly mirrored, instead of hand-
 * tuning seven independent pixel values that can silently drift apart.
 * Both radii are expressed as multiples of `spread`, so the whole orbit
 * — not just individual offsets — scales down continuously on mobile.
 */
const ORBIT_CONFIG = {
  xRadius: 3.6,
  zRadius: 2.2,
};

const CAMERA_CONFIG = {
  /** Perspective (camera distance) expressed as a multiple of spread.
   *  Lower = more dramatic/wide-angle falloff, higher = flatter. Tuned
   *  down from 13 to 10 for more visible depth now that the far tiers
   *  (up to 55°) sit further into the scene via ORBIT_CONFIG. */
  perspectiveFactor: 10,
  perspectiveOrigin: "50% 50%",
};

const STAGE_CONFIG = {
  maxWidthClassName: "max-w-[1800px] mx-auto",
  // Fixed h-[720px] was identical on a 320px phone and a 1920px display,
  // which is what made mobile read as oversized: the card could shrink,
  // but the stage around it never did. clamp() scales the stage down
  // with the viewport too, capping at the original 720px on desktop.
  heightClassName: "h-[clamp(280px,92vw,720px)]",
  overflowClassName: "overflow-visible",
};

interface SlotStyle {
  x: number;
  z: number;
  rotateY: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

/**
 * Derives a slot's full style from SLOT_CONFIG + ORBIT_CONFIG. Sign is
 * applied to rotateY as LEFT = positive, RIGHT = negative (per spec); x
 * and z fall out of that same signed angle via the orbit formula, so a
 * slot's position and its rotation can never disagree with each other —
 * there's only one angle, used for both. Magnitude (scale/opacity/zIndex)
 * comes straight from the table, so slot(-n) and slot(+n) are identical
 * apart from sign, by construction — no way to edit one side without the
 * other. x/z scale with the responsive `spread` value (viewport-driven).
 */
function getSlotStyle(offset: SlotOffset, spread: number): SlotStyle {
  const magnitude = Math.abs(offset) as SlotMagnitude;
  const entry = SLOT_CONFIG[magnitude];
  // offset > 0 renders to the right of center, so RIGHT = negative rotateY.
  const sign = Math.sign(offset);
  const rotateY = -sign * entry.rotateYDeg;
  const theta = (entry.rotateYDeg * Math.PI) / 180;

  return {
    x: sign * ORBIT_CONFIG.xRadius * Math.sin(theta) * spread,
    z: -ORBIT_CONFIG.zRadius * (1 - Math.cos(theta)) * spread,
    rotateY,
    scale: entry.scale,
    opacity: entry.opacity,
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
}

function SpatialCardStack<T>({
  items,
  renderCard,
  getKey,
  className,
}: SpatialCardStackProps<T>) {
  const total = items.length;
  const [active, setActive] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [spread, setSpread] = useState<number>(() =>
    typeof window === "undefined" ? SPREAD_CONFIG.base : computeSpread(window.innerWidth),
  );
  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth,
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
      raf = requestAnimationFrame(() => {
        setSpread(computeSpread(window.innerWidth));
        setViewportWidth(window.innerWidth);
      });
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

    // Below 640px there isn't room to peek 3 cards deep on either side
    // without the outer ones sitting past the screen edge — cap how many
    // orbit slots render there. Desktop/tablet (>=640px) keep the full
    // MAX_VISIBLE_OFFSET depth, unchanged.
    const mobileCap = viewportWidth < 640 ? 1 : MAX_VISIBLE_OFFSET;
    const span = Math.min(mobileCap, Math.floor((total - 1) / 2) || 0);
    for (let d = -span; d <= span; d++) {
      const index = ((active + d) % total + total) % total;
      const offset = normalizeOffset(d, total);
      entries.push({ item: items[index], index, offset });
    }
    return entries;
  }, [active, items, total, viewportWidth]);

const perspective = spread * CAMERA_CONFIG.perspectiveFactor;
  const cardWidth = computeCardWidth(viewportWidth);

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
              cardWidth={cardWidth}
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
  cardWidth,
  reducedMotion,
  carouselOffsetSpring,
  spread,
}: {
  offset: number;
  isActive: boolean;
  children: ReactNode;
  cardWidth: number;
  reducedMotion: boolean;
  carouselOffsetSpring: MotionValue<number>;
  spread: number;
}) {
  const clampedOffset = Math.max(-3, Math.min(3, offset)) as SlotOffset;
  const style = useMemo(
    () => getSlotStyle(clampedOffset, spread),
    [clampedOffset, spread],
  );

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
      className="absolute left-1/2 top-1/2 flex-none"
      style={{
        width: `${cardWidth}px`,
        transformStyle: "preserve-3d",
        willChange: "transform, opacity",
        zIndex: style.zIndex,
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
              opacity: style.opacity,
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
   * SINGLE SHARED MOTION VALUE for the active number + active dot, built
   * from exactly the same two ingredients that place the cards:
   *   1. `activeIndex` — mirrors the discrete `active` index, but instead
   *      of jumping, animates to each new value with the SAME spring
   *      physics as SpatialCard's restingXSpring (CAROUSEL_CONFIG.spring),
   *      so the knob moves in lockstep with the cards on every
   *      advance/goTo/autoplay step instead of trailing a beat behind.
   *   2. `sharedOffset` — the exact MotionValue that also shifts every
   *      card during a drag/scrub. Adding it straight through (no extra
   *      spring layer) means live dragging has zero added lag: the knob
   *      moves in the same frame, by the same amount, as the cards.
   * displayIndex = activeIndex + sharedOffset is the one continuous number
   * that positions the number+dot unit. There is no separate progress/fill
   * value anymore — the line itself never changes, only this one position
   * along it, per spec ("only the orange dot slides").
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
  // The ONLY thing that moves. Both the active number and the active dot
  // read their horizontal position from this single value, so they can
  // never drift apart or be positioned by two different formulas.
  const knobLeft = useTransform<number, string>(
    displayIndex,
    (idx) => `${(idx / denom) * 100}%`,
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
    <div className="relative mx-auto mt-14 w-full max-w-[560px] px-6">
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
        {/* The ONE line. Never changes — no fill, no progress width. */}
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-white/15" />

        {/* Evenly spaced, neutral, static dots — every one of them,
            including the active slot, so the line never appears to
            have a gap or a stray mark where the knob currently isn't. */}
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25"
            style={{ left: `${(i / denom) * 100}%` }}
          />
        ))}

        {/* Active number + active dot: ONE unit, ONE position source
            (knobLeft), so they can never be out of sync with each other
            or with the cards. Only this unit ever moves. */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ left: knobLeft }}
        >
          <span
            aria-live="polite"
            className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap font-mono text-xs font-black tracking-[0.2em] text-primary"
          >
            {String(active + 1).padStart(2, "0")}
          </span>
          <span className="block h-3.5 w-3.5 rounded-full border-2 border-black bg-primary shadow-[0_0_14px_rgba(255,102,0,0.9)]" />
        </motion.div>
      </div>

      <div className="mt-3 flex justify-end">
        <span className="font-mono text-xs font-black tracking-[0.2em] text-white/30">
          {String(total).padStart(2, "0")}
        </span>
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
    <div className="mx-auto mb-3 max-w-[1480px] px-5 sm:px-8 sm:mb-6 lg:mb-14">
      <div data-reveal>
        <p className="mb-2.5 text-xs font-black uppercase tracking-[0.32em] text-primary sm:mb-4">
          {eyebrow}
        </p>

        <h2
          className={cn(
            "section-title max-w-[1200px] text-[clamp(1.05rem,5.6vw,3.75rem)] leading-[1.18] sm:text-[clamp(1.3rem,5vw,3.75rem)] sm:leading-[1.14] lg:text-[clamp(1.6rem,6.4vw,3.75rem)] lg:leading-[1.12]",
            titleClassName,
          )}
        >
          {title}
        </h2>

        <p className="mt-3 max-w-xl text-sm leading-6 text-white/60 sm:mt-6 sm:text-base sm:leading-7">
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
  className="
    leading-[0.96]
    font-black
    tracking-tight
    max-w-[1550px]
    text-[clamp(1.2rem,5.9cqw,3.4rem)]
    sm:text-[clamp(1.2rem,6.8cqw,3.4rem)]
  "
>
  IF YOU&apos;RE HERE TO HIRE US
  <br />
  <span>—WELCOME.</span>

  <br />
  <br />

  IF YOU&apos;RE HERE FOR INSPIRATION
  <br />
  <span>—DIVE IN.</span>
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
    <section className="relative z-10 scroll-mt-28 px-5 py-5 sm:px-8 sm:py-8 lg:py-16">
      <div className="absolute left-1/2 top-1/2 -z-20 h-[560px] w-[1400px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(255,90,0,0.18)_0%,rgba(255,90,0,0.08)_30%,rgba(255,255,255,0.015)_55%,transparent_80%)] blur-[120px] opacity-70" />
      <div className="absolute left-1/2 top-1/2 -z-20 h-[620px] w-[1520px] -translate-x-1/2 -translate-y-1/2 rounded-[32px] bg-black/10 opacity-25 shadow-[inset_0_0_140px_rgba(0,0,0,0.6)]" />
      <div className="relative z-20 mx-auto grid max-w-[1480px] translate-y-[-40px] grid-cols-4 gap-1 rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),rgba(10,10,10,0.75)] px-2 py-3 shadow-[0_20px_80px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.04),0_0_80px_rgba(255,77,18,0.08)] backdrop-blur-xl sm:grid-cols-4 sm:gap-4 sm:px-8 sm:py-10 xl:px-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            data-reveal
            className="relative flex min-h-0 flex-col items-center gap-1 border border-transparent bg-transparent p-1.5 text-center transition duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 sm:block sm:min-h-40 sm:gap-0 sm:p-7 sm:text-left"
            >
              <>
                <stat.icon className="shrink-0 text-primary sm:hidden" size={16} />
                <stat.icon className="hidden shrink-0 text-primary sm:mb-7 sm:block" size={24} />
              </>
              <div>
                <p className="text-lg font-black leading-none text-white sm:text-5xl">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-0.5 text-[8px] leading-tight font-bold uppercase tracking-[0.04em] text-white/60 sm:mt-3 sm:text-sm sm:tracking-[0.08em] sm:leading-normal">
                  {stat.label}
                </p>
              </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShowreelSection() {
  return (
    <section className="relative scroll-mt-28 px-2 py-4 sm:px-16 sm:py-10 lg:px-24 lg:py-32">
      <div className="mx-auto mb-6 max-w-[1480px] px-5 sm:mb-10 sm:px-8">
  <p className="mb-2 text-xs font-black uppercase tracking-[0.32em] text-primary">
    SHOWREEL
  </p>

  <h2 className="section-title max-w-[1500px] text-[clamp(1.05rem,5.6vw,3.75rem)] leading-[1.18] sm:text-[clamp(1.3rem,5vw,3.75rem)] sm:leading-[1.14] lg:text-[clamp(1.6rem,6.4vw,3.75rem)] lg:leading-[1.12]">
    THIS ISN&apos;T A SHOWREEL.
    <br />
    IT&apos;S A REASON TO HIRE US.
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
    <section id="team" className="flex scroll-mt-28 flex-col px-4 py-4 sm:px-8 sm:py-10 lg:block lg:py-20">
     <div className="mx-auto mb-6 w-full px-0 sm:mb-10 lg:mb-14 lg:px-8" style={{ maxWidth: "1980px" }}>
      <div data-reveal>
        <p className="mb-3 text-lg font-black uppercase tracking-[0.32em] text-primary">
          Meet the founders
        </p>
        <h2 className="section-title max-w-[1200px] text-[clamp(1.05rem,4vw,3.75rem)] leading-[1.16] sm:text-[clamp(1.28rem,4vw,3.75rem)] sm:leading-[1.12] lg:text-[clamp(1.5rem,4.4vw,3.75rem)] lg:leading-[1.1]">
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
    md:grid-cols-4
    gap-[clamp(4px,1.4vw,20px)]
    px-2
    lg:max-w-[1480px]
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
    <section id="services" className="scroll-mt-28 px-5 py-4 sm:px-8 sm:py-10 lg:py-20">
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
      <div className="mx-auto grid max-w-[1480px] grid-cols-1 gap-3 lg:grid-cols-4 lg:gap-5">
        {services.map((service, index) => (
          <article
            key={service.title}
            data-reveal
            className={cn(
              "group cinema-panel relative min-h-0 min-w-0 snap-start overflow-hidden rounded-md p-3.5 transition duration-500 will-change-transform hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow sm:min-h-60 sm:p-5 lg:min-h-72 lg:p-7",
              service.span,
            )}
          >
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/0 blur-3xl transition duration-500 group-hover:bg-primary/20" />
            <service.icon
              className="relative mb-2.5 h-6 w-6 text-white/70 transition duration-300 group-hover:text-primary sm:mb-6 sm:h-9 sm:w-9 lg:mb-10 lg:h-[42px] lg:w-[42px]"
              size={42}
            />
            <p className="relative mb-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary sm:mb-3 sm:text-xs sm:tracking-[0.24em]">
              0{index + 1}
            </p>
            <h3 className="relative text-base font-black uppercase sm:text-2xl lg:text-3xl">
              {service.title}
            </h3>
            <p className="relative mt-1.5 max-w-xl text-sm leading-6 text-white/60 sm:mt-3 sm:text-base sm:leading-7 lg:mt-5">
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
    <section id="work" className="scroll-mt-28 overflow-x-clip py-5 sm:py-10 lg:py-20">
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
            SCROLL IF YOU&apos;RE CURIOUS.
            <br />
            STOP IF YOU&apos;RE IMPRESSED.
          </>
        }
        copy="A selection of visual systems designed to travel from cinema screens to thumb-stopping social edits."
      />

      {/*
        Card width is computed inside SpatialCardStack from viewport
        width directly — clamp(280px, 82vw, 640px), same as the original
        desktop design. Mobile shrinks proportionally on its own because
        the formula is vw-based; no separate mobile system.
      */}
      <SpatialCardStack
        items={projects}
        getKey={(project, index) => `${project.title}-${index}`}
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

              <div className="absolute left-3 top-3 max-w-[calc(100%-2rem)] rounded-full border border-white/20 px-2.5 py-1.5 text-[0.6rem] font-black uppercase tracking-[0.1em] text-white/80 sm:left-8 sm:top-8 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.18em]">
                {project.category}
              </div>

              <div className="absolute bottom-3 left-3 right-3 sm:bottom-8 sm:left-8 sm:right-8">
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-primary sm:mb-3 sm:text-sm sm:tracking-[0.2em]">
                  Case 0{(index % projects.length) + 1}
                </p>

                <h3 className="line-clamp-2 max-w-full overflow-hidden text-ellipsis break-words text-lg font-black uppercase leading-[1.08] sm:text-4xl lg:text-5xl">
                  {project.title}
                </h3>

                <div className="mt-3 sm:mt-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white transition-all duration-300 group-hover:bg-primary group-hover:text-black sm:gap-2 sm:px-5 sm:py-2 sm:text-xs sm:tracking-[0.14em]">
                    View Project
                    <ArrowRight size={14} className="sm:hidden" />
                    <ArrowRight size={16} className="hidden sm:block" />
                  </span>
                </div>
              </div>

              <p className="absolute right-3 top-11 text-base font-black text-white/20 sm:right-8 sm:top-8 sm:text-4xl">
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
    <section id="about" className="scroll-mt-28 px-5 py-4 sm:px-8 sm:py-10 lg:py-20">
      <div className="mx-auto grid max-w-[1480px] gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
  <div data-reveal className="[container-type:inline-size]">
    <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
      Client response
    </p>

    <h2 className="section-title max-w-[700px] text-[clamp(1rem,6.2cqw,3.25rem)] leading-[1.16] sm:text-[clamp(1.2rem,6.2cqw,3.25rem)] sm:leading-[1.12] lg:text-[clamp(1.4rem,7.2cqw,3.25rem)] lg:leading-[1.1]">
      OUR WORK SPEAKS.
      <br />
      THEY CONFIRM.
    </h2>
  </div>

  
    <div data-reveal className="cinema-panel relative overflow-hidden rounded-md p-5 sm:p-12">
          <Quote className="mb-4 text-primary sm:mb-8 sm:hidden" size={32} />
          <Quote className="mb-8 hidden text-primary sm:mb-8 sm:block" size={42} />
          <motion.p
            key={testimonial.quote}
            initial={{ y: 24, opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.55, ease: revealEase }}
            className="text-lg font-bold leading-tight text-white sm:text-4xl"
          >
            {testimonial.quote}
          </motion.p>
          <div className="mt-6 flex items-center gap-4 sm:mt-10">
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
    <section id="contact" className="relative scroll-mt-28 px-5 py-6 sm:px-8 sm:py-12 lg:py-24">
      <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,77,18,0.24),transparent_66%)]" />
      <div className="relative mx-auto max-w-[1480px]">
        <div data-reveal className="mb-4 sm:mb-8 lg:mb-14">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
            Start project
          </p>
          <h2 className="section-title max-w-[1200px] text-[clamp(1.05rem,5.6vw,3.75rem)] leading-[1.18] sm:text-[clamp(1.3rem,5vw,3.75rem)] sm:leading-[1.14] lg:text-[clamp(1.6rem,6.4vw,3.75rem)] lg:leading-[1.12]">
            YOU&apos;VE SEEN OUR STORIES.
            <br />
            NOW LET&apos;S HEAR YOURS.
          </h2>
        </div>

        <div className="grid gap-5 sm:gap-6 lg:gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div data-reveal>
            <div className="space-y-3 sm:space-y-4 lg:space-y-5 text-white/70">
    <a
    href="mailto:team@krooproduction.in"
    className="flex min-w-0 items-center gap-4 rounded-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
  >
    <Mail className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
    <span className="min-w-0 break-words">
      team@krooproduction.in
    </span>
  </a>

  <a target="_blank"
    href="tel:+916291252126"
    className="flex min-w-0 items-center gap-4 rounded-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
  >
    <Phone className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
    <span>+91 62912 52126</span>
  </a>

  <p className="flex min-w-0 items-center gap-4">
    <MapPin className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
    <span>Kolkata, India</span>
  </p>
</div>

           <div className="mt-5 sm:mt-6 lg:mt-8 flex gap-2 sm:gap-3">
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
      className="magnetic-target flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition duration-300 hover:border-primary hover:text-primary hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black sm:h-11 sm:w-11 lg:h-12 lg:w-12"
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
              } catch {
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
    <footer className="relative border-t border-white/10 px-5 py-6 sm:px-8 sm:py-8 lg:py-14">
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

          {[
            { label: "Home", href: "#home" },
            { label: "Projects", href: "#work" },
            { label: "Services", href: "#services" },
            { label: "Our Team", href: "#team" },
            { label: "Contact", href: "#contact" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="block rounded-sm py-1 text-sm text-white/50 transition hover:text-primary"
            >
              {item.label}
            </a>
          ))}
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
        <ProjectsSection />
        <ServicesSection />
        <FoundersSection />
        <TestimonialsSection />
        <ContactSection />
        <Footer />
      </div>
    </main>
  );
}