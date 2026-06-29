"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
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
import { useEffect, useRef, useState } from "react";
import { Ambient } from "@/components/ambient";
import { CursorFollower } from "@/components/cursor-follower";
import { Loader } from "@/components/loader";
import { KrooMark } from "@/components/scene/kroo-mark";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

function SplitText({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, index) => (
        <span className="word-mask mr-[0.18em]" key={`${word}-${index}`}>
          <motion.span variants={fadeUp} custom={index}>
            {word}
          </motion.span>
        </span>
      ))}
    </>
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
    className="relative min-h-[100svh] scroll-mt-28 overflow-hidden px-5 pb-16 pt-28 sm:px-8 lg:pt-36 xl:pt-40"
    >
      <div className="pointer-events-none absolute right-[-16rem] top-16 h-[42rem] w-[42rem] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-72 bg-[radial-gradient(ellipse_at_72%_100%,rgba(255,77,18,0.44),transparent_64%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_68%,transparent)]" />

      <div
       className="
       mx-auto
       grid
       max-w-[1480px]
       items-center
       grid-cols-1
       gap-10
       lg:min-h-[calc(100vh-8.5rem)]
       lg:grid-cols-[minmax(0,0.98fr)_minmax(280px,0.82fr)]
       lg:gap-6
       xl:gap-12
       "
      >
        <motion.div
          className="relative z-10 min-w-0 max-w-none"
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
          <h1 className="headline text-balance">
            <SplitText text="Stories to Life." />
          </h1>
          <motion.p
            variants={fadeUp}
            custom={4}
            className="mt-7 max-w-2xl text-base leading-7 text-white/70 sm:text-lg lg:text-xl lg:leading-8"
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
              <div
                key={item.label}
                className="cinema-panel min-h-[110px] min-w-0 rounded-xl p-4 text-white/70"
              >
                <item.icon className="mb-4 text-primary" size={20} />
                <p className="text-xs font-bold uppercase tracking-[0.12em] break-words">
                  {item.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="relative z-10 flex min-w-0 items-center justify-center"
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
      <div className="absolute left-1/2 top-1/2 -z-20 h-[560px] w-[1400px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(255,90,0,0.18)_0%,rgba(255,90,0,0.08)_30%,rgba(255,90,0,0.03)_55%,transparent_80%)] blur-[120px] opacity-70" />
      <div className="absolute left-1/2 top-1/2 -z-20 h-[560px] w-[1400px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] opacity-40" />
      <div className="absolute left-1/2 top-1/2 -z-20 h-[620px] w-[1520px] -translate-x-1/2 -translate-y-1/2 rounded-[32px] bg-black/10 opacity-25 shadow-[inset_0_0_140px_rgba(0,0,0,0.6)]" />
      <div className="relative z-20 mx-auto grid max-w-[1480px] translate-y-[-40px] grid-flow-col auto-cols-[minmax(min(82vw,320px),1fr)] gap-5 overflow-x-auto scroll-smooth rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),rgba(10,10,10,0.75)] px-5 py-10 shadow-[0_20px_80px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.04),0_0_80px_rgba(255,77,18,0.08)] snap-x snap-mandatory touch-pan-x hide-scrollbar backdrop-blur-xl sm:px-8 sm:py-12 lg:grid-flow-row lg:grid-cols-4 lg:auto-cols-auto lg:overflow-visible lg:snap-none xl:px-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            data-reveal
            className="relative min-h-40 min-w-0 snap-start border border-transparent bg-transparent p-5 transition duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-orange-500 sm:p-7"
          >
            <stat.icon className="mb-7 text-primary" size={24} />
            <p className="text-5xl font-black leading-none text-white">
              <CountUp value={stat.value} suffix={stat.suffix} />
            </p>
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.14em] text-white/60">
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
    <section id="work" className="relative scroll-mt-28 px-5 py-16 sm:px-8 lg:py-20">
      <SectionIntro
        eyebrow="Showreel"
        title="A glimpse of what we do best."
        copy="Cinematic campaign systems, high-impact launch films, and motion-led storytelling built to hold attention."
      />
      <div
        data-reveal
        data-scale-on-scroll
        className="group mx-auto max-w-[1480px] overflow-hidden rounded-md border border-white/10 bg-black shadow-2xl shadow-primary/10"
      >
        <div className="relative aspect-[16/9] min-h-[320px] overflow-hidden sm:min-h-[420px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_35%,rgba(255,255,255,0.2),transparent_18%),linear-gradient(115deg,rgba(255,77,18,0.86),rgba(19,19,19,0.86)_38%,rgba(0,0,0,0.97)_68%),linear-gradient(15deg,transparent_48%,rgba(255,255,255,0.2)_49%,transparent_51%)] transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/75 shadow-[0_0_46px_rgba(255,255,255,0.65)]" />
          <div className="absolute left-[12%] top-[22%] h-[48%] w-[44%] rounded-md border border-white/10 bg-black/50 shadow-2xl shadow-black/80 backdrop-blur-sm sm:left-[16%] sm:w-[38%]">
            <div className="absolute -right-16 top-1/3 h-20 w-48 rounded-full border border-white/20" />
            <div className="absolute bottom-8 left-8 h-20 w-20 rounded-full border-[16px] border-zinc-900 shadow-inner sm:bottom-10 sm:left-10 sm:h-24 sm:w-24 sm:border-[18px]" />
            <div className="absolute right-8 top-10 h-14 w-24 rounded bg-zinc-950 sm:h-16 sm:w-28" />
            <div className="absolute left-8 top-8 text-3xl font-black tracking-[0.2em] text-white/20 sm:left-10 sm:text-4xl">
              RED
            </div>
          </div>
          <button
            className="magnetic-target absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-glow-strong transition duration-500 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black active:scale-95 sm:h-24 sm:w-24"
            aria-label="Play showreel"
          >
            <Play size={32} fill="currentColor" />
          </button>
          <div className="absolute inset-x-5 bottom-6 flex items-center gap-3 text-xs font-bold text-white sm:inset-x-8 sm:bottom-8 sm:gap-4 sm:text-sm">
            <Play size={18} fill="currentColor" />
            <span>00:00</span>
            <div className="h-px flex-1 bg-white" />
            <span>01:30</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoStrip() {
  return (
    <section className="relative overflow-hidden px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-[1480px]">
        <p
          data-reveal
          className="mb-6 text-sm font-black uppercase tracking-[0.18em] text-white/80"
        >
          Trusted by brands that inspire
        </p>
        <div className="relative overflow-hidden border-y border-white/10 py-4">
          <div className="flex w-max animate-marquee gap-4">
            {[...brandMarks, ...brandMarks].map((logo, index) => (
              <div
                key={`${logo}-${index}`}
                className="flex h-24 w-44 items-center justify-center rounded-md border border-white/10 bg-white/[0.025] text-xl font-black tracking-[0.12em] text-white/40 grayscale transition duration-300 hover:border-primary/60 hover:text-white hover:shadow-glow"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FounderPortrait({ tone }: { tone: string }) {
  return (
    <div className="relative h-72 overflow-hidden rounded-sm bg-neutral-950">
      <div className={cn("absolute inset-0 bg-gradient-to-b opacity-70", tone)} />
      <div className="absolute left-1/2 top-12 h-24 w-24 -translate-x-1/2 rounded-full bg-gradient-to-b from-white/80 to-zinc-500 shadow-[inset_0_-20px_30px_rgba(0,0,0,0.5)]" />
      <div className="absolute left-1/2 top-28 h-44 w-40 -translate-x-1/2 rounded-t-[70px] bg-gradient-to-b from-zinc-700 to-black" />
      <div className="absolute left-1/2 top-20 h-4 w-16 -translate-x-1/2 rounded-full bg-black/60" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}

function FoundersSection() {
  return (
    <section id="team" className="scroll-mt-28 px-5 py-16 sm:px-8 lg:py-20">
      <SectionIntro
        eyebrow="Meet the founders"
        title="Creative minds. Strategic thinkers. Storytellers."
        copy="A leadership team built around cinematic taste, production discipline, and modern distribution craft."
      />
      <div className="mx-auto grid max-w-[1480px] grid-flow-col auto-cols-[minmax(min(82vw,320px),1fr)] gap-5 overflow-x-auto scroll-smooth pb-3 snap-x snap-mandatory touch-pan-x hide-scrollbar xl:grid-flow-row xl:grid-cols-4 xl:auto-cols-auto xl:overflow-visible xl:snap-none">
        {founders.map((founder) => (
          <article
            key={founder.name}
            data-reveal
            className="group cinema-panel min-w-0 snap-start overflow-hidden rounded-md p-3 transition duration-500 hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow"
          >
            <div className="overflow-hidden rounded-sm">
            <div className="transition duration-700 group-hover:scale-105">
               {founder.image ? (
            <div className="relative aspect-[4/5] w-full">
            <Image
                src={founder.image}
                alt={founder.name}
                fill
                sizes="(max-width: 1280px) 82vw, 25vw"
                className="object-cover"
              />
            </div>
              ) : (
            <FounderPortrait tone={founder.tone} />
             )}
          </div>
          </div>
            <div className="p-4">
              <h3 className="text-lg font-black uppercase tracking-[0.08em] text-primary">
                {founder.name}
              </h3>
              <p className="mt-1 text-sm font-bold uppercase tracking-[0.16em] text-white/60">
                {founder.role}
              </p>
              <div className="mt-5 flex gap-3 text-white/60">
                <a href="#" aria-label={`${founder.name} LinkedIn`} className="rounded-full transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black">
                  <Linkedin size={18} />
                </a>
                <a href="#" aria-label={`${founder.name} email`} className="rounded-full transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black">
                  <Mail size={18} />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="scroll-mt-28 px-5 py-16 sm:px-8 lg:py-20">
      <SectionIntro
        eyebrow="What we do"
        title="End-to-end production, under one roof."
        copy="From creative strategy to delivery masters, every frame is treated like a brand asset with cultural weight."
      />
      <div className="mx-auto grid max-w-[1480px] grid-flow-col auto-cols-[minmax(min(82vw,320px),1fr)] gap-5 overflow-x-auto scroll-smooth pb-3 snap-x snap-mandatory touch-pan-x hide-scrollbar md:grid-flow-row md:grid-cols-3 md:auto-cols-auto md:overflow-visible md:snap-none">
        {services.map((service, index) => (
          <article
            key={service.title}
            data-reveal
            className={cn(
              "group cinema-panel min-h-72 min-w-0 snap-start overflow-hidden rounded-md p-6 transition duration-500 will-change-transform hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow sm:p-7",
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
  const marqueeProjects = [
    ...projects,
    ...projects,
    ...projects,
  ];

  return (
    <section className="scroll-mt-28 overflow-hidden py-20">

      {/* Top Marquee */}

      <div className="mb-10 overflow-hidden border-y border-primary/20 py-4">
        <div className="animate-project-marquee whitespace-nowrap text-sm font-black uppercase tracking-[0.35em] text-primary">
          FEATURED PROJECTS • MUSIC VIDEOS • COMMERCIALS • BRAND FILMS • REELS •
          FEATURED PROJECTS • MUSIC VIDEOS • COMMERCIALS • BRAND FILMS • REELS •
          FEATURED PROJECTS • MUSIC VIDEOS • COMMERCIALS • BRAND FILMS • REELS •
        </div>
      </div>

      <SectionIntro
        eyebrow="Featured Projects"
        title="Campaign worlds built for attention."
        copy="A selection of visual systems designed to travel from cinema screens to thumb-stopping social edits."
      />

      <div className="overflow-hidden">
        <div className="animate-project-marquee flex w-max gap-4 pb-6 sm:gap-6">
          {marqueeProjects.map((project, index) => (
            <article
              key={`${project.title}-${index}`}
              className="group relative w-[min(82vw,700px)] flex-none overflow-hidden rounded-md border border-white/10 bg-black"
            >
              <div
                className={cn(
                  "relative aspect-[1.15] overflow-hidden bg-gradient-to-br transition duration-700 group-hover:scale-[1.025]",
                  project.color
                )}
              >
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
                </div>

                <p className="absolute right-5 top-16 text-2xl font-black text-white/20 sm:right-8 sm:top-8 sm:text-4xl">
                  {project.metric}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
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
      <div className="mx-auto grid max-w-[1480px] gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
        <div data-reveal>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
            Client response
          </p>
          <h2 className="section-title">Trusted when the frame matters.</h2>
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

  return (
    <section id="contact" className="relative scroll-mt-28 px-5 py-20 sm:px-8 lg:py-24">
      <div className="absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,77,18,0.24),transparent_66%)]" />
      <div className="relative mx-auto grid max-w-[1480px] gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div data-reveal>
          <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
            Start project
          </p>
          <h2 className="section-title">Let the next frame begin.</h2>
          <div className="mt-10 space-y-5 text-white/70">
            <a className="flex min-w-0 items-center gap-4 rounded-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black" href="mailto:hello@krooproduction.com">
              <Mail className="shrink-0 text-primary" /> <span className="min-w-0 break-words">hello@krooproduction.com</span>
            </a>
            <a className="flex min-w-0 items-center gap-4 rounded-sm transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black" href="tel:+919876543210">
              <Phone className="shrink-0 text-primary" /> <span>+91 98765 43210</span>
            </a>
            <p className="flex min-w-0 items-center gap-4">
              <MapPin className="shrink-0 text-primary" /> <span>Kolkata, India</span>
            </p>
          </div>
          <div className="mt-8 flex gap-3">
            {[Instagram, Youtube, Facebook, Linkedin].map((Icon, index) => (
              <a
                key={index}
                href="#"
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
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Name" aria-label="Name" required />
            <Input type="email" placeholder="Email" aria-label="Email" required />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input placeholder="Company" aria-label="Company" />
            <Input placeholder="Budget range" aria-label="Budget range" />
          </div>
          <Textarea className="mt-4" placeholder="Project brief" aria-label="Project brief" required />
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex min-w-0 items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-white/70">
              <CheckCircle2 size={16} className="shrink-0 text-primary" />
              {sent ? "Brief received. We will reply shortly." : "Response within 24 hours."}
            </p>
            <Button type="submit" size="lg" className="min-w-[240px] w-full sm:w-auto">
              START YOUR PROJECT
              <ArrowUpRight size={17} />
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-white/10 px-5 py-10 sm:px-8">
      <div className="mx-auto grid max-w-[1480px] gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span className="text-4xl font-black text-primary">K</span>
            <span className="text-lg font-black uppercase tracking-[0.12em]">Kroo</span>
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
          {["Home", "Work", "Services", "Team", "About", "Contact"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="block rounded-sm py-1 text-sm text-white/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black">
              {item}
            </a>
          ))}
        </div>
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-white">
            Services
          </h3>
          {services.map((service) => (
            <a key={service.title} href="#services" className="block rounded-sm py-1 text-sm text-white/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black">
              {service.title}
            </a>
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
