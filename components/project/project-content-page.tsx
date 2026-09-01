import type { LucideIcon } from "lucide-react";
import { Activity, ArrowUpRight, Instagram, Linkedin, Youtube } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Ambient } from "@/components/ambient";
import { CursorFollower } from "@/components/cursor-follower";
import { SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/content";

import { ProjectGallery, ProjectHero, ProjectPageEffects, type ProjectVideo } from "./ProjectClient";

export type { ProjectVideo };

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
  title,
  copy,
  titleClassName,
}: {
  title: ReactNode;
  copy: string;
  titleClassName?: string;
}) {
  return (
    <div className="mx-auto mb-10 w-full max-w-[1480px] lg:mb-14">
      <div data-reveal className="max-w-[1400px]">
        <h2
          className={`section-title text-balance [&_br]:hidden ${titleClassName ?? ""}`}
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
          }}
        >
          {title}
        </h2>
        <p className="mt-7 max-w-[760px] text-base leading-7 text-white/60">
          {copy}
        </p>
      </div>
    </div>
  );
}

function ProjectInfo({ items }: { items: ProjectInfoItem[] }) {
  return (
    <section className="relative z-10 px-5 pb-14 sm:px-8 lg:pb-20">
      <div className="absolute left-1/2 top-1/2 -z-20 h-[420px] w-[1300px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(255,90,0,0.18)_0%,rgba(255,90,0,0.07)_34%,transparent_72%)] blur-[120px] opacity-80" />
      <div className="cinema-panel mx-auto grid w-full max-w-[1480px] gap-4 overflow-hidden rounded-[28px] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.45),0_0_80px_rgba(255,77,18,0.08)] sm:p-5 md:grid-cols-2 lg:grid-cols-5">
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

function AboutProject({ about }: { about: ProjectPageConfig["about"] }) {
  return (
    <section id="about" className="relative scroll-mt-28 px-5 py-16 sm:px-8 lg:py-24">
      <div className="pointer-events-none absolute left-0 top-0 h-[34rem] w-[34rem] rounded-full bg-primary/10 blur-[120px]" />
      <div className="mx-auto w-full max-w-[1480px]">
        <div data-reveal className="max-w-[1280px]">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
            About the project
          </p>
          <h2 className="text-balance text-[clamp(3rem,4.2vw,4.7rem)] font-black uppercase leading-[0.94] tracking-tight">
            About This Production
          </h2>
          <p className="mt-7 max-w-[700px] text-base leading-7 text-white/60">{about.intro}</p>
        </div>

        <div className="mt-14 border-t border-white/10 pt-16">
          <div className="grid gap-6 lg:grid-cols-3">
            {about.details.map((item) => (
              <div key={item.title} className="mt-20 border-t border-white/10 pt-16">
                <article
                  data-reveal
                  className="cinema-panel flex min-h-[300px] flex-col rounded-md p-8"
                >
                  <item.icon
                    className="mb-8 text-white/55 transition duration-300 group-hover:text-primary"
                    size={34}
                  />
                  <h3 className="text-3xl font-black uppercase leading-none">{item.title}</h3>
                  <p className="mt-auto pt-6 text-base leading-7 text-white/62">{item.copy}</p>
                </article>
              </div>
            ))}

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
      <div data-reveal className="relative mx-auto w-full max-w-[1320px] border-y border-white/10 py-16 text-center">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-primary">
          Start project
        </p>
        <h2 className="section-title max-w-none text-balance">{content.title}</h2>
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
  const socialIcons = [Instagram, Youtube, Linkedin];

  return (
    <footer className="relative border-t border-white/10 px-5 py-10 sm:px-8">
      <div className="mx-auto grid w-full max-w-[1480px] gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_minmax(0,0.8fr)]">
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
            {socialIcons.map((Icon, index) => (
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
  const HeroIcon = config.hero.icon;
  const AccentIcon = config.hero.accentIcon ?? Activity;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020202] text-white">
      <Ambient />
      <CursorFollower />
      <SiteNav />
      <ProjectPageEffects />
      <div className="relative z-10">
        <ProjectHero
          title={config.title}
          description={config.description}
          thumbnail={config.hero.thumbnail}
          alt={config.hero.alt}
          label={config.hero.label}
          visualTitle={config.hero.visualTitle}
          featuredButtonLabel={config.featuredButtonLabel}
          heroIcon={<HeroIcon size={27} />}
          accentIcon={<AccentIcon size={32} />}
        />

        <section id="work" className="relative scroll-mt-28 overflow-visible px-5 py-16 sm:px-8 lg:py-20">
          <SectionIntro
            title={config.gallery.title}
            titleClassName="max-w-[1400px] text-[clamp(2.1rem,3vw,3.6rem)] leading-[0.95] tracking-tight"
            copy={config.gallery.copy}
          />
          <ProjectGallery videos={config.videos} />
        </section>

        <AboutProject about={config.about} />
        <ProjectCTA cta={config.cta} />
        <ProjectFooter />
      </div>
    </main>
  );
}