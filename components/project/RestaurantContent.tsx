"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  ChefHat,
  Clock3,
  Flame,
  Film,
  Layers3,
  Play,
  Sparkles,
  Target,
  UserRound,
  X,
  Instagram,
  Youtube,
  Linkedin,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Ambient } from "@/components/ambient";
import { CursorFollower } from "@/components/cursor-follower";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/content";
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
      delay: i * 0.08,
      duration: 0.82,
      ease: revealEase,
    },
  }),
};

type RestaurantVideo = {
  id: number;
  title: string;
  thumbnail: string;
  video: string;
  description: string;
  duration: string;
  category: string;
  client: string;
  services: string[];
};

export const restaurantVideos: RestaurantVideo[] = [
  {
    id: 1,
    title: "Fine Dining Commercial",
    thumbnail: "/images/gym-content/thumb-01.svg",
    video: "",
    description: "Cinematic commercial built to elevate a fine dining brand.",
    duration: "1:18",
    category: "Commercial",
    client: "Hospitality Industry",
    services: ["Filming", "Food Styling", "Color Grading"],
  },
  {
    id: 2,
    title: "Cafe Launch Film",
    thumbnail: "/images/gym-content/thumb-02.svg",
    video: "",
    description: "Warm, inviting launch film introducing a new cafe brand.",
    duration: "0:52",
    category: "Launch",
    client: "Hospitality Industry",
    services: ["Filming", "Editing", "Motion Graphics"],
  },
  {
    id: 3,
    title: "Luxury Menu Showcase",
    thumbnail: "/images/gym-content/thumb-03.svg",
    video: "",
    description: "Macro-detail menu showcase built for premium perception.",
    duration: "1:04",
    category: "Showcase",
    client: "Hospitality Industry",
    services: ["Food Styling", "Filming", "Color Grading"],
  },
  {
    id: 4,
    title: "Chef Documentary",
    thumbnail: "/images/gym-content/thumb-04.svg",
    video: "",
    description: "Intimate documentary profile following a signature chef.",
    duration: "2:41",
    category: "Documentary",
    client: "Hospitality Industry",
    services: ["Interview", "Filming", "Sound Design"],
  },
  {
    id: 5,
    title: "Signature Dish Story",
    thumbnail: "/images/gym-content/thumb-05.svg",
    video: "",
    description: "Short-form story told entirely through a single dish.",
    duration: "0:34",
    category: "Social",
    client: "Hospitality Industry",
    services: ["Editing", "Color Grading", "Motion Graphics"],
  },
  {
    id: 6,
    title: "Restaurant Brand Film",
    thumbnail: "/images/gym-content/thumb-06.svg",
    video: "",
    description: "Full brand film covering atmosphere, craft and service.",
    duration: "1:47",
    category: "Brand Film",
    client: "Hospitality Industry",
    services: ["Creative Direction", "Filming", "Editing"],
  },
  {
    id: 7,
    title: "Cloud Kitchen Campaign",
    thumbnail: "/images/gym-content/thumb-07.svg",
    video: "",
    description: "Fast-cut delivery-first campaign built for paid social.",
    duration: "0:41",
    category: "Campaign",
    client: "Hospitality Industry",
    services: ["Filming", "Editing", "Motion Graphics"],
  },
  {
    id: 8,
    title: "Hotel Dining Experience",
    thumbnail: "/images/gym-content/thumb-08.svg",
    video: "",
    description: "Ambient walkthrough of a hotel's signature dining room.",
    duration: "1:22",
    category: "Walkthrough",
    client: "Hospitality Industry",
    services: ["Filming", "Drone", "Color Grading"],
  },
  {
    id: 9,
    title: "Dessert Commercial",
    thumbnail: "/images/gym-content/thumb-09.svg",
    video: "",
    description: "High-gloss dessert commercial shot for maximum craving.",
    duration: "0:29",
    category: "Commercial",
    client: "Hospitality Industry",
    services: ["Food Styling", "Filming", "Editing"],
  },
];

function SectionIntro({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="mx-auto mb-10 flex max-w-[1480px] flex-col gap-5 px-5 sm:px-8 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
      <div data-reveal className="max-w-4xl">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
          {eyebrow}
        </p>
        <h2 className="section-title text-balance">{title}</h2>
      </div>
      <p data-reveal className="max-w-md text-base leading-7 text-white/60">
        {copy}
      </p>
    </div>
  );
}

function ProjectHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 82]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.965]);

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
            Restaurant Content
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-6 max-w-3xl text-base leading-7 text-white/70 sm:text-lg lg:mt-8 lg:text-xl lg:leading-8"
          >
            Cinematic restaurant films, food storytelling and hospitality
            content that turns viewers into customers.
          </motion.p>
          <motion.div
            variants={fadeUp}
            custom={3}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button size="lg" asChild>
              <a href="#work">
                <Play size={18} fill="currentColor" />
                View projects
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
                src="/images/gym-content/hero-thumb.svg"
                alt="Restaurant Content project thumbnail"
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
                  <ChefHat size={27} />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
                  Hospitality Production
                </p>
                <h2 className="mt-3 text-4xl font-black uppercase leading-none text-white sm:text-5xl">
                  Fine Dining Visual System
                </h2>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="absolute -right-5 top-10 hidden h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-black/55 text-primary shadow-glow backdrop-blur-2xl sm:flex"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            <Flame size={32} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function ProjectInfo() {
  const items = [
    { label: "Client", value: "Hospitality Industry", icon: UserRound },
    { label: "Category", value: "Restaurant Marketing", icon: Film },
    {
      label: "Services",
      value: "Filming, Food Styling, Editing, Motion Graphics, Color Grading, Drone",
      icon: Layers3,
    },
    { label: "Year", value: "2026", icon: Calendar },
    { label: "Timeline", value: "3 Weeks", icon: Clock3 },
  ];

  return (
    <section className="relative z-10 px-5 pb-14 sm:px-8 lg:pb-20">
      <div className="absolute left-1/2 top-1/2 -z-20 h-[420px] w-[1300px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(255,90,0,0.18)_0%,rgba(255,90,0,0.07)_34%,transparent_72%)] blur-[120px] opacity-80" />
      <div className="cinema-panel mx-auto grid max-w-[1480px] gap-4 overflow-hidden rounded-[28px] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45),0_0_80px_rgba(255,77,18,0.08)] sm:p-5 md:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.label}
            data-reveal
            className="group min-w-0 rounded-xl border border-white/10 bg-white/[0.025] p-5 transition duration-500 hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow"
          >
            <item.icon
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
        ))}
      </div>
    </section>
  );
}

