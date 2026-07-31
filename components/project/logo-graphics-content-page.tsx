"use client";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Clock3,
  PenTool,
  Film,
  Layers3,
  Play,
  Sparkles,
  Target,
  UserRound,
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
import { logoGraphicsVideos } from "../../lib/logo-graphics-videos";
import type { LogoGraphicsVideo } from "../../lib/logo-graphics-videos";

function SectionIntro({
  eyebrow,
  title,
  copy,
  titleClassName,
}: {
  eyebrow: string;
  title: React.ReactNode;
  copy: string;
  titleClassName?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-[1480px] px-5 sm:px-8 lg:mb-14">
  <div data-reveal className="max-w-[1100px]">
    <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
      {eyebrow}
    </p>

    <h2 className={`section-title ${titleClassName ?? ""}`}>
      {title}
    </h2>

    <p className="mt-8 max-w-[760px] text-base leading-7 text-white/60">
      {copy}
    </p>
  </div>
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
            Logo & Graphics
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-6 max-w-3xl text-base leading-7 text-white/70 sm:text-lg lg:mt-8 lg:text-xl lg:leading-8"
          >
            Premium motion graphics and logo animation content created for
            brands, agencies and product launches. Every reveal is designed to
            increase engagement, brand value and recall.
          </motion.p>
          <motion.div
            variants={fadeUp}
            custom={3}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button size="lg" asChild>
              <a href="#work">
                <Play size={18} fill="currentColor" />
                Featured videos
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
                src="/images/logo-graphics/hero-thumb.svg"
                alt="Logo & Graphics project thumbnail"
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
                  <PenTool size={27} />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
                  Motion Production
                </p>
                <h2 className="mt-3 text-4xl font-black uppercase leading-none text-white sm:text-5xl">
                  Brand Visual System
                </h2>
              </div>
            </div>
          </motion.div>
          <motion.div
            className="absolute -right-5 top-10 hidden h-24 w-24 items-center justify-center rounded-full border border-primary/30 bg-black/55 text-primary shadow-glow backdrop-blur-2xl sm:flex"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            <Activity size={32} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function ProjectInfo() {
  const items = [
    { label: "Client", value: "Emerging Brands", icon: UserRound },
    { label: "Category", value: "Motion Production", icon: Film },
    {
      label: "Services",
      value: "Design, Animation, Editing, Sound Design",
      icon: Layers3,
    },
    { label: "Year", value: "2026", icon: Calendar },
    { label: "Duration", value: "2 Months", icon: Clock3 },
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
  isActive,
  onSelect,
}: {
  video: LogoGraphicsVideo;
  isActive: boolean;
  onSelect: (video: LogoGraphicsVideo | null) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const toggle = () => {
    onSelect(isActive ? null : video);
  };

  return (
    <article
      data-reveal
      className={cn(
        "group cinema-panel flex min-w-0 flex-col overflow-hidden rounded-md border border-transparent transition-colors duration-500 hover:border-primary/70 hover:shadow-glow",
        isActive && "border-primary/80 shadow-glow-strong",
      )}
    >
      {/* Media box: fixed vertical aspect for every card, playing or not — never resizes.
          3:4 instead of 9:16 so the reel reads as a preview, not a fullscreen phone mockup. */}
      <div
        className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-t-md bg-black"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Thumbnail layer */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500 ease-out",
            isActive ? "pointer-events-none opacity-0" : "opacity-100",
          )}
        >
          <Image
            src={video.thumbnail}
            alt={`${video.title} thumbnail`}
            fill
            loading="lazy"
            sizes="(max-width: 767px) 33vw, (max-width: 1023px) 33vw, 25vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/84 via-black/5 to-transparent" />
          <button
            type="button"
            onClick={toggle}
            aria-label={`Play ${video.title}`}
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-glow-strong transition duration-500 group-hover:scale-110 group-hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          >
            <Play size={23} fill="currentColor" />
          </button>
        </div>

        {/* Video layer — crossfades in over the thumbnail, same box, same size */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500 ease-out",
            isActive ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          {isActive && (
            <video
              key={video.id}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={video.thumbnail}
              controls={hovered}
              className="h-full w-full object-cover"
            >
              <source src={video.video} type="video/mp4" />
            </video>
          )}
        </div>
      </div>

      {/* Info section: identical height and content for every card, always.
          Title is clamped to 1 line so varying title lengths can never change card height. */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isActive}
        className="w-full flex-1 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black sm:p-5"
      >
        <h3 className="line-clamp-1 text-xl font-black uppercase leading-tight text-white sm:text-2xl">
          {video.title}
        </h3>
        <p className="mt-1.5 text-xs font-black uppercase tracking-[0.2em] text-primary">
          {video.category} • {video.duration}
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/60">
          {video.description}
        </p>
      </button>
    </article>
  );
}

function VideoGallery() {
  const [selected, setSelected] = useState<LogoGraphicsVideo | null>(null);

  return (
    <section id="work" className="relative scroll-mt-28 px-2 py-16 sm:px-8 lg:py-20">
     <SectionIntro
      eyebrow="Featured Videos"
      title={
      <>
      A CURATED COLLECTION OF OUR
      <br />
      CINEMATIC MOTION PRODUCTIONS
      </>
      }
  titleClassName="max-w-[1100px] text-[clamp(2.4rem,3.6vw,4.2rem)] leading-[0.92]"
  copy="Logo reveals, brand identity animations and motion graphics reels built with rhythm, contrast and performance-led intent."
/>
      <div className="mx-auto grid max-w-[1480px] grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {logoGraphicsVideos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            isActive={selected?.id === video.id}
            onSelect={setSelected}
          />
        ))}
      </div>
    </section>
  );
}

