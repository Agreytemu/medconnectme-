"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { dictionary, type Language } from "./translations";

interface LanguageContextValue {
  lang: Language;
  t: (key: string) => string;
  dict: Record<string, unknown>;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "meddashboard_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "sw" ? "sw" : "en";
  });

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((l) => {
      const next = l === "en" ? "sw" : "en";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const t = (key: string) => {
      const keys = key.split(".");
      let val: unknown = dictionary[lang];
      for (const k of keys) {
        if (val && typeof val === "object" && k in val) {
          val = (val as Record<string, unknown>)[k];
        } else {
          return key;
        }
      }
      return typeof val === "string" ? val : key;
    };
    return {
      lang,
      t,
      dict: dictionary[lang],
      setLang,
      toggleLang,
    };
  }, [lang, setLang, toggleLang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLang must be used within LanguageProvider");
  }
  return ctx;
}
