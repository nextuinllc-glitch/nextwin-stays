// SEO-rewrite of the 12 imported catalog titles. Old titles used "Appt 54",
// "Appart 36" etc. — fine inside WhatsApp where the audience already knows
// the brand, but bad for Google. Rewriting to full French keywords:
//
//   "Appt 54 — Glamour …"          →  "Studio 54 Marrakech — Vue Piscine …"
//   "Appart Duplex 26 — …"          →  "Appartement Duplex 26 Marrakech — …"
//   "Villa Prestige — Route Agadir" →  "Villa Prestige Marrakech — Route Agadir, 4 Chambres…"
//
// Every title now starts with a high-volume search keyword (Studio /
// Appartement / Duplex / Villa) and includes "Marrakech" for local SEO.
// Slugs are intentionally NOT changed — they were just created and the
// public URL stays the same as what's already indexed in the sitemap.
//
// Run:  npx tsx prisma/scripts/update-catalog-seo-titles.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Map of slug → new SEO-optimised FR title (≤60 chars where possible —
// Google truncates around there). Each title follows the pattern:
//   [Type Keyword] [Identifier] [Marrakech] — [Strong Differentiator]
const UPDATES: Record<string, string> = {
  "appt-54-glamour-prestige-grande-terrasse-vue-piscine":
    "Studio 54 Marrakech — Vue Piscine & Terrasse Glamour",
  "appt-d32-style-urbain-chic-vue-piscine-jardins":
    "Studio D32 Marrakech — Design Urbain Vue Piscine",
  "appart-36-standing-royal-vue-piscine-jardins":
    "Studio 36 Marrakech — Standing Royal Vue Piscine",
  "appt-duplex-26-double-hauteur-patio-prive":
    "Appartement Duplex 26 Marrakech — Double Hauteur & Patio Privé",
  "appart-22-duplex-moderne-cosy":
    "Appartement Duplex 22 Marrakech — Moderne & Cosy",
  "villa-prestige-route-agadir-4-chambres-piscine-chauffee":
    "Villa Prestige Marrakech — 4 Chambres, Piscine Chauffée (Route Agadir)",
  "appart-39-luxe-authenticite-piscine-parking-sous-sol":
    "Appartement 39 Marrakech — Luxe Authentique & Piscine",
  "appart-84-premium-avec-terrasse-vue-ville":
    "Appartement 84 Marrakech — Premium Terrasse Vue Ville",
  "appt-63-appartement-luxe-avec-terrasse-piscine":
    "Appartement 63 Marrakech — Luxe avec Terrasse & Piscine",
  "appt-57-appartement-moderne-complet-marrakech":
    "Appartement 57 Marrakech — Moderne & Entièrement Équipé",
  "appartement-gueliz-luxe-modernite-en-plein-c-ur-de-marrakech":
    "Appartement Gueliz Marrakech — Luxe & Modernité au Cœur Ville",
  "appt-76-appartement-de-luxe-au-c-ur-de-la-perle":
    "Appartement 76 Marrakech — Luxe au Cœur de la Perle",
};

// Short description = first sentence of description, capped at 140 chars,
// re-prefixed with the new title flavour so it reads as a marketing line
// rather than a body excerpt. Falls back to a generic line.
function buildShortDesc(title: string, description: string | null) {
  if (!description) return `${title.split("—")[0].trim()} à Marrakech.`;
  const firstSentence = description.split(/(?<=[.!?])\s+/)[0] || description;
  return firstSentence.length > 140
    ? firstSentence.slice(0, 137).trim() + "…"
    : firstSentence.trim();
}

async function main() {
  let updated = 0;
  let skipped = 0;
  for (const [slug, newTitle] of Object.entries(UPDATES)) {
    const existing = await prisma.property.findUnique({ where: { slug } });
    if (!existing) {
      console.log(`✗ ${slug} — not found, skipping`);
      skipped++;
      continue;
    }
    await prisma.property.update({
      where: { slug },
      data: {
        titleFr: newTitle,
        // Refresh the short description too so the meta description on
        // the property page stays in sync with the new title's flavour.
        shortDescriptionFr: buildShortDesc(newTitle, existing.descriptionFr),
      },
    });
    console.log(`✓ ${slug}`);
    console.log(`  → ${newTitle}`);
    updated++;
  }
  console.log(`\n✓ ${updated} titles updated, ${skipped} skipped.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
