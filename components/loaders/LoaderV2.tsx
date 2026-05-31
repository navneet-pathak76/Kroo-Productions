"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoaderV2() {
  // New cinematic reveal variant (V2)
  const [loading, setLoading] = useState(true);
  const [ambientGlow, setAmbientGlow] = useState(false);
  const [showTypography, setShowTypography] = useState(false);
  const [sliding, setSliding] = useState(false);

  useEffect(() => {
    // Timeline per spec:
    // 0.0s - black
    // 0.3s - ambient glow
    // 0.8s - logo begins revealing
    // 1.5s - logo fully visible
    // 1.5s - 2.5s HOLD
    // 2.5s - homepage begins sliding upward (dispatch event)
    // 3.5s - homepage reaches final position
    // loader unmount at ~3.5s

    const tAmbient = window.setTimeout(() => setAmbientGlow(true), 300);
    const tLogo = window.setTimeout(() => setShowTypography(true), 800);
    const tSlideStart = window.setTimeout(() => {
      // Signal consumer that the homepage may begin its reveal now (exactly 2500ms)
      window.dispatchEvent(new Event("loader:done"));
      setSliding(true);
    }, 2500);

    const tEnd = window.setTimeout(() => setLoading(false), 3500);

    return () => {
      window.clearTimeout(tAmbient);
      window.clearTimeout(tLogo);
      window.clearTimeout(tSlideStart);
      window.clearTimeout(tEnd);
    };
  }, []);

  const kroo = "KROO".split("");
  const production = "PRODUCTION".split("");

  const letter = {
    hidden: { y: 10, opacity: 0, letterSpacing: "0px" },
    visible: { y: 0, opacity: 1, letterSpacing: "2px", transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } },
  };

  return (
    <AnimatePresence>
      {loading ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          animate={sliding ? { y: "-100%", transition: { duration: 1.0, ease: [0.2, 0.8, 0.2, 1] } } : { y: "0%" }}
          exit={{ opacity: 0 }}
        >
          {/* Ambient glow fades in at 0.3s */}
          <motion.div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(255,77,18,0.04)] to-transparent"
            initial={{ opacity: 0 }}
            animate={ambientGlow ? { opacity: 1, transition: { duration: 0.35 } } : { opacity: 0 }}
          />

          <div className="relative flex flex-col items-center justify-center gap-6 px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, filter: "blur(22px)" }}
              animate={showTypography ? { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } } : { opacity: 0 }}
              className="flex items-center justify-center"
            >
              <Image src="/images/kroo.jpeg" alt="Kroo" width={420} height={420} priority className="w-[180px] sm:w-[280px] md:w-[380px] lg:w-[460px] h-auto" />
            </motion.div>

            <div className="flex flex-col items-center -mt-2">
              <motion.div
                className="overflow-hidden"
                initial="hidden"
                animate={showTypography ? "visible" : "hidden"}
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              >
                <div className="flex justify-center space-x-3 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight uppercase">
                  {kroo.map((ch, i) => (
                    <motion.span key={i} variants={letter} className="inline-block">
                      {ch}
                    </motion.span>
                  ))}
                </div>

                <div className="mt-2 flex justify-center space-x-2 text-xs sm:text-sm uppercase tracking-widest text-white/70">
                  {production.map((ch, i) => (
                    <motion.span key={i} variants={letter} className="inline-block">
                      {ch}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
