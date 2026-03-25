import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { SocialProof } from "@/components/landing/social-proof";
import { Features } from "@/components/landing/features";
import { BeforeAfter } from "@/components/landing/before-after";
import { HowItWorks } from "@/components/landing/how-it-works";
import { TwoModes } from "@/components/landing/two-modes";
import { Testimonials } from "@/components/landing/testimonials";
// import { Pricing } from "@/components/landing/pricing";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      {/* <SocialProof /> */}
      <Features />
      {/* <BeforeAfter /> */}
      <HowItWorks />
      <TwoModes />
      {/* <Testimonials /> */}
      {/* <Pricing /> */}
      <FinalCta />
      <Footer />
    </div>
  );
}