function AboutProject() {
  const details = [
    {
      title: "Creative Direction",
      copy: "The visual direction leans into disciplined typography, premium contrast and sharp brand recall. Each sequence is planned around the mark and the commercial message behind the brand.",
      icon: Target,
    },
    {
      title: "Camera And Lighting",
      copy: "Dynamic camera moves, locked-off reveal frames and controlled lighting create a polished motion graphics piece without losing the precision of the design.",
      icon: Film,
    },
    {
      title: "Post Workflow",
      copy: "The edit is structured for retention first: fast hooks, clean pacing, sound-led transitions, precise color separation and motion graphics that support the brand instead of overpowering it.",
      icon: Sparkles,
    },
  ];

  return (
    <section id="about" className="relative scroll-mt-28 px-5 py-16 sm:px-8 lg:py-24">
      <div className="pointer-events-none absolute left-0 top-0 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-[120px]" />
      <div className="mx-auto max-w-[1480px]">
        <div data-reveal className="max-w-[1660px]">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
            About the project
          </p>
          <h2 className="text-[clamp(3.6rem,4.8vw,5rem)] font-black uppercase leading-[0.92] tracking-tight">About This Production</h2>
          <p className="mt-7 max-w-[700px] text-base leading-7 text-white/60">
           A cinematic content system designed to position the brand as a premium
            visual identity through strategic storytelling, disciplined
            production, and high-impact visual execution.
          </p>
        </div>

        <div className="mt-14 border-t border-white/10 pt-16">
          <div className="grid gap-6 lg:grid-cols-3">
          {details.map((item) => (
            <div className="mt-20 border-t border-white/10 pt-16">
              <article
                data-reveal
                className="cinema-panel flex min-h-[300px] flex-col rounded-md p-8"
              >
              <item.icon
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
          ))}

          <article
            data-reveal
            className="cinema-panel lg:col-span-3 rounded-md p-10 py-7">
            <p className="mb-5 text-xs font-black uppercase tracking-[0.28em] text-primary">
              Marketing goals
            </p>
            <p className="max-w-full text-[clamp(1.9rem,2.6vw,2.8rem)] font-black leading-[1.12] tracking-tight text-white">
              Build instant credibility, make every reveal feel aspirational,
            <br />
              and turn brand content into a conversion asset across ads, reels,
              website sections and sales conversations.
            </p>
          </article>
        </div>
        </div>
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
        className="relative mx-auto max-w-[1320px] border-y border-white/10 py-16 text-center"
      >
        <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
          Start project
        </p>
        <h2 className="section-title max-w-none whitespace-nowrap">
          Ready To Build Your Brand?
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/64 sm:text-lg">
          Let&apos;s create cinematic content that makes your business
          impossible to ignore.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <a href="mailto:team@krooproduction.com">
              Start a Project
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

export default function LogoGraphicsContentPage() {
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
        <ProjectCTA />
        <ProjectFooter />
      </div>
    </main>
  );
}