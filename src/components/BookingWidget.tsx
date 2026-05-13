"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Minus, Plus, ShieldCheck, X } from "lucide-react";
import { StarRating } from "./StarRating";
import { getAverageRating, getReviewCount } from "@/lib/reviews-data";
import { formatPrice, nightsBetween, cn } from "@/lib/utils";
import type { Property } from "@/lib/properties";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/dictionaries";
import { DatesPopup } from "./DatesPopup";

type BlockedRange = { start: string; end: string };

type FeeSettings = { cleaningFee: number; serviceFeeRate: number };

type Props = {
  property: Property;
  // Blocked dates passed through to the multi-month date picker so the
  // popup respects the same availability rules as the inline calendar.
  blocked?: BlockedRange[];
  // Site-wide fees from Supabase Settings (admin-editable). Defaults
  // to zero so a fresh seed shows clean totals.
  fees?: FeeSettings;
};

// Default fees when the parent doesn't pass any — keeps the widget
// safe to mount in isolation (e.g., admin previews). Real values come
// from Supabase Settings via the `fees` prop.
const DEFAULT_FEES: FeeSettings = { cleaningFee: 0, serviceFeeRate: 0 };

// Concierge WhatsApp number — kept aligned with CheckoutForm so the
// "Envoyer une demande" CTA in the mobile sheet routes to the same line.
const CONCIERGE_PHONE = "+212600000000";

const DATE_LOCALE: Record<Locale, string> = {
  fr: "fr-FR",
  en: "en-GB",
  ar: "ar",
};

