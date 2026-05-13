"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight, Users, Bed, Bath } from "lucide-react";
import type { Property, PropertyType } from "@/lib/properties";
import { PROPERTY_TYPE_BADGE_CLASS } from "@/lib/properties";
import { cn, formatPrice } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

type Props = {
  property: Property;
  priority?: boolean;
};

function shortenKey(a: string): keyof ReturnType<typeof useI18n>["t"]["amenity"] | null {
  const l = a.toLowerCase();
  // More specific matches first so "Self check-in" doesn't get
  // swallowed by a broader pattern below.
  if (l.includes("self check") || l.includes("self-check")) return "selfCheckIn";
  if (l.includes("housekeeping")) return "housekeeping";
  if (l.includes("optional chef") || l === "chef") return "chef";
  if (l.includes("elevator") || l === "lift") return "elevator";
  if (l === "bbq" || l.includes("barbecue")) return "bbq";
  if (l.includes("pool")) return "pool";
  if (l.includes("kitchen")) return "kitchen";
  if (l.includes("air conditioning")) return "ac";
  if (l.includes("wi-fi")) return "wifi";
  if (l.includes("parking")) return "parking";
  if (l.includes("hammam")) return "hammam";
  if (l.includes("breakfast")) return "breakfast";
  if (l.includes("workspace")) return "workspace";
  if (l.includes("garden")) return "garden";
  if (l.includes("rooftop") || l.includes("terrace")) return "terrace";
  if (l.includes("washer")) return "washer";
  if (l.includes("concierge")) return "concierge";
  if (l.includes("tennis")) return "tennis";
  return null;
}

function pickTopAmenityKeys(amenities: string[], max = 3) {
  const out: string[] = [];
  for (const a of amenities) {
    const k = shortenKey(a);
    if (!k) continue;
    if (!out.includes(k)) out.push(k);
    if (out.length === max) break;
  }
  return out;
}

const TYPE_KEY: Record<PropertyType, "villa" | "apartment" | "riad"> = {
  villa: "villa",
  apartment: "apartment",
  riad: "riad",
};

