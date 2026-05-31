"use client";

import Image from "next/image";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
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

  const rotateX = useTransform(
    smoothMy,
    [0, 100],
    [10, -10]
  );

  const rotateY = useTransform(
    smoothMx,
    [0, 100],
    [-18, 18]
  );

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
    <div className="relative flex items-center justify-center h-[1100px] w-full overflow-visible">

      {/* Ambient Orange Atmosphere */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[5%] top-[10%] h-[900px] w-[900px] rounded-full bg-[rgba(255,85,0,0.12)] blur-[220px]" />
      </div>

      {/* Hero Logo */}
      <motion.div
        style={{
          x: tx,
          rotateX,
          rotateY,
          transformPerspective: 2500,
        }}
        animate={{
          y: [0, -12, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-20 flex items-center justify-center scale-125 lg:scale-150 will-change-transform"
      >
        <Image
          src="/images/kroo.jpeg"
          alt="Kroo Production Logo"
          width={2200}
          height={2200}
          priority
          quality={100}
          className="
           w-[450px]
           sm:w-[700px]
           md:w-[900px]
           lg:w-[1000px]
           xl:w-[1100px]
           2xl:w-[1200px]
            max-w-none
            h-auto
            object-contain
            select-none
            drop-shadow-[0_0_120px_rgba(255,100,0,0.28)]
          "
        />
      </motion.div>

    </div>
  );
}