"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  dictionaries,
  DEFAULT_LOCALE,
  RTL_LOCALES,
  type Locale,
} from "./dictionaries";

type Ctx = {
  locale: Locale;
  t: typeof dictionaries.fr;
  setLocale: (locale: Locale) => void;
  dir: "ltr" | "rtl";
};

const I18nContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "nextwin.locale";

function isLocale(value: string | null): value is Locale {
  return value === "fr" || value === "en" || value === "ar";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Hydrate from localStorage after mount so the SSR HTML stays consistent
  // with the default locale (avoids hydration mismatch).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isLocale(saved) && saved !== locale) {
        setLocaleState(saved);
      }
    } catch {
      // localStorage unavailable (e.g. private mode) — silently keep default.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflect the active locale onto the <html> element so screen readers,
  // hyphenation, and the RTL bidi layer pick it up.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  const dir: "ltr" | "rtl" = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

  return (
    <I18nContext.Provider
      value={{ locale, t: dictionaries[locale], setLocale, dir }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