export function PropertyCard({ property, priority = false }: Props) {
  const { t, locale } = useI18n();
  const [index, setIndex] = useState(0);
  const total = property.images.length;
  // Locale-aware title — falls back to FR when EN/AR weren't filled in,
  // and to the server-resolved title when the i18n bundle isn't present
  // (legacy data path).
  const title = property.i18n
    ? locale === "en"
      ? property.i18n.title.en || property.i18n.title.fr
      : locale === "ar"
      ? property.i18n.title.ar || property.i18n.title.fr
      : property.i18n.title.fr
    : property.title;
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  // Swipe-gesture bookkeeping. `touchStartXRef` records the finger's
  // X on touchstart; `swipedRef` flips true on touchend if the swipe
  // travelled past the threshold, and stays true just long enough to
  // cancel the click that would otherwise fire on the wrapping <Link>.
  const touchStartXRef = useRef<number | null>(null);
  const swipedRef = useRef(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (!wrap || !card) return;
    const rect = wrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const ry = (x - 0.5) * 12; // -6 to 6 deg
    const rx = (0.5 - y) * 9; // -4.5 to 4.5 deg
    card.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%)`;
      glareRef.current.style.opacity = "1";
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (card) card.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0)";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i + 1) % total);
  };

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((i) => (i - 1 + total) % total);
  };

  // Touch handlers — give phones the same left/right swipe affordance
  // as the desktop arrow buttons. We use the touchstart X as the anchor,
  // measure the delta at touchend, and treat anything beyond 40 px as
  // a swipe. The synthetic click that follows a touchend on a child of
  // <Link> is suppressed via the swipedRef flag below.
  const SWIPE_THRESHOLD = 40;
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null;
    swipedRef.current = false;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartXRef.current;
    if (startX == null || total <= 1) return;
    const endX = e.changedTouches[0]?.clientX;
    if (endX == null) return;
    const dx = endX - startX;
    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      swipedRef.current = true;
      // Right swipe (positive dx) → previous; left swipe → next. Mirrors
      // the natural "drag the current photo aside to reveal the next".
      if (dx > 0) setIndex((i) => (i - 1 + total) % total);
      else setIndex((i) => (i + 1) % total);
    }
    touchStartXRef.current = null;
  };
  // Suppress the navigation click immediately after a swipe. The mobile
  // browser fires a synthetic click on touchend even though no real
  // tap happened; without this guard, every swipe would also open the
  // property detail page.
  const handleLinkClick = (e: React.MouseEvent) => {
    if (swipedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      swipedRef.current = false;
    }
  };

  const topAmenityKeys = pickTopAmenityKeys(property.amenities, 3);

  return (
    <div
      ref={wrapRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group [perspective:1200px]"
    >
      <Link
        href={`/properties/${property.slug}`}
        className="block focus:outline-none"
        onClick={handleLinkClick}
      >
        <div
          ref={cardRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative aspect-[20/19] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-card transition-[transform,box-shadow] duration-200 ease-out [transform-style:preserve-3d] touch-pan-y will-change-transform group-hover:shadow-card-hover"
        >
          {property.images.map((img, i) => (
            <div
              key={i}
              className={cn(
                "absolute inset-0 transition-opacity duration-500",
                i === index ? "opacity-100" : "opacity-0",
              )}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={priority && i === 0}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
              />
            </div>
          ))}

          {/* Glare layer — follows the cursor */}
          <div
            ref={glareRef}
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 mix-blend-screen"
            style={{ transform: "translateZ(1px)" }}
          />

          {/* Type badge — top-left, color-coded — lifts in Z */}
          <span
            className={cn(
              "pointer-events-none absolute left-3 top-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide shadow-md",
              PROPERTY_TYPE_BADGE_CLASS[property.type],
            )}
            style={{ transform: "translateZ(40px)" }}
          >
            {t.type[TYPE_KEY[property.type]]}
          </span>

          {/* Rating badge — top-right, emerald-green pill — lifts in Z */}
          <span
            className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-600/95 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md backdrop-blur"
            style={{ transform: "translateZ(40px)" }}
          >
            {property.rating.toFixed(2)}
            <Star className="h-3 w-3 fill-white text-white" />
          </span>

          {/* Carousel arrows — both sides, fade in on desktop hover.
              Hidden by default on touch devices (the swipe gesture is
              the affordance there). `aria-label` makes them keyboard
              and screen-reader navigable. */}
          {total > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100"
                style={{ transform: "translateZ(50px)" }}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100"
                style={{ transform: "translateZ(50px)" }}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Dot indicators — lift in Z */}
          {total > 1 && (
            <div
              className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1"
              style={{ transform: "translateZ(40px)" }}
            >
              {property.images.slice(0, Math.min(total, 6)).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition",
                    i === index ? "bg-white w-4" : "bg-white/55",
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 px-1">
          <h3 className="font-display text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-brand-700">
            {title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {property.guests} {t.card.guests}
            </span>
            <span className="text-ink-soft">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Bed className="h-3.5 w-3.5" />
              {property.bedrooms} {t.card.bedrooms}
            </span>
            <span className="text-ink-soft">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Bath className="h-3.5 w-3.5" />
              {property.bathrooms} {t.card.bathrooms}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {topAmenityKeys.map((k) => (
              <span
                key={k}
                className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-ink-muted transition-colors group-hover:border-brand-200 group-hover:text-brand-700"
              >
                {t.amenity[k as keyof typeof t.amenity]}
              </span>
            ))}
          </div>

          {/* Price line — bold currency-formatted amount + small muted
              "per night" suffix. Sits on its own row below the amenity
              chips as the closing statement of every card. */}
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-base font-semibold text-ink">
              {formatPrice(property.pricePerNight, property.currency as "EUR" | "USD")}
            </span>
            <span className="text-sm text-ink-muted">{t.booking.perNight}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
