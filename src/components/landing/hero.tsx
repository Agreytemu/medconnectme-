"use client";

import Image from "next/image";
import { ArrowRight, MoveRight } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Panel, useScroller } from "./scroller";
import { Reveal } from "./reveal";

export function Hero() {
  const { t } = useLang();
  const { scrollTo } = useScroller();

  return (
    <Panel id="intro">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-slate-900 sm:text-5xl md:text-6xl">
            {t("landing.hero.title1")}
            <br />
            <span className="text-emerald-600">{t("landing.hero.title2")}</span>
          </h1>
        </Reveal>
        <Reveal delay={90}>
          <p className="mx-auto mt-5 max-w-[54ch] text-lg leading-relaxed text-slate-600">
            {t("landing.hero.subtitle")}
          </p>
        </Reveal>
        <Reveal delay={180}>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/login"
              className="group inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-[15px] font-medium text-white shadow-sm transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-md"
            >
              {t("landing.hero.ctaPrimary")}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </a>
            <button
              type="button"
              onClick={() => scrollTo("daily")}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-[15px] font-medium text-slate-700 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            >
              {t("landing.hero.ctaSecondary")}
            </button>
          </div>
        </Reveal>
      </div>

      <Reveal delay={270} duration={650} className="mx-auto mt-10 w-full max-w-5xl lg:mt-8">
        <div className="flex justify-center">
          <Image
            src="/screenshots/dashboard.png"
            alt={t("landing.hero.screenshotAlt")}
            width={1440}
            height={900}
            sizes="(min-width: 1152px) 1152px, 100vw"
            priority
            className="h-auto w-full rounded-2xl ring-1 ring-slate-900/[0.07] shadow-[0_1px_0_rgba(16,24,40,0.03),0_24px_48px_-24px_rgba(16,24,40,0.25)] lg:w-auto lg:max-h-[41vh]"
          />
        </div>
        <div className="mt-4 hidden items-center justify-center gap-2 text-sm text-slate-400 lg:flex">
          <MoveRight className="h-4 w-4 animate-[nudge-x_2.4s_ease-in-out_infinite]" />
          <span>{t("landing.hero.caption")}</span>
        </div>
      </Reveal>
    </Panel>
  );
}
