"use client";

import { useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useScroller } from "./scroller";

const items = [
  { key: "product", id: "daily" },
  { key: "aiTutor", id: "ai" },
  { key: "about", id: "about" },
  { key: "pricing", id: "pricing" },
  { key: "contact", id: "contact" },
  { key: "faq", id: "faq" },
] as const;

export function FloatingMenu() {
  const { t, lang, toggleLang } = useLang();
  const { scrollTo, activeId } = useScroller();
  const [open, setOpen] = useState(false);

  const go = (id: string) => {
    scrollTo(id);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 md:hidden">
      {open && (
        <div className="w-60 origin-bottom-right rounded-2xl border border-slate-900/[0.08] bg-white p-2 shadow-[0_24px_48px_-24px_rgba(16,24,40,0.35)]">
          <div className="flex flex-col">
            {items.map((it) => (
              <button
                key={it.key}
                type="button"
                onClick={() => go(it.id)}
                className={`rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  activeId === it.id
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t(`landing.nav.${it.key}`)}
              </button>
            ))}
          </div>
          <div className="my-1 border-t border-slate-900/[0.06]" />
          <button
            type="button"
            onClick={toggleLang}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Globe className="h-4 w-4" />
            {lang === "en" ? "Kiswahili" : "English"}
          </button>
          <a
            href="/login"
            className="mt-1 block rounded-lg bg-slate-900 px-3 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            {t("landing.nav.getStarted")}
          </a>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={open}
        className="grid h-14 w-14 place-items-center rounded-full bg-emerald-600 text-white shadow-lg transition-colors hover:bg-emerald-700"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
    </div>
  );
}
