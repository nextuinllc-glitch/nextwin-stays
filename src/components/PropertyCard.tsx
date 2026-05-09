"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { Star, ChevronRight, Users, Bed, Bath } from "lucide-react";
import type { Property, PropertyType } from "@/lib/properties";
import { PROPERTY_TYPE_BADGE_CLASS } from "@/lib/properties";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

type Props = {
  property: Property;
  priority?: boolean;
};

function shortenKey(a: string): keyof ReturnType<typeof useI18n>["t"]["amenity"] | null {
  const l = a.toLowerCase();
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
      >
        <div
          ref={cardRef}
          className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-card transition-[transform,box-shadow] duration-200 ease-out [transform-style:preserve-3d] will-change-transform group-hover:shadow-card-hover"
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

          {/* Carousel right arrow — lifts in Z, fades in on hover */}
          {total > 1 && (
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100"
              style={{ transform: "translateZ(50px)" }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
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
        </div>
      </Link>
    </div>
  );
}
