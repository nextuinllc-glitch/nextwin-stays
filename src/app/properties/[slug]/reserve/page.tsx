import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/CheckoutForm";
import { getPropertyBySlug, getAllPropertySlugs } from "@/lib/property-repo";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await getAllPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

type SearchParams = {
  from?: string;
  to?: string;
  guests?: string;
};

export const metadata = {
  title: "Confirmer la réservation",
};

export default async function ReservePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const sp = await searchParams;

  const initial = {
    from: sp.from ?? null,
    to: sp.to ?? null,
    guests: sp.guests ? Number(sp.guests) : 2,
  };

  return <CheckoutForm property={property} initial={initial} />;
}
