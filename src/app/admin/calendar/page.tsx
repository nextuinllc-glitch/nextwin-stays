import { prisma } from "@/lib/db";
import { listReservationsInWindow } from "@/lib/reservation-repo";
import { MasterCalendar } from "@/components/admin/MasterCalendar";

export const dynamic = "force-dynamic";

type SearchParams = { m?: string };

function parseMonth(m?: string): { year: number; month: number } {
  if (m && /^\d{4}-\d{2}$/.test(m)) {
    const [y, mm] = m.split("-").map(Number);
    return { year: y, month: mm - 1 };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const { year, month } = parseMonth(sp.m);

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 1);
  // Fetch reservations spilling slightly past the edges so multi-day bars at
  // month boundaries still render at the right offset.
  const windowStart = new Date(year, month, -7);
  const windowEnd = new Date(year, month + 1, 7);

  const [properties, reservations] = await Promise.all([
    prisma.property.findMany({
      where: { published: true },
      orderBy: [{ position: "asc" }, { titleFr: "asc" }],
      select: {
        id: true,
        titleFr: true,
        type: true,
        area: true,
        images: { orderBy: { position: "asc" }, take: 1, select: { src: true } },
      },
    }),
    listReservationsInWindow(windowStart, windowEnd),
  ]);

  return (
    <MasterCalendar
      monthStart={monthStart.toISOString()}
      monthEnd={monthEnd.toISOString()}
      properties={properties.map((p) => ({
        id: p.id,
        title: p.titleFr,
        type: p.type,
        area: p.area,
        image: p.images[0]?.src ?? null,
      }))}
      reservations={reservations.map((r) => ({
        id: r.id,
        reference: r.reference,
        propertyId: r.propertyId,
        status: r.status,
        checkIn: r.checkIn.toISOString(),
        checkOut: r.checkOut.toISOString(),
        clientName: `${r.client.firstName} ${r.client.lastName}`,
      }))}
    />
  );
}
