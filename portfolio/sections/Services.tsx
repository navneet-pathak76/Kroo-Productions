import { Reveal } from "@/components/Reveal";
import type { ServiceItem } from "@/types";

const SERVICES: ServiceItem[] = [
  {
    index: "01",
    title: "Commercial Ads",
    description:
      "Fast-paced, conversion-focused edits built for paid media and short attention spans.",
  },
  {
    index: "02",
    title: "Brand Films",
    description: "Longer-form storytelling that builds identity, not just impressions.",
  },
  {
    index: "03",
    title: "Cinematic Reels",
    description:
      "Social-first cuts with a film-grade rhythm — built to hold, not just to hook.",
  },
  {
    index: "04",
    title: "Motion Graphics",
    description:
      "Type, transitions and animated systems that carry a brand's visual language.",
  },
  {
    index: "05",
    title: "Color Grading",
    description:
      "A consistent, considered grade that gives every project its own visual mood.",
  },
  {
    index: "06",
    title: "Sound Design",
    description: "Mix, foley and score selection that makes footage feel finished, not just cut.",
  },
];

export function Services() {
  return (
    <section id="services" className="section-pad">
      <div className="wrap">
        <div className="max-w-[640px] mb-16">
          <p className="eyebrow">Services</p>
          <Reveal>
            <h2 className="font-display text-[clamp(30px,4vw,52px)] mt-4">
              What I bring to
              <br />
              your timeline.
            </h2>
          </Reveal>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SERVICES.map((service, i) => (
            <Reveal key={service.index} delay={i * 0.05}>
              <div className="glass-card p-8 h-full transition-colors duration-400 hover:border-accent/40 hover:bg-accent/5">
                <span className="text-[12px] text-accent tracking-[.1em]">
                  {service.index}
                </span>
                <h3 className="text-[21px] font-medium font-display mt-5">
                  {service.title}
                </h3>
                <p className="text-muted text-[14px] mt-3 leading-[1.7]">
                  {service.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
