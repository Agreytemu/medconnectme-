"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n/LanguageContext";
import { LanguageToggle } from "@/components/dashboard/language-toggle";
import { Logo } from "@/components/ui/logo";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white">
      <video
        className="auth-bg absolute inset-0 h-full w-full object-cover"
        src="/video/ecg-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/70 to-white/85"
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-emerald-600"
          >
            <Logo className="h-7 w-7 rounded-md" />
            {t("appName")}
          </Link>
          <LanguageToggle />
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-16">
          {children}
        </div>
      </div>
    </div>
  );
}
