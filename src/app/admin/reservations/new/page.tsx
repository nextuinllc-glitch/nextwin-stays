import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { NewReservationForm } from "@/components/admin/NewReservationForm";

export const dynamic = "force-dynamic";

type SearchParams = {
  propertyId?: string;
  checkIn?: string;
};

export default async function NewReservationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const properties = await prisma.property.findMany({
    where: { published: true },
    orderBy: { titleFr: "asc" },
    select: {
      id: true,
      titleFr: true,
      pricePerNight: true,
      currency: true,
      guests: true,
      area: true,
      images: { orderBy: { position: "asc" }, take: 1, select: { src: true } },
    },
  });

  const settings = await prisma.settings.findUnique({ where: { id: 1 } });

  return (
    <div>
      <Link
        href="/admin/reservations"
        className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted transition hover:text-ink"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Retour aux réservations
      </Link>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
        Nouvelle réservation
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        Vérification automatique de disponibilité, création du client si nouveau.
      </p>

      <div className="mt-6">
        <NewReservationForm
          properties={properties.map((p) => ({
            id: p.id,
            title: p.titleFr,
            area: p.area,
            pricePerNight: p.pricePerNight,
            currency: p.currency,
            maxGuests: p.guests,
            image: p.images[0]?.src ?? null,
          }))}
          defaults={{
            propertyId: sp.propertyId ?? null,
            checkIn: sp.checkIn ?? null,
            cleaningFee: settings?.cleaningFee ?? 45,
            serviceFeeRate: settings?.serviceFeeRate ?? 0.07,
          }}
        />
      </div>
    </div>
  );
}
