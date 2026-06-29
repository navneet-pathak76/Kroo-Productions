"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

export function KrooMark() {
  const mx = useMotionValue(50);
  const my = useMotionValue(50);

  const smoothMx = useSpring(mx, {
    stiffness: 70,
    damping: 20,
  });

  const smoothMy = useSpring(my, {
    stiffness: 70,
    damping: 20,
  });

  const tx = useTransform(smoothMx, [0, 100], [-15, 15]);

  const rotateX = useTransform(smoothMy, [0, 100], [10, -10]);

  const rotateY = useTransform(smoothMx, [0, 100], [-18, 18]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth) * 100);
      my.set((e.clientY / window.innerHeight) * 100);
    };

    window.addEventListener("mousemove", onMove);

    return () => {
      window.removeEventListener("mousemove", onMove);
    };
  }, [mx, my]);

  return (
    <div className="relative flex h-auto w-full items-center justify-center overflow-visible">
      {/* Ambient Orange Atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 aspect-square w-[clamp(19rem,58vw,66rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,77,18,0.30)_0%,rgba(255,77,18,0.16)_34%,rgba(255,77,18,0.07)_57%,transparent_74%)] opacity-80 blur-[clamp(3rem,6vw,7.5rem)] lg:w-[clamp(36rem,64vw,74rem)]"
      />

      {/* Hero Logo */}
      <motion.div
        style={{
          x: tx,
          rotateX,
          rotateY,
          transformPerspective: 2500,
        }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-20 flex w-full items-center justify-center will-change-transform"
      >
        <Image
          src="/images/kroo.jpeg"
          alt="Kroo Production Logo"
          width={1400}
          height={1400}
          priority
          quality={100}
          sizes="(max-width: 1024px) 86vw, (max-width: 1536px) 60vw, 1024px"
          className="aspect-square h-auto w-[clamp(18rem,54vw,58rem)] max-w-full object-contain select-none drop-shadow-[0_0_120px_rgba(255,100,0,0.20)] lg:w-[clamp(28rem,52vw,64rem)] lg:max-w-[118%]"
        />
      </motion.div>
    </div>
  );
}
