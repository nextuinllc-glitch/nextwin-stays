"use client";

// Full-screen multi-month date picker that opens from the property
// detail page's sticky bar ("Vérifier la disponibilité" / "Voir les
// disponibilités"). Mirrors the Airbnb pattern: a vertical scroll of
// months, click-once for check-in, click-twice for check-out, range
// preview + price footer + "Enregistrer" to commit.
//
// Dates are committed to the URL (?from=&to=) on save — this is the
// same store that <AvailabilityInline> and <BookingWidget> read, so
// the inline calendar and the sticky-bar summary auto-update.

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/dictionaries";
import { formatPrice, nightsBetween } from "@/lib/utils";

type BlockedRange = { start: string; end: string };

type Props = {
  open: boolean;
  onClose: () => void;
  blocked: BlockedRange[];
  pricePerNight: number;
  currency: "EUR" | "USD";
  // How many months to render below the current one. Default = 11,
  // giving a full year of forward visibility (current month + 11 ahead).
  monthsAhead?: number;
  // Minimum stay enforced by the per-property rule (apartments = 2,
  // villa = 3). Default 1 keeps the popup safe when used in contexts
  // that don't pass it.
  minNights?: number;
};

const DATE_LOCALE: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-GB",
  ar: "ar",
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function parseISO(s: string | null) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : startOfDay(d);
}
function isSameDay(a: Date, b: Date) {
  return a.getTime() === b.getTime();
}

