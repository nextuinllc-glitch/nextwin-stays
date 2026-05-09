"use client";

import { useState } from "react";
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

type Props = {
  amenities: string[];
};

// Map a raw English amenity string from the DB to its translation key in
// dictionaries.ts (same buckets as the listing-card chips). Returns null
// when no key matches — caller falls back to the original string so a new
// admin-added amenity still renders even before it's translated.
function amenityKey(a: string): "pool" | "kitchen" | "ac" | "wifi" | "parking" | "hammam" | "breakfast" | "workspace" | "garden" | "terrace" | "washer" | "concierge" | "tennis" | null {
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

export function Amenities({ amenities }: Props) {
  const { t } = useI18n();
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? amenities : amenities.slice(0, 8);

  return (
    <section>
      <h2 className="font-display text-2xl font-semibold text-ink">{t.detail.amenitiesTitle}</h2>
      <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
        {visible.map((a) => {
          const Icon = ICONS[a] ?? ShieldCheck;
          const key = amenityKey(a);
          const label = key ? t.amenity[key] : a;
          return (
            <div key={a} className="flex items-center gap-3 text-sm text-ink">
              <Icon className="h-5 w-5 text-brand-600" />
              <span>{label}</span>
            </div>
          );
        })}
      </div>
      {amenities.length > 8 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="btn-ghost mt-6"
        >
          {showAll ? t.detail.showLess : t.detail.showAllAmenities.replace("{n}", String(amenities.length))}
        </button>
      )}
    </section>
  );
}
