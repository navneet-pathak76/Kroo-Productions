const ITEMS = [
  "Luxury Brands",
  "Real Estate",
  "Hotels",
  "Gyms",
  "Restaurants",
  "Fashion",
  "Startups",
  "Influencers",
];

export function Marquee() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="border-t border-b border-line py-5 overflow-hidden bg-bg">
      <div className="flex gap-16 w-max animate-marquee">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="font-display text-[15px] text-muted tracking-wide flex items-center gap-16 whitespace-nowrap"
          >
            {item}
            <span className="text-accent">—</span>
          </span>
        ))}
      </div>
    </div>
  );
}
