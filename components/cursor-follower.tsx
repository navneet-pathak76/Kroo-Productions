"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useDeviceCapability } from "@/hooks/use-device-capability";

export function CursorFollower() {
  const capability = useDeviceCapability();
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 160, damping: 24, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 160, damping: 24, mass: 0.35 });
  const enabled =
    capability.hover &&
    capability.pointer === "fine" &&
    !capability.touch &&
    !capability.reducedMotion &&
    capability.performanceTier !== "LOW";

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }

    const onMove = (event: MouseEvent) => {
      x.set(event.clientX - 16);
      y.set(event.clientY - 16);
      setVisible(true);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-8 w-8 rounded-full border border-primary/70 mix-blend-screen shadow-glow md:block"
      style={{ x: springX, y: springY, opacity: visible ? 1 : 0 }}
    />
  );
}
