// Seed sample bureau, magasin, and plateau listings under SALE so the
// new property-type filter pills (Bureau / Magasin / Plateau) have
// at least one card each. Idempotent: upsert by slug.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Row = {
  slug: string;
  type: "bureau" | "magasin" | "plateau";
  area: string;
  bedrooms: number;
  bathrooms: number;
  surfaceM2: number;
  salePrice: number;
  titleFr: string;
  shortFr: string;
  descriptionFr: string;
  amenities: string[];
  highlights: string[];
  images: string[];
};

const ROWS: Row[] = [
  {
    slug: "bureau-gueliz-prestige",
    type: "bureau",
    area: "Guéliz",
    bedrooms: 0,
    bathrooms: 2,
    surfaceM2: 180,
    salePrice: 4_200_000,
    titleFr: "Bureau de prestige, Guéliz",
    shortFr: "Plateau de bureau 180 m² au coeur du nouveau Guéliz, vue Atlas.",
    descriptionFr:
      "Bureau d'exception au 5e étage d'un immeuble récent du nouveau Guéliz. 180 m² lumineux, climatisation centralisée, salle de réunion, kitchenette équipée, deux blocs sanitaires.\n\nIdéal cabinet, agence ou direction régionale. Deux places de parking en sous-sol incluses. Réception et gardien 24/7.",
    amenities: [
      "Climatisation centralisée",
      "Salle de réunion",
      "Kitchenette",
      "Parking",
      "Gardien 24/7",
      "Fibre optique",
    ],
    highlights: ["Vue Atlas", "Cœur du nouveau Guéliz", "Immeuble récent"],
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=2000&q=85",
    ],
  },
  {
    slug: "magasin-gueliz-mohamed-v",
    type: "magasin",
    area: "Guéliz",
    bedrooms: 0,
    bathrooms: 1,
    surfaceM2: 140,
    salePrice: 4_900_000,
    titleFr: "Magasin d'angle, avenue Mohammed V",
    shortFr: "Pas-de-porte d'angle 140 m² avec mezzanine, double vitrine.",
    descriptionFr:
      "Pas-de-porte d'angle exceptionnel sur l'avenue Mohammed V, l'artère la plus passante de Guéliz. 140 m² de surface utile, mezzanine de 40 m², double vitrine sur deux rues.\n\nIdéal concept-store, galerie ou restauration de standing. Murs en vente, possibilité d'acquérir également le fonds de commerce existant. Bail commercial en cours.",
    amenities: ["Double vitrine", "Mezzanine 40 m²", "Climatisation", "Sanitaires"],
    highlights: ["Angle, double vitrine", "Avenue Mohammed V", "Mezzanine"],
    images: [
      "https://images.unsplash.com/photo-1481253127861-534b8edc270d?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?auto=format&fit=crop&w=2000&q=85",
    ],
  },
  {
    slug: "plateau-bureaux-route-fes",
    type: "plateau",
    area: "Route de Fès",
    bedrooms: 0,
    bathrooms: 4,
    surfaceM2: 420,
    salePrice: 7_800_000,
    titleFr: "Plateau de bureaux 420 m², Route de Fès",
    shortFr: "Plateau brut 420 m² livré aménageable, R+2 dans immeuble neuf.",
    descriptionFr:
      "Plateau de bureaux de 420 m² au 2e étage d'un immeuble tertiaire neuf sur la Route de Fès. Livré brut, prêt à aménager selon le cahier des charges du preneur. Hauteur sous plafond 3,20 m, façade vitrée, ascenseur.\n\nQuatre blocs sanitaires, accès handicapés, parking sous-sol pour 8 véhicules. Idéal grande équipe, plateforme de coworking ou backoffice.",
    amenities: [
      "Façade vitrée",
      "Hauteur 3,20 m",
      "Ascenseur",
      "Accès handicapés",
      "Parking sous-sol",
      "Fibre optique",
    ],
    highlights: ["420 m² livré brut", "Immeuble neuf", "Parking 8 véhicules"],
    images: [
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=2000&q=85",
    ],
  },
];

async function main() {
  console.log(`Seeding ${ROWS.length} commercial sale listings (bureau / magasin / plateau)...`);

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
      listingKind: "SALE",
      pricePerNight: 0,
      monthlyRent: null,
      salePrice: row.salePrice,
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

  console.log(`\nDone.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Seed error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
