// Seed the SQLite database from the in-memory PROPERTIES array so the public
// site keeps working immediately after the admin panel is wired up. Re-runs
// are idempotent — uses upsert keyed on slug.
import { PrismaClient } from "@prisma/client";
import { PROPERTIES } from "../src/lib/properties";

const prisma = new PrismaClient();

// Approximate Marrakech zone coordinates per slug — used for the public
// page's privacy-zone map circle. These are intentionally area-level (not
// the exact street) so the rendered ~200m circle reads as "around here"
// without leaking the address. Admin can fine-tune in /admin/properties/[id].
const COORDS_BY_SLUG: Record<string, { lat: number; lng: number; radius?: number }> = {
  "riad-jardin-secret":      { lat: 31.6309, lng: -7.9844, radius: 200 }, // Medina
  "riad-medina-rooftop":     { lat: 31.6275, lng: -7.9870, radius: 200 }, // Medina (souks)
  "riad-citrus-courtyard":   { lat: 31.6320, lng: -7.9820, radius: 200 }, // Medina
  "villa-palmeraie-oasis":   { lat: 31.6651, lng: -7.9558, radius: 250 }, // Palmeraie
  "villa-atlas-views":       { lat: 31.5520, lng: -7.9285, radius: 300 }, // Route de l'Ourika
  "villa-bohemian-retreat":  { lat: 31.5430, lng: -8.0210, radius: 300 }, // Sidi Abdallah Ghiat
  "gueliz-modern-loft":      { lat: 31.6396, lng: -8.0086, radius: 200 }, // Gueliz
  "kasbah-style-apartment":  { lat: 31.6190, lng: -7.9881, radius: 200 }, // Kasbah
};

// Marketing-style multilingual titles per slug. The English in PROPERTIES
// becomes the EN title; the FR (and AR) below are the punchy listing-style
// labels surfaced on the public site under the FR locale (default).
const TITLES_BY_SLUG: Record<string, { fr: string; en: string; ar: string }> = {
  "riad-jardin-secret": {
    fr: "Riad au Jardin Secret — Piscine & Cour de Palmiers",
    en: "Hidden Garden Riad with Pool & Palm Courtyard",
    ar: "رياض الحديقة السرية — مسبح وفناء النخيل",
  },
  "villa-palmeraie-oasis": {
    fr: "Villa Palmeraie — Piscine Chauffée & Jardin Privé",
    en: "Palmeraie Villa with Heated Pool & Private Garden",
    ar: "فيلا النخيل — مسبح مُسخّن وحديقة خاصة",
  },
  "gueliz-modern-loft": {
    fr: "Loft Design à Gueliz — À 8 min de Majorelle",
    en: "Designer Loft in Gueliz — 8 min from Majorelle",
    ar: "لوفت تصميم في جليز — 8 دقائق من ماجوريل",
  },
  "riad-medina-rooftop": {
    fr: "Riad Médina — Rooftop Panoramique & Suites Ensuite",
    en: "Medina Riad with Panoramic Rooftop & Ensuite Suites",
    ar: "رياض المدينة — سطح بانورامي وأجنحة كاملة",
  },
  "villa-atlas-views": {
    fr: "Villa Vue Atlas — Piscine à Débordement & Tennis",
    en: "Atlas-View Villa with Infinity Pool & Tennis Court",
    ar: "فيلا بإطلالة أطلس — مسبح لا متناهٍ وملعب تنس",
  },
  "kasbah-style-apartment": {
    fr: "Appartement Kasbah — Terrasse Privée près du Palais Royal",
    en: "Kasbah-Style Apartment with Private Terrace near Royal Palace",
    ar: "شقة كازابة — تراس خاص قرب القصر الملكي",
  },
  "riad-citrus-courtyard": {
    fr: "Riad Cour aux Orangers — Petit-déjeuner Inclus",
    en: "Citrus-Courtyard Riad with Daily Breakfast",
    ar: "رياض فناء البرتقال — مع الإفطار اليومي",
  },
  "villa-bohemian-retreat": {
    fr: "Villa Bohème — Hammam Privé & Piscine d'Eau Salée",
    en: "Bohemian Villa Retreat with Hammam & Salt-Water Pool",
    ar: "فيلا بوهيمية — حمام خاص ومسبح بمياه مالحة",
  },
};

async function main() {
  // Settings — single row, id = 1
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  console.log("✓ settings ready");

  for (const p of PROPERTIES) {
    const existing = await prisma.property.findUnique({ where: { slug: p.slug } });
    const t = TITLES_BY_SLUG[p.slug];
    const coords = COORDS_BY_SLUG[p.slug];

    const data = {
      slug: p.slug,
      type: p.type,
      area: p.area,
      city: p.city,
      rating: p.rating,
      reviewCount: p.reviewCount,
      guests: p.guests,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      pricePerNight: p.pricePerNight,
      currency: p.currency,
      // Marketing-style FR title (primary) + EN + AR. Falls back to the
      // legacy English title if the slug isn't in the override map yet.
      titleFr: t?.fr ?? p.title,
      titleEn: t?.en ?? p.title,
      titleAr: t?.ar ?? null,
      shortDescriptionFr: p.shortDescription,
      shortDescriptionEn: p.shortDescription,
      descriptionFr: p.description,
      descriptionEn: p.description,
      amenitiesJson: JSON.stringify(p.amenities),
      highlightsJson: JSON.stringify(p.highlights),
      hostName: p.host.name,
      hostYears: p.host.yearsHosting,
      published: true,
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
      locationRadius: coords?.radius ?? 200,
    };

    if (existing) {
      await prisma.property.update({
        where: { slug: p.slug },
        data,
      });
      // Wipe + replace images so the seed is deterministic.
      await prisma.propertyImage.deleteMany({ where: { propertyId: existing.id } });
      await prisma.propertyImage.createMany({
        data: p.images.map((img, i) => ({
          propertyId: existing.id,
          src: img.src,
          alt: img.alt,
          position: i,
        })),
      });
    } else {
      await prisma.property.create({
        data: {
          ...data,
          images: {
            create: p.images.map((img, i) => ({
              src: img.src,
              alt: img.alt,
              position: i,
            })),
          },
        },
      });
    }
    console.log(`✓ ${p.slug}`);
  }

  console.log(`\n✓ Seeded ${PROPERTIES.length} properties`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
