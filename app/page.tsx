import Nav from "@/app/components/Nav";
import Hero from "@/app/components/Hero";
import Features from "@/app/components/Features";
import Pricing from "@/app/components/Pricing";
import HowItWorks from "@/app/components/HowItWorks";
import FooterCTA from "@/app/components/FooterCTA";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <HowItWorks />
        <FooterCTA />
      </main>
      <Footer />
    </>
  );
}