function VideoCard({
  video,
  onOpen,
}: {
  video: RestaurantVideo;
  onOpen: (video: RestaurantVideo) => void;
}) {
  return (
    <button
      data-reveal
      onClick={() => onOpen(video)}
      className="group cinema-panel min-w-0 overflow-hidden rounded-md text-left transition duration-500 hover:-translate-y-1 hover:border-primary/70 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
      aria-label={`Open ${video.title}`}
    >
      <div className="relative aspect-video overflow-hidden bg-black">
        <Image
          src={video.thumbnail}
          alt={`${video.title} thumbnail`}
          fill
          loading="lazy"
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/84 via-black/5 to-transparent" />
        <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-glow-strong transition duration-500 group-hover:scale-110 group-hover:bg-orange-600">
          <Play size={23} fill="currentColor" />
        </div>
        <div className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[0.66rem] font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-xl">
          {video.category}
        </div>
        <div className="absolute bottom-4 right-4 text-xs font-black uppercase tracking-[0.16em] text-white">
          {video.duration}
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <h3 className="text-xl font-black uppercase leading-tight text-white sm:text-2xl">
          {video.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/60">
          {video.description}
        </p>
      </div>
    </button>
  );
}

function VideoModal({
  videos,
  selected,
  onClose,
  onSelect,
}: {
  videos: RestaurantVideo[];
  selected: RestaurantVideo | null;
  onClose: () => void;
  onSelect: (video: RestaurantVideo) => void;
}) {
  const selectedIndex = selected
    ? videos.findIndex((video) => video.id === selected.id)
    : -1;

  useEffect(() => {
    if (!selected) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") {
        onSelect(videos[(selectedIndex - 1 + videos.length) % videos.length]);
      }
      if (event.key === "ArrowRight") {
        onSelect(videos[(selectedIndex + 1) % videos.length]);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, onSelect, selected, selectedIndex, videos]);

  if (!selected) return null;

  const previousVideo =
    videos[(selectedIndex - 1 + videos.length) % videos.length];
  const nextVideo = videos[(selectedIndex + 1) % videos.length];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/78 p-4 backdrop-blur-2xl sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={onClose}
      >
        <motion.div
          className="cinema-panel relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-md shadow-[0_24px_110px_rgba(0,0,0,0.78),0_0_90px_rgba(255,77,18,0.14)]"
          initial={{ y: 32, opacity: 0, scale: 0.96, filter: "blur(12px)" }}
          animate={{ y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ y: 18, opacity: 0, scale: 0.98, filter: "blur(10px)" }}
          transition={{ duration: 0.38, ease: revealEase }}
          onMouseDown={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.title} video player`}
        >
          <button
            onClick={onClose}
            className="magnetic-target absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/55 text-white transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
            aria-label="Close video modal"
          >
            <X size={20} />
          </button>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
            <div className="relative aspect-video min-h-[260px] overflow-hidden bg-black">
              {selected.video ? (
                <video
                  key={selected.id}
                  controls
                  autoPlay
                  preload="metadata"
                  poster={selected.thumbnail}
                  className="h-full w-full object-cover"
                >
                  <source src={selected.video} />
                </video>
              ) : (
                <>
                  <Image
                    src={selected.thumbnail}
                    alt={`${selected.title} video poster`}
                    fill
                    priority
                    sizes="(max-width: 1023px) 100vw, 70vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/35" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-glow-strong">
                      <Play size={31} fill="currentColor" />
                    </div>
                    <p className="max-w-sm px-6 text-xs font-black uppercase tracking-[0.22em] text-white/70">
                      CloudFront video placeholder
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.28em] text-primary">
                {selected.category} / {selected.duration}
              </p>
              <h3 className="text-3xl font-black uppercase leading-none text-white sm:text-4xl">
                {selected.title}
              </h3>
              <p className="mt-5 text-base leading-7 text-white/62">
                {selected.description} Built as part of a cinematic
                restaurant content system for stronger engagement, premium
                perception and reservation-ready campaign delivery.
              </p>

              <div className="mt-8 space-y-5 border-y border-white/10 py-6">
                <div>
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-primary">
                    Client
                  </p>
                  <p className="mt-2 font-black uppercase tracking-[0.1em] text-white">
                    {selected.client}
                  </p>
                </div>
                <div>
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.22em] text-primary">
                    Services used
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selected.services.map((service) => (
                      <span
                        key={service}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.14em] text-white/70"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onSelect(previousVideo)}
                  className="px-4"
                >
                  <ArrowLeft size={17} />
                  Previous
                </Button>
                <Button
                  size="lg"
                  onClick={() => onSelect(nextVideo)}
                  className="px-4"
                >
                  Next
                  <ArrowRight size={17} />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function VideoGallery() {
  const [selected, setSelected] = useState<RestaurantVideo | null>(null);

  return (
    <section id="work" className="relative scroll-mt-28 px-5 py-16 sm:px-8 lg:py-20">
      <SectionIntro
        eyebrow="Featured Videos"
        title="A curated collection of our cinematic restaurant productions."
        copy="Brand films, chef stories and food-forward social edits built to make every dish feel irresistible."
      />
      <div className="mx-auto grid max-w-[1480px] gap-5 md:grid-cols-2 lg:grid-cols-3">
        {restaurantVideos.map((video) => (
          <VideoCard key={video.id} video={video} onOpen={setSelected} />
        ))}
      </div>
      <VideoModal
        videos={restaurantVideos}
        selected={selected}
        onClose={() => setSelected(null)}
        onSelect={setSelected}
      />
    </section>
  );
}

function AboutProject() {
  const details = [
    {
      title: "Creative Direction",
      copy: "The visual direction leans into warmth, texture and appetite appeal. Each sequence is planned around plating, ambience and the story the restaurant wants to tell before a guest ever sits down.",
      icon: Target,
    },
    {
      title: "Food Cinematography",
      copy: "Macro detail shots, steam, sauce pours and controlled practical lighting turn every dish into a hero moment without losing the honesty of real ingredients.",
      icon: Flame,
    },
    {
      title: "Post Production",
      copy: "The edit is structured for craving first: fast hooks, clean pacing, sound-led transitions, rich color separation and motion graphics that support the menu instead of overpowering it.",
      icon: Sparkles,
    },
  ];

  return (
    <section id="about" className="relative scroll-mt-28 px-5 py-16 sm:px-8 lg:py-24">
      <div className="pointer-events-none absolute left-0 top-0 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-[120px]" />
      <div className="mx-auto grid max-w-[1480px] gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
        <div data-reveal className="lg:sticky lg:top-32">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
            About the project
          </p>
          <h2 className="section-title text-balance">About This Production</h2>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/60">
            This section will later contain final client-approved details. For
            now, it reflects the intended production approach for a premium
            restaurant content system.
          </p>
        </div>

        <div className="grid gap-5">
          {details.map((item) => (
            <article
              key={item.title}
              data-reveal
              className="cinema-panel group rounded-md p-6 transition duration-500 hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow sm:p-8"
            >
              <item.icon
                className="mb-8 text-white/55 transition duration-300 group-hover:text-primary"
                size={34}
              />
              <h3 className="text-3xl font-black uppercase leading-none text-white">
                {item.title}
              </h3>
              <p className="mt-5 text-base leading-7 text-white/62">
                {item.copy}
              </p>
            </article>
          ))}

          <article
            data-reveal
            className="cinema-panel overflow-hidden rounded-md p-6 sm:p-8"
          >
            <p className="mb-5 text-xs font-black uppercase tracking-[0.28em] text-primary">
              Marketing goals
            </p>
            <p className="text-2xl font-bold leading-tight text-white sm:text-4xl">
              Build instant appetite, make the restaurant feel like a
              destination, and turn food content into a reservation-driving
              asset across ads, reels, website sections and delivery apps.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const reasons = [
    {
      title: "Luxury Food Styling",
      copy: "Every plate is styled with intent so the food reads as premium in the first frame, not just the final cut.",
      icon: ChefHat,
    },
    {
      title: "Cinematic Lighting",
      copy: "Warm practical lighting and controlled highlights give each dish depth, texture and genuine appetite appeal.",
      icon: Flame,
    },
    {
      title: "Fast Social Delivery",
      copy: "Short-form edits are built and delivered on a rhythm that keeps restaurant feeds active and current.",
      icon: Layers3,
    },
    {
      title: "Story Driven Marketing",
      copy: "Chef stories, brand history and hospitality moments are woven in so content builds loyalty, not just views.",
      icon: Sparkles,
    },
  ];

  return (
    <section className="relative px-5 py-16 sm:px-8 lg:py-24">
      <div className="pointer-events-none absolute right-0 top-1/3 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-[120px]" />
      <SectionIntro
        eyebrow="Why Kroo"
        title="Why Restaurant Brands Choose Kroo"
        copy="A production approach built specifically around hospitality, food and the guests you're trying to reach."
      />
      <div className="mx-auto grid max-w-[1480px] gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map((reason) => (
          <article
            key={reason.title}
            data-reveal
            className="cinema-panel group rounded-md p-6 transition duration-500 hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow sm:p-7"
          >
            <reason.icon
              className="mb-7 text-white/55 transition duration-300 group-hover:text-primary"
              size={30}
            />
            <h3 className="text-lg font-black uppercase leading-tight text-white sm:text-xl">
              {reason.title}
            </h3>
            <p className="mt-4 text-sm leading-6 text-white/60">
              {reason.copy}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectCTA() {
  return (
    <section id="contact" className="relative scroll-mt-28 overflow-hidden px-5 py-20 sm:px-8 lg:py-28">
      <div className="absolute inset-x-0 bottom-0 h-80 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,77,18,0.3),transparent_66%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:linear-gradient(to_bottom,transparent,black_28%,black_74%,transparent)]" />
      <div
        data-reveal
        className="relative mx-auto max-w-[1480px] border-y border-white/10 py-16 text-center"
      >
        <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
          Start project
        </p>
        <h2 className="section-title mx-auto max-w-5xl text-balance">
          Let&apos;s Make{" "}
          <span className="whitespace-nowrap">People Hungry</span> Before
          They Visit.
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/64 sm:text-lg">
          Let&apos;s create cinematic food content that fills tables and
          builds a brand people crave.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <a href="mailto:team@krooproduction.com">
              Start Restaurant Project
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
            <span className="text-lg font-black uppercase tracking-[0.12em]">
              Kroo
            </span>
          </div>
          <p className="max-w-xs text-sm leading-6 text-white/50">
            Cinematic storytelling through powerful visuals and purposeful
            execution.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white">
            Quick links
          </h3>
          {["Home", "Work", "Team", "Services", "About", "Contact"].map(
            (item) => (
              <Link
                key={item}
                href={`/#${item.toLowerCase()}`}
                className="block rounded-sm py-1 text-sm text-white/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
              >
                {item}
              </Link>
            ),
          )}
        </div>
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white">
            Services
          </h3>
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
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white">
            Follow us
          </h3>
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
          <p className="mt-6 text-sm text-white/40">
            &copy; 2026 Kroo Production. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function RestaurantContentPage() {
  useLenis();
  useGsapReveal();
  useMagnetic();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020202] text-white">
      <Ambient />
      <CursorFollower />
      <SiteNav />
      <div className="relative z-10">
        <ProjectHero />
        <ProjectInfo />
        <VideoGallery />
        <AboutProject />
        <WhyChooseUs />
        <ProjectCTA />
        <ProjectFooter />
      </div>
    </main>
  );
}
