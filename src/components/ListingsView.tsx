"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Map as MapIcon } from "lucide-react";
import type { Property, PropertyType } from "@/lib/properties";
import { PropertyCard } from "./PropertyCard";
import { TypePills } from "./TypePills";
import { useI18n } from "@/i18n/I18nProvider";

type Props = {
  // Always the FULL published catalog — server pre-renders one HTML
  // file for every variant of /properties?type=… and we filter on the
  // client so static export (GitHub Pages) can serve the page from a
  // single bake.
  list: Property[];
  counts: { all: number; villa: number; riad: number; apartment: number };
};

const VALID_TYPES: PropertyType[] = ["riad", "villa", "apartment"];

export function ListingsView({ list, counts }: Props) {
  const { t } = useI18n();
  const searchParams = useSearchParams();

  const filteredList = useMemo(() => {
    const typeParam = searchParams.get("type");
    const guestsParam = searchParams.get("guests");
    const typeFilter =
      typeParam && (VALID_TYPES as string[]).includes(typeParam)
        ? (typeParam as PropertyType)
        : null;
    const guestsFilter = guestsParam ? Number(guestsParam) : NaN;

    return list.filter((p) => {
      if (typeFilter && p.type !== typeFilter) return false;
      if (!Number.isNaN(guestsFilter) && guestsFilter > 0 && p.guests < guestsFilter) {
        return false;
      }
      return true;
    });
  }, [list, searchParams]);

  return (
    <div className="container-page py-8 sm:py-10">
      {/* Heading: centered up to tablet width, left-aligned on the desktop
          layout where the search bar above sets the rhythm. Using `md:`
          (768 px) instead of `sm:` so phones-in-landscape and small tablets
          keep the centered editorial feel. */}
      <h1 className="text-center font-display text-2xl font-semibold tracking-tight text-ink md:text-left">
        {t.listings.title}
      </h1>

      <div className="mt-5 flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
        {/* Filter pills + map button: stacked + centered until desktop,
            row + space-between from md+. */}
        <TypePills
          // Order on row 2: Villa · Apartment · Riad — keeps the
          // alphabetical-ish balance and puts Apartment (the most common
          // type in the catalog) in the middle for visual weight.
          pills={[
            { value: "all", label: t.listings.all, count: counts.all },
            { value: "villa", label: t.type.villa, count: counts.villa },
            { value: "apartment", label: t.type.apartment, count: counts.apartment },
            { value: "riad", label: t.type.riad, count: counts.riad },
          ]}
        />
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-600/20 bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 md:w-auto"
        >
          <MapIcon className="h-4 w-4" />
          {t.listings.viewMap}
        </button>
      </div>

      <div className="mt-8">
        {filteredList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <p className="text-base font-semibold text-ink">{t.listings.noResults}</p>
            <p className="mt-1.5 text-sm text-ink-muted">{t.listings.noResultsHint}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {filteredList.map((p, i) => (
              <PropertyCard key={p.slug} property={p} priority={i < 3} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
