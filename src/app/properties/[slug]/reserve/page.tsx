import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getPropertyBySlug, getAllPropertySlugs } from "@/lib/property-repo";
import { getFeeSettings } from "@/lib/settings-repo";

export async function generateStaticParams() {
  const slugs = await getAllPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

export const metadata = {
  title: "Confirmer la réservation",
};

// Static export — every property's /reserve page is pre-rendered once
// at build time with empty initial values. The `?from=`, `?to=`, and
// `?guests=` query params are read CLIENT-side inside <CheckoutForm>
// (see the useSearchParams effect there) so a deep-link lands with the
// calendar pre-filled. We can't read searchParams here because that
// would force a per-request server render that GitHub Pages can't host.
export default async function ReservePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Sequential — same reason as the property detail page: the Supabase
  // pooler is opened with connection_limit=1 and Promise.all over two
  // queries dead-locks on the pool at build time.
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();
  const fees = await getFeeSettings();

  // <Suspense> required because CheckoutForm calls useSearchParams() to
  // hydrate the dates / guest count from the URL on the client. Without
  // it, the static-export build fails with "should be wrapped in a
  // suspense boundary at page".
  return (
    <Suspense>
      <CheckoutForm
        property={property}
        initial={{ from: null, to: null, guests: 2 }}
        fees={fees}
      />
    </Suspense>
  );
}
