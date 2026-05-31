"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoaderV1() {
  const [loading, setLoading] = useState(true);
  const [showTypography, setShowTypography] = useState(false);
  const [sliding, setSliding] = useState(false);

  useEffect(() => {
    // Timeline orchestration
    // t0: logo intro (0 - 0.8s)
    // t1: typography (0.8 - 1.3s)
    // t2: slide reveal (1.3 - 2.1s)
    const tLogo = window.setTimeout(() => setShowTypography(true), 800);
    const tSlide = window.setTimeout(() => setSliding(true), 1300);
    const tEnd = window.setTimeout(() => setLoading(false), 2100);

    return () => {
      window.clearTimeout(tLogo);
      window.clearTimeout(tSlide);
      window.clearTimeout(tEnd);
    };
  }, []);

  const kroo = "KROO".split("");
  const production = "PRODUCTION".split("");

  const letter = {
    hidden: { y: 8, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] } },
  };

  return (
    <AnimatePresence>
      {loading ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          animate={sliding ? { y: "-100%", transition: { duration: 0.8, ease: [0.2, 0.8, 0.2, 1] } } : { y: "0%" }}
          exit={{ opacity: 0 }}
        >
          {/* subtle ambient orange glow */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(255,77,18,0.04)] to-transparent" />

          {/* Center stack */}
          <div className="relative flex flex-col items-center justify-center gap-6 px-6">
            {/* Scene 1: Logo intro */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, filter: "blur(20px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
              className="flex items-center justify-center"
            >
              <Image src="/images/kroo.jpeg" alt="Kroo" width={420} height={420} priority className="w-[160px] sm:w-[260px] md:w-[360px] lg:w-[420px] h-auto" />
            </motion.div>

            {/* Scene 2: Typographic reveal */}
            <div className="flex flex-col items-center -mt-2">
              <motion.div
                className="overflow-hidden"
                initial="hidden"
                animate={showTypography ? "visible" : "hidden"}
                variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
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
