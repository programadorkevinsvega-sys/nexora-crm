"use client"

import { LandingNavbar } from "./landing-navbar"
import { LandingHeroSection } from "./landing-hero-section"
import { LandingBentoGrid } from "./landing-bento-grid"
import { LandingComparisonSection } from "./landing-comparison-section"
import { LandingPricingSection } from "./landing-pricing-section"
import { LandingTechStackSection } from "./landing-tech-stack-section"
import { LandingFooter } from "./landing-footer"

export default function LandingHomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      <LandingNavbar />
      <main>
        <LandingHeroSection />
        <LandingBentoGrid />
        <LandingComparisonSection />
        <LandingPricingSection />
        <LandingTechStackSection />
      </main>
      <LandingFooter />
    </div>
  )
}
