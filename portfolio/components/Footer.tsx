export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line py-8">
      <div className="wrap flex flex-col md:flex-row items-center justify-between gap-3 text-[12px] text-muted text-center md:text-left">
        <span>© {year} Navneet Pathak. All rights reserved.</span>
        <span>Video Editor · Motion Designer · Based in India</span>
      </div>
    </footer>
  );
}
