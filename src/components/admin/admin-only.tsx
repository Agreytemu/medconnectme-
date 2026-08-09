"use client";

import { ShieldX } from "lucide-react";
import { useLang } from "@/lib/i18n/LanguageContext";
import { useProfile } from "@/lib/profile-context";

export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  const profile = useProfile();

  if (profile.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-3">
          <ShieldX className="h-7 w-7" />
        </div>
        <p className="font-semibold text-slate-700">{t("common.error")}</p>
        <p className="text-sm text-slate-400 mt-1">Admin access required</p>
      </div>
    );
  }

  return <>{children}</>;
}
