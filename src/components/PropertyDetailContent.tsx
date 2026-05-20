"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronLeft, MapPin, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Gallery } from "@/components/Gallery";
import { Amenities } from "@/components/Amenities";
import { BookingWidget } from "@/components/BookingWidget";
import { PropertyInquiryForm } from "@/components/PropertyInquiryForm";
import { PropertySpecs } from "@/components/PropertySpecs";
import { Reviews } from "@/components/Reviews";
import { getReviewCount, getAverageRating } from "@/lib/reviews-data";
import { getAreaCopy, formatLocationLine } from "@/data/area-descriptions";
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
  // Site-wide fees from Supabase Settings. Both default to 0 so a
  // freshly seeded site shows clean totals; admin edits propagate to
  // the booking widget + checkout summary via this prop.
  fees: { cleaningFee: number; serviceFeeRate: number };
  // Concierge WhatsApp number from Settings.whatsappNumber — used by
  // the booking-widget CTA and the "ask the concierge" buttons.
  whatsappNumber: string;
};

// Picks the right translation based on locale, with FR fallback for
// fields where EN/AR weren't filled in (the catalog has many of these).
function pick(bundle: { fr: string; en: string | null; ar: string | null }, locale: "fr" | "en" | "ar") {
  if (locale === "en") return bundle.en || bundle.fr;
  if (locale === "ar") return bundle.ar || bundle.fr;
  return bundle.fr;
}

