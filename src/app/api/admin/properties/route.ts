import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";

export const runtime = "nodejs";

async function guard() {
  const { valid } = await getCurrentSession();
  if (!valid) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  return null;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  const properties = await prisma.property.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
    include: { images: { orderBy: { position: "asc" } } },
  });
  return NextResponse.json({ ok: true, properties });
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  if (!body?.titleFr) {
    return NextResponse.json({ ok: false, error: "Titre FR requis" }, { status: 400 });
  }

  let slug = (body.slug as string)?.trim() || slugify(body.titleFr);
  // Ensure slug is unique by suffixing if needed.
  const existing = await prisma.property.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString().slice(-4)}`;

  const property = await prisma.property.create({
    data: {
      slug,
      type: body.type ?? "riad",
      area: body.area ?? "",
      city: body.city ?? "Marrakech",
      rating: Number(body.rating) || 4.85,
      reviewCount: Number(body.reviewCount) || 0,
      guests: Number(body.guests) || 1,
      bedrooms: Number(body.bedrooms) || 1,
      bathrooms: Number(body.bathrooms) || 1,
      pricePerNight: Number(body.pricePerNight) || 0,
      currency: body.currency ?? "EUR",
      titleFr: body.titleFr,
      titleEn: body.titleEn || null,
      titleAr: body.titleAr || null,
      shortDescriptionFr: body.shortDescriptionFr || null,
      shortDescriptionEn: body.shortDescriptionEn || null,
      shortDescriptionAr: body.shortDescriptionAr || null,
      descriptionFr: body.descriptionFr || null,
      descriptionEn: body.descriptionEn || null,
      descriptionAr: body.descriptionAr || null,
      amenitiesJson: JSON.stringify(Array.isArray(body.amenities) ? body.amenities : []),
      highlightsJson: JSON.stringify(Array.isArray(body.highlights) ? body.highlights : []),
      hostName: body.hostName ?? "NEXTWIN",
      hostYears: Number(body.hostYears) || 1,
      published: body.published ?? true,
      latitude:
        body.latitude == null || body.latitude === "" ? null : Number(body.latitude),
      longitude:
        body.longitude == null || body.longitude === "" ? null : Number(body.longitude),
      locationRadius:
        body.locationRadius != null ? Number(body.locationRadius) || 200 : 200,
      ruleCheckIn: body.ruleCheckIn || "À partir de 15h00",
      ruleCheckOut: body.ruleCheckOut || "Avant 11h00",
      rulePets: body.rulePets || "Sur demande",
      ruleSmoking: body.ruleSmoking || "Interdit à l'intérieur",
      ruleAdditional: body.ruleAdditional || null,
      images: {
        create: Array.isArray(body.images)
          ? body.images.map((img: { src: string; alt?: string }, i: number) => ({
              src: img.src,
              alt: img.alt ?? "",
              position: i,
            }))
          : [],
      },
    },
  });

  return NextResponse.json({ ok: true, id: property.id, slug: property.slug });
}
