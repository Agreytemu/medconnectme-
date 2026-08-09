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
import { PanelScroller } from "./scroller";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PanelScroller nav={<LandingNav />}>
        <Hero />
        <DailyView />
        <Results />
        <Wards />
        <Reference />
        <AITutor />
        <SmallThings />
        <Pricing />
        <FAQ />
      </PanelScroller>
    </div>
  );
}
