"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import {
  Wifi,
  Snowflake,
  Waves,
  Utensils,
  Car,
  WashingMachine,
  Bath,
  Wind,
  Coffee,
  Trees,
  Tv,
  Dumbbell,
  ShieldCheck,
  Briefcase,
  ParkingCircle,
  Sunrise,
  ChevronLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  "Wi-Fi": Wifi,
  "Wi-Fi (fiber)": Wifi,
  "Air conditioning": Snowflake,
  "Private pool": Waves,
  "Heated pool": Waves,
  "Salt-water pool": Waves,
  "Splash pool": Waves,
  "Plunge pool": Waves,
  "Infinity pool": Waves,
  "Pool": Waves,
  "Full kitchen": Utensils,
  "Kitchen": Utensils,
  "BBQ": Utensils,
  "Free parking": Car,
  "Washer": WashingMachine,
  "Hammam": Bath,
  "Hammam access": Bath,
  "Rooftop terrace": Wind,
  "Private terrace": Wind,
  "Breakfast included": Coffee,
  "Garden": Trees,
  "Vegetable garden": Trees,
  "TV": Tv,
  "Gym": Dumbbell,
  "Tennis court": Dumbbell,
  "Concierge": ShieldCheck,
  "Daily housekeeping": ShieldCheck,
  "Self check-in": ShieldCheck,
  "Optional chef": Coffee,
  "Workspace": Briefcase,
  "Elevator": ParkingCircle,
  "Sunrise yoga setup": Sunrise,
};

// Category buckets used by the full-list modal — same set Airbnb uses.
// Identified by a stable `key` (locale-independent) and matched by a
// regex on the raw English amenity string from the DB. The display
// label comes from the i18n dictionary at render time so the modal
// translates seamlessly into EN / FR / AR. Order here is canonical
// render order regardless of which amenities the property declares.
type CategoryKey =
  | "bathroom"
  | "bedroom"
  | "entertainment"
  | "heatingCooling"
  | "internet"
  | "kitchen"
  | "outdoor"
  | "parking"
  | "services";

const CATEGORIES: { key: CategoryKey; matches: (a: string) => boolean }[] = [
  { key: "bathroom", matches: (a) => /hammam|bath|shower|towel|hair dryer|toilet/i.test(a) },
  { key: "bedroom", matches: (a) => /washer|dryer|linen|sheet|pillow|wardrobe|iron/i.test(a) },
  { key: "entertainment", matches: (a) => /\btv\b|netflix|prime|sound system|console/i.test(a) },
  { key: "heatingCooling", matches: (a) => /air conditioning|heating|fan/i.test(a) },
  { key: "internet", matches: (a) => /wi-?fi|internet|workspace|desk/i.test(a) },
  { key: "kitchen", matches: (a) => /kitchen|fridge|oven|microwave|coffee|breakfast|bbq|dishwasher/i.test(a) },
  { key: "outdoor", matches: (a) => /pool|garden|terrace|rooftop|patio|courtyard|gym|tennis|yoga/i.test(a) },
  { key: "parking", matches: (a) => /parking|garage/i.test(a) },
  { key: "services", matches: (a) => /concierge|housekeeping|chef|check-?in|elevator/i.test(a) },
];

type Props = {
  amenities: string[];
};

// Map a raw English amenity string from the DB to its translation key in
// dictionaries.ts (same buckets as the listing-card chips). Returns null
// when no key matches - caller falls back to the original string so a new
// admin-added amenity still renders even before it's translated.
type AmenityI18nKey =
  | "pool"
  | "kitchen"
  | "ac"
  | "wifi"
  | "parking"
  | "hammam"
  | "breakfast"
  | "workspace"
  | "garden"
  | "terrace"
  | "washer"
  | "concierge"
  | "tennis"
  | "bbq"
  | "housekeeping"
  | "elevator"
  | "chef"
  | "selfCheckIn"
  | "heating"
  | "balcony"
  | "tv"
  | "linens"
  | "security"
  | "chimney"
  | "languages";