// Build a Sunday-first 6-row grid of either `Date` (real day) or null
// (padding cells). The padding count keeps every month's grid the same
// shape so the layout doesn't jump when scrolling.
function buildMonth(month: Date): (Date | null)[] {
  const first = startOfMonth(month);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstWeekday = (first.getDay() + 6) % 7; // Monday-first
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= lastDay; day++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function DatesPopup({
  open,
  onClose,
  blocked,
  pricePerNight,
  currency,
  monthsAhead = 11,
  minNights = 1,
}: Props) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const today = startOfDay(new Date());

  // Local picking state — only flushed to the URL on Save. We seed it
  // from the URL on mount so opening the picker shows the user's
  // currently-saved range.
  const [pickedFrom, setPickedFrom] = useState<Date | null>(null);
  const [pickedTo, setPickedTo] = useState<Date | null>(null);

  // Range-preview hover state — gives the user a live preview of the
  // candidate stay before committing the check-out click.
  const [hover, setHover] = useState<Date | null>(null);

  useEffect(() => {
    if (!open) return;
    setPickedFrom(parseISO(params.get("from")));
    setPickedTo(parseISO(params.get("to")));
    setHover(null);
  }, [open, params]);

  // Body-scroll lock so the page underneath doesn't drift while the
  // popup is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc closes — keyboard accessibility for desktop.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const blockedSet = useMemo(() => {
    const out = new Set<number>();
    for (const r of blocked) {
      let cur = startOfDay(new Date(r.start));
      const end = startOfDay(new Date(r.end));
      while (cur.getTime() < end.getTime()) {
        out.add(cur.getTime());
        cur = new Date(cur.getTime() + 86_400_000);
      }
    }
    return out;
  }, [blocked]);

  const rangeCrossesBlocked = (a: Date, b: Date) => {
    let cur = new Date(a.getTime() + 86_400_000);
    while (cur.getTime() < b.getTime()) {
      if (blockedSet.has(cur.getTime())) return true;
      cur = new Date(cur.getTime() + 86_400_000);
    }
    return false;
  };

  const handleClick = (day: Date) => {
    if (day.getTime() < today.getTime()) return;
    if (blockedSet.has(day.getTime())) return;
    // Start of a new selection: no `from` yet, or both ends already picked.
    if (!pickedFrom || (pickedFrom && pickedTo)) {
      setPickedFrom(day);
      setPickedTo(null);
      return;
    }
    // Clicked on or before the existing `from` → restart from there.
    if (day.getTime() <= pickedFrom.getTime()) {
      setPickedFrom(day);
      setPickedTo(null);
      return;
    }
    // Would the proposed range cross a blocked day? Then reset.
    if (rangeCrossesBlocked(pickedFrom, day)) {
      setPickedFrom(day);
      setPickedTo(null);
      return;
    }
    // Per-property minimum stay — reject any departure that yields
    // fewer nights than `minNights`. The user keeps `pickedFrom` and
    // can pick a later day until the threshold is satisfied.
    const proposedNights = nightsBetween(pickedFrom, day);
    if (proposedNights < minNights) return;
    setPickedTo(day);
  };

  const inRange = (day: Date) => {
    if (!pickedFrom) return false;
    const end = pickedTo ?? hover;
    if (!end) return false;
    return day.getTime() > pickedFrom.getTime() && day.getTime() < end.getTime();
  };

  const monthsToRender = useMemo(() => {
    const first = startOfMonth(today);
    return Array.from({ length: monthsAhead + 1 }, (_, i) => addMonths(first, i));
  }, [today, monthsAhead]);

  const fmtMonth = (m: Date) =>
    new Intl.DateTimeFormat(DATE_LOCALE[locale], { month: "long", year: "numeric" })
      .format(m)
      .replace(/^./, (c) => c.toUpperCase());

  const weekdayLabels = useMemo(() => {
    // Generate locale-aware Mon-Sun labels. The 2026-05-04 anchor is a
    // Monday so we walk forward 7 days from there to fill the row.
    const base = new Date(2026, 4, 4);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return new Intl.DateTimeFormat(DATE_LOCALE[locale], { weekday: "narrow" }).format(d);
    });
  }, [locale]);

  const nights = nightsBetween(pickedFrom, pickedTo);
  const total = nights > 0 ? pricePerNight * nights : 0;

  // Header title mirrors Airbnb's three-state copy:
  //   - "Sélectionnez la date d'arrivée" (no `from`)
  //   - "Sélectionnez la date de départ" (`from` only)
  //   - "{N} nuits" (both)
  const headerTitle =
    pickedFrom && pickedTo
      ? `${nights} ${nights === 1 ? t.booking.nightSingular : t.booking.nightPlural}`
      : pickedFrom
      ? t.search.departure
      : t.search.arrival;
  const headerSub =
    pickedFrom && pickedTo
      ? `${fmtDate(pickedFrom, locale)} - ${fmtDate(pickedTo, locale)}`
      : t.search.selectDatesHint;

  const reset = () => {
    setPickedFrom(null);
    setPickedTo(null);
    setHover(null);
  };

  const commit = () => {
    const next = new URLSearchParams(params.toString());
    if (pickedFrom) next.set("from", isoDay(pickedFrom));
    else next.delete("from");
    if (pickedTo) next.set("to", isoDay(pickedTo));
    else next.delete("to");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    onClose();
  };

  if (!open) return null;

  const canSave = Boolean(pickedFrom && pickedTo);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.search.selectDatesTitle}
      className="fixed inset-0 z-50 flex flex-col bg-white"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label={t.search.close}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-sm font-semibold text-ink underline underline-offset-2 transition hover:opacity-70"
          >
            {t.search.clearDates}
          </button>
        </div>
        <div className="mt-3">
          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">
            {headerTitle}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">{headerSub}</p>
        </div>
      </header>

      {/* Scrollable months list */}
      <div className="flex-1 overflow-y-auto">
        <div className="container-narrow py-6">
          {/* Sticky weekday row so it stays visible while the user
              scrolls through the months below. */}
          <div className="sticky top-0 z-[1] -mx-1 grid grid-cols-7 border-b border-gray-100 bg-white pb-2 pt-1 text-center text-[12px] font-semibold uppercase text-ink-muted">
            {weekdayLabels.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </div>

          {monthsToRender.map((month) => (
            <MonthGrid
              key={`${month.getFullYear()}-${month.getMonth()}`}
              month={month}
              today={today}
              pickedFrom={pickedFrom}
              pickedTo={pickedTo}
              hover={hover}
              setHover={setHover}
              onClick={handleClick}
              blockedSet={blockedSet}
              inRange={inRange}
              monthLabel={fmtMonth(month)}
            />
          ))}
        </div>
      </div>

      {/* Footer — total price preview + save */}
      <footer className="border-t border-gray-100 bg-white px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            {canSave && nights > 0 ? (
              <>
                <div className="text-base font-semibold text-ink underline decoration-1 underline-offset-4">
                  {formatPrice(total, currency)}
                </div>
                <div className="text-[11px] text-ink-muted">
                  {t.booking.total} · {nights}{" "}
                  {nights === 1 ? t.booking.nightSingular : t.booking.nightPlural}
                </div>
              </>
            ) : (
              <div className="text-sm font-semibold text-ink">
                {t.booking.addDatesForPrice}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={commit}
            disabled={!canSave}
            className={cn(
              "rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition",
              !canSave && "cursor-not-allowed opacity-50",
            )}
          >
            {t.search.apply}
          </button>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function MonthGrid({
  month,
  today,
  pickedFrom,
  pickedTo,
  hover,
  setHover,
  onClick,
  blockedSet,
  inRange,
  monthLabel,
}: {
  month: Date;
  today: Date;
  pickedFrom: Date | null;
  pickedTo: Date | null;
  hover: Date | null;
  setHover: (d: Date | null) => void;
  onClick: (d: Date) => void;
  blockedSet: Set<number>;
  inRange: (d: Date) => boolean;
  monthLabel: string;
}) {
  const cells = useMemo(() => buildMonth(month), [month]);

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-base font-bold text-ink">{monthLabel}</h3>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((d, i) => {
          if (!d) return <span key={i} className="aspect-square" />;
          const isPast = d.getTime() < today.getTime();
          const isBlocked = blockedSet.has(d.getTime());
          const isFrom = pickedFrom && isSameDay(d, pickedFrom);
          const isTo = pickedTo && isSameDay(d, pickedTo);
          const inside = inRange(d);
          const disabled = isPast || isBlocked;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onClick(d)}
              onMouseEnter={() => setHover(d)}
              disabled={disabled}
              className={cn(
                "relative aspect-square text-sm font-medium transition",
                disabled && "text-ink-soft line-through",
                !disabled && !isFrom && !isTo && !inside && "text-ink hover:bg-gray-100 rounded-full",
                inside && !isFrom && !isTo && "bg-gray-100 text-ink",
                (isFrom || isTo) && "rounded-full bg-ink text-white",
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function fmtDate(d: Date, locale: Locale) {
  return new Intl.DateTimeFormat(DATE_LOCALE[locale], {
    day: "numeric",
    month: "short",
  }).format(d);
}
