import {
  Aperture,
  BadgeCheck,
  BarChart3,
  MapPin,
  Bot,
  Camera,
  Clapperboard,
  Film,
  Megaphone,
  MonitorPlay,
  Play,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

export const navItems = [
  { label: "Home", href: "#home" },
  { label: "Projects", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Our Team", href: "#team" },
  { label: "Contact", href: "#contact" },
];

export const stats = [];

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
    title: "Commercial & Brand Films",
    description:
      "Brand films, digital commercials, product films and launch campaigns built around a clear message.",
    icon: Clapperboard,
    span: "lg:col-span-2",
  },
  {
    title: "Social & Short-Form Content",
    description:
      "Reels, campaign edits and platform-specific video for brands that need consistent content.",
    icon: Megaphone,
    span: "lg:col-span-1",
  },
  {
    title: "Production & Direction",
    description:
      "Concept development, scripting, crew, locations, cinematography and on-set direction.",
    icon: Camera,
    span: "lg:col-span-1",
  },
  {
    title: "Post-Production",
    description:
      "Editing, colour grading, motion graphics, sound design, VFX and final delivery.",
    icon: MonitorPlay,
    span: "lg:col-span-2",
  },
  {
    title: "AI & Visual Content",
    description:
      "AI-assisted visuals, product concepts, generative environments and branded content where they add value.",
    icon: Bot,
    span: "lg:col-span-2",
  },
];

export const projects = [
  {
    title: "Gym Content",
    category: "Premium fitness storytelling",
    metric: "Transformations",
    color: "from-orange-500/80 via-zinc-900 to-black",
    image: "/images/gym-content.jpg",
    href: "/gym-content",
  },
  {
    title: "Fashion Content",
    category: "Fashion & lifestyle campaigns",
    metric: "02",
    color: "from-amber-500/80 via-neutral-800 to-black",
    image: "/images/clothing-content.jpg",
    href: "/clothing-content",
  },
  {
    title: "Restaurant Content",
    category: "Hospitality brand films",
    metric: "03",
    color: "from-orange-600/80 via-amber-900/70 to-black",
    image: "/images/restaurant-content.png",
    href: "/restaurant-content",
  },
  {
    title: "REAL ESTATE",
    category: "Luxury Properties",
    metric: "04",
    image: "/re.png",
    href: "/real-estate",
  },
  {
    title: "PRODUCTS",
    category: "Commercial",
    metric: "05",
    image: "/product.png",
    href: "/product-content",
  },
  {
    title: "AI VIDEOS",
    category: "AI Production",
    metric: "06",
    image: "/ai.png",
    href: "/ai-content",
  },
  {
    title: "Clubs Content",
    category: "Nightlife & event visuals",
    metric: "07",
    color: "from-purple-700/70 via-black to-black",
    image: "/images/clubs-content.jpg",
    href: "/clubs-content",
  },
  {
    title: "Motion Graphics & Logos",
    category: "2D & 3D animation",
    metric: "08",
    color: "from-red-700/80 via-orange-900 to-black",
    image: "/images/motion-graphics.png",
    href: "/motion-graphics-content",
  },
  {
    title: "SOCIAL MEDIA",
    category: "Performance Marketing",
    metric: "09",
    image: "/dm.png",
    href: "/digital-marketing-content",
  },
];

export const testimonials = [
  {
    quote:
      "I had a great experience working with Kroo Production. The team did an excellent job and really understood what I was looking for.",
    name: "Debjit",
    company: "Founder, Pab Store",
    logo: "/images/pab.jpg",
  },
  {
    quote:
      "Kroo Production got the vibe exactly right. The content came out clean, energetic, and matched my style perfectly. Really enjoyed working with the team.",
    name: "DJ Mishi",
    company: "DJ & Artist",
    logo: "/images/djmishi.png",
  },
  {
    quote:
      "The team brought strategy, taste, and speed. Every detail had intention, and the campaign moved exactly the way we hoped.",
    name: "EDITLAB",
    company: "Creative Venture",
    logo: "/images/editlab.jpg",
  },
];

export const brandMarks = [];

export const capabilities = [
  { label: "Creative Direction", icon: Aperture, description: "Concepts shaped around your brand, audience and campaign objective." },
  { label: "End-to-End Production", icon: BadgeCheck, description: "One coordinated workflow from pre-production through final delivery." },
  { label: "Social-Ready Content", icon: BarChart3, description: "Commercial films, campaign assets and social-first edits." },
  { label: "Pan-India Production", icon: MapPin, description: "Kolkata based, with production planned across India." },
];
