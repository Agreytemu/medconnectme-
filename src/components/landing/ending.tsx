"use client";

import { useState } from "react";
import { Check, ChevronDown, HeartPulse } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import type { Dictionary } from "@/lib/i18n/translations";
import { Panel } from "./scroller";

const planKeys = ["free", "premium", "institution"] as const;

export function Pricing() {
  const { dict } = useLang();
  const d = (dict as unknown as Dictionary).landing.pricing;
  const [yearly, setYearly] = useState(true);

  return (
    <Panel id="pricing">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            {d.title}
          </h2>
          <p className="mt-3 text-[17px] leading-relaxed text-slate-600">
            {d.subtitle}
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                !yearly ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {d.monthly}
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                yearly ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {d.yearly}
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {planKeys.map((key) => {
            const p = d.plans[key];
            const popular = key === "premium";
            const price =
              key === "premium"
                ? yearly
                  ? "$6"
                  : "$8"
                : key === "free"
                  ? "$0"
                  : p.price;

            return (
              <div
                key={key}
                className={`flex flex-col rounded-2xl p-6 ${
                  popular
                    ? "bg-slate-900 text-white shadow-[0_1px_0_rgba(16,24,40,0.03),0_24px_48px_-24px_rgba(16,24,40,0.35)]"
                    : "bg-white ring-1 ring-slate-900/[0.08]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{p.name}</p>
                  {popular && (
                    <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300">
                      {d.popular}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span
                    key={price}
                    className="animate-[price-in_0.18s_ease-out] text-4xl font-semibold tracking-tight"
                  >
                    {price}
                  </span>
                  <span
                    className={`text-sm ${
                      popular ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {p.period}
                  </span>
                </div>
                <p
                  className={`mt-3 text-sm ${
                    popular ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {p.desc}
                </p>
                <ul className="mt-5 flex-1 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          popular ? "text-emerald-300" : "text-emerald-600"
                        }`}
                      />
                      <span
                        className={
                          popular ? "text-slate-300" : "text-slate-600"
                        }
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/login"
                  className={`mt-6 rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors ${
                    popular
                      ? "bg-white text-slate-900 hover:bg-slate-100"
                      : "bg-slate-900 text-white hover:bg-slate-700"
                  }`}
                >
                  {p.cta}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

export function FAQ() {
  const { dict } = useLang();
  const d = (dict as unknown as Dictionary).landing.faq;
  const footer = (dict as unknown as Dictionary).landing.footer;
  const [open, setOpen] = useState<number | null>(0);

  const columns = [
    { title: footer.product, links: footer.productLinks },
    { title: footer.students, links: footer.studentLinks },
    { title: footer.resources, links: footer.resourceLinks },
  ];

  return (
    <Panel id="faq">
      <div className="grid gap-14 lg:grid-cols-3 lg:gap-16">
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            {d.title}
          </h2>
          <div className="mt-8">
            {d.items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div key={i} className="border-t border-slate-900/[0.08]">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  >
                    <span className="text-[17px] font-medium text-slate-900">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-5 pr-10 text-[15px] leading-relaxed text-slate-600">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="border-t border-slate-900/[0.08]" />
          </div>
        </div>

        <footer className="flex flex-col gap-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-600 text-white">
                <HeartPulse className="h-4 w-4" />
              </span>
              <span className="text-[15px] font-semibold tracking-tight text-slate-900">
                MedConnectMe
              </span>
            </div>
            <p className="mt-4 max-w-[28ch] text-sm leading-relaxed text-slate-600">
              {footer.tagline}
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-medium text-slate-900">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mt-auto flex flex-col gap-1 border-t border-slate-900/[0.06] pt-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} MedConnectMe. {footer.rights}
            </p>
            <p className="text-xs text-slate-500">{footer.made}</p>
          </div>
        </footer>
      </div>
    </Panel>
  );
}
