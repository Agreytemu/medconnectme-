"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { NavList } from "./nav-list";
import { LanguageToggle } from "./language-toggle";
import { useLang } from "@/lib/i18n/LanguageContext";
import { Logo } from "@/components/ui/logo";
import type { Role } from "@/lib/types";

export function MobileNav({
  role,
  onLogout,
}: {
  role: Role;
  onLogout: () => void;
}) {
  const { t } = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85%] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 h-14 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Logo className="h-7 w-7 rounded-lg" />
                <span className="text-sm font-semibold text-slate-800">
                  {t("appName")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavList role={role} />
            <div className="p-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between px-1">
                <LanguageToggle />
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 h-9 rounded-full text-red-600 hover:bg-red-50 text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  {t("nav.logout")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
