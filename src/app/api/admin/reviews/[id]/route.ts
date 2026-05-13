import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";

export const runtime = "nodejs";

const VALID_STATUSES = new Set(["pending", "approved", "denied"]);

// Approve / deny / re-queue a review. Only `status` can be patched
// from the admin queue; the body, author, ratings stay verbatim from
// the submitter to preserve the public-facing audit trail.
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { valid } = await getCurrentSession();
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const status = body?.status;
  if (typeof status !== "string" || !VALID_STATUSES.has(status)) {
    return NextResponse.json(
      { ok: false, error: "Statut invalide (pending|approved|denied requis)" },
      { status: 400 },
    );
  }
  const review = await prisma.review.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json({ ok: true, review });
}

// Hard-delete a review — for spam. The status="denied" path keeps the
// row in the DB for auditing; this endpoint is for cases where you
// don't want any trace of the submission left.
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { valid } = await getCurrentSession();
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await ctx.params;
  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
