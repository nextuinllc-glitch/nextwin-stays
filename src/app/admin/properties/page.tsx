import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/db";
import { PropertyFilterBar } from "@/components/admin/PropertyFilterBar";
import { PublishToggle } from "@/components/admin/PublishToggle";

const TYPE_BADGE: Record<string, string> = {
  riad: "bg-amber-600 text-white",
  villa: "bg-violet-500 text-white",
  apartment: "bg-sky-400 text-white",
};

const TYPE_LABEL: Record<string, string> = {
  riad: "Riad",
  villa: "Villa",
  apartment: "Appartement",
};

const TYPE_VALUES = ["riad", "villa", "apartment"] as const;
type PropertyType = (typeof TYPE_VALUES)[number];

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage({
  searchParams,
}: {
  // Next 15: searchParams is a Promise, awaited per-request.
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const sp = await searchParams;
  // Coerce to a known value or fall through to "all" — protects the query
  // from `?type=<script>` and similar payloads.
  const typeFilter: PropertyType | null = TYPE_VALUES.includes(
    sp.type as PropertyType,
  )
    ? (sp.type as PropertyType)
    : null;
  const q = (sp.q ?? "").trim();

  // Build the WHERE once and reuse for the row query. SQLite's LIKE is
  // case-insensitive for ASCII by default, which is good enough for the
  // admin filter — Prisma's `mode: "insensitive"` is a no-op on SQLite.
  const where = {
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

  // Counts power the pill badges; we want each pill to show its total
  // *regardless* of the active filter so admins can see "Riad: 3" even
  // while looking at Villas. Group across the un-filtered set.
  const [properties, grouped] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: [{ position: "asc" }, { createdAt: "desc" }],
      include: { images: { orderBy: { position: "asc" }, take: 1 } },
    }),
    prisma.property.groupBy({ by: ["type"], _count: { _all: true } }),
  ]);

  const counts = {
    all: grouped.reduce((sum, g) => sum + g._count._all, 0),
    riad: grouped.find((g) => g.type === "riad")?._count._all ?? 0,
    villa: grouped.find((g) => g.type === "villa")?._count._all ?? 0,
    apartment: grouped.find((g) => g.type === "apartment")?._count._all ?? 0,
  };

  // The "showing X of Y" counter helps when the filter narrows the list
  // — admins can tell at a glance whether a filter is active.
  const totalLabel =
    typeFilter || q
      ? `${properties.length} sur ${counts.all}`
      : `${counts.all} ${counts.all === 1 ? "propriété" : "propriétés"}`;

  return (
    <div>
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Propriétés</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {totalLabel} dans votre catalogue.
          </p>
        </div>
        <Link
          href="/admin/properties/new"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Nouvelle propriété
        </Link>
      </header>

      <PropertyFilterBar counts={counts} />

      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50/80">
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
              <th className="px-4 py-3">Propriété</th>
              <th className="hidden px-4 py-3 sm:table-cell">Type</th>
              <th className="hidden px-4 py-3 md:table-cell">Capacité</th>
              <th className="hidden px-4 py-3 md:table-cell">Prix / nuit</th>
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
                        href="/admin/properties"
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
                        href="/admin/properties/new"
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
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TYPE_BADGE[p.type] ?? "bg-gray-200"}`}>
                    {TYPE_LABEL[p.type] ?? p.type}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-xs text-ink-muted md:table-cell">
                  {p.guests} inv. · {p.bedrooms} ch. · {p.bathrooms} sdb
                </td>
                <td className="hidden px-4 py-3 font-medium text-ink md:table-cell">
                  €{p.pricePerNight}
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
