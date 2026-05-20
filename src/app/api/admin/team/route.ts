import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";

export const runtime = "nodejs";

async function guard() {
  const { valid } = await getCurrentSession();
  if (!valid) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  return null;
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "member"
  );
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  const team = await prisma.teamMember.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ ok: true, team });
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ ok: false, error: "Nom requis" }, { status: 400 });
  }

  // Ensure unique slug — if the user-supplied (or auto-derived) slug
  // collides with an existing row, suffix it with -2, -3, … until free.
  const baseSlug = typeof body.slug === "string" && body.slug.trim() ? slugify(body.slug) : slugify(name);
  let slug = baseSlug;
  let suffix = 2;
  while (await prisma.teamMember.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix++}`;
  }

  const last = await prisma.teamMember.findFirst({ orderBy: { position: "desc" } });

  const ALLOWED_SPECIALTY = new Set(["SHORT_STAY", "RENT_LONG", "SALE"]);
  const specialty =
    typeof body.specialty === "string" && ALLOWED_SPECIALTY.has(body.specialty)
      ? body.specialty
      : null;

  const created = await prisma.teamMember.create({
    data: {
      slug,
      name,
      roleFr: typeof body.roleFr === "string" ? body.roleFr : "",
      roleEn: typeof body.roleEn === "string" ? body.roleEn : null,
      roleAr: typeof body.roleAr === "string" ? body.roleAr : null,
      bioFr: typeof body.bioFr === "string" ? body.bioFr : "",
      bioEn: typeof body.bioEn === "string" ? body.bioEn : null,
      bioAr: typeof body.bioAr === "string" ? body.bioAr : null,
      photoUrl: typeof body.photoUrl === "string" && body.photoUrl ? body.photoUrl : null,
      whatsapp: typeof body.whatsapp === "string" && body.whatsapp ? body.whatsapp : null,
      email: typeof body.email === "string" && body.email ? body.email : null,
      phone: typeof body.phone === "string" && body.phone ? body.phone : null,
      specialty,
      position: typeof body.position === "number" ? body.position : (last?.position ?? -1) + 1,
      published: body.published !== false,
    },
  });
  return NextResponse.json({ ok: true, member: created });
}
