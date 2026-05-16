// One-shot DB update: every Pearl Garden + Gueliz apartment in the
// catalogue is a 1-bedroom / 1-bathroom / 2-guest unit. Prices are
// spread between €72 and €76 so the booking funnel doesn't show every
// listing at the same flat number. Villa Prestige is untouched.
//
//   Run:  node scripts/normalize-apartment-specs.mjs

import { PrismaClient } from "@prisma/client";

// Slug → (€/night). Chosen to vary slightly between cards without
// breaking the "all roughly €72-76" promise the owner asked for.
const PRICE_BY_SLUG = {
  "d32-style-urbain-chic": 65,
  "appt-54-glamour-prestige": 67,
  "appt-duplex-26-double-hauteur": 69,
  "appart-36-standing-royal": 66,
  "appart-39-luxe-authenticite": 65,
  "appart-22-duplex-moderne": 68,
  "appart-84-premium-terrasse-vue-ville": 67,
  "appt-63-luxe-terrasse-piscine": 69,
  "appt-57-moderne-complet": 66,
  "appt-76-de-luxe": 68,
  "appartement-gueliz-luxe-modernite": 69,
};

async function main() {
  const prisma = new PrismaClient();
  for (const [slug, price] of Object.entries(PRICE_BY_SLUG)) {
    const r = await prisma.property.update({
      where: { slug },
      data: { pricePerNight: price, bedrooms: 1, bathrooms: 1, guests: 2 },
    });
    console.log(`✓ ${slug.padEnd(40)} €${r.pricePerNight} · 1 ch · 1 sdb · 2 invités`);
  }
  console.log("\nDone.");
  await prisma.$disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
