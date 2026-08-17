"use client";

import { LanguageToggle } from "@/components/dashboard/language-toggle";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-gradient-to-b from-emerald-50 via-white to-white">
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
        className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/40"
      />
      <div className="relative z-10 flex h-screen flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <span />
          <LanguageToggle />
        </header>
        <div className="flex flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}
