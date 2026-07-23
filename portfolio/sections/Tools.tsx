import { Reveal } from "@/components/Reveal";

const TOOLS = [
  "Premiere Pro",
  "After Effects",
  "DaVinci Resolve",
  "Photoshop",
  "Illustrator",
  "Blender",
  "AI-Assisted Editing",
];

export function Tools() {
  return (
    <section className="pb-24 md:pb-[150px]">
      <div className="wrap">
        <div className="mb-9">
          <p className="eyebrow">Toolkit</p>
          <Reveal>
            <h2 className="font-display text-[clamp(30px,4vw,52px)] mt-4">
              Built with the
              <br />
              industry standard.
            </h2>
          </Reveal>
        </div>
        <div className="flex flex-wrap gap-4">
          {TOOLS.map((tool, i) => (
            <Reveal key={tool} delay={i * 0.04}>
              <div className="flex items-center gap-2.5 px-[22px] py-4 rounded-full border border-line bg-glass text-[14px]">
                <span className="w-[7px] h-[7px] rounded-full bg-accent" />
                {tool}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
