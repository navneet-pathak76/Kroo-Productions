"use client";

import { Play } from "lucide-react";
import type { MouseEvent } from "react";
import { Reveal } from "@/components/Reveal";
import type { WorkItem } from "@/types";

/**
 * Placeholder project data. Swap `thumbnailUrl` / `videoUrl` for real
 * assets served from CloudFront once they're uploaded to S3 — see
 * lib/ses.ts and the README for the storage convention.
 */
const WORK_ITEMS: WorkItem[] = [
  { id: "01", index: "01", title: "Étoile Jewellery", category: "Luxury Brand Film" },
  { id: "02", index: "02", title: "Forma Fitness", category: "Gym Commercial" },
  { id: "03", index: "03", title: "Casa Ember", category: "Restaurant Content" },
  { id: "04", index: "04", title: "Meridian Residences", category: "Real Estate Reel" },
];

function WorkCard({ item, delay }: { item: WorkItem; delay: number }) {
  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  return (
    <Reveal delay={delay}>
      <div
        onMouseMove={handleMouseMove}
        data-cursor-magnet
        className="group relative rounded-[22px] overflow-hidden aspect-[4/5] bg-gradient-to-br from-bg2 to-bg border border-line cursor-pointer"
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(600px circle at var(--mx,50%) var(--my,50%), var(--accent-dim), transparent 60%)",
          }}
        />
        <div className="absolute inset-3.5 border border-white/[.06] rounded-2xl flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border border-white/25 flex items-center justify-center opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-400 backdrop-blur-md bg-white/[.04]">
            <Play size={18} className="ml-0.5" />
          </div>
        </div>
        <div className="absolute left-0 right-0 bottom-0 p-7 flex justify-between items-end translate-y-2 group-hover:translate-y-0 transition-transform duration-400">
          <div>
            <h3 className="text-[22px] font-medium font-display">{item.title}</h3>
            <div className="text-[11px] text-muted tracking-[.1em] uppercase mt-1.5">
              {item.category}
            </div>
          </div>
          <span className="text-[12px] text-muted">{item.index}</span>
        </div>
      </div>
    </Reveal>
  );
}

export function Work() {
  return (
    <section id="work" className="section-pad">
      <div className="wrap">
        <div className="max-w-[640px] mb-16">
          <p className="eyebrow">Selected Work</p>
          <Reveal>
            <h2 className="font-display text-[clamp(30px,4vw,52px)] mt-4">
              Frames worth
              <br />
              stopping for.
            </h2>
          </Reveal>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {WORK_ITEMS.map((item, i) => (
            <WorkCard key={item.id} item={item} delay={i * 0.06} />
          ))}
        </div>
      </div>
    </section>
  );
}
