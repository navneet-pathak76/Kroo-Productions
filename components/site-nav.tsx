"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDeviceCapability } from "@/hooks/use-device-capability";
import { navItems } from "@/lib/content";
import { cn } from "@/lib/utils";

// The "Home" nav item is the only item that must ever leave the current
// page. On the homepage itself it keeps the existing smooth-scroll-to-top
// behavior (via scrollToSection below); on every other route it must do a
// real Next.js navigation back to "/" instead of appending "#home" to the
// current pathname.
const HOME_HREF = "#home";

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
  const capability = useDeviceCapability();
  const pathname = usePathname();
  const isOnHomepage = pathname === "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#home");
  const scrolledRef = useRef(false);
  const reduceEffects =
    capability.reducedMotion ||
    capability.performanceTier === "LOW" ||
    capability.pointer === "coarse";

  /**
   * HIDE-ON-SCROLL-DOWN. No amount of header opacity/background fixing
   * can prevent a fixed header from being mid-collision with SOME piece
   * of scrolling content at SOME scroll offset — that's inherent to
   * "content passes underneath a fixed overlay", and screenshots kept
   * showing it (most visibly, the hero's CTA row half-behind the header)
   * regardless of how solid the header's own background was made. The
   * actual fix is not to be sitting there to collide with in the first
   * place: the header slides out of view the moment the user scrolls
   * down past the very top, and slides back the moment they scroll up
   * (or land back near the top) — so it's never overlapping content
   * mid-transition, and reappears instantly whenever they want the nav.
   */
  const [headerHidden, setHeaderHidden] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const headerHiddenRef = useRef(false);
  const lastScrollY = useRef(0);
  const openRef = useRef(open);
  openRef.current = open;

  // Force the header visible whenever the mobile menu is opened — no
  // reason to let it be mid-hide (or hide while it's open) since the
  // menu itself lives inside this header.
  useEffect(() => {
    if (open) {
      headerHiddenRef.current = false;
      setHeaderHidden(false);
    }
  }, [open]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const next = y > 24;
        if (next !== scrolledRef.current) {
          scrolledRef.current = next;
          setScrolled(next);
        }

        // Ignore sub-pixel/momentum jitter so tiny scroll-bounce deltas
        // (common on iOS Safari's rubber-band scroll) don't flicker the
        // header in and out.
        const delta = y - lastScrollY.current;
        if (Math.abs(delta) > 6 || y < 40) {
          const shouldHide = !openRef.current && delta > 0 && y > 60;
          const shouldShow = delta < 0 || y < 40;
          if (shouldHide && !headerHiddenRef.current) {
            headerHiddenRef.current = true;
            setHeaderHidden(true);
          } else if (shouldShow && headerHiddenRef.current) {
            headerHiddenRef.current = false;
            setHeaderHidden(false);
          }
          lastScrollY.current = y;
        }
      });
    };
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
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
      className={cn(
        "fixed left-0 right-0 top-0 z-50 px-4 py-4 sm:px-6",
        // The pill (<nav> below) only ever covers ITS OWN bounding box —
        // the header's own px-4/py-4 padding around the pill, and the
        // corner gaps left by its rounded-full shape, were fully
        // transparent. On mobile/coarse-pointer that let scrolling
        // content (the hero CTA row, section headings, etc.) show
        // through in that gap even with the pill itself opaque — visible
        // as content "peeking" above/below/around the pill rather than
        // cleanly disappearing behind the header. A solid backdrop across
        // the WHOLE fixed header box (not just the pill) closes that gap.
        // Desktop/hover-capable keeps the fully transparent surrounding
        // padding — this is a touch/mobile-only fix.
        reduceEffects && "bg-black/[0.96]",
      )}
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: headerHidden ? -120 : 0, opacity: headerHidden ? 0 : 1 }}
      transition={
        hasEntered
          ? { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
          : { duration: 0.75, delay: 1.85, ease: [0.22, 1, 0.36, 1] }
      }
      onAnimationComplete={() => setHasEntered(true)}
    >
      <nav
        className={cn(
          // Background opacity is set ONCE, per branch below — a
          // `bg-black/85` used to also be applied unconditionally here
          // AND overridden again per scrolled-state a few lines down,
          // two conflicting background-color utilities on the same
          // element. Which one actually won was left to Tailwind's
          // internal class ordering rather than anything in this file,
          // and on `reduceEffects` devices (any coarse/touch pointer —
          // i.e. effectively all mobile) that's what let section
          // headings read as bleeding through/overlapping the pill while
          // scrolling. Blur is the only thing set unconditionally now;
          // background comes from exactly one place.
          "mx-auto flex max-w-[1520px] items-center justify-between gap-3 rounded-full border px-4 py-3 transition-all duration-500 sm:px-5",
          !reduceEffects && "backdrop-blur-2xl",
          scrolled
            ? cn(
                "border-primary/25",
                // Solid on touch/coarse-pointer devices at all times (not
                // just once scrolled) — there's no hover-driven reason to
                // keep it glassy there, and content passing underneath a
                // fixed header needs to stay legible while scrolling.
                reduceEffects ? "bg-black/[0.9]" : "bg-black/[0.72]",
                reduceEffects
                  ? "shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
                  : "shadow-[0_18px_70px_rgba(0,0,0,0.55),0_0_42px_rgba(255,77,18,0.12)]",
              )
            : cn(
                "border-white/10",
                reduceEffects
                  ? "bg-black/[0.9] shadow-lg shadow-black/20"
                  : "bg-black/[0.34] shadow-2xl shadow-black/25",
              ),
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
            const navLinkClassName = cn(
              "group relative rounded-full text-xs font-black uppercase tracking-[0.14em] transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black",
              isActive ? "text-white" : "text-white/[0.64] hover:text-white",
            );
            const underlineClassName = cn(
              "absolute -bottom-2 left-0 h-px bg-primary shadow-[0_0_18px_rgba(255,77,18,0.9)] transition-all duration-300",
              isActive ? "w-full" : "w-0 group-hover:w-full",
            );

            if (item.href === HOME_HREF && !isOnHomepage) {
              return (
                <Link key={item.href} href="/" className={navLinkClassName}>
                  {item.label}
                  <span className={underlineClassName} />
                </Link>
              );
            }

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => scrollToSection(event, item.href)}
                className={navLinkClassName}
              >
                {item.label}
                <span className={underlineClassName} />
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
          className={cn(
            "mx-auto mt-3 max-w-[1520px] rounded-2xl border border-primary/20 bg-black/[0.88] p-3 lg:hidden",
            reduceEffects
              ? "shadow-[0_16px_48px_rgba(0,0,0,0.62)]"
              : "shadow-[0_22px_80px_rgba(0,0,0,0.72),0_0_42px_rgba(255,77,18,0.13)] backdrop-blur-2xl",
          )}
          initial={{ y: -8, opacity: 0, filter: reduceEffects ? "none" : "blur(8px)" }}
          animate={{ y: 0, opacity: 1, filter: reduceEffects ? "none" : "blur(0px)" }}
          transition={{ duration: reduceEffects ? 0.01 : 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
          {navItems.map((item) => {
            const mobileLinkClassName = cn(
              "block rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.16em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black",
              active === item.href
                ? "bg-primary/[0.12] text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white",
            );

            if (item.href === HOME_HREF && !isOnHomepage) {
              return (
                <Link
                  key={item.href}
                  href="/"
                  onClick={() => setOpen(false)}
                  className={mobileLinkClassName}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => {
                  scrollToSection(event, item.href);
                  setOpen(false);
                }}
                className={mobileLinkClassName}
              >
                {item.label}
              </a>
            );
          })}
        </motion.div>
      ) : null}
    </motion.header>
  );
}