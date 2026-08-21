"use client";

import { useLang } from "@/lib/i18n/LanguageContext";
import type { Dictionary } from "@/lib/i18n/translations";
import { Panel } from "./scroller";
import { Reveal } from "./reveal";

function MiniDashboard() {
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 shrink-0 rounded-full bg-emerald-500" />
        <div className="h-2 w-16 rounded bg-slate-200" />
        <div className="ml-auto h-2 w-8 rounded bg-slate-200" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["3.8", "92%", "120"].map((n) => (
          <div key={n} className="rounded-lg bg-emerald-50 p-2">
            <p className="text-sm font-semibold text-slate-900">{n}</p>
            <p className="text-[9px] text-slate-500">Stat</p>
          </div>
        ))}
      </div>
      <div className="flex-1 rounded-lg bg-slate-50 p-2">
        <svg
          viewBox="0 0 100 40"
          className="h-full w-full"
          preserveAspectRatio="none"
          aria-hidden
        >
          <polyline
            points="0,32 15,28 30,30 45,18 60,22 75,10 100,14"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-6 rounded bg-slate-100" />
        <div className="h-6 rounded bg-slate-100" />
      </div>
    </div>
  );
}

function Device({ kind, label }: { kind: "phone" | "tablet" | "computer"; label: string }) {
  if (kind === "phone") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-[200px] rounded-[2.2rem] bg-slate-900 p-3 shadow-xl">
          <span className="absolute left-1/2 top-2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-slate-700" />
          <div className="h-[360px] overflow-hidden rounded-[1.6rem] bg-white">
            <MiniDashboard />
          </div>
        </div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    );
  }
  if (kind === "tablet") {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-[320px] rounded-3xl bg-slate-900 p-4 shadow-xl">
          <div className="h-[400px] overflow-hidden rounded-2xl bg-white">
            <MiniDashboard />
          </div>
        </div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-[520px] rounded-xl bg-slate-900 p-3 shadow-xl">
        <div className="h-[300px] overflow-hidden rounded-lg bg-white">
          <MiniDashboard />
        </div>
      </div>
      <div className="h-3 w-24 rounded-b-md bg-slate-900" />
      <div className="h-2 w-44 rounded bg-slate-200" />
      <p className="text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

export function Showcase() {
  const { dict } = useLang();
  const d = (dict as unknown as Dictionary).landing.screenshots;
  const devices = [
    { kind: "phone" as const, label: d.phone },
    { kind: "tablet" as const, label: d.tablet },
    { kind: "computer" as const, label: d.computer },
  ];

  return (
    <Panel id="screenshots">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
            {d.kicker}
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            {d.title}
          </h2>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-slate-600">
            {d.subtitle}
          </p>
        </Reveal>
        <div className="mt-12 flex flex-col items-center gap-12 lg:flex-row lg:items-end lg:justify-center lg:gap-8">
          {devices.map((dev, i) => (
            <Reveal key={dev.kind} delay={i * 80}>
              <Device kind={dev.kind} label={dev.label} />
            </Reveal>
          ))}
        </div>
      </div>
    </Panel>
  );
}
