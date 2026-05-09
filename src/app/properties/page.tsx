import { Suspense } from "react";
import type { PropertyType } from "@/lib/properties";
import { SearchBar } from "@/components/SearchBar";
import { ListingsView } from "@/components/ListingsView";
import { getPublishedProperties, getPropertyTypeCounts } from "@/lib/property-repo";

export const dynamic = "force-dynamic";

type SearchParams = {
  type?: string;
  guests?: string;
  from?: string;
  to?: string;
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const typeFilter =
    params.type && ["riad", "villa", "apartment"].includes(params.type)
      ? (params.type as PropertyType)
      : undefined;
  const guestsFilter = params.guests ? Number(params.guests) : undefined;

  const [list, counts] = await Promise.all([
    getPublishedProperties({
      type: typeFilter,
      guests: guestsFilter && !Number.isNaN(guestsFilter) ? guestsFilter : undefined,
    }),
    getPropertyTypeCounts(),
  ]);

  const initialFrom = params.from ? new Date(params.from) : null;
  const initialTo = params.to ? new Date(params.to) : null;
  const initialGuests = params.guests ? Number(params.guests) : 1;

  return (
    <>
      {/* Search form bar — visually shown only on desktop. The component
          is still mounted on mobile (display:none) so the `?openDates=1`
          deep-link from the bottom-nav still triggers the calendar modal,
          which renders at body level via fixed positioning and is visible
          regardless of the form's display state. */}
      <section className="border-b border-gray-100 bg-cream-50 max-md:hidden">
        <div className="container-page py-6 sm:py-7">
          <Suspense>
            <SearchBar
              variant="compact"
              initialFrom={initialFrom}
              initialTo={initialTo}
              initialGuests={initialGuests}
            />
          </Suspense>
        </div>
      </section>

      <Suspense>
        <ListingsView list={list} counts={counts} />
      </Suspense>
    </>
  );
}
