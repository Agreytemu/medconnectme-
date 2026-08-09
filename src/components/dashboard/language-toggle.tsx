"use client";

import { Languages } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, toggleLang } = useLang();

  return (
    <button
      onClick={toggleLang}
      className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors ${className ?? ""}`}
      title="Switch language / Badilisha lugha"
    >
      <Languages className="h-4 w-4" />
      {lang === "en" ? "SW" : "EN"}
    </button>
  );
}
