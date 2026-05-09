"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronLeft, MapPin, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Gallery } from "@/components/Gallery";
import { Amenities } from "@/components/Amenities";
import { BookingWidget } from "@/components/BookingWidget";
import { Reviews } from "@/components/Reviews";
import { AvailabilityInline } from "@/components/AvailabilityInline";
import {
  PROPERTY_TYPE_LABEL,
  type Property,
} from "@/lib/properties";
import { cn, formatPrice, nightsBetween } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

// Mirror BookingWidget — keeping these inline so the mobile summary uses
// the exact same numbers as the sidebar widget without a shared module.
const SERVICE_FEE_RATE = 0.07;
const CLEANING_FEE = 45;

function parseISO(s: string | null) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Leaflet only runs in the browser — load it client-side via dynamic import.
const PropertyMapZone = dynamic(() => import("@/components/PropertyMapZone"), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full animate-pulse rounded-2xl bg-cream-100 sm:h-80" />
  ),
});

type Props = {
  property: Property;
  blockedRanges: Array<{ start: string; end: string }>;
};

// Picks the right translation based on locale, with FR fallback for
// fields where EN/AR weren't filled in (the catalog has many of these).
function pick(bundle: { fr: string; en: string | null; ar: string | null }, locale: "fr" | "en" | "ar") {
  if (locale === "en") return bundle.en || bundle.fr;
  if (locale === "ar") return bundle.ar || bundle.fr;
  return bundle.fr;
}

