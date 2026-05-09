"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import type { PropertyType } from "@/lib/properties";
import { cn } from "@/lib/utils";

const TYPES: { value: PropertyType; label: string }[] = [
  { value: "riad", label: "Riad" },
  { value: "villa", label: "Villa" },
  { value: "apartment", label: "Apartment" },
];

const SORTS = [
  { value: "popular", label: "Most popular" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Highest rated" },
];

const AMENITIES = [
  "Pool",
  "Wi-Fi",
  "Air conditioning",
  "Kitchen",
  "Free parking",
  "Hammam",
  "Workspace",
  "Breakfast included",
];

type Props = {
  totalCount: number;
};

export function Filters({ totalCount }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [openMobile, setOpenMobile] = useState(false);

  const activeType = params.get("type") as PropertyType | null;
  const activeSort = params.get("sort") ?? "popular";
  const activePriceMin = Number(params.get("priceMin") ?? 0);
  const activePriceMax = Number(params.get("priceMax") ?? 1000);
  const activeAmenities = (params.get("amenities") ?? "").split(",").filter(Boolean);

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(patch).forEach(([k, v]) => {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    });
    router.push(`/properties?${next.toString()}`);
  };

  const toggleType = (t: PropertyType) => {
    update({ type: activeType === t ? null : t });
  };

  const toggleAmenity = (a: string) => {
    const next = activeAmenities.includes(a)
      ? activeAmenities.filter((x) => x !== a)
      : [...activeAmenities, a];
    update({ amenities: next.length ? next.join(",") : null });
  };

  const reset = () => router.push("/properties");

  const Body = (
    <div className="flex flex-col gap-7">
      <section>
        <h3 className="mb-3 text-sm font-semibold text-ink">Property type</h3>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => toggleType(t.value)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                activeType === t.value
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-gray-200 bg-white text-ink hover:border-gray-300",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-ink">Price per night</h3>
        <div className="flex items-center gap-2">
          <label className="flex-1">
            <span className="field-label">Min</span>
            <div className="mt-1 flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2">
              <span className="mr-1 text-xs text-ink-soft">€</span>
              <input
                type="number"
                inputMode="numeric"
                value={activePriceMin}
                onChange={(e) => update({ priceMin: e.target.value || null })}
                className="field-input"
              />
            </div>
          </label>
          <label className="flex-1">
            <span className="field-label">Max</span>
            <div className="mt-1 flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2">
              <span className="mr-1 text-xs text-ink-soft">€</span>
              <input
                type="number"
                inputMode="numeric"
                value={activePriceMax}
                onChange={(e) => update({ priceMax: e.target.value || null })}
                className="field-input"
              />
            </div>
          </label>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-ink">Amenities</h3>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <button
              key={a}
              onClick={() => toggleAmenity(a)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                activeAmenities.includes(a)
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-gray-200 bg-white text-ink-muted hover:border-gray-300 hover:text-ink",
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-ink">Sort by</h3>
        <select
          value={activeSort}
          onChange={(e) => update({ sort: e.target.value })}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </section>

      <button
        onClick={reset}
        className="text-left text-xs font-semibold text-ink-muted underline-offset-2 hover:text-ink hover:underline"
      >
        Reset all filters
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-20 rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Filters</h2>
            <span className="text-xs text-ink-soft">{totalCount} stays</span>
          </div>
          {Body}
        </div>
      </aside>

      {/* Mobile trigger */}
      <div className="flex items-center justify-between lg:hidden">
        <span className="text-xs text-ink-muted">{totalCount} stays</span>
        <button
          onClick={() => setOpenMobile(true)}
          className="btn-ghost"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Mobile drawer */}
      {openMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpenMobile(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">Filters</h2>
              <button
                onClick={() => setOpenMobile(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-gray-100"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {Body}
            <div className="sticky bottom-0 mt-6 -mx-5 border-t border-gray-100 bg-white px-5 pt-4">
              <button onClick={() => setOpenMobile(false)} className="btn-primary w-full">
                Show {totalCount} stays
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
