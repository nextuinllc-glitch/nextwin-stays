"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/dictionaries";

type Props = {
  from: Date | null;
  to: Date | null;
  onChange: (from: Date | null, to: Date | null) => void;
  minNights?: number;
};

const DATE_LOCALE: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-GB",
  ar: "ar",
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function buildMonth(month: Date) {
  const first = startOfMonth(month);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  // Sunday-first week (getDay() returns 0=Sunday).
  const firstWeekday = first.getDay();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= lastDay; day++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function DateRangeCalendar({ from, to, onChange, minNights = 1 }: Props) {
  const { t, locale } = useI18n();
  const today = startOfDay(new Date());
  const [cursor, setCursor] = useState<Date>(startOfMonth(from ?? today));
  const [hover, setHover] = useState<Date | null>(null);

  // Always render a single month — keeps the popover compact and lets the
  // user pick check-in and check-out without flipping between two grids.
  const months = useMemo(() => [cursor], [cursor]);

  const fmtMonth = (m: Date) =>
    new Intl.DateTimeFormat(DATE_LOCALE[locale], { month: "long", year: "numeric" })
      .format(m)
      .replace(/^./, (c) => c.toUpperCase());

  const handleClick = (day: Date) => {
    if (!from || (from && to)) {
      onChange(day, null);
      return;
    }
    if (day.getTime() < from.getTime()) {
      onChange(day, null);
      return;
    }
    const nights = Math.round((day.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    if (nights < minNights) return;
    onChange(from, day);
  };

  const inRange = (day: Date) => {
    if (!from) return false;
    const end = to ?? hover;
    if (!end) return false;
    return day.getTime() > from.getTime() && day.getTime() < end.getTime();
  };

  return (
    <div>
      <div className="grid grid-cols-1">
        {months.map((m) => (
          <div key={m.toISOString()}>
            {/* Inline nav: prev <  Month Year  > next — same on mobile and desktop */}
            <div className="mb-3 flex items-center justify-center gap-5">
              <button
                onClick={() => setCursor(addMonths(cursor, -1))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:bg-gray-50"
                aria-label={t.search.prevMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-base font-semibold text-ink">{fmtMonth(m)}</span>
              <button
                onClick={() => setCursor(addMonths(cursor, 1))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:bg-gray-50"
                aria-label={t.search.nextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
              {t.weekdays.map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 text-[13px]">
              {buildMonth(m).map((day, i) => {
                if (!day) return <div key={i} className="h-8" />;
                const past = day.getTime() < today.getTime();
                const isFrom = from && isSameDay(day, from);
                const isTo = to && isSameDay(day, to);
                const between = inRange(day);
                const disabled = past;
                return (
                  <button
                    key={i}
                    disabled={disabled}
                    onClick={() => handleClick(day)}
                    onMouseEnter={() => setHover(day)}
                    onMouseLeave={() => setHover(null)}
                    className={cn(
                      "relative mx-auto flex h-8 w-8 items-center justify-center transition",
                      "rounded-full",
                      disabled && "cursor-not-allowed text-gray-300",
                      !disabled && !isFrom && !isTo && !between && "hover:bg-gray-100",
                      // In-between range: stronger blue tint so the picked
                      // span is unmistakable. Square corners join cells into
                      // one continuous bar; the bookends override below.
                      between && "bg-brand-200 text-brand-900 font-medium rounded-none",
                      (isFrom || isTo) && "bg-brand-600 text-white font-semibold ring-2 ring-brand-700/40 ring-offset-1",
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
