import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";

export const runtime = "nodejs";

// Quick autocomplete for the new-reservation form. Matches firstName,
// lastName, email or phone (substring, case-insensitive on email).
export async function GET(req: Request) {
  const { valid } = await getCurrentSession();
  if (!valid) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ ok: true, clients: [] });

  const clients = await prisma.client.findMany({
    where: {
      OR: [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { email: { contains: q.toLowerCase() } },
        { phone: { contains: q } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      vip: true,
      totalSpend: true,
    },
    orderBy: { totalSpend: "desc" },
    take: 8,
  });
  return NextResponse.json({ ok: true, clients });
}
