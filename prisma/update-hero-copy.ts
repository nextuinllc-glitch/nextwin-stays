// One-shot script: refresh the Settings row so the hero dateline + subtitle
// reflect the broadened brand (achat + location + court séjour), not the
// stay-only origin. Idempotent - safe to re-run.

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Per-locale dateline (the small tracked label that floats under the
  // "Nextwin · Immobilier" wordmark in the hero).
  const heroTaglineFr = "Marrakech, à chaque étape";
  const heroTaglineEn = "Marrakech, every step of the way";
  const heroTaglineAr = "مراكش، في كل مراحل مشروعك";

  // Per-locale hero subtitle (the short sentence below the dateline).
  const heroSubtitleFr = "Acheter, louer ou séjourner. Un seul interlocuteur.";
  const heroSubtitleEn = "Buy, rent or stay. One single contact.";
  const heroSubtitleAr = "للبيع، للإيجار، أو للإقامة. محاور واحد.";

  const result = await prisma.settings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      heroTaglineFr, heroTaglineEn, heroTaglineAr,
      heroSubtitleFr, heroSubtitleEn, heroSubtitleAr,
    },
    update: {
      heroTaglineFr, heroTaglineEn, heroTaglineAr,
      heroSubtitleFr, heroSubtitleEn, heroSubtitleAr,
    },
  });
  console.log("Hero copy refreshed:", {
    taglineFr: result.heroTaglineFr,
    subtitleFr: result.heroSubtitleFr,
  });
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