// Matcher works on EN and FR equally — both keyword families are
// checked so the same amenity string survives a locale switch (the
// admin can write "Piscine" or "Pool" and either matches).
function amenityKey(a: string): AmenityI18nKey | null {
  const l = a.toLowerCase();
  // Order matters: more specific matches come first so "Self check-in"
  // doesn't get swallowed by a generic "check" match later.
  if (l.includes("self check") || l.includes("self-check") || l.includes("arrivée autonome")) return "selfCheckIn";
  if (l.includes("housekeeping") || l.includes("ménage")) return "housekeeping";
  if (l.includes("optional chef") || l === "chef" || l.includes("cuisinier")) return "chef";
  if (l.includes("elevator") || l === "lift" || l.includes("ascenseur")) return "elevator";
  if (l === "bbq" || l.includes("barbecue")) return "bbq";
  if (l.includes("cheminée") || l.includes("chimney") || l.includes("fireplace")) return "chimney";
  if (l.includes("hammam")) return "hammam";
  if (l.includes("pool") || l.includes("piscine")) return "pool";
  if (l.includes("kitchen") || l.includes("cuisine")) return "kitchen";
  if (l.includes("heating") || l.includes("chauffage")) return "heating";
  if (l.includes("air cond") || l.includes("climatisation") || l.includes("clim ")) return "ac";
  if (l.includes("wi-fi") || l.includes("wifi")) return "wifi";
  if (l.includes("parking")) return "parking";
  if (l.includes("breakfast") || l.includes("petit-déjeuner")) return "breakfast";
  if (l.includes("workspace") || l.includes("bureau")) return "workspace";
  if (l.includes("rooftop") || l.includes("terrace") || l.includes("terrasse")) return "terrace";
  if (l.includes("garden") || l.includes("jardin")) return "garden";
  if (l.includes("balcon") || l.includes("balcony")) return "balcony";
  if (l.includes("smart tv") || l.includes("télévision") || l.includes("television") || l === "tv" || l.startsWith("tv ")) return "tv";
  if (l.includes("washer") || l.includes("lave-linge") || l.includes("lave linge")) return "washer";
  if (l.includes("linge") || l.includes("linens") || l.includes("serviettes") || l.includes("towels")) return "linens";
  if (l.includes("sécurisée") || l.includes("security") || l.includes("gardien") || l.includes("secured")) return "security";
  if (l.includes("concierge")) return "concierge";
  if (l.includes("tennis")) return "tennis";
  if (l.includes("langue") || l.includes("language")) return "languages";
  return null;
}

export function Amenities({ amenities }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  // Lock the page scroll while the modal is open so the backdrop
  // doesn't double-scroll the page underneath.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const inlineList = amenities.slice(0, 8);

  // Bucket every amenity into one of the categories. Anything that
  // doesn't match a known regex lands in the locale-aware "other"
  // bucket so we never silently drop a value the admin added.
  const grouped = (() => {
    const buckets: Record<string, string[]> = {};
    for (const a of amenities) {
      const cat: CategoryKey | "other" =
        CATEGORIES.find((c) => c.matches(a))?.key ?? "other";
      (buckets[cat] ??= []).push(a);
    }
    return buckets;
  })();

  // Render categories in the canonical order (CATEGORIES), then fold
  // any unknowns ("other") at the end. Labels resolve via i18n at
  // render time.
  const orderedCategoryKeys = [
    ...CATEGORIES.map((c) => c.key),
    "other" as const,
  ].filter((k) => grouped[k]?.length);

  const label = (a: string) => {
    const key = amenityKey(a);
    return key ? t.amenity[key] : a;
  };

  return (
    <section>
      <h2 className="font-display text-lg font-bold text-ink sm:text-xl">
        {t.detail.amenitiesTitle}
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {inlineList.map((a) => {
          const Icon = ICONS[a] ?? ShieldCheck;
          return (
            <div key={a} className="flex items-center gap-3 text-sm text-ink">
              <Icon className="h-5 w-5 text-ink" />
              <span>{label(a)}</span>
            </div>
          );
        })}
      </div>

      {amenities.length > 8 && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-ghost mt-6 !rounded-lg !border-ink !text-ink"
        >
          {t.detail.showAllAmenities.replace("{n}", String(amenities.length))}
        </button>
      )}

      {/* Full-screen modal — Airbnb pattern: white surface, sticky
          back-arrow header, body grouped into category sections.
          Closes on Esc or back-arrow. */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.detail.amenitiesTitle}
          className="fixed inset-0 z-50 flex flex-col bg-white"
        >
          <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.search.close}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="container-narrow py-6 sm:py-8">
              <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
                {t.detail.amenitiesModalTitle}
              </h2>

              <div className="mt-8 space-y-10">
                {orderedCategoryKeys.map((catKey) => (
                  <div key={catKey}>
                    <h3 className="text-base font-bold text-ink">
                      {t.detail.amenityCategories[catKey]}
                    </h3>
                    <ul className="mt-3 divide-y divide-gray-100">
                      {grouped[catKey].map((a) => {
                        const Icon = ICONS[a] ?? ShieldCheck;
                        return (
                          <li
                            key={a}
                            className="flex items-center gap-3 py-3 text-[15px] text-ink"
                          >
                            <Icon className="h-5 w-5 shrink-0 text-ink" />
                            <span>{label(a)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
