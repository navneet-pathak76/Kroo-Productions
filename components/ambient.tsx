"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useEffect } from "react";
import { useDeviceCapability } from "@/hooks/use-device-capability";

export function Ambient() {
  const capability = useDeviceCapability();
  const x = useMotionValue(50);
  const y = useMotionValue(50);
  const background = useMotionTemplate`radial-gradient(520px circle at ${x}% ${y}%, rgba(255,77,18,0.17), transparent 54%)`;
  const canTrackPointer =
    capability.hover &&
    capability.pointer === "fine" &&
    !capability.touch &&
    !capability.reducedMotion &&
    capability.performanceTier !== "LOW";

  useEffect(() => {
    if (!canTrackPointer) return;

    const onMove = (event: MouseEvent) => {
      x.set((event.clientX / window.innerWidth) * 100);
      y.set((event.clientY / window.innerHeight) * 100);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [canTrackPointer, x, y]);

  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: canTrackPointer
            ? background
            : "radial-gradient(520px circle at 50% 35%, rgba(255,77,18,0.12), transparent 54%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:88px_88px] opacity-20 [mask-image:radial-gradient(circle_at_50%_30%,black,transparent_72%)] motion-reduce:hidden"
      />
      {/* Removed film-grain / noise overlay to keep background clean */}
    </>
  );
}
