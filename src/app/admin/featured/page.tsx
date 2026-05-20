import { prisma } from "@/lib/db";
import { getPublishedProperties } from "@/lib/property-repo";
import { HomeFeaturedPicker } from "@/components/admin/HomeFeaturedPicker";

export const dynamic = "force-dynamic";

export default async function AdminFeaturedPage() {
  const [shortStay, rentLong, sale, settings] = await Promise.all([
    getPublishedProperties({ listingKind: "SHORT_STAY" }),
    getPublishedProperties({ listingKind: "RENT_LONG" }),
    getPublishedProperties({ listingKind: "SALE" }),
    prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    }),
  ]);

  // Trim to the fields the picker actually needs so we don't ship the
  // full image array of every property to the client.
  const toOption = (p: { slug: string; title: string; area: string; city: string; type: string }) => ({
    slug: p.slug,
    title: p.title,
    area: p.area,
    city: p.city,
    type: p.type,
  });

  return (
    <div>
      <header>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Sélection de la page d&apos;accueil
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Choisissez le bien mis en avant pour chacune des trois catégories sur la page d&apos;accueil
          (Court séjour, Long durée, Acheter). Laissez vide pour utiliser la sélection automatique
          (premier bien publié de la catégorie).
        </p>
      </header>

      <div className="mt-6">
        <HomeFeaturedPicker
          initial={{
            shortStaySlug: settings.homeFeaturedShortStaySlug ?? "",
            rentLongSlug: settings.homeFeaturedRentLongSlug ?? "",
            saleSlug: settings.homeFeaturedSaleSlug ?? "",
          }}
          options={{
            shortStay: shortStay.map(toOption),
            rentLong: rentLong.map(toOption),
            sale: sale.map(toOption),
          }}
        />
      </div>
    </div>
  );
}