function parseISO(s: string | null) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Scrolls to the inline "Jours disponibles" calendar so users pick dates
// in one place. Keeps the widget's role as price + reserve CTA without
// duplicating the calendar in a popup.
function scrollToAvailability() {
  if (typeof document === "undefined") return;
  const el = document.getElementById("availability");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function BookingWidget({ property, blocked = [], fees = DEFAULT_FEES }: Props) {
  const { cleaningFee: CLEANING_FEE, serviceFeeRate: SERVICE_FEE_RATE } = fees;
  const params = useSearchParams();
  const { t, locale } = useI18n();
  const from = parseISO(params.get("from"));
  const to = parseISO(params.get("to"));
  const [guests, setGuests] = useState(2);
  const [openGuests, setOpenGuests] = useState(false);
  // Controls the full-screen multi-month date popup. Opens from the
  // sticky bar's date area or the "Check availability" button.
  const [datesPopupOpen, setDatesPopupOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenGuests(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Lock body scroll while the guests popover is open — it's the only
  // modal left on this widget (the mobile sheet was retired in favour
  // of a direct Reserve→WhatsApp flow from the sticky bar).
  useEffect(() => {
    if (!openGuests) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [openGuests]);

  const nights = nightsBetween(from, to);
  const subtotal = property.pricePerNight * Math.max(nights, 0);
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = nights ? subtotal + CLEANING_FEE + serviceFee : 0;

  const canReserve = nights > 0 && guests >= 1 && guests <= property.guests;

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat(DATE_LOCALE[locale], { day: "numeric", month: "short" }).format(d);

  const dateRangeLabel =
    from && to
      ? `${fmtDate(from)} → ${fmtDate(to)}`
      : from
      ? fmtDate(from)
      : t.booking.selectDatesPill;

  const nightLabel = (n: number) => (n === 1 ? t.booking.nightSingular : t.booking.nightPlural);
  const guestLabel = (n: number) => (n === 1 ? t.search.guestSingular : t.search.guestPlural);

  // WhatsApp prefill — substitutes property/dates/guests AND the
  // computed reservation totals (nights, price/night, full total) into
  // the locale's request template. Falls back to a placeholder when
  // dates aren't picked yet so the message stays sensible even if the
  // user opens WhatsApp from the "Check availability" path.
  const totalForMessage = nights > 0 ? total : property.pricePerNight;
  const requestMessage = t.booking.requestPrefill
    .replace("{property}", property.title)
    .replace("{from}", from ? fmtDate(from) : "—")
    .replace("{to}", to ? fmtDate(to) : "—")
    .replace("{nights}", String(nights))
    .replace("{nightLabel}", nightLabel(nights))
    .replace("{guests}", String(guests))
    .replace("{pricePerNight}", formatPrice(property.pricePerNight))
    .replace("{total}", formatPrice(totalForMessage));
  const whatsappHref = `https://wa.me/${CONCIERGE_PHONE.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    requestMessage,
  )}`;

  return (
    <div ref={wrapRef} className="relative">
      {/* Inline widget — hidden on mobile, where the fixed bottom bar handles it */}
      <div className="hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-widget lg:block">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-semibold text-ink">
              {formatPrice(property.pricePerNight)}
            </span>
            <span className="ml-1 text-sm text-ink-muted">{t.booking.perNight}</span>
          </div>
          <StarRating
            rating={getReviewCount(property.slug) > 0 ? getAverageRating(property.slug) : property.rating}
            reviewCount={getReviewCount(property.slug) || property.reviewCount}
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
          <div className="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setDatesPopupOpen(true)}
              className="px-3 py-2.5 text-left transition hover:bg-gray-50"
            >
              <div className="field-label">{t.search.arrival}</div>
              <div className={cn("text-sm font-semibold", from ? "text-ink" : "text-ink-soft")}>
                {from ? fmtDate(from) : t.booking.addDate}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setDatesPopupOpen(true)}
              className="px-3 py-2.5 text-left transition hover:bg-gray-50"
            >
              <div className="field-label">{t.search.departure}</div>
              <div className={cn("text-sm font-semibold", to ? "text-ink" : "text-ink-soft")}>
                {to ? fmtDate(to) : t.booking.addDate}
              </div>
            </button>
          </div>
          <button
            type="button"
            onClick={() => setOpenGuests((v) => !v)}
            className={cn(
              "block w-full px-3 py-2.5 text-left transition hover:bg-gray-50",
              openGuests && "bg-gray-50",
            )}
          >
            <div className="field-label">{t.search.guests}</div>
            <div className="text-sm font-semibold text-ink">
              {guests} {guestLabel(guests)}
            </div>
          </button>
        </div>

        {/* Desktop Reserve CTA — when dates + guest count are valid the
            button is a direct WhatsApp deep-link (no intermediate
            checkout page, no DB write — we're a static-export public
            site). When dates aren't set yet the button instead scrolls
            to the inline calendar so the user can pick them. The
            anchor's `aria-disabled` keeps it semantically correct in
            the disabled state without dropping pointer-events. */}
        {canReserve ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-4 w-full !py-3.5 !text-base"
          >
            {t.booking.reserve}
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setDatesPopupOpen(true)}
            className="btn-primary mt-4 w-full !py-3.5 !text-base"
          >
            {t.booking.selectDates}
          </button>
        )}

        <p className="mt-2 text-center text-[11px] text-ink-soft">{t.booking.noChargeYet}</p>

        {nights > 0 && (
          <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm">
            <div className="flex items-center justify-between text-ink-muted">
              <span>
                {formatPrice(property.pricePerNight)} × {nights} {nightLabel(nights)}
              </span>
              <span className="text-ink">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-ink-muted">
              <span>{t.booking.cleaningFee}</span>
              <span className="text-ink">{formatPrice(CLEANING_FEE)}</span>
            </div>
            <div className="flex items-center justify-between text-ink-muted">
              <span>{t.booking.serviceFee}</span>
              <span className="text-ink">{formatPrice(serviceFee)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-base font-semibold text-ink">
              <span>{t.booking.total}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>{t.booking.freeCancellation}</span>
        </div>
      </div>

      {/* Mobile sticky bottom bar — Airbnb-style: total (or "add dates"
          hint) on the LEFT, gradient Reserve button on the RIGHT.
          - Dates picked + guests valid → Reserve is a direct WhatsApp
            deep-link, no intermediate sheet (the message includes
            dates, nights, price/night, and total, see whatsappHref).
          - Dates not picked → button label switches to "Check
            availability" and opens the full-screen multi-month popup.
          Tapping the price/summary on the left also opens the date
          popup so the user can edit their pick. The guests count
          lives in the inline `openGuests` popover triggered separately
          (a small pill rendered above the date summary). */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <button
            type="button"
            onClick={() => setDatesPopupOpen(true)}
            className="min-w-0 text-left"
          >
            {nights > 0 ? (
              <>
                <div className="text-base font-semibold text-ink underline decoration-1 underline-offset-4">
                  {formatPrice(total)}
                </div>
                <div className="text-[11px] text-ink-muted">
                  {dateRangeLabel} · {nights} {nightLabel(nights)} · {guests}{" "}
                  {guestLabel(guests)}
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-ink underline decoration-1 underline-offset-4">
                  {t.booking.addDatesForPrice}
                </div>
                <div className="text-[11px] text-ink-muted">
                  {formatPrice(property.pricePerNight)} {t.booking.perNight} · {guests}{" "}
                  {guestLabel(guests)}
                </div>
              </>
            )}
          </button>

          {canReserve ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary shrink-0"
            >
              {t.booking.reserve}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setDatesPopupOpen(true)}
              className="btn-primary shrink-0"
            >
              {t.booking.viewAvailability}
            </button>
          )}
        </div>
      </div>

      {/* Full-screen multi-month date picker. Opens from the sticky
          bar's price/summary tap or the "Check availability" button.
          Commits to the URL on save so the inline calendar + sticky
          bar both auto-update from the same source of truth. */}
      <DatesPopup
        open={datesPopupOpen}
        onClose={() => setDatesPopupOpen(false)}
        blocked={blocked}
        pricePerNight={property.pricePerNight}
        currency={(property.currency ?? "EUR") as "EUR" | "USD"}
      />

      {/* Guests panel — desktop-only quick selector reachable from the
          sidebar widget. Mobile uses the inline stepper inside the sheet. */}
      {openGuests && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpenGuests(false)}
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
                onClick={() => setOpenGuests(false)}
                aria-label={t.search.close}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between p-5">
              <div>
                <div className="text-sm font-semibold text-ink">{t.search.guests}</div>
                <div className="text-xs text-ink-soft">
                  {t.detail.upToGuests.replace("{n}", String(property.guests))}
                </div>
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
                <span className="w-6 text-center text-base font-semibold tabular-nums">
                  {guests}
                </span>
                <button
                  onClick={() => setGuests((g) => Math.min(property.guests, g + 1))}
                  disabled={guests >= property.guests}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:border-brand-300 disabled:opacity-40"
                  aria-label={t.search.increaseGuests}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 p-4">
              <button
                type="button"
                onClick={() => setOpenGuests(false)}
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
