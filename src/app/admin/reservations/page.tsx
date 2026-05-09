import Link from "next/link";
import { Plus } from "lucide-react";
import { listReservations } from "@/lib/reservation-repo";
import { prisma } from "@/lib/db";
import { ReservationsListView } from "@/components/admin/ReservationsListView";
import { isStatus, isSource } from "@/lib/reservation-status";

export const dynamic = "force-dynamic";

type SearchParams = {
  status?: string;
  source?: string;
  propertyId?: string;
  q?: string;
  from?: string;
  to?: string;
};

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const [reservations, properties] = await Promise.all([
    listReservations({
      status:
        sp.status && (isStatus(sp.status) || sp.status === "ALL")
          ? (sp.status as never)
          : undefined,
      source:
        sp.source && (isSource(sp.source) || sp.source === "ALL")
          ? (sp.source as never)
          : undefined,
      propertyId: sp.propertyId,
      query: sp.q,
      from: sp.from ? new Date(sp.from) : undefined,
      to: sp.to ? new Date(sp.to) : undefined,
    }),
    prisma.property.findMany({
      where: { published: true },
      orderBy: { titleFr: "asc" },
      select: { id: true, titleFr: true },
    }),
  ]);

  return (
    <div>
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Réservations</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {reservations.length} {reservations.length === 1 ? "réservation" : "réservations"} (filtres appliqués).
          </p>
        </div>
        <Link
          href="/admin/reservations/new"
          className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Nouvelle réservation
        </Link>
      </header>

      <ReservationsListView
        reservations={reservations.map((r) => ({
          id: r.id,
          reference: r.reference,
          status: r.status,
          source: r.source,
          checkIn: r.checkIn.toISOString(),
          checkOut: r.checkOut.toISOString(),
          nights: r.nights,
          guests: r.guests,
          total: r.total,
          currency: r.currency,
          property: {
            id: r.property.id,
            title: r.property.titleFr,
            image: r.property.images?.[0]?.src ?? null,
          },
          client: {
            firstName: r.client.firstName,
            lastName: r.client.lastName,
            email: r.client.email,
          },
        }))}
        properties={properties.map((p) => ({ id: p.id, title: p.titleFr }))}
      />
    </div>
  );
}
