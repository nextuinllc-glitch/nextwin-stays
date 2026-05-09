import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import {
  getReservation,
  updateReservation,
  cancelReservation,
  type UpdateReservationInput,
} from "@/lib/reservation-repo";

export const runtime = "nodejs";

async function guard() {
  const { valid } = await getCurrentSession();
  if (!valid) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  return null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  const r = await getReservation(id);
  if (!r) return NextResponse.json({ ok: false, error: "Introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true, reservation: r });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as UpdateReservationInput;

  try {
    const reservation = await updateReservation(id, body);
    return NextResponse.json({ ok: true, reservation });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Mise à jour impossible.";
    return NextResponse.json({ ok: false, error: message }, { status: 409 });
  }
}

// DELETE = soft cancel. Hard delete would lose the audit trail; admin can
// always purge from a future archive page if truly needed.
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const reason = typeof body?.reason === "string" ? body.reason : undefined;

  try {
    const reservation = await cancelReservation(id, reason);
    return NextResponse.json({ ok: true, reservation });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Annulation impossible.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
