import Link from "next/link";
import { MagneticButton } from "./MagneticButton";

const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export function Nav() {
  return (
    <nav className="fixed top-0 left-0 w-full z-[500] flex items-center justify-between px-6 md:px-10 py-5">
      <Link href="#hero" className="font-display font-semibold text-lg tracking-tight">
        NAVNEET <span className="text-accent">PATHAK</span>
      </Link>

      <div className="hidden md:flex items-center gap-9 text-[13px] tracking-wide text-muted">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} className="hover:text-white transition-colors">
            {link.label}
          </a>
        ))}
      </div>

      <div data-cursor-magnet>
        <MagneticButton
          href="#contact"
          variant="ghost"
          className="!py-2.5 !px-5 !text-[13px] hover:bg-white hover:text-bg hover:border-white transition-colors"
        >
          Start a Project
        </MagneticButton>
      </div>
    </nav>
  );
}
