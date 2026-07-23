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

import type { ReactNode } from "react";

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
    className="relative min-h-[30svh] scroll-mt-28 overflow-hidden px-5 pb-16 pt-28 sm:px-8 lg:pt-36 xl:pt-40"
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
          className="relative z-10 min-w-0 order-2 lg:order-1"
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
          <h1 className="
              leading-[0.96]
              font-black
              tracking-tight
              max-w-[1550px]
              text-[clamp(3rem,3vw,1rem)] ">
            <>
              IF YOU'RE HERE TO HIRE US
          <br />
          <span>—WELCOME.</span>
          <br />
          <br />
              IF YOU'RE HERE TO COPY US
          <br />
          <span>—GOOD LUCK.</span>
          </>
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
      <div className="absolute left-1/2 top-1/2 -z-20 h-[560px] w-[1400px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(255,90,0,0.18)_0%,rgba(255,90,0,0.08)_30%,rgba(255,90,0,0.03)_55%,transparent_80%)] blur-[120px] opacity-70" />
      <div className="absolute left-1/2 top-1/2 -z-20 h-[560px] w-[1400px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] opacity-40" />
      <div className="absolute left-1/2 top-1/2 -z-20 h-[620px] w-[1520px] -translate-x-1/2 -translate-y-1/2 rounded-[32px] bg-black/10 opacity-25 shadow-[inset_0_0_140px_rgba(0,0,0,0.6)]" />
      <div className="relative z-20 mx-auto grid max-w-[1480px] translate-y-[-40px] grid-cols-4 gap-4 rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent),rgba(10,10,10,0.75)] px-5 py-8 shadow-[0_20px_80px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.04),0_0_80px_rgba(255,77,18,0.08)] backdrop-blur-xl sm:px-8 sm:py-10 lg:grid-cols-4 xl:px-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            data-reveal
            className="relative min-h-[96px] border border-transparent bg-transparent p-2.5 transition duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-orange-500 sm:min-h-40 sm:p-7"
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
    <section id="work" className="relative scroll-mt-48 px-2 py-6 sm:px-30 lg:py-50">
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
            poster=""
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
  /*return (
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
}*/

function FounderPortrait({ tone }: { tone: string }) {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm bg-neutral-950 lg:aspect-auto lg:h-72">
      <div className={cn("absolute inset-0 bg-gradient-to-b opacity-70", tone)} />
      <div className="absolute left-1/2 top-[37px] h-[75px] w-[75px] -translate-x-1/2 rounded-full bg-gradient-to-b from-white/80 to-zinc-500 shadow-[inset_0_-20px_30px_rgba(0,0,0,0.5)] lg:top-12 lg:h-24 lg:w-24" />
      <div className="absolute left-1/2 top-[87px] h-[137px] w-[125px] -translate-x-1/2 rounded-t-[55px] bg-gradient-to-b from-zinc-700 to-black lg:top-28 lg:h-44 lg:w-40 lg:rounded-t-[70px]" />
      <div className="absolute left-1/2 top-[62px] h-3 w-12 -translate-x-1/2 rounded-full bg-black/60 lg:top-20 lg:h-4 lg:w-16" />
      <div className="absolute inset-x-0 bottom-0 h-[88px] bg-gradient-to-t from-black to-transparent lg:h-28" />
    </div>
  );
}

function FoundersSection() {
  return (
    <section id="team" className="flex scroll-mt-28 flex-col px-4 py-16 sm:px-8 lg:block lg:py-20">
     <div className="mx-auto mb-10 w-full px-0 lg:mb-14 lg:px-8" style={{ maxWidth: "1980px" }}>
      <div data-reveal>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.32em] text-primary">
          Meet the founders
        </p>
        <h2 className="section-title max-w-[1200px] text-[clamp(2.8rem,4vw,4.8rem)]">
            GOOD LUCK TO YOUR COMPETITORS.
        <br />
            YOU FOUND US FIRST.
        </h2>
        <p className="mt-6 max-w-xl text-base leading-7 text-white/60">
            A leadership team built around cinematic taste, production discipline, and modern distribution craft.
        </p>
        </div>
      </div>
      <div className="mx-auto grid w-full max-w-none grid-cols-2 gap-[14px] pb-3 md:grid-cols-2 lg:max-w-[1480px] lg:grid-cols-4 lg:gap-5">
        {founders.map((founder) => (
          <article
            key={founder.name}
            data-reveal
            className="group cinema-panel aspect-[3/4.7] w-full overflow-hidden rounded-md p-2.5 transition duration-500 hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow lg:aspect-auto lg:p-3"
            style={{
              width: "100%",
              minWidth: 0,
              maxWidth: "none",
              height: "auto",
              boxSizing: "border-box",
            }}
          >
            <div className="overflow-hidden rounded-sm">
            <div className="transition duration-700 group-hover:scale-105">
               {founder.image ? (
            <div className="w-full">
            <Image
                src={founder.image}
                alt={founder.name}
                width={600}
                height={800}
                sizes="(max-width: 768px) 100vw,(max-width: 1280px) 50vw,25vw"
                className="aspect-[3/4] h-auto w-full object-cover"
              />
            </div>
              ) : (
            <FounderPortrait tone={founder.tone} />
             )}
          </div>
          </div>
            <div className="p-3 lg:p-4">
              <h3 className="text-[13px] font-black uppercase tracking-[0.08em] text-primary sm:text-base lg:text-lg">
                {founder.name}
              </h3>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60 sm:text-xs lg:text-sm">
                {founder.role}
              </p>
              <div className="mt-4 grid w-fit grid-cols-2 gap-2.5 text-white/60 lg:mt-5 lg:gap-3">
                <a href="#" aria-label={`${founder.name} LinkedIn`} className="rounded-full transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black">
                  <Linkedin className="size-4 lg:size-[18px]" />
                </a>
                <a href="#" aria-label={`${founder.name} email`} className="rounded-full transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black">
                  <Mail className="size-4 lg:size-[18px]" />
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
          FEATURED PROJECTS • GYM COMMERCIALS • PRODUCT ADS • BRAND FILMS • REELS •
          FEATURED PROJECTS • GYM COMMERCIALS • PRODUCT ADS • BRAND FILMS • REELS •
          FEATURED PROJECTS • GYM COMMERCIALS • PRODUCT ADS • BRAND FILMS • REELS •
        </div>
      </div>

    {/* ProjectsSection */}
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
      <div className="overflow-hidden">
        <div className="animate-project-marquee flex w-max gap-4 pb-6 sm:gap-6">
          {marqueeProjects.map((project, index) => (
            <article
              key={`${project.title}-${index}`}
              className="group relative w-[min(82vw,700px)] flex-none overflow-hidden rounded-md border border-white/10 bg-black"
            >
              <div className="relative aspect-[1.15] overflow-hidden">
                <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(max-width:768px) 100vw, 700px"
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
      <div className="mx-auto max-w-[1480px]">
        <div data-reveal className="mb-10 lg:mb-14">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
         Client response
        </p>
        <h2 className="section-title max-w-[1200px]">
          OUR WORK SPEAKS.
        <br />
          THEY CONFIRM.
        </h2>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center">
    <div /> {/* keeps card aligned right if you want the two-col ratio preserved below the heading, or delete this div and let the card span full width */}
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
            <div className="grid grid-cols-3 gap-6">
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
