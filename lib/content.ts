import {
  Aperture,
  BadgeCheck,
  BarChart3,
  Camera,
  Clapperboard,
  Film,
  Megaphone,
  MonitorPlay,
  PlaneTakeoff,
  Play,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

export const navItems = [
  { label: "Home", href: "#home" },
  { label: "Work", href: "#work" },
  { label: "Team", href: "#team" },
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const stats = [
  { value: 200, suffix: "+", label: "Projects Delivered", icon: Film },
  { value: 150, suffix: "+", label: "Happy Clients", icon: Users },
  { value: 20, suffix: "M+", label: "Views Generated", icon: Play },
  { value: 8, suffix: "+", label: "Years Experience", icon: Star },
];

export const founders = [
 {
    name: "Navneet Pathak",
    role: "Founder",
    image: "/images/navneet.jpeg",
    tone: "from-zinc-300 via-stone-700 to-black",
  },
  {
    name: "Rajbir Singh",
    role: "Founder",
    image: "/images/rajbir.png",
    tone: "from-zinc-300 via-zinc-700 to-black",
  },
  {
    name: "Vivek Das",
    role: "Founder",
    image: "/images/vivekdas.jpeg",
    tone: "from-zinc-200 via-neutral-700 to-black",
  },
  {
    name: "Soumojit Das",
    role: "Founder",
    image: "/images/sj.jpeg",
    tone: "from-zinc-100 via-zinc-600 to-black",
  },
  
];

export const services = [
  {
    title: "Video Production",
    description:
      "Commercial films, social launches, event stories, and performance-ready brand assets.",
    icon: Clapperboard,
    span: "md:col-span-2",
  },
  {
    title: "Film Production",
    description:
      "Concept development, casting, crews, studio planning, lighting, and on-set direction.",
    icon: Camera,
    span: "md:col-span-1",
  },
  {
    title: "Post Production",
    description:
      "Editing, color, motion graphics, sound design, VFX supervision, and delivery masters.",
    icon: MonitorPlay,
    span: "md:col-span-1",
  },
  {
    title: "Digital Marketing",
    description:
      "Campaign strategy, cutdown systems, paid creative, creator content, and launch analytics.",
    icon: Megaphone,
    span: "md:col-span-2",
  },
  {
    title: "Aerial Cinematography",
    description:
      "Licensed drone crews, cinematic flight planning, tracking shots, and landscape reveals.",
    icon: PlaneTakeoff,
    span: "md:col-span-3",
  },
];

export const projects = [
  {
    title: "Brand Commercial",
    category: "Automotive launch film",
    metric: "8.4M views",
    color: "from-orange-600/90 via-red-950/70 to-black",
  },
  {
    title: "Music Video",
    category: "Performance visual system",
    metric: "14 sets",
    color: "from-zinc-100/50 via-orange-700/70 to-black",
  },
  {
    title: "Luxury Ad Campaign",
    category: "Fashion editorial film",
    metric: "6 markets",
    color: "from-amber-500/80 via-neutral-800 to-black",
  },
  {
    title: "Documentary",
    category: "Human story series",
    metric: "42 min",
    color: "from-neutral-400/50 via-stone-950 to-black",
  },
  {
    title: "Fitness Promo",
    category: "High-impact social cutdowns",
    metric: "92 assets",
    color: "from-orange-500/80 via-zinc-900 to-black",
  },
];

export const testimonials = [
  {
    quote:
      "Kroo turned a complicated launch into a film system that felt premium from the first frame to the final cutdown.",
    name: "Aarav Mehta",
    company: "Creative Director, Nova Auto",
  },
  {
    quote:
      "The team brought strategy, taste, and speed. Every detail had intention, and the campaign moved exactly the way we hoped.",
    name: "Ira Sen",
    company: "Brand Lead, Forma",
  },
  {
    quote:
      "Their post-production workflow is surgical. The grade, rhythm, and sound design made the story feel bigger than the brief.",
    name: "Dev Kapoor",
    company: "Producer, Eastline",
  },
];

export const brandMarks = [
  "NIKE",
  "COCA-COLA",
  "SAMSUNG",
  "AIRTEL",
  "ZARA",
  "H&M",
  "AMAZON",
  "ADIDAS",
];

export const capabilities = [
  { label: "Cinematic Direction", icon: Aperture },
  { label: "Production Logistics", icon: BadgeCheck },
  { label: "Digital Performance", icon: BarChart3 },
  { label: "Motion Systems", icon: Sparkles },
];
