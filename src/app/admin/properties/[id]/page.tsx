import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PropertyEditor } from "@/components/admin/PropertyEditor";

export const dynamic = "force-dynamic";

type ListingKind = "SHORT_STAY" | "RENT_LONG" | "SALE";
const VALID_KINDS: ListingKind[] = ["SHORT_STAY", "RENT_LONG", "SALE"];

export default async function PropertyEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kind?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  if (id === "new") {
    // Preset the listing kind from the query string so the "Nouvelle
    // propriété" buttons under /admin/acheter, /admin/louer, etc. each
    // open the editor in the right mode by default.
    const presetKind: ListingKind = VALID_KINDS.includes(sp.kind as ListingKind)
      ? (sp.kind as ListingKind)
      : "SHORT_STAY";
    return <PropertyEditor mode="create" presetKind={presetKind} />;
  }

  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } } },
  });
  if (!property) notFound();

  // Cast around the in-flight Prisma client types so the new fields read
  // cleanly even before the generated client picks them up.
  const p = property as typeof property & {
    listingKind?: string | null;
    monthlyRent?: number | null;
    salePrice?: number | null;
    surfaceM2?: number | null;
  };

  return (
    <PropertyEditor
      mode="edit"
      initial={{
        id: p.id,
        slug: p.slug,
        type: p.type,
        area: p.area,
        city: p.city,
        rating: p.rating,
        reviewCount: p.reviewCount,
        guests: p.guests,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        listingKind: (p.listingKind ?? "SHORT_STAY") as ListingKind,
        pricePerNight: p.pricePerNight,
        monthlyRent: p.monthlyRent ?? null,
        salePrice: p.salePrice ?? null,
        surfaceM2: p.surfaceM2 ?? null,
        currency: p.currency,
        titleFr: p.titleFr,
        titleEn: p.titleEn ?? "",
        titleAr: p.titleAr ?? "",
        shortDescriptionFr: p.shortDescriptionFr ?? "",
        shortDescriptionEn: p.shortDescriptionEn ?? "",
        shortDescriptionAr: p.shortDescriptionAr ?? "",
        descriptionFr: p.descriptionFr ?? "",
        descriptionEn: p.descriptionEn ?? "",
        descriptionAr: p.descriptionAr ?? "",
        amenities: JSON.parse(p.amenitiesJson || "[]") as string[],
        highlights: JSON.parse(p.highlightsJson || "[]") as string[],
        hostName: p.hostName,
        hostYears: p.hostYears,
        published: p.published,
        images: p.images.map((i) => ({ id: i.id, src: i.src, alt: i.alt, position: i.position })),
        latitude: p.latitude ?? null,
        longitude: p.longitude ?? null,
        locationRadius: p.locationRadius ?? 200,
        ruleCheckIn: p.ruleCheckIn ?? "À partir de 15h00",
        ruleCheckOut: p.ruleCheckOut ?? "Avant 11h00",
        rulePets: p.rulePets ?? "Sur demande",
        ruleSmoking: p.ruleSmoking ?? "Interdit à l'intérieur",
        ruleAdditional: p.ruleAdditional ?? "",
        // Real-estate structured fields - load whatever is set, default null.
        landSurfaceM2:   (p as { landSurfaceM2?:   number | null }).landSurfaceM2   ?? null,
        floor:           (p as { floor?:           number | null }).floor           ?? null,
        totalFloors:     (p as { totalFloors?:     number | null }).totalFloors     ?? null,
        yearBuilt:       (p as { yearBuilt?:       number | null }).yearBuilt       ?? null,
        condition:       (p as { condition?:       string | null }).condition       ?? null,
        standing:        (p as { standing?:        string | null }).standing        ?? null,
        orientation:     (p as { orientation?:     string | null }).orientation     ?? null,
        furnished:       (p as { furnished?:       boolean | null }).furnished      ?? null,
        parkingSpaces:   (p as { parkingSpaces?:   number | null }).parkingSpaces   ?? null,
        landStatus:      (p as { landStatus?:      string | null }).landStatus      ?? null,
        landZoning:      (p as { landZoning?:      string | null }).landZoning      ?? null,
        securityDeposit: (p as { securityDeposit?: number | null }).securityDeposit ?? null,
        monthlyCharges:  (p as { monthlyCharges?:  number | null }).monthlyCharges  ?? null,
        agencyFeeMonths: (p as { agencyFeeMonths?: number | null }).agencyFeeMonths ?? null,
        ceilingHeight:   (p as { ceilingHeight?:   number | null }).ceilingHeight   ?? null,
        salons:           (p as { salons?:           number | null }).salons           ?? null,
        apartmentSubtype: (p as { apartmentSubtype?: string | null }).apartmentSubtype ?? null,
        availability:     (p as { availability?:     string | null }).availability     ?? null,
      }}
    />
  );
}
