import { notFound } from "next/navigation";
import { getReservation } from "@/lib/reservation-repo";
import { ReservationDetailView } from "@/components/admin/ReservationDetailView";

export const dynamic = "force-dynamic";

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await getReservation(id);
  if (!r) notFound();

  return (
    <ReservationDetailView
      reservation={{
        id: r.id,
        reference: r.reference,
        status: r.status,
        source: r.source,
        checkIn: r.checkIn.toISOString(),
        checkOut: r.checkOut.toISOString(),
        nights: r.nights,
        guests: r.guests,
        nightlyRate: r.nightlyRate,
        cleaningFee: r.cleaningFee,
        serviceFee: r.serviceFee,
        total: r.total,
        currency: r.currency,
        notes: r.notes,
        specialRequests: r.specialRequests,
        cancelledAt: r.cancelledAt?.toISOString() ?? null,
        cancellationReason: r.cancellationReason,
        createdAt: r.createdAt.toISOString(),
        property: {
          id: r.property.id,
          slug: r.property.slug,
          title: r.property.titleFr,
          area: r.property.area,
          city: r.property.city,
          image: r.property.images?.[0]?.src ?? null,
        },
        client: {
          id: r.client.id,
          firstName: r.client.firstName,
          lastName: r.client.lastName,
          email: r.client.email,
          phone: r.client.phone,
          vip: r.client.vip,
          totalSpend: r.client.totalSpend,
        },
      }}
    />
  );
}
