import { Counter } from "@/components/Counter";
import type { StatItem } from "@/types";

const STATS: StatItem[] = [
  { label: "Projects Delivered", value: 150 },
  { label: "Clients Served", value: 50 },
  { label: "Years Editing", value: 2 },
  { label: "Views Generated", value: 10, suffix: "M+" },
];

export function Stats() {
  return (
    <section className="pb-24 md:pb-[150px]">
      <div className="wrap grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <Counter value={stat.value} suffix={stat.suffix} />
            <p className="text-[13px] text-muted tracking-wide mt-2 uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
