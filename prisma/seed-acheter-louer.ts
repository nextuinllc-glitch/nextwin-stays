// Seed SALE + RENT_LONG properties alongside the existing SHORT_STAY catalogue.
// Idempotent: re-running upserts on slug.
//
// All user-visible strings (titleFr, descriptionFr, area) avoid em-dashes
// per CLAUDE.md. Use hyphen-minus with spaces (` - `), commas, or colons.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Seed = {
  slug: string;
  kind: "SALE" | "RENT_LONG";
  type: "villa" | "riad" | "apartment" | "terrain" | "commercial";
  area: string;
  rating: number;
  reviewCount: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  surfaceM2: number;
  // For SALE rows: salePrice in MAD. For RENT_LONG rows: monthlyRent in MAD.
  // Currency is always MAD for sale/long-term Moroccan real-estate.
  price: number;
  titleFr: string;
  shortFr: string;
  descriptionFr: string;
  amenities: string[];
  highlights: string[];
  images: string[];
};

// Marrakech sample data. Mix of villas, riads, apartments, terrain, commercial.
const ROWS: Seed[] = [
  // -------------------- ACHETER --------------------
  {
    slug: "villa-palmeraie-contemporaine",
    kind: "SALE",
    type: "villa",
    area: "Palmeraie",
    rating: 4.9,
    reviewCount: 0,
    guests: 10,
    bedrooms: 5,
    bathrooms: 6,
    surfaceM2: 720,
    price: 18_500_000,
    titleFr: "Villa contemporaine, Palmeraie",
    shortFr: "Villa d'architecte de 720 m² sur un parc paysager d'un hectare.",
    descriptionFr:
      "Au cœur de la Palmeraie, cette villa contemporaine signée par un architecte reconnu déploie 720 m² habitables sur un parc paysager d'un hectare. Les espaces de réception ouvrent sur la piscine à débordement et l'oliveraie centenaire.\n\nL'étage abrite cinq suites parentales, dont une chambre principale avec dressing dédié et terrasse privative. Sous-sol : hammam, salle de sport, cellier à vins.",
    amenities: ["Piscine chauffée", "Hammam", "Salle de sport", "Climatisation", "Jardin", "Parking sécurisé"],
    highlights: ["Architecte reconnu", "Oliveraie centenaire", "Suites parentales"],
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85",
    ],
  },
  {
    slug: "riad-medina-restaure",
    kind: "SALE",
    type: "riad",
    area: "Médina",
    rating: 4.8,
    reviewCount: 0,
    guests: 8,
    bedrooms: 4,
    bathrooms: 4,
    surfaceM2: 280,
    price: 6_900_000,
    titleFr: "Riad d'auteur restauré, Médina",
    shortFr: "Demeure du XIXe siècle, patio à oranger et terrasse vue Koutoubia.",
    descriptionFr:
      "Niché dans une derb paisible de la Médina, ce riad du XIXe siècle a été entièrement restauré dans les règles de l'art : zelliges, tadelakt, cèdre sculpté. Le patio central, ombragé par un oranger, donne le ton d'une demeure raffinée.\n\nQuatre chambres en suite réparties sur deux étages. Terrasse panoramique avec vue sur la Koutoubia. Idéal pour une résidence secondaire ou un projet d'hôtellerie de charme.",
    amenities: ["Patio à oranger", "Tadelakt", "Zelliges", "Terrasse vue Koutoubia", "Climatisation"],
    highlights: ["XIXe siècle restauré", "Vue Koutoubia", "Cèdre sculpté"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85",
    ],
  },
  {
    slug: "appartement-gueliz-standing",
    kind: "SALE",
    type: "apartment",
    area: "Guéliz",
    rating: 4.85,
    reviewCount: 0,
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    surfaceM2: 165,
    price: 3_250_000,
    titleFr: "Appartement de standing, Guéliz",
    shortFr: "165 m² au 6e étage avec terrasse vue Atlas, finitions Bulthaup.",
    descriptionFr:
      "Dans une résidence sécurisée du nouveau Guéliz, appartement de 165 m² au 6e étage, doté d'une terrasse plein sud avec vue sur l'Atlas. Finitions soignées : parquet massif, cuisine équipée Bulthaup, salle de bain en marbre.\n\nTrois chambres dont une suite parentale. Place de parking et cave incluses. Piscine commune et conciergerie.",
    amenities: ["Terrasse vue Atlas", "Cuisine Bulthaup", "Parking", "Piscine commune", "Conciergerie"],
    highlights: ["6e étage", "Vue Atlas", "Résidence sécurisée"],
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85",
    ],
  },
  {
    slug: "villa-piscine-hivernage",
    kind: "SALE",
    type: "villa",
    area: "Hivernage",
    rating: 4.88,
    reviewCount: 0,
    guests: 8,
    bedrooms: 4,
    bathrooms: 5,
    surfaceM2: 540,
    price: 12_400_000,
    titleFr: "Villa avec piscine, Hivernage",
    shortFr: "540 m² sur terrain arboré de 1 200 m², piscine chauffée.",
    descriptionFr:
      "À deux pas des palaces de l'Hivernage, villa élégante de 540 m² sur un terrain arboré de 1 200 m². Plain-pied lumineux avec doubles séjours, cuisine ouverte sur la terrasse et patio intérieur.\n\nQuatre chambres en suite à l'étage, piscine chauffée, dépendance pour le personnel.",
    amenities: ["Piscine chauffée", "Doubles séjours", "Patio", "Dépendance personnel"],
    highlights: ["Hivernage", "Terrain de 1 200 m²", "Plain-pied"],
    images: [
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=2000&q=85",
    ],
  },
  {
    slug: "terrain-targa",
    kind: "SALE",
    type: "terrain",
    area: "Targa",
    rating: 4.7,
    reviewCount: 0,
    guests: 0,
    bedrooms: 0,
    bathrooms: 0,
    surfaceM2: 1_400,
    price: 2_800_000,
    titleFr: "Terrain constructible, Targa",
    shortFr: "Terrain plat de 1 400 m², titré et viabilisé, R+1 + piscine.",
    descriptionFr:
      "Beau terrain plat de 1 400 m² au cœur du quartier résidentiel de Targa, dans une rue calme bordée de villas. Titré, viabilisé, prêt à construire.\n\nCahier des charges autorisant villa R+1 avec piscine. Une opportunité rare dans un secteur en forte demande.",
    amenities: ["Titré", "Viabilisé", "Plat"],
    highlights: ["1 400 m²", "Rue calme", "R+1 + piscine autorisé"],
    images: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=2000&q=85",
    ],
  },
  {
    slug: "domaine-equestre-amizmiz",
    kind: "SALE",
    type: "villa",
    area: "Route d'Amizmiz",
    rating: 4.95,
    reviewCount: 0,
    guests: 12,
    bedrooms: 6,
    bathrooms: 7,
    surfaceM2: 950,
    price: 24_000_000,
    titleFr: "Domaine équestre, Route d'Amizmiz",
    shortFr: "Domaine de 3 hectares, écuries, maison d'amis, autonomie totale.",
    descriptionFr:
      "À 25 minutes du centre, domaine d'exception sur 3 hectares. Villa principale de 950 m², maison d'amis indépendante, écuries pour 8 chevaux, carrière et paddocks.\n\nVerger, oliveraie en production, piscine 20 m, hammam, salle de cinéma. Domaine entièrement autonome : forage, panneaux solaires, générateur.",
    amenities: ["Écuries", "Maison d'amis", "Piscine 20 m", "Hammam", "Salle de cinéma", "Forage", "Panneaux solaires"],
    highlights: ["3 hectares", "Domaine autonome", "Maison d'amis indépendante"],
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=2000&q=85",
    ],
  },

  // -------------------- LOUER (long-term) --------------------
  {
    slug: "loc-villa-palmeraie",
    kind: "RENT_LONG",
    type: "villa",
    area: "Palmeraie",
    rating: 4.85,
    reviewCount: 0,
    guests: 8,
    bedrooms: 4,
    bathrooms: 4,
    surfaceM2: 420,
    price: 45_000,
    titleFr: "Location villa, Palmeraie",
    shortFr: "Villa meublée 4 chambres, piscine, jardin, bail 12 mois.",
    descriptionFr:
      "Villa moderne entièrement meublée disponible en location longue durée dans la Palmeraie. Quatre chambres, double séjour, cuisine équipée, piscine privée, jardin paysager.\n\nIdéal pour résidents internationaux : ménage hebdomadaire inclus, conciergerie sur demande. Bail minimum 12 mois.",
    amenities: ["Meublée", "Piscine privée", "Jardin", "Ménage inclus", "Climatisation", "Wifi fibré"],
    highlights: ["Bail 12 mois", "Ménage inclus", "Meublée premium"],
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=85",
    ],
  },
  {
    slug: "loc-appartement-gueliz",
    kind: "RENT_LONG",
    type: "apartment",
    area: "Guéliz",
    rating: 4.8,
    reviewCount: 0,
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    surfaceM2: 120,
    price: 14_000,
    titleFr: "Appartement meublé, Guéliz",
    shortFr: "2 chambres, terrasse, résidence sécurisée, prêt à habiter.",
    descriptionFr:
      "Appartement meublé de 120 m² avec terrasse en plein cœur du Guéliz. Résidence sécurisée avec gardien 24/7, piscine commune et parking. Décoration soignée, cuisine équipée, lave-linge.\n\nBail minimum 6 mois renouvelable. Idéal expatrié ou cadre en mission.",
    amenities: ["Meublé", "Terrasse", "Parking", "Piscine commune", "Gardien 24/7", "Wifi"],
    highlights: ["Cœur de Guéliz", "Résidence sécurisée", "Bail flexible 6 mois"],
    images: [
      "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=2000&q=85",
    ],
  },
  {
    slug: "loc-riad-medina",
    kind: "RENT_LONG",
    type: "riad",
    area: "Médina",
    rating: 4.9,
    reviewCount: 0,
    guests: 6,
    bedrooms: 3,
    bathrooms: 3,
    surfaceM2: 220,
    price: 22_000,
    titleFr: "Riad à louer, Médina",
    shortFr: "Riad restauré 3 chambres, patio et terrasse, bail annuel.",
    descriptionFr:
      "Riad de caractère entièrement restauré disponible en location annuelle. Patio central à fontaine, trois chambres en suite, salon traditionnel, terrasse panoramique avec coin détente.\n\nÉquipé pour une vie quotidienne confortable : chauffage central, cuisine moderne dissimulée derrière les boiseries, wifi fibré.",
    amenities: ["Patio à fontaine", "Terrasse panoramique", "Chauffage central", "Cuisine moderne", "Wifi fibré"],
    highlights: ["Authentique", "Bail annuel", "Cœur de la Médina"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=2000&q=85",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85",
    ],
  },
];

async function main() {
  console.log(`Seeding ${ROWS.length} sale + long-term-rental properties...`);

  for (const row of ROWS) {
    const data = {
      slug: row.slug,
      type: row.type,
      area: row.area,
      city: "Marrakech",
      rating: row.rating,
      reviewCount: row.reviewCount,
      guests: row.guests,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
      listingKind: row.kind,
      // Only one of these is meaningful per row - the others stay null/0.
      pricePerNight: 0,
      monthlyRent: row.kind === "RENT_LONG" ? row.price : null,
      salePrice: row.kind === "SALE" ? row.price : null,
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

    // Replace images on every run so re-seeding refreshes them.
    await prisma.propertyImage.deleteMany({ where: { propertyId: created.id } });
    await prisma.propertyImage.createMany({
      data: row.images.map((src, i) => ({
        propertyId: created.id,
        src,
        alt: `${row.titleFr}, photo ${i + 1}`,
        position: i,
      })),
    });

    console.log(`  ${row.kind.padEnd(10)} - ${row.slug}`);
  }

  console.log(`\nDone. ${ROWS.length} listings seeded.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Seed error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
