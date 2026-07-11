"use client";

import { motion } from "framer-motion";
import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Instagram, Linkedin, Youtube } from "lucide-react";
import { Ambient } from "@/components/ambient";
import { CursorFollower } from "@/components/cursor-follower";
import { SiteNav } from "@/components/site-nav";
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
      delay: i * 0.06,
      duration: 0.82,
      ease: revealEase,
    },
  }),
};

export type LegalIcon = ComponentType<{ size?: number; className?: string }>;

export type LegalList = { heading?: string; items: string[] };

export type LegalSection = {
  number: string;
  title: string;
  icon: LegalIcon;
  paragraphs?: string[];
  lists?: LegalList[];
};

export type LegalContactDetail = {
  label: string;
  value: string;
  href?: string;
  icon: LegalIcon;
};

type LegalPageLayoutProps = {
  breadcrumbLabel: string;
  heading: ReactNode;
  effectiveDate: string;
  intro: string;
  sections: LegalSection[];
  contactNumber: string;
  contactTitle?: string;
  contactDetails: LegalContactDetail[];
  contactNote?: string;
};

function LegalHero({
  breadcrumbLabel,
  heading,
  effectiveDate,
  intro,
}: Pick<LegalPageLayoutProps, "breadcrumbLabel" | "heading" | "effectiveDate" | "intro">) {
  return (
    <section className="relative scroll-mt-28 overflow-hidden px-5 pb-14 pt-32 sm:px-8 lg:px-5 lg:pb-20 lg:pt-40">
      <div className="pointer-events-none absolute right-[-16rem] top-10 h-[44rem] w-[44rem] rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_68%,transparent)]" />

      <div className="relative z-10 mx-auto max-w-[900px]">
        <motion.nav
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/50"
        >
          <Link
            href="/"
            className="rounded-sm text-white/50 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          >
            Home
          </Link>
          <ChevronRight size={13} className="text-white/30" />
          <span className="text-primary">{breadcrumbLabel}</span>
        </motion.nav>

        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={1}
          className="mb-5 text-xs font-black uppercase tracking-[0.48em] text-primary sm:text-sm"
        >
          Legal
        </motion.p>
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={2}
          className="headline text-balance"
        >
          {heading}
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={3}
          className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-white/50"
        >
          Effective Date: {effectiveDate}
        </motion.p>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={4}
          className="mt-8 max-w-2xl text-base leading-7 text-white/70 sm:text-lg lg:leading-8"
        >
          {intro}
        </motion.p>
      </div>
    </section>
  );
}

function LegalSections({ sections }: { sections: LegalSection[] }) {
  return (
    <section className="relative px-5 pb-8 sm:px-8">
      <div className="mx-auto max-w-[900px] space-y-5">
        {sections.map((section) => (
          <article
            key={section.number}
            data-reveal
            className="cinema-panel group rounded-md p-6 transition duration-500 hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs font-black tracking-[0.06em] text-primary">
                  {section.number}
                </span>
                <h2 className="text-2xl font-black uppercase leading-tight text-white sm:text-3xl">
                  {section.title}
                </h2>
              </div>
              <section.icon
                className="hidden shrink-0 text-white/40 transition duration-300 group-hover:text-primary sm:block"
                size={26}
              />
            </div>

            {section.paragraphs?.map((paragraph, index) => (
              <p
                key={index}
                className="mt-3 text-base leading-7 text-white/62 first:mt-0"
              >
                {paragraph}
              </p>
            ))}

            {section.lists?.map((list, listIndex) => (
              <div key={listIndex} className="mt-5 first:mt-5">
                {list.heading && (
                  <p className="mb-3 text-sm font-black uppercase tracking-[0.08em] text-white/75">
                    {list.heading}
                  </p>
                )}
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {list.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm leading-6 text-white/60"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}

function LegalContact({
  contactNumber,
  contactTitle = "Contact Us",
  contactDetails,
  contactNote,
}: Pick<
  LegalPageLayoutProps,
  "contactNumber" | "contactTitle" | "contactDetails" | "contactNote"
>) {
  return (
    <section className="relative px-5 py-8 sm:px-8 lg:py-12">
      <div className="mx-auto max-w-[900px]">
        <article
          data-reveal
          className="cinema-panel overflow-hidden rounded-md p-6 sm:p-8"
        >
          <div className="mb-6 flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs font-black tracking-[0.06em] text-primary">
              {contactNumber}
            </span>
            <h2 className="text-2xl font-black uppercase leading-tight text-white sm:text-3xl">
              {contactTitle}
            </h2>
          </div>

          <p className="mb-7 text-lg font-black uppercase tracking-[0.06em] text-white">
            Kroo Production
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {contactDetails.map((detail) => (
              <div
                key={detail.label}
                className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-white/[0.025] p-4"
              >
                <detail.icon className="mt-0.5 shrink-0 text-primary" size={18} />
                <div className="min-w-0">
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-white/45">
                    {detail.label}
                  </p>
                  {detail.href ? (
                    <a
                      href={detail.href}
                      className="mt-1 block break-words text-sm font-bold text-white/80 transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
                    >
                      {detail.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-bold text-white/80">
                      {detail.value}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {contactNote && (
            <p className="mt-7 text-xs leading-6 text-white/45">
              {contactNote}
            </p>
          )}
        </article>
      </div>
    </section>
  );
}

function LegalFooter() {
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

export function LegalPageLayout({
  breadcrumbLabel,
  heading,
  effectiveDate,
  intro,
  sections,
  contactNumber,
  contactTitle,
  contactDetails,
  contactNote,
}: LegalPageLayoutProps) {
  useLenis();
  useGsapReveal();
  useMagnetic();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020202] text-white">
      <Ambient />
      <CursorFollower />
      <SiteNav />
      <div className="relative z-10">
        <LegalHero
          breadcrumbLabel={breadcrumbLabel}
          heading={heading}
          effectiveDate={effectiveDate}
          intro={intro}
        />
        <LegalSections sections={sections} />
        <LegalContact
          contactNumber={contactNumber}
          contactTitle={contactTitle}
          contactDetails={contactDetails}
          contactNote={contactNote}
        />
        <LegalFooter />
      </div>
    </main>
  );
}