export function PropertyDetailContent({ property, blockedRanges, fees, whatsappNumber }: Props) {
  const { t, locale } = useI18n();
  const params = useSearchParams();
  const [showAllRules, setShowAllRules] = useState(false);
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  // Real review numbers — derived from the per-property review pool
  // (see src/data/property-reviews.json built by scripts/seed-reviews.mjs).
  // Falls back to the seeded `property.rating` / `reviewCount` when this
  // property has no reviews assigned yet (e.g., a freshly added listing).
  const reviewCount = getReviewCount(property.slug);
  const averageRating = getAverageRating(property.slug);
  const displayRating = reviewCount > 0 ? averageRating : property.rating;
  const displayReviewCount = reviewCount > 0 ? reviewCount : property.reviewCount;

  // Resolve locale-aware fields client-side so toggling FR/EN/AR re-renders
  // the page without a round-trip. SSR still ships the FR default so the
  // first paint isn't blank. Falls back to the server-resolved string when
  // the i18n bundle is unavailable (legacy seed data).
  const title = property.i18n ? pick(property.i18n.title, locale) : property.title;
  const rawShort = property.i18n
    ? pick(property.i18n.shortDescription, locale)
    : property.shortDescription;
  const description = property.i18n
    ? pick(property.i18n.description, locale)
    : property.description;
  // The bulk-import derives shortDescription from the first line of
  // the full description — so when the page renders both side-by-side,
  // the opening sentence appears twice. Strip the short here when it's
  // already a prefix of the full text; the description carries the
  // same hook line on its own.
  const shortDescription =
    rawShort && description.trim().startsWith(rawShort.trim()) ? "" : rawShort;

  // Threshold above which the description gets line-clamped + a
  // "show more" button. Below this, the whole text is shown inline (the
  // affordance would feel silly for two-sentence blurbs).
  const descriptionIsLong = description.length > 280;

  // Lock the page scroll when any full-screen modal is open so the
  // background doesn't drift behind the panel. Same handler covers
  // the description and location modals.
  useEffect(() => {
    if (!isDescOpen && !isLocationOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isDescOpen, isLocationOpen]);

  // Esc closes whichever modal is open — keyboard accessibility.
  useEffect(() => {
    if (!isDescOpen && !isLocationOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setIsDescOpen(false);
      setIsLocationOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isDescOpen, isLocationOpen]);

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
    <div className="container-page py-6 pb-36 sm:py-8 lg:pb-8">
      <Link
        href="/properties"
        className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted transition hover:text-ink"
      >
        <ChevronLeft className="h-3.5 w-3.5 rtl:rotate-180" />
        {t.detail.back}
      </Link>

      {/* Photos first — large hero gallery sits directly under the back
          link, like Airbnb / Welbnb. Title block follows below so the
          eye lands on the property's image before reading details.
          For SALE + RENT_LONG listings the images are swapped to the
          cream placeholder in the public repo; the `comingSoon` prop
          tells the gallery to layer the locale-aware "Bientôt
          disponible" overlay on top. */}
      <div className="mt-4">
        <Gallery
          images={property.images}
          comingSoon={(property.listingKind ?? "SHORT_STAY") !== "SHORT_STAY"}
          watermark={(property.listingKind ?? "SHORT_STAY") === "SHORT_STAY"}
        />
      </div>

      {/* Title block — name + meta + rating. Type pill above the title
          was removed to match the editorial pattern (welbnb / Airbnb):
          the type appears inline with the meta row instead, so the
          headline reads as one clean composition without a coloured
          chip floating above it. */}
      {/* Airbnb-style title block: bold sans-serif headline (26px mobile,
          larger on desktop), a single muted meta row "Type · X guests ·
          Y bedrooms · Z bathrooms" right under it, then a tight rating
          + location strip. Sized to mirror the Airbnb 2026 mobile detail
          spec the user referenced. */}
      <div className="mt-6">
        <h1 className="font-display text-[22px] font-bold leading-tight tracking-tight text-ink sm:text-[26px] lg:text-[28px]">
          {title}
        </h1>
        {/* Meta row under the title. Guests is a SHORT_STAY-only metric
            (max occupancy for a booking); for SALE / RENT_LONG we surface
            surface habitable instead, plus bedrooms/baths only when the
            type has them (terrain has neither). */}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-ink-muted">
          <span>{PROPERTY_TYPE_LABEL[property.type]}</span>
          {(() => {
            const isStay = (property.listingKind ?? "SHORT_STAY") === "SHORT_STAY";
            const isTerrain = property.type === "terrain";
            const isCommercial = property.type === "bureau" || property.type === "magasin";
            const items: React.ReactNode[] = [];

            if (!isStay && property.surfaceM2) {
              items.push(<span key="surface">{property.surfaceM2} m²</span>);
            } else if (!isStay && isTerrain && property.landSurfaceM2) {
              items.push(<span key="land">{property.landSurfaceM2.toLocaleString("fr-FR")} m²</span>);
            }
            if (isStay) {
              items.push(
                <span key="guests">{property.guests} {t.card.guests}</span>,
              );
            }
            if (!isTerrain && !isCommercial && property.bedrooms > 0) {
              items.push(<span key="bd">{property.bedrooms} {t.card.bedrooms}</span>);
            }
            if (!isTerrain && property.bathrooms > 0) {
              items.push(<span key="ba">{property.bathrooms} {t.card.bathrooms}</span>);
            }
            return items.flatMap((node, i) => [
              <span key={`dot-${i}`}>·</span>,
              node,
            ]);
          })()}
        </div>
        {/* Rating block: SHORT_STAY only. Guest ratings don't apply to a
            sale or a long-term lease - those buyers care about location +
            condition, not a star score. Location chip stays for everyone. */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink">
          {property.listingKind === "SHORT_STAY" && (
            <>
              <span className="inline-flex items-center gap-1 font-semibold">
                <Star className="h-4 w-4 fill-ink text-ink" />
                {displayRating.toFixed(2)}
                <span className="font-normal text-ink-soft">({displayReviewCount})</span>
              </span>
              <span className="text-ink-soft">·</span>
            </>
          )}
          <span className="inline-flex items-center gap-1.5 text-ink-muted">
            <MapPin className="h-3.5 w-3.5 text-brand-500" />
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
              <h2 className="font-display text-lg font-bold text-ink sm:text-xl">
                {t.detail.aboutTitle}
              </h2>
              {shortDescription && (
                <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-ink-muted">
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

          {/* Caractéristiques - structured per-type facts grid (surface,
              étage, année, état, parking, titre foncier, etc.). Only
              shown for SALE + RENT_LONG; SHORT_STAY listings already
              surface capacity in the title meta row. PropertySpecs
              returns null for SHORT_STAY, and we gate the wrapping
              border here too so the page doesn't render an empty
              bordered shell. */}
          {(property.listingKind ?? "SHORT_STAY") !== "SHORT_STAY" && (
            <div className="border-b border-cream-300 pb-12">
              <PropertySpecs property={property} />
            </div>
          )}

          {/* Agréments */}
          <div className="border-b border-cream-300 pb-12">
            <Amenities amenities={property.amenities} />
          </div>

          {/* Jours disponibles - inline 1-month date picker. SHORT_STAY only;
              the calendar makes no sense for sales or long-term leases. */}
          {property.listingKind === "SHORT_STAY" && (
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
          )}

          {/* Commentaires - SHORT_STAY only. Guest reviews don't apply
              to a property that's for sale or on a 12-month lease; what
              matters there is location + condition + the conseiller, not
              a star score. */}
          {property.listingKind === "SHORT_STAY" && (
            <div className="border-b border-cream-300 pb-12">
              <Reviews slug={property.slug} propertyTitle={title} />
            </div>
          )}

          {/* "Where you'll be" — privacy-preserving zone map + a
              neighborhood blurb keyed off the property's `area`. The
              blurb is clamped to 3 lines inline; "Lire la suite" pops
              the location modal with the full text plus a "Getting
              around" subsection (transport, distances). */}
          {property.location && (() => {
            const areaCopy = getAreaCopy(property.area);
            const neighborhood = areaCopy.neighborhood[locale];
            return (
              <section className="border-b border-cream-300 pb-12">
                <h2 className="font-display text-lg font-bold text-ink sm:text-xl">
                  {t.map.title}
                </h2>
                <div className="mt-4">
                  <PropertyMapZone
                    lat={property.location.lat}
                    lng={property.location.lng}
                    radius={property.location.radius}
                    label={t.map.privacyHint.replace(
                      "{n}",
                      String(property.location.radius),
                    )}
                  />
                </div>
                <p className="mt-5 text-base font-semibold text-ink">
                  {formatLocationLine(property.city, locale)}
                </p>
                <p className="mt-2 text-sm text-ink-muted line-clamp-3">
                  {neighborhood}
                </p>
                <button
                  type="button"
                  onClick={() => setIsLocationOpen(true)}
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink underline underline-offset-2 transition hover:text-brand-700"
                >
                  {t.map.showMore}
                </button>
              </section>
            );
          })()}

          {/* Bon à savoir — Règles de la maison. SHORT_STAY only: check-in
              times, no-smoking policy etc. don't apply to a sale or an annual
              lease (those have their own rule set negotiated at signing). */}
          {property.listingKind === "SHORT_STAY" && (
          <section>
            <h2 className="font-display text-lg font-bold text-ink sm:text-xl">{t.rules.sectionTitle}</h2>
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
          )}
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          {/* Sidebar branches on listingKind:
              SHORT_STAY -> BookingWidget (calendar + nightly maths)
              SALE / RENT_LONG -> PropertyInquiryForm (lead capture).
              Keeps the existing booking flow intact while giving real-estate
              listings their own conversion widget. */}
          {property.listingKind === "SHORT_STAY" ? (
            <BookingWidget
              property={property}
              blocked={blockedRanges}
              fees={fees}
              whatsappNumber={whatsappNumber}
            />
          ) : (
            <PropertyInquiryForm
              property={property}
              whatsappPhoneIntl={whatsappNumber?.replace(/\D/g, "") || undefined}
            />
          )}
        </aside>
      </div>

      {/* Full description modal — Airbnb pattern: full-bleed white
          overlay, sticky back-arrow header, body scrolls. No backdrop
          dim, no centred card. Closes on Esc or the back arrow. */}
      {isDescOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="À propos de ce logement"
          className="fixed inset-0 z-50 flex flex-col bg-white"
        >
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setIsDescOpen(false)}
              aria-label={t.search.close}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="container-narrow py-6 sm:py-8">
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                {t.detail.aboutModalTitle}
              </h2>
              {shortDescription && (
                <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-ink-muted">
                  {shortDescription}
                </p>
              )}
              {description && (
                <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-ink-muted">
                  {description}
                </p>
              )}
              {property.highlights.length > 0 && (
                <ul className="mt-6 space-y-2.5">
                  {property.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5 text-sm text-ink">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Location modal — Airbnb pattern: full-screen white surface,
          sticky back-arrow header, body shows the area's neighborhood
          paragraph followed by a "Getting around" subsection with
          transport / distance details. Copy is shared across every
          property in the same area (see src/data/area-descriptions.ts). */}
      {isLocationOpen && property.location && (() => {
        const areaCopy = getAreaCopy(property.area);
        return (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.map.title}
            className="fixed inset-0 z-50 flex flex-col bg-white"
          >
            <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
              <button
                type="button"
                onClick={() => setIsLocationOpen(false)}
                aria-label={t.search.close}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto">
              <div className="container-narrow py-6 sm:py-8">
                <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                  {t.map.title}
                </h2>

                <p className="mt-5 text-base font-semibold text-ink">
                  {formatLocationLine(property.city, locale)}
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                  {areaCopy.neighborhood[locale]}
                </p>

                <h3 className="mt-8 text-lg font-bold text-ink">
                  {t.map.gettingAroundTitle}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
                  {areaCopy.gettingAround[locale]}
                </p>
              </div>
            </div>
          </div>
        );
      })()}
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
