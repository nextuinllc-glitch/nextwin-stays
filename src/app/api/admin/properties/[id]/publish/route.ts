import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";

export const runtime = "nodejs";

// Tiny endpoint dedicated to flipping the published flag from the admin
// list. Lives next to the full PATCH so admins can toggle via a one-click
// switch without sending the entire property body across the wire.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { valid } = await getCurrentSession();
  if (!valid) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  // Coerce to boolean explicitly — null / undefined fall through to false
  // so a malformed payload doesn't accidentally republish a draft.
  const published = body?.published === true;

  const updated = await prisma.property
    .update({ where: { id }, data: { published }, select: { id: true, published: true } })
    .catch(() => null);

  if (!updated) {
    return NextResponse.json({ ok: false, error: "Introuvable" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, published: updated.published });
}
