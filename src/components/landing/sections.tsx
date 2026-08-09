"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { User, Bot } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import type { Dictionary } from "@/lib/i18n/translations";
import { Panel } from "./scroller";
import { Reveal } from "./reveal";

function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
      {children}
    </p>
  );
}

function Screenshot({
  src,
  alt,
  caption,
  className = "",
  imgClass = "",
}: {
  src: string;
  alt: string;
  caption: string;
  className?: string;
  imgClass?: string;
}) {
  return (
    <figure className={className}>
      <div className="flex justify-center">
        <Image
          src={src}
          alt={alt}
          width={1440}
          height={900}
          sizes="(min-width: 1152px) 1152px, 100vw"
          className={`h-auto w-full rounded-2xl ring-1 ring-slate-900/[0.07] shadow-[0_1px_0_rgba(16,24,40,0.03),0_24px_48px_-24px_rgba(16,24,40,0.2)] lg:w-auto ${
            imgClass || "lg:max-h-[60vh]"
          }`}
        />
      </div>
      <figcaption className="mt-3 text-sm text-slate-500">{caption}</figcaption>
    </figure>
  );
}

export function DailyView() {
  const { t } = useLang();
  return (
    <Panel id="daily">
      <div className="grid items-center gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <Reveal>
            <Kicker>{t("landing.daily.kicker")}</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              {t("landing.daily.title")}
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-slate-600">
              {t("landing.daily.body")}
            </p>
          </Reveal>
        </div>
        <div className="md:col-span-7">
          <Reveal delay={80}>
            <Screenshot
              src="/screenshots/timetable.png"
              alt={t("landing.daily.screenshotAlt")}
              caption={t("landing.daily.caption")}
            />
          </Reveal>
        </div>
      </div>
    </Panel>
  );
}

export function Results() {
  const { t } = useLang();
  return (
    <Panel id="results">
      <div className="grid items-center gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <Reveal>
            <Kicker>{t("landing.results.kicker")}</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              {t("landing.results.title")}
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-slate-600">
              {t("landing.results.body")}
            </p>
          </Reveal>
        </div>
        <div className="md:col-span-7">
          <Reveal delay={80}>
            <Screenshot
              src="/screenshots/grades.png"
              alt={t("landing.results.screenshotAlt")}
              caption={t("landing.results.caption")}
            />
          </Reveal>
        </div>
      </div>
    </Panel>
  );
}

export function Wards() {
  const { t } = useLang();
  return (
    <Panel id="wards">
      <div className="grid items-center gap-12 md:grid-cols-12">
        <div className="md:col-span-7 md:order-2">
          <Reveal>
            <Screenshot
              src="/screenshots/rotations.png"
              alt={t("landing.wards.screenshotAlt")}
              caption={t("landing.wards.caption")}
            />
          </Reveal>
        </div>
        <div className="md:col-span-5 md:order-1">
          <Reveal delay={80}>
            <Kicker>{t("landing.wards.kicker")}</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              {t("landing.wards.title")}
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-slate-600">
              {t("landing.wards.body")}
            </p>
          </Reveal>
        </div>
      </div>
    </Panel>
  );
}

export function Reference() {
  const { t } = useLang();
  return (
    <Panel id="reference">
      <div className="grid items-center gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <Reveal>
            <Kicker>{t("landing.reference.kicker")}</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              {t("landing.reference.title")}
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-slate-600">
              {t("landing.reference.body")}
            </p>
          </Reveal>
        </div>
        <div className="md:col-span-7">
          <Reveal delay={80}>
            <Screenshot
              src="/screenshots/formulary.png"
              alt={t("landing.reference.screenshotAlt")}
              caption={t("landing.reference.caption")}
            />
          </Reveal>
        </div>
      </div>
    </Panel>
  );
}

export function AITutor() {
  const { t } = useLang();
  return (
    <Panel id="ai">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <Reveal>
            <Kicker>{t("landing.ai.kicker")}</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              {t("landing.ai.title")}
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-slate-600">
              {t("landing.ai.body")}
            </p>
          </Reveal>
        </div>
        <Reveal delay={80}>
          <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-900/[0.06] md:p-8">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-white">
                <Bot className="h-4 w-4" />
              </span>
              <p className="text-sm font-medium text-slate-900">
                {t("landing.ai.ask")}
              </p>
            </div>
            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-600">
                  <User className="h-3.5 w-3.5" />
                </span>
                <p className="rounded-xl bg-white px-4 py-2.5 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-900/[0.06]">
                  {t("landing.ai.user1")}
                </p>
              </div>
              <div className="flex items-start justify-end gap-3">
                <p className="max-w-[85%] rounded-xl bg-emerald-600 px-4 py-2.5 text-sm leading-relaxed text-white">
                  {t("landing.ai.ai1")}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-200 text-slate-600">
                  <User className="h-3.5 w-3.5" />
                </span>
                <p className="rounded-xl bg-white px-4 py-2.5 text-sm leading-relaxed text-slate-700 ring-1 ring-slate-900/[0.06]">
                  {t("landing.ai.user2")}
                </p>
              </div>
              <div className="flex items-start justify-end gap-3">
                <p className="max-w-[85%] rounded-xl bg-emerald-600 px-4 py-2.5 text-sm leading-relaxed text-white">
                  {t("landing.ai.ai2")}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Panel>
  );
}

export function SmallThings() {
  const { t, dict } = useLang();
  const d = (dict as unknown as Dictionary).landing.testimonial;

  return (
    <Panel id="small">
      <div className="grid items-center gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <Reveal>
            <Kicker>{t("landing.small.kicker")}</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              {t("landing.small.title")}
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-slate-600">
              {t("landing.small.body")}
            </p>
          </Reveal>
          <div className="mt-10 space-y-8">
            <Reveal delay={120}>
              <blockquote>
                <p className="text-lg leading-relaxed text-slate-700">
                  “{d.quote1}”
                </p>
                <footer className="mt-2 text-sm text-slate-500">
                  {d.name1} · {d.role1}
                </footer>
              </blockquote>
            </Reveal>
            <Reveal delay={200}>
              <blockquote>
                <p className="text-lg leading-relaxed text-slate-700">
                  “{d.quote2}”
                </p>
                <footer className="mt-2 text-sm text-slate-500">
                  {d.name2} · {d.role2}
                </footer>
              </blockquote>
            </Reveal>
          </div>
        </div>
        <div className="md:col-span-7 space-y-6">
          <Reveal delay={80}>
            <Screenshot
              imgClass="lg:max-h-[26vh]"
              src="/screenshots/id-card.png"
              alt={t("landing.small.idAlt")}
              caption={t("landing.small.idCaption")}
            />
          </Reveal>
          <Reveal delay={160}>
            <Screenshot
              imgClass="lg:max-h-[28vh]"
              src="/screenshots/case-logs.png"
              alt={t("landing.small.caseAlt")}
              caption={t("landing.small.caseCaption")}
            />
          </Reveal>
        </div>
      </div>
    </Panel>
  );
}
