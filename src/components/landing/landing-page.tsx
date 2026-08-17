"use client";

import { LandingNav } from "./nav";
import { Hero } from "./hero";
import {
  DailyView,
  Results,
  Wards,
  Reference,
  AITutor,
  SmallThings,
} from "./sections";
import { Pricing, FAQ } from "./ending";
import { About, Contact } from "./about-contact";
import { Testimonies, Reviews } from "./testimonials-reviews";
import { FloatingMenu } from "./floating-menu";
import { PanelScroller } from "./scroller";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PanelScroller
        nav={
          <>
            <LandingNav />
            <FloatingMenu />
          </>
        }
      >
        <Hero />
        <About />
        <DailyView />
        <Results />
        <Wards />
        <Reference />
        <AITutor />
        <SmallThings />
        <Pricing />
        <Testimonies />
        <Reviews />
        <Contact />
        <FAQ />
      </PanelScroller>
    </div>
  );
}
