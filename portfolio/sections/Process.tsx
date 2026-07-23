import { Reveal } from "@/components/Reveal";
import type { ProcessStep } from "@/types";

const STEPS: ProcessStep[] = [
  {
    order: "01",
    title: "Discovery",
    description: "Understand the brand, the audience and what the content needs to do.",
  },
  {
    order: "02",
    title: "Planning",
    description: "Structure, pacing and references locked before a single cut is made.",
  },
  {
    order: "03",
    title: "Editing",
    description: "Assembly, refinement and grade — built in rounds, not one pass.",
  },
  {
    order: "04",
    title: "Motion",
    description: "Graphics, type and sound layered in to finish the story.",
  },
  {
    order: "05",
    title: "Delivery",
    description: "Export specs matched to platform, with room for one clean revision round.",
  },
];

export function Process() {
  return (
    <section id="process" className="section-pad">
      <div className="wrap">
        <div className="max-w-[640px] mb-16">
          <p className="eyebrow">Process</p>
          <Reveal>
            <h2 className="font-display text-[clamp(30px,4vw,52px)] mt-4">
              From footage
              <br />
              to final cut.
            </h2>
          </Reveal>
        </div>

        <div className="relative flex flex-col md:flex-row justify-between gap-10 md:gap-5">
          <div
            aria-hidden
            className="hidden md:block absolute top-[22px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-line to-transparent"
          />
          {STEPS.map((step, i) => (
            <Reveal key={step.order} delay={i * 0.08} className="relative flex-1">
              <div className="w-11 h-11 rounded-full border border-line flex items-center justify-center text-[12px] text-accent bg-bg relative z-[2]">
                {step.order}
              </div>
              <h4 className="text-[17px] font-medium font-display mt-5">{step.title}</h4>
              <p className="text-muted text-[13px] mt-2 leading-[1.6] max-w-[200px]">
                {step.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
