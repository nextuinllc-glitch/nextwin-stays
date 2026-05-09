import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { checkAvailability } from "@/lib/reservation-repo";

export const runtime = "nodejs";

// Pre-flight conflict check used by the new-reservation form so the admin
// sees red dates before submitting.
export async function POST(req: Request) {
  const { valid } = await getCurrentSession();
  if (!valid) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { propertyId, checkIn, checkOut, excludeReservationId } = body ?? {};
  if (!propertyId || !checkIn || !checkOut) {
    return NextResponse.json(
      { ok: false, error: "propertyId, checkIn, checkOut requis" },
      { status: 400 },
    );
  }
  const result = await checkAvailability(
    propertyId,
    new Date(checkIn),
    new Date(checkOut),
    typeof excludeReservationId === "string" ? excludeReservationId : undefined,
  );
  return NextResponse.json({ ok: true, ...result });
}
