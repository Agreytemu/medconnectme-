"use client";

import { Star } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import type { Dictionary } from "@/lib/i18n/translations";
import { Panel } from "./scroller";
import { Reveal } from "./reveal";

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600">
      {children}
    </p>
  );
}

export function Testimonies() {
  const { t } = useLang();
  const cards = [
    {
      quote: t("landing.testimonial.quote1"),
      name: t("landing.testimonial.name1"),
      role: t("landing.testimonial.role1"),
    },
    {
      quote: t("landing.testimonial.quote2"),
      name: t("landing.testimonial.name2"),
      role: t("landing.testimonial.role2"),
    },
  ];

  return (
    <Panel id="testimonies">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <Kicker>{t("landing.testimonial.kicker")}</Kicker>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
            {t("landing.testimonial.title")}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {cards.map((c, i) => (
            <Reveal key={i} delay={i * 80}>
              <figure className="flex h-full flex-col rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-900/[0.06]">
                <blockquote className="text-[17px] leading-relaxed text-slate-700">
                  &ldquo;{c.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
                    {c.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function Reviews() {
  const { dict } = useLang();
  const d = (dict as unknown as Dictionary).landing.reviews;

  return (
    <Panel id="reviews">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <Kicker>{d.kicker}</Kicker>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                {d.title}
              </h2>
              <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-slate-600">
                {d.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-5 py-4 ring-1 ring-slate-900/[0.06]">
              <span className="text-4xl font-semibold tracking-tight text-slate-900">
                {d.average}
              </span>
              <div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-slate-500">{d.count}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {d.items.map((r, i) => (
            <Reveal key={i} delay={i * 80}>
              <article className="flex h-full flex-col rounded-2xl bg-white p-6 ring-1 ring-slate-900/[0.06]">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-4 w-4 ${
                        s <= r.rating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-200 text-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-700">
                  &ldquo;{r.text}&rdquo;
                </p>
                <div className="mt-5">
                  <p className="text-sm font-medium text-slate-900">{r.name}</p>
                  <p className="text-xs text-slate-500">{r.role}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </Panel>
  );
}
