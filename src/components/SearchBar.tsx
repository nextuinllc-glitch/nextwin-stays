"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CalendarDays, Users, Search, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateRangeCalendar } from "./Calendar";
import { formatDateRange } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/dictionaries";

type Props = {
  variant?: "hero" | "compact";
  initialFrom?: Date | null;
  initialTo?: Date | null;
  initialGuests?: number;
};

const DATE_LOCALE: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-GB",
  ar: "ar",
};

export function SearchBar({ variant = "hero", initialFrom = null, initialTo = null, initialGuests = 1 }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const { t, locale } = useI18n();
  const [from, setFrom] = useState<Date | null>(initialFrom);
  const [to, setTo] = useState<Date | null>(initialTo);
  const [guests, setGuests] = useState(initialGuests);
  const [openPanel, setOpenPanel] = useState<"dates" | "guests" | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenPanel(null);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Auto-open the date picker when a deep-link from the mobile bottom-nav
  // arrives with `?openDates=1`. We strip the param immediately so a back
  // navigation or refresh doesn't keep popping the modal open.
  useEffect(() => {
    if (params.get("openDates") === "1") {
      setOpenPanel("dates");
      const next = new URLSearchParams(params.toString());
      next.delete("openDates");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  }, [params, pathname, router]);

  // Lock body scroll while either modal (dates / guests) is open — both
  // are centered/fixed with a backdrop, the page must stay still behind.
  useEffect(() => {
    if (!openPanel) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [openPanel]);

  const isHero = variant === "hero";

  // Local YYYY-MM-DD — never use toISOString() here, it converts to UTC
  // and rolls back a day for any tz west of GMT, breaking the date the
  // user actually picked.
  const isoLocal = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const handleSubmit = () => {
    const params = new URLSearchParams();
    if (from) params.set("from", isoLocal(from));
    if (to) params.set("to", isoLocal(to));
    params.set("guests", String(guests));
    router.push(`/properties?${params.toString()}`);
  };

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat(DATE_LOCALE[locale], { day: "numeric", month: "short" }).format(d);

  const guestsLabel = `${guests} ${guests === 1 ? t.search.guestSingular : t.search.guestPlural}`;

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative w-full",
        isHero ? "max-w-4xl" : "max-w-3xl",
      )}
    >
      <div
        className={cn(
          "grid grid-cols-1 gap-2 rounded-2xl p-2 shadow-widget ring-1 sm:grid-cols-[1fr_1fr_auto_auto] sm:gap-0 sm:p-1.5",
          // Hero variant has two readability profiles:
          //  - mobile: portrait video can be busy/bright (water, sunlight),
          //    so we use a darker frosted backdrop and force white text/icons
          //    via [&_…] selectors so labels never vanish into a wave.
          //  - sm+ : landscape image is calmer and the original light frosted
          //    glass with navy text reads as luxurious — keep that.
          isHero
            ? "bg-black/25 ring-white/30 backdrop-blur-md " +
              "sm:bg-white/15 sm:ring-white/40 sm:backdrop-blur-sm " +
              "[&_.field-label]:!text-white [&_.field-label]:font-bold " +
              "[&_.field-value]:!text-white [&_.field-value]:!text-[13px] " +
              "sm:[&_.field-label]:!text-brand-700 sm:[&_.field-value]:!text-brand-700"
            : "bg-white ring-gray-100",
        )}
      >
        {/* Arrival */}
        <button
          type="button"
          onClick={() => setOpenPanel(openPanel === "dates" ? null : "dates")}
          className={cn(
            "flex items-center gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-gray-50",
            openPanel === "dates" && "bg-gray-50",
          )}
        >
          <CalendarDays
            className={cn(
              "h-5 w-5 shrink-0",
              // Match the field text: white on mobile-hero, navy elsewhere.
              isHero ? "text-white sm:text-brand-600" : "text-brand-600",
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="field-label">{t.search.arrival}</div>
            <div className={cn("field-value truncate text-sm font-semibold", from ? "text-ink" : "text-ink-soft")}>
              {from ? fmtDate(from) : t.search.pickDate}
            </div>
          </div>
        </button>

        {/* Departure */}
        <button
          type="button"
          onClick={() => setOpenPanel(openPanel === "dates" ? null : "dates")}
          className={cn(
            "flex items-center gap-3 rounded-xl border-t border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 sm:border-l sm:border-t-0",
            openPanel === "dates" && "bg-gray-50",
          )}
        >
          <CalendarDays
            className={cn(
              "h-5 w-5 shrink-0",
              // Match the field text: white on mobile-hero, navy elsewhere.
              isHero ? "text-white sm:text-brand-600" : "text-brand-600",
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="field-label">{t.search.departure}</div>
            <div className={cn("field-value truncate text-sm font-semibold", to ? "text-ink" : "text-ink-soft")}>
              {to ? fmtDate(to) : t.search.pickDate}
            </div>
          </div>
        </button>

        {/* Guests */}
        <button
          type="button"
          onClick={() => setOpenPanel(openPanel === "guests" ? null : "guests")}
          className={cn(
            "flex items-center gap-3 rounded-xl border-t border-gray-100 px-4 py-3 text-left transition hover:bg-gray-50 sm:min-w-[180px] sm:border-l sm:border-t-0",
            openPanel === "guests" && "bg-gray-50",
          )}
        >
          <Users
            className={cn(
              "h-5 w-5 shrink-0",
              isHero ? "text-white sm:text-brand-600" : "text-brand-600",
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="field-label">{t.search.guests}</div>
            <div className="field-value text-sm font-semibold text-ink">{guestsLabel}</div>
          </div>
        </button>

        {/* CTA */}
        <button
          type="button"
          onClick={handleSubmit}
          className="btn-primary mx-1 my-1 sm:mx-0 sm:my-0"
        >
          <Search className="h-4 w-4" />
          <span>{t.search.search}</span>
        </button>
      </div>

      {/* Date panel — full modal on mobile (title + Apply), dropdown on desktop */}
      {openPanel === "dates" && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpenPanel(null)}
            aria-hidden
          />
          <div
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl",
              "inset-x-0 bottom-0 max-h-[92vh] rounded-t-3xl border-t border-gray-100",
              "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[400px] sm:max-w-[92vw] sm:max-h-[88vh] sm:rounded-2xl sm:border sm:border-gray-100 sm:p-4",
            )}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:hidden">
              <h3 className="text-lg font-semibold text-ink">{t.search.selectDatesTitle}</h3>
              <button
                type="button"
                onClick={() => setOpenPanel(null)}
                aria-label={t.search.close}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 sm:flex-none sm:p-0">
              <DateRangeCalendar
                from={from}
                to={to}
                onChange={(f, twoDates) => {
                  setFrom(f);
                  setTo(twoDates);
                  if (f && twoDates) setOpenPanel("guests");
                }}
              />
              <div className="mt-4 text-center text-sm text-ink-muted sm:hidden">
                {from && to ? formatDateRange(from, to) : t.search.selectDatesHint}
              </div>
            </div>

            <div className="hidden items-center justify-between border-t border-gray-100 pt-3 sm:mt-3 sm:flex">
              <div className="text-sm text-ink-muted">
                {from && to ? formatDateRange(from, to) : t.search.selectDatesHint}
              </div>
              <button
                type="button"
                onClick={() => {
                  setFrom(null);
                  setTo(null);
                }}
                className="rounded-full border border-gray-300 px-4 py-1.5 text-xs font-semibold text-ink-muted transition hover:border-ink hover:text-ink"
              >
                {t.search.clearDates}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-gray-100 p-4 sm:hidden">
              <button
                type="button"
                onClick={() => {
                  setFrom(null);
                  setTo(null);
                }}
                className="rounded-full border border-brand-600 px-4 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                {t.search.clearDates}
              </button>
              <button
                type="button"
                onClick={() => setOpenPanel(null)}
                disabled={!from || !to}
                className="rounded-full bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t.search.apply}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Guests panel — same modal pattern as the date picker */}
      {openPanel === "guests" && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpenPanel(null)}
            aria-hidden
          />
          <div
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl",
              "inset-x-0 bottom-0 rounded-t-3xl border-t border-gray-100",
              "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[400px] sm:max-w-[92vw] sm:rounded-2xl sm:border sm:border-gray-100",
            )}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-lg font-semibold text-ink">{t.search.guests}</h3>
              <button
                type="button"
                onClick={() => setOpenPanel(null)}
                aria-label={t.search.close}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between p-5">
              <div>
                <div className="text-sm font-semibold text-ink">{t.search.guests}</div>
                <div className="text-xs text-ink-soft">{t.search.adultsChildren}</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  disabled={guests <= 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:border-brand-300 disabled:opacity-40"
                  aria-label={t.search.decreaseGuests}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-6 text-center text-base font-semibold tabular-nums">{guests}</span>
                <button
                  onClick={() => setGuests((g) => Math.min(16, g + 1))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:border-brand-300"
                  aria-label={t.search.increaseGuests}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 p-4">
              <button
                type="button"
                onClick={() => setOpenPanel(null)}
                className="w-full rounded-full bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                {t.search.apply}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
