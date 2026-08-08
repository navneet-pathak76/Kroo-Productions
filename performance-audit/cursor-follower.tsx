"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function CursorFollower() {
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 160, damping: 24, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 160, damping: 24, mass: 0.35 });

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      x.set(event.clientX - 16);
      y.set(event.clientY - 16);
      setVisible(true);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[70] hidden h-8 w-8 rounded-full border border-primary/70 mix-blend-screen shadow-glow md:block"
      style={{ x: springX, y: springY, opacity: visible ? 1 : 0 }}
    />
  );
}
