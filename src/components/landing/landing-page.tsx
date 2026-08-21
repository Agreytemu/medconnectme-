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
import { Contact } from "./about-contact";
import { Testimonies, Reviews } from "./testimonials-reviews";
import { Showcase } from "./showcase";
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
        <DailyView />
        <Results />
        <Wards />
        <Reference />
        <AITutor />
        <SmallThings />
        <Pricing />
        <Showcase />
        <Testimonies />
        <Reviews />
        <Contact />
        <FAQ />
      </PanelScroller>
    </div>
  );
}
