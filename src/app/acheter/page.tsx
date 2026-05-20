import { Suspense } from "react";
import { ListingsByKindView } from "@/components/ListingsByKindView";
import { CustomRequestForm } from "@/components/CustomRequestForm";
import { getPublishedProperties, getPropertyTypeCounts } from "@/lib/property-repo";

/**
 * Public listings page for properties FOR SALE (Acheter).
 * Server-renders the published SALE catalog + per-type counts. Filtering by
 * ?type=... happens client-side. CustomRequestForm at the bottom captures
 * briefs from visitors who don't find the right bien in the catalogue.
 */
export default async function AcheterPage() {
  const [list, counts] = await Promise.all([
    getPublishedProperties({ listingKind: "SALE" }),
    getPropertyTypeCounts({ listingKind: "SALE" }),
  ]);

  return (
    <>
      <Suspense>
        <ListingsByKindView list={list} counts={counts} kind="SALE" />
      </Suspense>
      <CustomRequestForm kind="SALE" />
    </>
  );
}
