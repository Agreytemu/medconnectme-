"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useScroller } from "./scroller";
import { Logo } from "@/components/ui/logo";

const links = [
  { key: "product", href: "#daily" },
  { key: "aiTutor", href: "#ai" },
  { key: "pricing", href: "#pricing" },
  { key: "faq", href: "#faq" },
] as const;

export function LandingNav() {
  const { t, lang, toggleLang } = useLang();
  const { scrollTo, activeId, desktop } = useScroller();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      if (!desktop) {
        if (y > 160 && y > lastY + 4) setHidden(true);
        else if (y < lastY - 4 || y <= 160) setHidden(false);
      }
      lastY = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [desktop]);

  const solid = desktop || scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        !desktop && hidden ? "-translate-y-full" : "translate-y-0"
      } ${
        solid
          ? "border-b border-slate-900/[0.06] bg-white/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 rounded-lg" />
          <span className="text-[15px] font-semibold tracking-tight text-slate-900">
            MedConnectMe
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => {
            const id = l.href.slice(1);
            const active = activeId === id;
            return (
              <button
                key={l.key}
                type="button"
                onClick={() => scrollTo(id)}
                className={`relative text-sm transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:bg-slate-900 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:text-slate-900 hover:after:scale-x-100 ${
                  active
                    ? "text-slate-900 after:scale-x-100"
                    : "text-slate-600 after:scale-x-0"
                }`}
              >
                {t(`landing.nav.${l.key}`)}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLang}
            className="hidden text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:block"
            aria-label="Switch language"
          >
            {lang === "en" ? "Kiswahili" : "English"}
          </button>
          <Link
            href="/login"
            className="hidden text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 sm:block"
          >
            {t("landing.nav.login")}
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-md"
          >
            {t("landing.nav.getStarted")}
          </Link>
        </div>
      </div>
    </header>
  );
}
