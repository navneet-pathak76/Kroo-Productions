import { Reveal } from "@/components/Reveal";
import type { TimelineItem } from "@/types";

const TIMELINE: TimelineItem[] = [
  {
    order: "Chapter 01",
    title: "Started Editing",
    description:
      "Learned the craft frame by frame — Premiere, After Effects, color and sound, self-taught and obsessive.",
  },
  {
    order: "Chapter 02",
    title: "Freelancing",
    description:
      "Took on independent creators and small brands, building a reel that started opening bigger doors.",
  },
  {
    order: "Chapter 03",
    title: "Commercial Projects",
    description:
      "Moved into paid commercial work — ads, reels and brand films built around measurable results.",
  },
  {
    order: "Chapter 04",
    title: "Production House",
    description:
      "Joined production pipelines, editing at scale without losing the detail that makes a cut feel intentional.",
  },
  {
    order: "Chapter 05",
    title: "Luxury Clients",
    description:
      "Now trusted by luxury and hospitality brands who need every second on screen to feel premium.",
  },
];

export function About() {
  return (
    <section id="about" className="section-pad">
      <div className="wrap grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-start">
        <div>
          <p className="eyebrow">About</p>
          <Reveal>
            <h2 className="font-display text-[clamp(30px,4vw,52px)] mt-4">
              Every frame
              <br />
              has purpose.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-muted text-[16px] leading-[1.8] mt-6">
              I started editing because a badly cut ad bothered me more than
              a bad product. Two years and 150+ projects later, that same
              instinct still runs every timeline I open — pacing, grade,
              sound and motion all working toward one job: make someone stop
              scrolling.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-muted text-[16px] leading-[1.8] mt-5">
              Today I work with production houses and premium brands who
              need content that looks expensive because the strategy behind
              it is precise, not because the budget was big.
            </p>
          </Reveal>
        </div>

        <div className="relative pl-8">
          <div
            aria-hidden
            className="absolute left-[6px] top-1.5 bottom-1.5 w-px bg-gradient-to-b from-line to-transparent"
          />
          {TIMELINE.map((item, i) => (
            <Reveal key={item.order} delay={i * 0.08} className="relative pb-12 last:pb-0">
              <div
                aria-hidden
                className="absolute -left-[34px] top-1 w-[11px] h-[11px] rounded-full bg-bg border-2 border-accent"
              />
              <span className="text-[12px] text-accent tracking-[.1em] uppercase">
                {item.order}
              </span>
              <h4 className="text-[19px] font-medium font-display mt-2">
                {item.title}
              </h4>
              <p className="text-muted text-[14px] mt-1.5 leading-[1.6]">
                {item.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
