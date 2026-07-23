import { Nav } from "@/components/Nav";
import { Marquee } from "@/components/Marquee";
import { Footer } from "@/components/Footer";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { Work } from "@/sections/Work";
import { Services } from "@/sections/Services";
import { Stats } from "@/sections/Stats";
import { Process } from "@/sections/Process";
import { Tools } from "@/sections/Tools";
import { Testimonials } from "@/sections/Testimonials";
import { Contact } from "@/sections/Contact";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Work />
        <Services />
        <Stats />
        <Process />
        <Tools />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
