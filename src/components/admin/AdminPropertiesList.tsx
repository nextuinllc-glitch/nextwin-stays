import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { PropertyFilterBar } from "./PropertyFilterBar";
import { PublishToggle } from "./PublishToggle";
import { formatPrice, formatPriceShort } from "@/lib/utils";

type Kind = "SHORT_STAY" | "RENT_LONG" | "SALE";

const TYPE_BADGE: Record<string, string> = {
  riad:       "bg-amber-600 text-white",
  villa:      "bg-violet-500 text-white",
  apartment:  "bg-sky-400 text-white",
  terrain:    "bg-emerald-600 text-white",
  bureau:     "bg-indigo-500 text-white",
  magasin:    "bg-orange-500 text-white",
  commercial: "bg-rose-500 text-white",
};

const TYPE_LABEL: Record<string, string> = {
  riad:       "Riad",
  villa:      "Villa",
  apartment:  "Appartement",
  terrain:    "Terrain",
  bureau:     "Bureau",
  magasin:    "Magasin",
  commercial: "Commercial",
};

const TYPE_VALUES = [
  "riad",
  "villa",
  "apartment",
  "terrain",
  "bureau",
  "magasin",
  "commercial",
] as const;
type PropertyType = (typeof TYPE_VALUES)[number];

// Per-kind page chrome: heading + price column header + edit/new base URL.
const KIND_CHROME: Record<
  Kind,
  { heading: string; subtitle: string; priceLabel: string; baseHref: string; newHref: string }
> = {
  SALE: {
    heading: "Acheter",
    subtitle: "Catalogue des biens à vendre.",
    priceLabel: "Prix de vente",
    baseHref: "/admin/acheter",
    newHref: "/admin/properties/new?kind=SALE",
  },
  RENT_LONG: {
    heading: "Louer",
    subtitle: "Catalogue des locations longue durée.",
    priceLabel: "Loyer mensuel",
    baseHref: "/admin/louer",
    newHref: "/admin/properties/new?kind=RENT_LONG",
  },
  SHORT_STAY: {
    heading: "Court séjour",
    subtitle: "Catalogue des locations à la nuit (Airbnb-style).",
    priceLabel: "Prix par nuit",
    baseHref: "/admin/court-sejour",
    newHref: "/admin/properties/new?kind=SHORT_STAY",
  },
};

/**
 * Server-rendered admin properties list, scoped to a single listing kind.
 * Used by /admin/acheter, /admin/louer, and /admin/court-sejour.
 *
 * Filtering by property type (?type=) and free-text search (?q=) stay in the
 * URL so the page stays cache-friendly and back/forward navigation works.
 */
export async function AdminPropertiesList({
  kind,
  searchParams,
}: {
  kind: Kind;
  searchParams: { type?: string; q?: string };
}) {
  const chrome = KIND_CHROME[kind];

  const typeFilter: PropertyType | null = TYPE_VALUES.includes(
    searchParams.type as PropertyType,
  )
    ? (searchParams.type as PropertyType)
    : null;
  const q = (searchParams.q ?? "").trim();

  const where = {
    listingKind: kind,
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(q
      ? {
          OR: [
            { titleFr: { contains: q } },
            { titleEn: { contains: q } },
            { area: { contains: q } },
            { city: { contains: q } },
          ],
        }
      : {}),
  };

  const [properties, grouped] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    // Counts are scoped to this kind so admins see the per-kind breakdown
    // (e.g. 6 SALE = 3 villa + 1 riad + 1 appt + 1 terrain).
    prisma.property.groupBy({
      by: ["type"],
      where: { listingKind: kind },
      _count: { _all: true },
    }),
  ]);

  const counts = {
    all:        grouped.reduce((s, g) => s + g._count._all, 0),
    riad:       grouped.find((g) => g.type === "riad")?._count._all ?? 0,
    villa:      grouped.find((g) => g.type === "villa")?._count._all ?? 0,
    apartment:  grouped.find((g) => g.type === "apartment")?._count._all ?? 0,
    terrain:    grouped.find((g) => g.type === "terrain")?._count._all ?? 0,
    bureau:     grouped.find((g) => g.type === "bureau")?._count._all ?? 0,
    magasin:    grouped.find((g) => g.type === "magasin")?._count._all ?? 0,
    commercial: grouped.find((g) => g.type === "commercial")?._count._all ?? 0,
  };

  const totalLabel =
    typeFilter || q
      ? `${properties.length} sur ${counts.all}`
      : `${counts.all} ${counts.all === 1 ? "propriété" : "propriétés"}`;

  // Picks the right price field per kind for the table column.
  function priceCell(p: (typeof properties)[number]) {
    const currency = (p.currency ?? "EUR") as "EUR" | "USD" | "MAD";
    if (kind === "SALE") {
      const v = (p as { salePrice?: number | null }).salePrice;
      return v ? formatPriceShort(v, currency) : "-";
    }
    if (kind === "RENT_LONG") {
      const v = (p as { monthlyRent?: number | null }).monthlyRent;
      return v ? formatPrice(v, currency) : "-";
    }
    return formatPrice(p.pricePerNight, currency);
  }

  return (
    <div>
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">{chrome.heading}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {chrome.subtitle} {totalLabel}.
          </p>
        </div>
        <Link
          href={chrome.newHref}
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Nouvelle propriété
        </Link>
      </header>

      <PropertyFilterBar counts={counts} baseHref={chrome.baseHref} />

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/80">
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
              <th className="px-4 py-3">Propriété</th>
              <th className="hidden px-4 py-3 sm:table-cell">Type</th>
              <th className="hidden px-4 py-3 md:table-cell">Capacité</th>
              <th className="hidden px-4 py-3 md:table-cell">{chrome.priceLabel}</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {properties.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-ink-muted">
                  {typeFilter || q ? (
                    <>
                      Aucune propriété ne correspond à ces filtres.{" "}
                      <Link
                        href={chrome.baseHref}
                        className="font-semibold text-brand-700 underline-offset-2 hover:underline"
                      >
                        Réinitialiser
                      </Link>
                      .
                    </>
                  ) : (
                    <>
                      Aucune propriété pour le moment.{" "}
                      <Link
                        href={chrome.newHref}
                        className="font-semibold text-brand-700 underline-offset-2 hover:underline"
                      >
                        Créez la première
                      </Link>
                      .
                    </>
                  )}
                </td>
              </tr>
            )}
            {properties.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 last:border-b-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {p.images[0] && (
                        <Image
                          src={p.images[0].src}
                          alt={p.images[0].alt}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-ink">{p.titleFr}</div>
                      <div className="truncate text-xs text-ink-muted">
                        {p.area}, {p.city}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      TYPE_BADGE[p.type] ?? "bg-gray-200"
                    }`}
                  >
                    {TYPE_LABEL[p.type] ?? p.type}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-xs text-ink-muted md:table-cell">
                  {p.bedrooms > 0 ? `${p.bedrooms} ch.` : "-"}
                  {p.bathrooms > 0 ? ` · ${p.bathrooms} sdb` : ""}
                  {(p as { surfaceM2?: number | null }).surfaceM2
                    ? ` · ${(p as { surfaceM2?: number | null }).surfaceM2} m²`
                    : ""}
                </td>
                <td className="hidden px-4 py-3 font-medium text-ink md:table-cell">
                  {priceCell(p)}
                </td>
                <td className="px-4 py-3">
                  <PublishToggle id={p.id} initial={p.published} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/properties/${p.id}`}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                  >
                    <Pencil className="h-3 w-3" />
                    Modifier
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
