import { Reveal } from "@/components/Reveal";
import type { Testimonial } from "@/types";

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Navneet turned three days of raw gym footage into a launch film that actually felt premium. Every cut had a reason.",
    name: "Ritika Malhotra",
    role: "Founder, Forma Fitness",
  },
  {
    quote:
      "The grade alone made our restaurant look like a different tier of brand. Bookings noticeably picked up after launch.",
    name: "Arjun Verma",
    role: "Owner, Casa Ember",
  },
  {
    quote:
      "Fast, precise, and genuinely protective of the brand's tone. Exactly what a luxury client needs from an editor.",
    name: "Simran Kaur",
    role: "Marketing Lead, Étoile Jewellery",
  },
];

export function Testimonials() {
  return (
    <section className="section-pad">
      <div className="wrap">
        <div className="max-w-[640px] mb-16">
          <p className="eyebrow">Testimonials</p>
          <Reveal>
            <h2 className="font-display text-[clamp(30px,4vw,52px)] mt-4">
              Trusted by brands
              <br />
              that notice detail.
            </h2>
          </Reveal>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.06} className="min-w-[380px] flex-shrink-0">
              <div className="glass-card p-8 h-full">
                <div className="text-accent text-[13px] tracking-[2px]">★★★★★</div>
                <p className="text-[16px] leading-[1.7] text-[#e8e8e8] mt-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="mt-6">
                  <h5 className="text-[14px] font-medium">{t.name}</h5>
                  <span className="text-[12px] text-muted">{t.role}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
