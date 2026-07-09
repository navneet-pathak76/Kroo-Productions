import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Coming Soon | Kroo Production",
  description:
    "We're building something exceptional. This page will be available soon.",
};

export default function ComingSoonPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070707] text-white">

      {/* Background */}
      <div className="absolute inset-0">

        {/* Orange Glow */}
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF6B00]/10 blur-[180px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,.9)_100%)]" />
      </div>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-6">

        <div className="w-full max-w-4xl text-center">

          {/* Logo */}

          <Image
            src="/images/logo.png"
            alt="Kroo Production"
            width={72}
            height={72}
            priority
            className="mx-auto"
          />

          {/* Brand */}

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.45em] text-[#FF6B00]">
            KROO PRODUCTION
          </p>

          {/* Title */}

          <h1 className="mt-8 text-6xl font-black tracking-tight md:text-8xl">
            COMING SOON
          </h1>

          {/* Subtitle */}

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-9 text-zinc-400">
            We're crafting this experience with the same attention to detail,
            creativity, and precision that defines every Kroo Production
            project.
          </p>

          {/* Divider */}

          <div className="mx-auto mt-12 h-px w-32 bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent" />

          {/* Buttons */}

          <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">

            <Link
              href="/#contact"
              className="rounded-full bg-[#FF6B00] px-10 py-4 text-sm font-semibold uppercase tracking-[0.18em] transition duration-300 hover:scale-105 hover:bg-orange-600"
            >
              Contact Us
            </Link>

            <Link
              href="/"
              className="rounded-full border border-white/10 px-10 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300 transition duration-300 hover:border-[#FF6B00] hover:text-white"
            >
              Back Home
            </Link>

          </div>

          {/* Footer */}

          <div className="mt-20 text-sm text-zinc-500">

            <p className="font-semibold tracking-[0.3em] text-zinc-300">
              KROO PRODUCTION
            </p>

            <p className="mt-3">
              Creative Production House
            </p>

            <p className="mt-2">
              Commercial Films • Brand Films • Motion Graphics • Content Creation
            </p>

            <p className="mt-8 text-xs">
              © 2026 Kroo Production. All Rights Reserved.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}