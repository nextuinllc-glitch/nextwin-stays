// Seed RENT_LONG bureau + magasin so the Louer filter pills show those
// categories with at least one card each. Idempotent (upsert on slug).

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type Row = {
  slug: string;
  type: "bureau" | "magasin";
  area: string;
  bedrooms: number;
  bathrooms: number;
  surfaceM2: number;
  monthlyRent: number;
  floor: number | null;
  ceilingHeight: number | null;
  yearBuilt: number;
  condition: string;
  parkingSpaces: number;
  securityDeposit: number; // months
  agencyFeeMonths: number;
  monthlyCharges: number | null;
  furnished: boolean;
  titleFr: string;
  shortFr: string;
  descriptionFr: string;
  amenities: string[];
  highlights: string[];
  images: string[];
};

const ROWS: Row[] = [
  {
    slug: "loc-bureau-gueliz",
    type: "bureau",
    area: "Guéliz",
    bedrooms: 0,
    bathrooms: 2,
    surfaceM2: 140,
    monthlyRent: 18000,
    floor: 4,
    ceilingHeight: 2.9,
    yearBuilt: 2019,
    condition: "Bon état",
    parkingSpaces: 1,
    securityDeposit: 3,
    agencyFeeMonths: 1,
    monthlyCharges: 600,
    furnished: false,
    titleFr: "Bureau aménagé à louer, Guéliz",
    shortFr: "Plateau 140 m² au 4e étage, climatisé, fibre, prêt à occuper.",
    descriptionFr:
      "Bureau livré aménagé au 4e étage d'un immeuble tertiaire récent du nouveau Guéliz. 140 m² distribués en trois espaces ouverts, une salle de réunion fermée, kitchenette et deux blocs sanitaires.\n\nClimatisation centralisée, fibre optique, gardien 24/7, ascenseur, place de parking en sous-sol. Bail commercial 3-6-9 standard. Caution 3 mois, frais d'agence 1 mois.",
    amenities: [
      "Climatisation centralisée",
      "Salle de réunion",
      "Kitchenette",
      "Fibre optique",
      "Ascenseur",
      "Parking sous-sol",
      "Gardien 24/7",
    ],
    highlights: ["Livré aménagé", "Bail 3-6-9", "Au cœur de Guéliz"],
    images: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=2000&q=85",
    ],
  },
  {
    slug: "loc-magasin-mohamed-v",
    type: "magasin",
    area: "Guéliz",
    bedrooms: 0,
    bathrooms: 1,
    surfaceM2: 95,
    monthlyRent: 22000,
    floor: 0,
    ceilingHeight: 3.6,
    yearBuilt: 2008,
    condition: "Bon état",
    parkingSpaces: 0,
    securityDeposit: 6,
    agencyFeeMonths: 1,
    monthlyCharges: null,
    furnished: false,
    titleFr: "Magasin à louer, avenue Mohammed V",
    shortFr: "Pas-de-porte 95 m² sur axe passant, simple vitrine, idéal concept-store.",
    descriptionFr:
      "Local commercial 95 m² au rez-de-chaussée sur l'avenue Mohammed V, l'artère commerciale la plus animée de Guéliz. Simple vitrine large, RdC unique, sanitaires, climatisation.\n\nIdéal pour concept-store, prêt-à-porter haut de gamme, salon de thé ou agence. Bail commercial. Caution 6 mois, frais d'agence 1 mois. Pas-de-porte négociable séparément.",
    amenities: [
      "Vitrine sur Mohammed V",
      "Climatisation",
      "Sanitaires",
      "Hauteur 3,6 m",
    ],
    highlights: ["Emplacement N°1 Guéliz", "Forte visibilité piétonne"],
    images: [
      "https://images.unsplash.com/photo-1481253127861-534b8edc270d?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=2000&q=85",
    ],
  },
];

async function main() {
  console.log(`Seeding ${ROWS.length} RENT_LONG bureau + magasin listings...`);
  for (const row of ROWS) {
    const data = {
      slug: row.slug,
      type: row.type,
      area: row.area,
      city: "Marrakech",
      rating: 4.7,
      reviewCount: 0,
      guests: 0,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      listingKind: "RENT_LONG",
      pricePerNight: 0,
      monthlyRent: row.monthlyRent,
      salePrice: null,
      surfaceM2: row.surfaceM2,
      currency: "MAD",
      titleFr: row.titleFr,
      titleEn: null,
      titleAr: null,
      shortDescriptionFr: row.shortFr,
      shortDescriptionEn: null,
      shortDescriptionAr: null,
      descriptionFr: row.descriptionFr,
      descriptionEn: null,
      descriptionAr: null,
      amenitiesJson: JSON.stringify(row.amenities),
      highlightsJson: JSON.stringify(row.highlights),
      hostName: "Nextwin",
      hostYears: 10,
      published: true,
      floor: row.floor,
      ceilingHeight: row.ceilingHeight,
      yearBuilt: row.yearBuilt,
      condition: row.condition,
      parkingSpaces: row.parkingSpaces,
      securityDeposit: row.securityDeposit,
      agencyFeeMonths: row.agencyFeeMonths,
      monthlyCharges: row.monthlyCharges,
      furnished: row.furnished,
      availability: "Immédiate",
    };

    const created = await prisma.property.upsert({
      where: { slug: row.slug },
      update: data,
      create: data,
    });

    await prisma.propertyImage.deleteMany({ where: { propertyId: created.id } });
    await prisma.propertyImage.createMany({
      data: row.images.map((src, i) => ({
        propertyId: created.id,
        src,
        alt: `${row.titleFr}, photo ${i + 1}`,
        position: i,
      })),
    });

    console.log(`  ${row.type.padEnd(8)} - ${row.slug}`);
  }
  console.log("Done.");
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
