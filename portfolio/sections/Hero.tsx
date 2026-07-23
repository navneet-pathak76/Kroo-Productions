"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/MagneticButton";

export function Hero() {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    function handleMouseMove(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth - 0.5) * 14;
      const y = (e.clientY / window.innerHeight - 0.5) * 14;
      if (frameRef.current) {
        gsap.to(frameRef.current, {
          rotateY: x,
          rotateX: -y,
          duration: 0.6,
          ease: "power2.out",
          transformPerspective: 800,
        });
      }
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-36 pb-16 overflow-hidden"
    >
      {/* Ambient floating shapes stand in for the brief's "floating camera / film reel / glass
          cube" motifs — kept as soft, subtle CSS/SVG shapes rather than a WebGL scene, since
          Three.js is not part of the mandated stack for this build. */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-[18%] left-[8%] w-40 h-40 rounded-[28%] border border-accent/20 animate-float"
          style={{ animationDelay: "0s" }}
        />
        <motion.div
          className="absolute top-[55%] left-[20%] w-24 h-24 rounded-full border border-accent/15 animate-float"
          style={{ animationDelay: "1.2s" }}
        />
        <motion.div
          className="absolute top-[30%] right-[12%] w-56 h-56 rounded-full bg-accent/10 blur-[80px]"
        />
        <div className="absolute inset-0 opacity-[.35] [background:radial-gradient(1px_1px_at_20%_30%,rgba(255,138,0,.5),transparent),radial-gradient(1px_1px_at_60%_70%,rgba(255,255,255,.3),transparent),radial-gradient(1px_1px_at_80%_20%,rgba(255,138,0,.4),transparent),radial-gradient(1px_1px_at_40%_85%,rgba(255,255,255,.25),transparent)] [background-size:100%_100%]" />
      </div>

      <div className="wrap relative z-[2] grid grid-cols-1 md:grid-cols-[1.15fr_.85fr] items-center gap-10">
        <div>
          <p className="eyebrow">Video Editor · Motion Designer</p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display uppercase text-[clamp(46px,6.4vw,108px)] leading-[1.02] bg-text-fade bg-clip-text text-transparent mt-2"
          >
            Navneet
            <br />
            Pathak
          </motion.h1>

          <p className="text-[14px] text-muted tracking-wide mt-4">
            150+ Projects &nbsp;·&nbsp; 50+ Clients &nbsp;·&nbsp; 2+ Years Behind the Timeline
          </p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-[clamp(32px,4.2vw,62px)] mt-6 leading-[1.05]"
          >
            Crafting{" "}
            <span className="bg-text-accent bg-clip-text text-transparent">
              cinematic stories
            </span>
            <br />
            that convert.
          </motion.h2>

          <p className="max-w-[460px] mt-6 text-muted text-[16px] leading-[1.65]">
            I edit, grade and design motion for brands that refuse to look
            ordinary — luxury labels, hotels, gyms and restaurants that need
            every frame to earn its place.
          </p>

          <div className="flex flex-wrap gap-4 mt-11">
            <div data-cursor-magnet>
              <MagneticButton href="#work" icon={<ArrowUpRight size={16} />}>
                View Portfolio
              </MagneticButton>
            </div>
            <div data-cursor-magnet>
              <MagneticButton href="#contact" variant="ghost">
                Start Project
              </MagneticButton>
            </div>
          </div>
        </div>

        <div className="relative flex justify-center">
          <div
            aria-hidden
            className="absolute w-[340px] h-[340px] rounded-full bg-accent/25 blur-[60px] top-[10%] -right-10 -z-10"
          />
          <div
            ref={frameRef}
            className="relative w-full max-w-[420px] aspect-[3/4] rounded-[26px] overflow-hidden"
          >
            <Image
              src="/portrait.jpg"
              alt="Navneet Pathak, video editor and motion designer"
              fill
              priority
              sizes="(max-width: 768px) 90vw, 420px"
              className="object-cover object-top grayscale-[45%] contrast-[1.08] brightness-[.9]"
              style={{
                maskImage:
                  "linear-gradient(to bottom, black 70%, transparent 100%), radial-gradient(ellipse at center, black 55%, transparent 78%)",
                WebkitMaskComposite: "source-in",
                maskComposite: "intersect",
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,138,0,.28),rgba(5,5,5,0)_55%),linear-gradient(0deg,#050505_0%,transparent_30%)]" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 text-[11px] tracking-[.2em] text-muted uppercase z-[2]">
        <span>Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-muted to-transparent" />
      </div>
    </section>
  );
}
