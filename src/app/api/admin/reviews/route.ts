import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";

export const runtime = "nodejs";

// Lists every review in the DB so the admin can sort the queue by
// status. Pending rows come first (the moderation backlog), then the
// approved + denied archive. Optional `?status=pending` filter.
export async function GET(req: Request) {
  const { valid } = await getCurrentSession();
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  }
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const where = status ? { status } : {};
  const reviews = await prisma.review.findMany({
    where,
    orderBy: [
      // Pending first, then by recency. We do this client-side after
      // fetching since Prisma can't sort by custom enum order in SQLite
      // and on Postgres we'd need a `CASE WHEN` raw expression.
      { createdAt: "desc" },
    ],
  });
  // Re-order so pending rows surface to the top of the queue.
  reviews.sort((a, b) => {
    const order = (s: string) =>
      s === "pending" ? 0 : s === "approved" ? 1 : 2;
    return order(a.status) - order(b.status);
  });
  return NextResponse.json({ ok: true, reviews });
}