export function PropertyDetailContent({ property, blockedRanges }: Props) {
  const { t, locale } = useI18n();
  const params = useSearchParams();
  const [showAllRules, setShowAllRules] = useState(false);
  const [isDescOpen, setIsDescOpen] = useState(false);

  // Resolve locale-aware fields client-side so toggling FR/EN/AR re-renders
  // the page without a round-trip. SSR still ships the FR default so the
  // first paint isn't blank. Falls back to the server-resolved string when
  // the i18n bundle is unavailable (legacy seed data).
  const title = property.i18n ? pick(property.i18n.title, locale) : property.title;
  const shortDescription = property.i18n
    ? pick(property.i18n.shortDescription, locale)
    : property.shortDescription;
  const description = property.i18n
    ? pick(property.i18n.description, locale)
    : property.description;

  // Threshold above which the description gets line-clamped + a
  // "show more" button. Below this, the whole text is shown inline (the
  // affordance would feel silly for two-sentence blurbs).
  const descriptionIsLong = description.length > 280;

  // Lock the page scroll when the full-description modal is open so the
  // background doesn't drift behind the panel.
  useEffect(() => {
    if (!isDescOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isDescOpen]);

  // Esc closes the modal — keyboard accessibility.
  useEffect(() => {
    if (!isDescOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDescOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isDescOpen]);

  // Reads the same ?from=&to= URL params AvailabilityInline writes so the
  // mobile breakdown card stays in sync with the inline date picker.
  const from = parseISO(params.get("from"));
  const to = parseISO(params.get("to"));
  const nights = nightsBetween(from, to);
  const subtotal = property.pricePerNight * Math.max(nights, 0);
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = nights ? subtotal + CLEANING_FEE + serviceFee : 0;

  const nightLabel = (n: number) => (n === 1 ? t.booking.nightSingular : t.booking.nightPlural);

  return (
    // Bottom padding on mobile compensates for the fixed bottom bar at the
    // viewport edge so the last section can scroll fully into view.
    <div className="container-page py-6 pb-28 sm:py-8 lg:pb-8">
      <Link
        href="/properties"
        className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted transition hover:text-ink"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {t.detail.back}
      </Link>

      {/* Photos first — large hero gallery sits directly under the back
          link, like Airbnb / Welbnb. Title block follows below so the
          eye lands on the property's image before reading details. */}
      <div className="mt-4">
        <Gallery images={property.images} />
      </div>

      {/* Title block — name + meta + rating. Type pill above the title
          was removed to match the editorial pattern (welbnb / Airbnb):
          the type appears inline with the meta row instead, so the
          headline reads as one clean composition without a coloured
          chip floating above it. */}
      <div className="mt-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        {/* Inline meta row — type · guests · bedrooms · bathrooms */}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
          <span>{PROPERTY_TYPE_LABEL[property.type]}</span>
          <span>·</span>
          <span>
            {property.guests} {t.card.guests}
          </span>
          <span>·</span>
          <span>
            {property.bedrooms} {t.card.bedrooms}
          </span>
          <span>·</span>
          <span>
            {property.bathrooms} {t.card.bathrooms}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink">
          <span className="inline-flex items-center gap-1 font-semibold">
            <Star className="h-4 w-4 fill-ink text-ink" />
            {property.rating.toFixed(2)}
            <span className="font-normal text-ink-soft">({property.reviewCount})</span>
          </span>
          <span className="text-ink-soft">·</span>
          <span className="inline-flex items-center gap-1.5 text-ink-muted">
            <MapPin className="h-3.5 w-3.5 text-brand-600" />
            {property.area}, {property.city}
          </span>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-[1fr_380px]">
        <div className="space-y-16">
          {/* À propos — tagline + truncated description with "Afficher
              plus" button that opens a full-page scrollable modal. The
              modal pattern matches Welbnb / Airbnb: title + X, page-
              behind dimmed, body of the description in full. */}
          {(shortDescription || description) && (
            <section className="border-b border-cream-300 pb-12">
              <h2 className="font-display text-2xl font-semibold text-ink">
                {t.detail.aboutTitle}
              </h2>
              {shortDescription && (
                <p className="mt-4 font-display text-xl font-semibold text-ink sm:text-2xl">
                  {shortDescription}
                </p>
              )}
              {description && (
                <p
                  className={cn(
                    "mt-4 whitespace-pre-line text-[15px] leading-relaxed text-ink-muted",
                    // Long descriptions get clamped to 5 lines with an
                    // "Afficher plus" affordance below. Short ones stay
                    // expanded (no button needed).
                    descriptionIsLong && "line-clamp-5",
                  )}
                >
                  {description}
                </p>
              )}
              {descriptionIsLong && (
                <button
                  type="button"
                  onClick={() => setIsDescOpen(true)}
                  className="btn-ghost mt-5"
                >
                  {t.rules.showMore}
                </button>
              )}
              {/* Highlights moved into the "Afficher plus" modal — keeps
                  the inline section short and the bullets discoverable
                  alongside the full description. */}
            </section>
          )}

          {/* Agréments */}
          <div className="border-b border-cream-300 pb-12">
            <Amenities amenities={property.amenities} />
          </div>

          {/* Jours disponibles — inline 1-month date picker. Mobile-only
              price breakdown sits below it so users see the cost before
              hitting the sticky Reserve bar. */}
          <div className="border-b border-cream-300 pb-12">
            <AvailabilityInline blocked={blockedRanges} />

            {nights > 0 && (
              <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-4 lg:hidden">
                <div className="space-y-2 text-sm">
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
                  <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-2.5 text-base font-semibold text-ink">
                    <span>{t.booking.total}</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Commentaires — moved up between dates and the map so the
              page reads in the order users naturally consider: see the
              place → check amenities → check availability → read what
              guests said → see the area → review the rules. */}
          <div className="border-b border-cream-300 pb-12">
            <Reviews rating={property.rating} reviewCount={property.reviewCount} />
          </div>

          {/* Emplacement — privacy-preserving zone map */}
          {property.location && (
            <section className="border-b border-cream-300 pb-12">
              <h2 className="font-display text-2xl font-semibold text-ink">{t.map.title}</h2>
              <p className="mt-2 text-sm text-ink-muted">{t.map.noLocation}</p>
              <div className="mt-4">
                <PropertyMapZone
                  lat={property.location.lat}
                  lng={property.location.lng}
                  radius={property.location.radius}
                  label={t.map.privacyHint.replace("{n}", String(property.location.radius))}
                />
              </div>
            </section>
          )}

          {/* Bon à savoir — Règles de la maison */}
          <section>
            <h2 className="font-display text-2xl font-semibold text-ink">{t.rules.sectionTitle}</h2>
            <h3 className="mt-4 text-sm font-semibold text-ink">{t.detail.rulesTitle}</h3>
            <div className="mt-3 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
              <RuleLine label={t.detail.ruleCheckIn} value={property.rules?.checkIn ?? t.detail.ruleCheckInValue} />
              <RuleLine label={t.detail.rulePets} value={property.rules?.pets ?? t.detail.rulePetsValue} />
              <RuleLine label={t.detail.ruleCheckOut} value={property.rules?.checkOut ?? t.detail.ruleCheckOutValue} />
              <RuleLine label={t.detail.ruleSmoking} value={property.rules?.smoking ?? t.detail.ruleSmokingValue} />
            </div>

            {showAllRules && (
              <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                <RuleLine label={t.detail.ruleMinStay} value={t.detail.ruleMinStayValue} />
                <RuleLine
                  label={t.detail.ruleCancellation}
                  value={t.detail.ruleCancellationValue}
                />
                {property.rules?.additional && (
                  <div className="sm:col-span-2">
                    <RuleLine
                      label={t.rules.additional}
                      value={property.rules.additional}
                    />
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setShowAllRules((v) => !v)}
              className="btn-ghost mt-5"
            >
              {showAllRules ? t.rules.showLess : t.rules.showMore}
            </button>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <BookingWidget property={property} />
        </aside>
      </div>

      {/* Full description modal — fixed overlay covering the whole
          viewport, scrollable body. Mobile: full-bleed sheet. Desktop:
          centred card with rounded corners. Closes on backdrop tap, Esc
          key, or the X button. */}
      {isDescOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsDescOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.detail.aboutTitle}
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden bg-white shadow-2xl",
              // Mobile: bottom-sheet fills viewport
              "inset-x-0 bottom-0 top-12 rounded-t-3xl",
              // Desktop: centred card
              "sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-h-[85vh] sm:w-[640px] sm:max-w-[92vw] sm:rounded-2xl",
            )}
          >
            <header className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <h3 className="font-display text-xl font-semibold text-ink">
                {t.detail.aboutTitle}
              </h3>
              <button
                type="button"
                onClick={() => setIsDescOpen(false)}
                aria-label={t.search.close}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-ink transition hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {shortDescription && (
                <p className="font-display text-lg font-semibold text-ink sm:text-xl">
                  {shortDescription}
                </p>
              )}
              <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-ink-muted">
                {description}
              </p>
              {property.highlights.length > 0 && (
                <ul className="mt-6 space-y-2.5">
                  {property.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5 text-sm text-ink">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function RuleLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="font-semibold text-ink">{label}:</span>{" "}
      <span className="text-ink-muted">{value}</span>
    </div>
  );
}
