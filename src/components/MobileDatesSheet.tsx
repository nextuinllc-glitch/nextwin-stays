"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Users, Minus, Plus, Search, ChevronLeft } from "lucide-react";
import { DateRangeCalendar } from "./Calendar";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
};

// Standalone bottom-sheet for the mobile "Dates" entry point. Two-step
// flow:
//   1. Single-month range calendar — pick check-in → pick check-out.
//      Auto-advances to step 2 the moment both dates are set.
//   2. Guests counter — quick +/-, then "Search properties" lands the
//      user on /properties?from=&to=&guests= so the listing grid filters
//      against the picked criteria immediately.
export function MobileDatesSheet({ open, onClose }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [step, setStep] = useState<"dates" | "guests">("dates");
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);

  // Reset state every time the sheet opens — users expect a fresh
  // canvas, not the stale dates from a previous trip plan.
  useEffect(() => {
    if (open) {
      setStep("dates");
      setFrom(null);
      setTo(null);
      setGuests(2);
    }
  }, [open]);

  // Lock body scroll while the sheet is up.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Calendar callback — tracks both ends, auto-advances when complete.
  const handleDateChange = (f: Date | null, t: Date | null) => {
    setFrom(f);
    setTo(t);
    if (f && t) {
      // Small timeout so the user sees the second date highlighted
      // before the panel switches — feels less jumpy.
      setTimeout(() => setStep("guests"), 220);
    }
  };

  // Build a YYYY-MM-DD string using **local** components — never call
  // toISOString(), which converts to UTC and rolls back a day in any
  // timezone west of GMT after midnight local. This was the bug that
  // turned May 12 into 2026-05-11 in the URL.
  const isoLocal = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (from) params.set("from", isoLocal(from));
    if (to) params.set("to", isoLocal(to));
    params.set("guests", String(guests));
    onClose();
    router.push(`/properties?${params.toString()}`);
  };

  if (!open) return null;

  // Format date as e.g. "Mai 12" for the chip preview at the top of the
  // guests step.
  const fmt = (d: Date | null) =>
    d
      ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(d)
      : "—";

  return (
    <>
      {/* Backdrop — tap to dismiss */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet body — slides up from the bottom edge */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={step === "dates" ? t.search.selectDatesTitle : t.search.guests}
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col overflow-hidden rounded-t-3xl border-t border-gray-100 bg-white shadow-2xl lg:hidden"
      >
        {/* Drag handle hint */}
        <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-gray-200" aria-hidden />

        <header className="flex items-center gap-3 px-5 py-4">
          {step === "guests" ? (
            <button
              type="button"
              onClick={() => setStep("dates")}
              aria-label={t.search.prevMonth}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : (
            <span className="h-9 w-9" aria-hidden />
          )}
          <h3 className="flex-1 text-center text-base font-semibold text-ink">
            {step === "dates" ? t.search.selectDatesTitle : t.search.guests}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.search.close}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {step === "dates" ? (
            <>
              <DateRangeCalendar from={from} to={to} onChange={handleDateChange} />
              <p className="mt-4 text-center text-sm text-ink-muted">
                {from && to
                  ? `${fmt(from)} → ${fmt(to)}`
                  : from
                  ? `${fmt(from)} → ${t.search.pickDate}`
                  : t.search.selectDatesHint}
              </p>
            </>
          ) : (
            <>
              {/* Date confirmation strip — reminds the user of the dates
                  they just picked while they tweak guests. */}
              <div className="flex items-center justify-between rounded-2xl bg-cream-100 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  {t.search.arrival} → {t.search.departure}
                </div>
                <div className="text-sm font-semibold text-ink">
                  {fmt(from)} → {fmt(to)}
                </div>
              </div>

              {/* Guests stepper */}
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-base font-semibold text-ink">
                    <Users className="h-4 w-4" />
                    {t.search.guests}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-soft">
                    {t.search.adultsChildren}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    disabled={guests <= 1}
                    aria-label={t.search.decreaseGuests}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:border-brand-400 disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center text-base font-semibold tabular-nums">
                    {guests}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGuests((g) => Math.min(16, g + 1))}
                    aria-label={t.search.increaseGuests}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:border-brand-400"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSearch}
                className={cn("btn-primary mt-8 w-full", "!py-4")}
              >
                <Search className="h-4 w-4" />
                {t.search.search}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
