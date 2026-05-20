// One-shot backfill: populate the new structured real-estate fields on
// existing SALE + RENT_LONG seed rows so the public detail page Specs
// grid + the listing cards have something to render. Idempotent.

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Per-slug overrides. Anything not listed here keeps its current values.
const UPDATES: Record<string, Record<string, unknown>> = {
  // ---- SALE ----
  "villa-palmeraie-contemporaine": {
    landSurfaceM2: 10000, // 1 ha
    yearBuilt: 2021,
    condition: "Bon état",
    standing: "Haut standing",
    orientation: "Sud",
    furnished: false,
    parkingSpaces: 4,
    salons: 2,
    availability: "Immédiate",
  },
  "riad-medina-restaure": {
    landSurfaceM2: 320,
    yearBuilt: 1890,
    condition: "Bon état",
    standing: "Haut standing",
    furnished: false,
    parkingSpaces: 0,
    salons: 1,
    landStatus: "Titré",
    availability: "Immédiate",
  },
  "appartement-gueliz-standing": {
    floor: 6,
    totalFloors: 7,
    yearBuilt: 2019,
    condition: "Bon état",
    standing: "Haut standing",
    orientation: "Sud",
    furnished: false,
    parkingSpaces: 1,
    salons: 1,
    apartmentSubtype: "Standard",
    availability: "Immédiate",
  },
  "villa-piscine-hivernage": {
    landSurfaceM2: 1200,
    yearBuilt: 2015,
    condition: "Bon état",
    standing: "Haut standing",
    furnished: false,
    parkingSpaces: 3,
    salons: 2,
    availability: "Immédiate",
  },
  "terrain-targa": {
    surfaceM2: null, // surface terrain is the canonical for terrain
    landSurfaceM2: 1400,
    landStatus: "Titré",
    landZoning: "Lot de villa",
    availability: "Immédiate",
  },
  "domaine-equestre-amizmiz": {
    landSurfaceM2: 30000, // 3 ha
    yearBuilt: 2014,
    condition: "Bon état",
    standing: "Haut standing",
    furnished: false,
    parkingSpaces: 6,
    salons: 2,
    availability: "Immédiate",
  },
  "bureau-gueliz-prestige": {
    floor: 5,
    totalFloors: 7,
    yearBuilt: 2020,
    condition: "Bon état",
    parkingSpaces: 2,
    ceilingHeight: 3.0,
    availability: "Immédiate",
  },
  "magasin-gueliz-mohamed-v": {
    floor: 0, // rez-de-chaussée
    yearBuilt: 2005,
    condition: "Bon état",
    ceilingHeight: 3.5,
    availability: "Immédiate",
  },
  "plateau-bureaux-route-fes": {
    floor: 2,
    yearBuilt: 2024,
    condition: "Neuf",
    parkingSpaces: 8,
    ceilingHeight: 3.2,
    availability: "Immédiate",
  },

  // ---- RENT_LONG ----
  "loc-villa-palmeraie": {
    landSurfaceM2: 1800,
    yearBuilt: 2018,
    condition: "Bon état",
    standing: "Haut standing",
    furnished: true,
    parkingSpaces: 3,
    salons: 2,
    securityDeposit: 2,
    agencyFeeMonths: 1,
    monthlyCharges: 1500,
    availability: "Immédiate",
  },
  "loc-appartement-gueliz": {
    floor: 4,
    totalFloors: 6,
    yearBuilt: 2017,
    condition: "Bon état",
    standing: "Standing moyen",
    furnished: true,
    parkingSpaces: 1,
    salons: 1,
    apartmentSubtype: "Standard",
    securityDeposit: 2,
    agencyFeeMonths: 1,
    monthlyCharges: 400,
    availability: "Immédiate",
  },
  "loc-riad-medina": {
    landSurfaceM2: 240,
    yearBuilt: 1920,
    condition: "Bon état",
    furnished: true,
    parkingSpaces: 0,
    salons: 1,
    securityDeposit: 2,
    agencyFeeMonths: 1,
    landStatus: "Titré",
    availability: "Immédiate",
  },
};

async function main() {
  let updated = 0;
  for (const [slug, data] of Object.entries(UPDATES)) {
    const r = await prisma.property.updateMany({ where: { slug }, data });
    if (r.count > 0) {
      updated++;
      console.log(`  ${r.count} row(s) updated for ${slug}`);
    } else {
      console.log(`  (no row found for ${slug})`);
    }
  }
  console.log(`\nDone. ${updated} properties backfilled.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
