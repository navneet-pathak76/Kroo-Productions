"use client";

import { useEffect } from "react";
import { getDeviceCapability, allowsScrubbedMotionEffects } from "@/lib/device-capability";

export function useGsapReveal() {
  useEffect(() => {
    const capability = getDeviceCapability();
    const reduced =
      capability.reducedMotion ||
      capability.performanceTier === "LOW" ||
      capability.saveData;

    if (reduced) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    async function run() {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const allowScrubbedEffects = allowsScrubbedMotionEffects(capability);
      const revealDuration = capability.performanceTier === "MEDIUM" ? 0.65 : 0.92;

      const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { y: capability.performanceTier === "MEDIUM" ? 22 : 34, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: revealDuration,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: {
              trigger: element,
              start: "top 84%",
            },
          },
        );
      });

        if (allowScrubbedEffects) {
          gsap.utils.toArray<HTMLElement>("[data-scale-on-scroll]").forEach((el) => {
            gsap.fromTo(
              el,
              { scale: 0.94 },
              {
                scale: 1,
                ease: "none",
                force3D: true,
                scrollTrigger: {
                  trigger: el,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.8,
                },
              },
            );
          });

          gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
            const speed = Number(el.dataset.parallax || 14);
            gsap.to(el, {
              y: speed * -1,
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            });
          });
        }
      });

      cleanup = () => {
        ctx.revert();
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.vars.trigger instanceof Element) {
            trigger.kill();
          }
        });
      };
    }

    void run();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);
}
