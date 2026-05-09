"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import { LOCALES, LOCALE_LABEL, type Locale } from "@/i18n/dictionaries";

type Props = {
  variant?: "default" | "light";
};

export function LanguageToggle({ variant = "default" }: Props) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isLight = variant === "light";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
          isLight
            ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
            : "border-gray-200 bg-white text-ink hover:border-gray-300 hover:bg-gray-50",
        )}
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="uppercase">{locale}</span>
        <ChevronDown className={cn("h-3 w-3 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute start-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card md:start-auto md:end-0">
          {LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLocale(l as Locale);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-ink transition hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-ink-soft">{l}</span>
                <span className="font-medium">{LOCALE_LABEL[l]}</span>
              </span>
              {locale === l && <Check className="h-4 w-4 text-brand-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
