import {
  Aperture,
  BadgeCheck,
  BarChart3,
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

export const stats = [
  { value: 200, suffix: "+", label: "Projects Delivered", icon: Film },
  { value: 50, suffix: "+", label: "Happy Clients", icon: Users },
  { value: 20, suffix: "M+", label: "Views Generated", icon: Play },
  { value: 5, suffix: "+", label: "Years Experience", icon: Star },
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
    span: "lg:col-span-2",
  },
  {
    title: "Film Production",
    description:
      "Concept development, casting, crews, studio planning, lighting, and on-set direction.",
    icon: Camera,
    span: "lg:col-span-1",
  },
  {
    title: "Post Production",
    description:
      "Editing, color, motion graphics, sound design, VFX supervision, and delivery masters.",
    icon: MonitorPlay,
    span: "lg:col-span-1",
  },
  {
    title: "Social Media",
    description:
      "Social strategy, cutdown systems, paid creative, creator content, and launch analytics.",
    icon: Megaphone,
    span: "lg:col-span-2",
  },
  {
  title: "AI Content Production",
  description:
    "AI-powered commercials, cinematic visuals, product renders, virtual models, AI avatars, and branded content engineered for speed without compromising cinematic quality.",
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
    title: "Clothing Content",
    category: "Fashion & lifestyle campaigns",
    metric: "Lookbooks",
    color: "from-amber-500/80 via-neutral-800 to-black",
    image: "/images/clothing-content.jpg",
    href: "/clothing-content",
  },
  {
    title: "Clubs Content",
    category: "Nightlife & event visuals",
    metric: "Aftermovies",
    color: "from-purple-700/70 via-black to-black",
    image: "/images/clubs-content.jpg",
    href: "/clubs-content",
  },
  {
    title: "Motion Graphics & Logo Animation",
    category: "2D & 3D animation",
    metric: "Visual FX",
    color: "from-red-700/80 via-orange-900 to-black",
    image: "/images/motion-graphics.jpg",
    href: "/motion-graphics-content",
  },
  {
    title: "Restaurant Content",
    category: "Hospitality brand films",
    metric: "Food Stories",
    color: "from-orange-600/80 via-amber-900/70 to-black",
    image: "/images/restaurant-content.jpg",
    href: "/restaurant-content",
  },
  {
    title: "REAL ESTATE",
    category: "Luxury Properties",
    metric: "06",
    image: "/images/projects/real-estate.svg",
    href: "/real-estate",
  },
  {
    title: "PRODUCTS",
    category: "Commercial",
    metric: "07",
    image: "/images/projects/products.svg",
    href: "/product-content",
  },
  {
    title: "AI VIDEOS",
    category: "AI Production",
    metric: "08",
    image: "/images/projects/ai-videos.svg",
    href: "/ai-content",
  },
  {
    title: "SOCIAL MEDIA",
    category: "Performance Marketing",
    metric: "09",
    image: "/images/projects/digital-marketing.svg",
    href: "/digital-marketing-content",
  },
  {
    title: "LOGO & GRAPHICS",
    category: "Brand Identity",
    metric: "10",
    image: "/images/projects/logo-graphics.svg",
    href: "/logo-graphics-content",
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

export const brandMarks = [];
  /*"NIKE",
  "COCA-COLA",
  "SAMSUNG",
  "AIRTEL",
  "ZARA",
  "H&M",
  "AMAZON",
  "ADIDAS",
];*/

export const capabilities = [
  { label: "Cinematic Direction", icon: Aperture },
  { label: "Production Logistics", icon: BadgeCheck },
  { label: "Digital Performance", icon: BarChart3 },
  { label: "Motion Systems", icon: Sparkles },
];
