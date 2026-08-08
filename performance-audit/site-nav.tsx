"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { MouseEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { navItems } from "@/lib/content";
import { cn } from "@/lib/utils";

function scrollToSection(event: MouseEvent<HTMLAnchorElement>, href: string) {
  event.preventDefault();

  const target = document.querySelector<HTMLElement>(href);
  if (!target) {
    window.location.href = `${window.location.pathname}${href}`;
    return;
  }

  target.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  window.history.replaceState(null, "", href);
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActive(`#${visible.target.id}`);
        }
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0.08, 0.2, 0.4, 0.65],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      className="fixed left-0 right-0 top-0 z-50 px-4 py-4 sm:px-6"
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.75, delay: 1.85, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav
        className={cn(
          "mx-auto flex max-w-[1520px] items-center justify-between gap-3 rounded-full border px-4 py-3 backdrop-blur-2xl transition-all duration-500 sm:px-5",
          scrolled
            ? "border-primary/25 bg-black/[0.72] shadow-[0_18px_70px_rgba(0,0,0,0.55),0_0_42px_rgba(255,77,18,0.12)]"
            : "border-white/10 bg-black/[0.34] shadow-2xl shadow-black/25",
        )}
      >
        <a
          href="#home"
          onClick={(event) => {
            scrollToSection(event, "#home");
            setOpen(false);
          }}
          className="group flex min-w-0 items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
          aria-label="Kroo Production home"
        >
          <span className="leading-none">
            <span className="block text-lg font-black uppercase tracking-[0.12em]">
              Kroo
            </span>
            <span className="block text-[0.58rem] font-bold uppercase tracking-[0.26em] text-white/60">
              Production
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => {
            const isActive = active === item.href;

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => scrollToSection(event, item.href)}
                className={cn(
                  "group relative rounded-full text-xs font-black uppercase tracking-[0.14em] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black",
                  isActive ? "text-white" : "text-white/[0.64] hover:text-white",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "absolute -bottom-2 left-0 h-px bg-primary shadow-[0_0_18px_rgba(255,77,18,0.9)] transition-all duration-300",
                    isActive ? "w-full" : "w-0 group-hover:w-full",
                  )}
                />
              </a>
            );
          })}
        </div>

        <div className="hidden sm:block">
          <Button asChild size="lg">
            <a
              href="#contact"
              onClick={(event) => scrollToSection(event, "#contact")}
            >
              Start a project <ArrowUpRight size={17} />
            </a>
          </Button>
        </div>

        <button
          className="magnetic-target inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black lg:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open ? (
        <motion.div
          className="mx-auto mt-3 max-w-[1520px] rounded-2xl border border-primary/20 bg-black/[0.88] p-3 shadow-[0_22px_80px_rgba(0,0,0,0.72),0_0_42px_rgba(255,77,18,0.13)] backdrop-blur-2xl lg:hidden"
          initial={{ y: -8, opacity: 0, filter: "blur(8px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(event) => {
                scrollToSection(event, item.href);
                setOpen(false);
              }}
              className={cn(
                "block rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.16em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                active === item.href
                  ? "bg-primary/[0.12] text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              {item.label}
            </a>
          ))}
        </motion.div>
      ) : null}
    </motion.header>
  );
}
