"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Users,
  Minus,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import { StarRating } from "./StarRating";
import { formatPrice, nightsBetween, cn } from "@/lib/utils";
import type { Property } from "@/lib/properties";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/dictionaries";

type Props = {
  property: Property;
};

const SERVICE_FEE_RATE = 0.07;
const CLEANING_FEE = 45;

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

export function BookingWidget({ property }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const { t, locale } = useI18n();
  const from = parseISO(params.get("from"));
  const to = parseISO(params.get("to"));
  const [guests, setGuests] = useState(2);
  const [openGuests, setOpenGuests] = useState(false);
  // Mobile-only welbnb-style summary sheet. Triggered from the fixed bar
  // and contains the date trigger (scrolls to inline calendar), guests
  // counter, send-request CTA, and Reserve Now CTA.
  const [openSheet, setOpenSheet] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Local YYYY-MM-DD — never use toISOString() here (converts to UTC and
  // rolls back a day west of GMT, breaking the user's actual pick).
  const isoLocal = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const goToCheckout = () => {
    const q = new URLSearchParams();
    if (from) q.set("from", isoLocal(from));
    if (to) q.set("to", isoLocal(to));
    q.set("guests", String(guests));
    router.push(`/properties/${property.slug}/reserve?${q.toString()}`);
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenGuests(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Lock body scroll while either the guests panel or the mobile sheet is open.
  useEffect(() => {
    if (!openGuests && !openSheet) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [openGuests, openSheet]);

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

  // WhatsApp prefill — substitutes property/dates/guests into the locale's
  // request template and falls back gracefully when dates aren't picked yet.
  const requestMessage = t.booking.requestPrefill
    .replace("{property}", property.title)
    .replace("{from}", from ? fmtDate(from) : "—")
    .replace("{to}", to ? fmtDate(to) : "—")
    .replace("{guests}", String(guests));
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
          <StarRating rating={property.rating} reviewCount={property.reviewCount} />
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
          <div className="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200">
            <button
              type="button"
              onClick={scrollToAvailability}
              className="px-3 py-2.5 text-left transition hover:bg-gray-50"
            >
              <div className="field-label">{t.search.arrival}</div>
              <div className={cn("text-sm font-semibold", from ? "text-ink" : "text-ink-soft")}>
                {from ? fmtDate(from) : t.booking.addDate}
              </div>
            </button>
            <button
              type="button"
              onClick={scrollToAvailability}
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

        <button
          type="button"
          disabled={!canReserve}
          onClick={() => {
            if (!canReserve) {
              scrollToAvailability();
              return;
            }
            goToCheckout();
          }}
          className="btn-primary mt-4 w-full !py-3.5 !text-base"
        >
          {canReserve ? t.booking.reserve : t.booking.selectDates}
        </button>

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

      {/* Mobile sticky bottom bar — always visible. Welbnb-style: a slim
          status row (price or "add dates" hint) plus a single CTA button
          that opens the summary sheet below. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.08)] lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            {nights > 0 ? (
              <>
                <div className="text-base font-semibold text-ink">{formatPrice(total)}</div>
                <div className="text-[11px] font-semibold text-brand-700">
                  {t.booking.total} · {nights} {nightLabel(nights)}
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-semibold text-ink">
                  {t.booking.addDatesForPrice}
                </div>
                <div className="text-[11px] text-ink-muted">
                  {formatPrice(property.pricePerNight)} {t.booking.perNight}
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setOpenSheet(true)}
            className="shrink-0 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            {nights > 0 ? t.booking.reserveNow : t.booking.viewAvailability}
          </button>
        </div>
      </div>

      {/* Mobile summary sheet — opened from the sticky bar. Mirrors the
          welbnb pattern: brief instruction, date pill (scrolls to inline
          calendar), guests counter, plus Send-request and Reserve CTAs. */}
      {openSheet && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setOpenSheet(false)}
            aria-hidden
          />
          <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-3xl border-t border-gray-100 bg-white p-5 shadow-2xl lg:hidden">
            <button
              type="button"
              onClick={() => setOpenSheet(false)}
              aria-label={t.search.close}
              className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-gray-50"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              {t.booking.sheetIntro}
            </p>

            {/* Date trigger — taps close the sheet and scroll to the
                inline calendar, the single source of truth for dates. */}
            <button
              type="button"
              onClick={() => {
                setOpenSheet(false);
                // Wait one frame so the body unlocks before we scroll.
                requestAnimationFrame(() => scrollToAvailability());
              }}
              className="mt-4 flex w-full items-center gap-3 rounded-full border border-gray-200 px-4 py-3 text-left transition hover:border-brand-300 hover:bg-gray-50"
            >
              <CalendarDays className="h-4 w-4 shrink-0 text-ink-soft" />
              <span
                className={cn(
                  "truncate text-sm font-semibold",
                  from ? "text-ink" : "text-ink-soft",
                )}
              >
                {dateRangeLabel}
              </span>
            </button>

            {/* Inline guests stepper — keeps the sheet self-contained
                without spawning yet another modal on top of it. */}
            <div className="mt-3 flex w-full items-center justify-between rounded-full border border-gray-200 px-4 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <Users className="h-4 w-4 shrink-0 text-ink-soft" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink">
                    {guests} {guestLabel(guests)}
                  </div>
                  <div className="text-[11px] text-ink-soft">
                    {t.detail.upToGuests.replace("{n}", String(property.guests))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  disabled={guests <= 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:border-brand-300 disabled:opacity-40"
                  aria-label={t.search.decreaseGuests}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.min(property.guests, g + 1))}
                  disabled={guests >= property.guests}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:border-brand-300 disabled:opacity-40"
                  aria-label={t.search.increaseGuests}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Live total when dates are picked, so users see the impact
                of changing guests without leaving the sheet. */}
            {nights > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-cream-50 px-4 py-3">
                <div>
                  <div className="text-base font-semibold text-ink">
                    {formatPrice(total)}
                  </div>
                  <div className="text-[11px] text-ink-muted">
                    {t.booking.total} · {nights} {nightLabel(nights)}
                  </div>
                </div>
                <div className="text-[11px] text-ink-soft">
                  {formatPrice(property.pricePerNight)} {t.booking.perNight}
                </div>
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-3">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-full border border-brand-600 bg-white text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                {t.booking.sendRequest}
              </a>
              <button
                type="button"
                onClick={() => {
                  if (!canReserve) {
                    setOpenSheet(false);
                    requestAnimationFrame(() => scrollToAvailability());
                    return;
                  }
                  setOpenSheet(false);
                  goToCheckout();
                }}
                className="inline-flex h-12 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                {t.booking.reserveNow}
              </button>
            </div>

            <p className="mt-3 text-center text-[11px] text-ink-soft">
              {t.booking.noChargeYet}
            </p>
          </div>
        </>
      )}

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
