import { Suspense } from "react";
import { ListingsByKindView } from "@/components/ListingsByKindView";
import { CustomRequestForm } from "@/components/CustomRequestForm";
import { getPublishedProperties, getPropertyTypeCounts } from "@/lib/property-repo";

/**
 * Public listings page for LONG-TERM RENTALS (Louer).
 * Server-renders the published RENT_LONG catalog + per-type counts. CustomRequestForm
 * at the bottom captures briefs from visitors who don't find a matching listing.
 */
export default async function LouerPage() {
  const [list, counts] = await Promise.all([
    getPublishedProperties({ listingKind: "RENT_LONG" }),
    getPropertyTypeCounts({ listingKind: "RENT_LONG" }),
  ]);

  return (
    <>
      <Suspense>
        <ListingsByKindView list={list} counts={counts} kind="RENT_LONG" />
      </Suspense>
      <CustomRequestForm kind="RENT_LONG" />
    </>
  );
}
