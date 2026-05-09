import { Suspense } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ListingsView } from "@/components/ListingsView";
import { getPublishedProperties, getPropertyTypeCounts } from "@/lib/property-repo";

// All published properties + type counts are fetched at build time.
// Filtering by `?type=`, `?guests=`, `?from=`, `?to=` happens entirely
// client-side now (see ListingsView and SearchBar) so this page is
// pre-rendered once and serves every variant of the URL from the same
// HTML — required for `output: 'export'` on GitHub Pages.
export default async function PropertiesPage() {
  const [list, counts] = await Promise.all([
    getPublishedProperties(),
    getPropertyTypeCounts(),
  ]);

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
            <SearchBar variant="compact" />
          </Suspense>
        </div>
      </section>

      <Suspense>
        <ListingsView list={list} counts={counts} />
      </Suspense>
    </>
  );
}
