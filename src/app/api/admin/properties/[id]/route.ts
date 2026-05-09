import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";

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
  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } } },
  });
  if (!property) return NextResponse.json({ ok: false, error: "Introuvable" }, { status: 404 });
  return NextResponse.json({ ok: true, property });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ ok: false, error: "Introuvable" }, { status: 404 });

  // Replace images atomically — admin sends the full ordered list each time.
  if (Array.isArray(body.images)) {
    await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
    if (body.images.length) {
      await prisma.propertyImage.createMany({
        data: body.images.map((img: { src: string; alt?: string }, i: number) => ({
          propertyId: id,
          src: img.src,
          alt: img.alt ?? "",
          position: i,
        })),
      });
    }
  }

  const updated = await prisma.property.update({
    where: { id },
    data: {
      slug: body.slug ?? existing.slug,
      type: body.type ?? existing.type,
      area: body.area ?? existing.area,
      city: body.city ?? existing.city,
      rating: body.rating != null ? Number(body.rating) : existing.rating,
      reviewCount: body.reviewCount != null ? Number(body.reviewCount) : existing.reviewCount,
      guests: body.guests != null ? Number(body.guests) : existing.guests,
      bedrooms: body.bedrooms != null ? Number(body.bedrooms) : existing.bedrooms,
      bathrooms: body.bathrooms != null ? Number(body.bathrooms) : existing.bathrooms,
      pricePerNight:
        body.pricePerNight != null ? Number(body.pricePerNight) : existing.pricePerNight,
      currency: body.currency ?? existing.currency,
      titleFr: body.titleFr ?? existing.titleFr,
      titleEn: body.titleEn ?? existing.titleEn,
      titleAr: body.titleAr ?? existing.titleAr,
      shortDescriptionFr: body.shortDescriptionFr ?? existing.shortDescriptionFr,
      shortDescriptionEn: body.shortDescriptionEn ?? existing.shortDescriptionEn,
      shortDescriptionAr: body.shortDescriptionAr ?? existing.shortDescriptionAr,
      descriptionFr: body.descriptionFr ?? existing.descriptionFr,
      descriptionEn: body.descriptionEn ?? existing.descriptionEn,
      descriptionAr: body.descriptionAr ?? existing.descriptionAr,
      amenitiesJson: Array.isArray(body.amenities)
        ? JSON.stringify(body.amenities)
        : existing.amenitiesJson,
      highlightsJson: Array.isArray(body.highlights)
        ? JSON.stringify(body.highlights)
        : existing.highlightsJson,
      hostName: body.hostName ?? existing.hostName,
      hostYears: body.hostYears != null ? Number(body.hostYears) : existing.hostYears,
      published: body.published ?? existing.published,
      latitude:
        body.latitude === undefined
          ? existing.latitude
          : body.latitude === null || body.latitude === ""
          ? null
          : Number(body.latitude),
      longitude:
        body.longitude === undefined
          ? existing.longitude
          : body.longitude === null || body.longitude === ""
          ? null
          : Number(body.longitude),
      locationRadius:
        body.locationRadius != null ? Number(body.locationRadius) : existing.locationRadius,
      ruleCheckIn: body.ruleCheckIn ?? existing.ruleCheckIn,
      ruleCheckOut: body.ruleCheckOut ?? existing.ruleCheckOut,
      rulePets: body.rulePets ?? existing.rulePets,
      ruleSmoking: body.ruleSmoking ?? existing.ruleSmoking,
      ruleAdditional:
        body.ruleAdditional === undefined
          ? existing.ruleAdditional
          : body.ruleAdditional || null,
    },
  });

  return NextResponse.json({ ok: true, id: updated.id, slug: updated.slug });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await guard();
  if (denied) return denied;
  const { id } = await params;
  await prisma.property.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
