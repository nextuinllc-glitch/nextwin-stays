"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Property, PropertyType, ListingKind } from "@/lib/properties";
import { PropertyCard } from "./PropertyCard";
import { TypePills } from "./TypePills";
import { useI18n } from "@/i18n/I18nProvider";

type Props = {
  list: Property[];
  counts: {
    all: number;
    villa: number;
    riad: number;
    apartment: number;
    terrain: number;
    bureau: number;
    magasin: number;
    commercial: number;
  };
  // The kind drives the page title and the filter pills shown for property
  // type. Acheter and Louer both expose the full type set; empty pills are
  // auto-hidden so a section with no terrain or bureau stays clean.
  kind: ListingKind;
};

const VALID_TYPES: PropertyType[] = [
  "villa",
  "riad",
  "apartment",
  "terrain",
  "bureau",
  "magasin",
  "commercial",
];

/**
 * Listings grid for "Acheter" and "Louer" (long-term rentals). Mirrors
 * ListingsView for short-stay but skips the dates+guests search bar - sales
 * and long-term rentals filter by property type, neighborhood, and price
 * instead of date availability.
 */
export function ListingsByKindView({ list, counts, kind }: Props) {
  const { t } = useI18n();
  const searchParams = useSearchParams();

  const filteredList = useMemo(() => {
    const typeParam = searchParams.get("type");
    const typeFilter =
      typeParam && (VALID_TYPES as string[]).includes(typeParam)
        ? (typeParam as PropertyType)
        : null;

    return list.filter((p) => {
      if (typeFilter && p.type !== typeFilter) return false;
      return true;
    });
  }, [list, searchParams]);

  // Heading copy adapts to the listing kind.
  const heading =
    kind === "SALE"
      ? t.listingKind.sale
      : kind === "RENT_LONG"
        ? t.listingKind.rentLong
        : t.listingKind.shortStay;

  return (
    <div className="container-page py-8 sm:py-10">
      <h1 className="text-center font-display text-2xl font-semibold tracking-tight text-ink md:text-left">
        {heading}
      </h1>

      <div className="mt-5 flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
        <TypePills
          pills={(
            [
              { value: "all",        label: t.listings.all,       count: counts.all },
              { value: "villa",      label: t.type.villa,         count: counts.villa },
              { value: "apartment",  label: t.type.apartment,     count: counts.apartment },
              { value: "riad",       label: t.type.riad,          count: counts.riad },
              { value: "terrain",    label: t.type.terrain,       count: counts.terrain },
              { value: "bureau",     label: t.type.bureau,        count: counts.bureau },
              { value: "magasin",    label: t.type.magasin,       count: counts.magasin },
              { value: "commercial", label: t.type.commercial,    count: counts.commercial },
            ] as const
          ).filter((p) => p.value === "all" || p.count > 0)}
        />
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
