import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import {
  createReservation,
  listReservations,
  type CreateReservationInput,
} from "@/lib/reservation-repo";
import { isStatus, isSource } from "@/lib/reservation-status";

export const runtime = "nodejs";

async function guard() {
  const { valid } = await getCurrentSession();
  if (!valid) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  return null;
}

export async function GET(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const source = searchParams.get("source");
  const propertyId = searchParams.get("propertyId") ?? undefined;
  const query = searchParams.get("q") ?? undefined;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const reservations = await listReservations({
    status: status && (isStatus(status) || status === "ALL") ? (status as never) : undefined,
    source: source && (isSource(source) || source === "ALL") ? (source as never) : undefined,
    propertyId,
    query,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });
  return NextResponse.json({ ok: true, reservations });
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as Partial<CreateReservationInput>;
  if (!body.propertyId || !body.checkIn || !body.checkOut) {
    return NextResponse.json(
      { ok: false, error: "propertyId, checkIn et checkOut sont requis." },
      { status: 400 },
    );
  }
  if (body.status && !isStatus(body.status)) {
    return NextResponse.json({ ok: false, error: "Statut invalide." }, { status: 400 });
  }
  if (body.source && !isSource(body.source)) {
    return NextResponse.json({ ok: false, error: "Source invalide." }, { status: 400 });
  }
  if (!body.client || (!body.client.id && !body.client.firstName && !body.client.phone && !body.client.email)) {
    return NextResponse.json(
      { ok: false, error: "Informations client requises (nom, téléphone ou email)." },
      { status: 400 },
    );
  }

  try {
    const reservation = await createReservation(body as CreateReservationInput);
    return NextResponse.json({ ok: true, id: reservation.id, reference: reservation.reference });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur de création.";
    return NextResponse.json({ ok: false, error: message }, { status: 409 });
  }
}
