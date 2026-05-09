import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PropertyEditor } from "@/components/admin/PropertyEditor";

export const dynamic = "force-dynamic";

export default async function PropertyEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (id === "new") {
    return <PropertyEditor mode="create" />;
  }

  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } } },
  });
  if (!property) notFound();

  return (
    <PropertyEditor
      mode="edit"
      initial={{
        id: property.id,
        slug: property.slug,
        type: property.type,
        area: property.area,
        city: property.city,
        rating: property.rating,
        reviewCount: property.reviewCount,
        guests: property.guests,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        pricePerNight: property.pricePerNight,
        currency: property.currency,
        titleFr: property.titleFr,
        titleEn: property.titleEn ?? "",
        titleAr: property.titleAr ?? "",
        shortDescriptionFr: property.shortDescriptionFr ?? "",
        shortDescriptionEn: property.shortDescriptionEn ?? "",
        shortDescriptionAr: property.shortDescriptionAr ?? "",
        descriptionFr: property.descriptionFr ?? "",
        descriptionEn: property.descriptionEn ?? "",
        descriptionAr: property.descriptionAr ?? "",
        amenities: JSON.parse(property.amenitiesJson || "[]") as string[],
        highlights: JSON.parse(property.highlightsJson || "[]") as string[],
        hostName: property.hostName,
        hostYears: property.hostYears,
        published: property.published,
        images: property.images.map((i) => ({ id: i.id, src: i.src, alt: i.alt, position: i.position })),
        latitude: property.latitude ?? null,
        longitude: property.longitude ?? null,
        locationRadius: property.locationRadius ?? 200,
        ruleCheckIn: property.ruleCheckIn ?? "À partir de 15h00",
        ruleCheckOut: property.ruleCheckOut ?? "Avant 11h00",
        rulePets: property.rulePets ?? "Sur demande",
        ruleSmoking: property.ruleSmoking ?? "Interdit à l'intérieur",
        ruleAdditional: property.ruleAdditional ?? "",
      }}
    />
  );
}
