"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface CounterProps {
  value: number;
  suffix?: string;
}

export function Counter({ value, suffix = "+" }: CounterProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const el = ref.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => {
        const counterObj = { val: 0 };
        gsap.to(counterObj, {
          val: value,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: () => {
            if (el) el.textContent = `${Math.floor(counterObj.val)}${suffix}`;
          },
        });
      },
    });

    return () => trigger.kill();
  }, [value, suffix]);

  return (
    <h3 ref={ref} className="text-[clamp(40px,5vw,72px)] text-accent font-display">
      0
    </h3>
  );
}
