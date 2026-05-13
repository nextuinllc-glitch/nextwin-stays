"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

type BlockedRange = { start: string; end: string };

type Props = {
  blocked: BlockedRange[];
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

function buildMonth(month: Date) {
  const first = startOfMonth(month);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstWeekday = first.getDay(); // Sunday-first
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= lastDay; day++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// Inline availability calendar — also doubles as the page's primary date
// picker so we don't end up with a redundant modal floating on top of the
// map. State lives in URL params (?from=&to=) so the BookingWidget reads
// the same values and stays in sync.
export function AvailabilityInline({ blocked }: Props) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const today = startOfDay(new Date());
  const [cursor, setCursor] = useState<Date>(startOfMonth(today));
  const [hover, setHover] = useState<Date | null>(null);
  const months = useMemo(() => [cursor, addMonths(cursor, 1)], [cursor]);

  // Local picked-state. We avoid pushing partial selections to the URL
  // because every `router.replace` re-renders the whole detail page
  // (Reviews, Map, etc.) and the lag is very noticeable on click 1.
  // URL is only written when both ends are picked OR when the user
  // clears the range — that's the only moment the booking widget /
  // sticky bar actually need a refresh.
  const urlFrom = parseISO(params.get("from"));
  const urlTo = parseISO(params.get("to"));
  const [localFrom, setLocalFrom] = useState<Date | null>(urlFrom);
  const [localTo, setLocalTo] = useState<Date | null>(urlTo);

  // Sync local state with the URL when it changes externally (e.g.,
  // the multi-month popup saves a range). The string keys keep the
  // effect dependency stable; comparing Date instances would re-fire
  // every render because parseISO returns fresh objects.
  const urlFromKey = params.get("from") ?? "";
  const urlToKey = params.get("to") ?? "";
  useEffect(() => {
    setLocalFrom(parseISO(urlFromKey || null));
    setLocalTo(parseISO(urlToKey || null));
  }, [urlFromKey, urlToKey]);

  const from = localFrom;
  const to = localTo;

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

  // Range crosses a blocked day? Then the proposed stay isn't valid.
  const rangeCrossesBlocked = (a: Date, b: Date) => {
    let cur = new Date(a.getTime() + 86_400_000); // exclusive of check-in
    while (cur.getTime() < b.getTime()) {
      if (blockedSet.has(cur.getTime())) return true;
      cur = new Date(cur.getTime() + 86_400_000);
    }
    return false;
  };

  const writeRangeToUrl = (f: Date | null, t: Date | null) => {
    const next = new URLSearchParams(params.toString());
    if (f) next.set("from", isoDay(f));
    else next.delete("from");
    if (t) next.set("to", isoDay(t));
    else next.delete("to");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  // Picks a new start: instant local state update, URL cleared so the
  // booking widget shows "Add dates for pricing" again. This is the
  // hot path that was previously freezing — partial selections now
  // never touch the URL or re-render parents.
  const setStart = (day: Date) => {
    setLocalFrom(day);
    setLocalTo(null);
    // Clear any stale completed range from the URL — keeps the sticky
    // bar honest. Single replace, then nothing until the second click.
    if (urlFrom || urlTo) writeRangeToUrl(null, null);
  };

  const setEnd = (start: Date, end: Date) => {
    setLocalFrom(start);
    setLocalTo(end);
    writeRangeToUrl(start, end);
  };

  const handleClick = (day: Date) => {
    if (day.getTime() < today.getTime()) return;
    if (blockedSet.has(day.getTime())) return;
    if (!from || (from && to)) {
      setStart(day);
      return;
    }
    if (day.getTime() <= from.getTime()) {
      setStart(day);
      return;
    }
    if (rangeCrossesBlocked(from, day)) {
      // Reset start to clicked day if the proposed range overlaps an
      // existing booking — friendlier than silently rejecting.
      setStart(day);
      return;
    }
    setEnd(from, day);
  };

  const clearDates = () => {
    setLocalFrom(null);
    setLocalTo(null);
    writeRangeToUrl(null, null);
  };

  const inRange = (day: Date) => {
    if (!from) return false;
    const end = to ?? hover;
    if (!end) return false;
    return day.getTime() > from.getTime() && day.getTime() < end.getTime();
  };

  // When a property changes (or the user lands with stale params for a
  // previous property), make sure the displayed cursor is at-or-after
  // today so they don't see an empty past month.
  useEffect(() => {
    if (cursor.getTime() < startOfMonth(today).getTime()) {
      setCursor(startOfMonth(today));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmtMonth = (m: Date) =>
    new Intl.DateTimeFormat(DATE_LOCALE[locale], { month: "long", year: "numeric" })
      .format(m)
      .replace(/^./, (c) => c.toUpperCase());

  return (
    <section id="availability">
      <h2 className="font-display text-2xl font-semibold text-ink">{t.availability.title}</h2>
      <p className="mt-1 text-sm text-ink-muted">{t.search.selectDatesHint}</p>

      <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setCursor(addMonths(cursor, -1))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:bg-gray-50"
            aria-label={t.search.prevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCursor(addMonths(cursor, 1))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:bg-gray-50"
            aria-label={t.search.nextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {months.map((m, idx) => (
            <div key={m.toISOString()} className={idx === 1 ? "hidden sm:block" : ""}>
              <div className="mb-2 text-center text-[13px] font-semibold text-ink">
                {fmtMonth(m)}
              </div>
              <div className="grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                {t.weekdays.map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 text-[13px]">
                {buildMonth(m).map((day, i) => {
                  if (!day) return <div key={i} className="h-9" />;
                  const past = day.getTime() < today.getTime();
                  const booked = blockedSet.has(day.getTime());
                  const isFrom = from && isSameDay(day, from);
                  const isTo = to && isSameDay(day, to);
                  const between = inRange(day);
                  const disabled = past || booked;

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleClick(day)}
                      onMouseEnter={() => !disabled && setHover(day)}
                      onMouseLeave={() => setHover(null)}
                      className={cn(
                        "relative mx-auto flex h-9 w-9 items-center justify-center rounded-full font-medium transition",
                        // States
                        disabled && past && "cursor-not-allowed text-gray-300 line-through",
                        disabled && booked && !past &&
                          "cursor-not-allowed bg-rose-50 text-rose-400 line-through",
                        !disabled && !isFrom && !isTo && !between && "text-ink hover:bg-gray-100",
                        between && "rounded-none bg-brand-100 text-brand-900 font-semibold",
                        (isFrom || isTo) &&
                          "bg-brand-600 text-white font-semibold ring-2 ring-brand-700/40 ring-offset-1",
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

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3 text-[11px] text-ink-muted">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-ink" />
              {t.availability.legendAvailable}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-200" />
              {t.availability.legendBooked}
            </span>
            <span className="inline-flex items-center gap-1.5 text-ink-soft">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-200" />
              {t.availability.legendPast}
            </span>
          </div>
          {(from || to) && (
            <button
              type="button"
              onClick={clearDates}
              className="text-[11px] font-semibold text-brand-700 underline-offset-2 hover:underline"
            >
              {t.search.clearDates}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
