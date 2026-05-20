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

  // Accept the listing kind and the kind-specific price fields. Defaults to
  // SHORT_STAY (back-compat with the original Stay-only API).
  const allowedKinds = ["SHORT_STAY", "RENT_LONG", "SALE"];
  const listingKind: string = allowedKinds.includes(body.listingKind)
    ? body.listingKind
    : "SHORT_STAY";

  const property = await prisma.property.create({
    data: {
      slug,
      type: body.type ?? "riad",
      area: body.area ?? "",
      city: body.city ?? "Marrakech",
      rating: Number(body.rating) || 4.85,
      reviewCount: Number(body.reviewCount) || 0,
      guests: Number(body.guests) || (listingKind === "SHORT_STAY" ? 1 : 0),
      bedrooms: Number(body.bedrooms) || 0,
      bathrooms: Number(body.bathrooms) || 0,
      listingKind,
      pricePerNight: Number(body.pricePerNight) || 0,
      monthlyRent:
        body.monthlyRent == null || body.monthlyRent === "" ? null : Number(body.monthlyRent),
      salePrice:
        body.salePrice == null || body.salePrice === "" ? null : Number(body.salePrice),
      surfaceM2:
        body.surfaceM2 == null || body.surfaceM2 === "" ? null : Number(body.surfaceM2),
      currency: body.currency ?? (listingKind === "SHORT_STAY" ? "EUR" : "MAD"),
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

      // Real-estate structured fields. All optional - null when not given.
      landSurfaceM2:
        body.landSurfaceM2 == null || body.landSurfaceM2 === "" ? null : Number(body.landSurfaceM2),
      floor:
        body.floor == null || body.floor === "" ? null : Number(body.floor),
      totalFloors:
        body.totalFloors == null || body.totalFloors === "" ? null : Number(body.totalFloors),
      yearBuilt:
        body.yearBuilt == null || body.yearBuilt === "" ? null : Number(body.yearBuilt),
      condition: body.condition || null,
      standing: body.standing || null,
      orientation: body.orientation || null,
      furnished:
        body.furnished == null ? null : Boolean(body.furnished),
      parkingSpaces:
        body.parkingSpaces == null || body.parkingSpaces === "" ? null : Number(body.parkingSpaces),
      landStatus: body.landStatus || null,
      landZoning: body.landZoning || null,
      securityDeposit:
        body.securityDeposit == null || body.securityDeposit === "" ? null : Number(body.securityDeposit),
      monthlyCharges:
        body.monthlyCharges == null || body.monthlyCharges === "" ? null : Number(body.monthlyCharges),
      agencyFeeMonths:
        body.agencyFeeMonths == null || body.agencyFeeMonths === "" ? null : Number(body.agencyFeeMonths),
      ceilingHeight:
        body.ceilingHeight == null || body.ceilingHeight === "" ? null : Number(body.ceilingHeight),
      salons:
        body.salons == null || body.salons === "" ? null : Number(body.salons),
      apartmentSubtype: body.apartmentSubtype || null,
      availability: body.availability || null,

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
