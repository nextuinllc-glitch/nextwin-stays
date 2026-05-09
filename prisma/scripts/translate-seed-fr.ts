// One-shot translation pass for the original 8 seed properties whose
// FR description columns were copy-pasted from the English `PROPERTIES`
// array at first seed. The 12 WhatsApp-imported properties already have
// proper French — they're untouched here.
//
// Run:  npx tsx prisma/scripts/translate-seed-fr.ts
//
// Idempotent: re-running rewrites the FR fields with the same strings.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type FR = {
  shortDescriptionFr: string;
  descriptionFr: string;
  // 3-bullet "highlights" list shown in the description modal. Stored
  // in a single `highlightsJson` column today (one global string array,
  // no per-locale variant), so writing French here means EN/AR users
  // also see French until we add a localised highlights structure.
  // The original 8 seed properties currently hold English values —
  // overriding to French is the right call given the audience is FR-
  // first.
  highlightsFr?: string[];
};

const FR_BY_SLUG: Record<string, FR> = {
  "riad-jardin-secret": {
    shortDescriptionFr:
      "Riad de 4 chambres au cœur de la médina, avec piscine et cour aux palmiers.",
    descriptionFr:
      "Un riad authentique caché derrière une porte cloutée à dix minutes à pied de la place Jamaa el-Fna. Cour intérieure pavée de zellige, palmiers, piscine et terrasse rooftop avec vue sur la Koutoubia. Hammam privatif au sous-sol et petit-déjeuner marocain inclus chaque matin. Idéal pour familles ou groupes d'amis qui veulent l'authenticité de la médina sans sacrifier le confort moderne.",
    highlightsFr: [
      "À 10 min à pied de Jamaa el-Fna",
      "Hammam privé au sous-sol",
      "Petit-déjeuner marocain inclus",
    ],
  },
  "riad-medina-rooftop": {
    shortDescriptionFr: "Riad médina avec rooftop panoramique et suites ensuite.",
    descriptionFr:
      "Riad médina entièrement rénové, à deux pas des souks. Trois suites avec salles de bains privatives, salons traditionnels en tadelakt et grand rooftop avec coin lounge, jacuzzi et vue dégagée sur les minarets. Climatisation, Wi-Fi haut débit et conciergerie 24h/24.",
    highlightsFr: [
      "Rooftop panoramique avec jacuzzi",
      "3 suites avec salle de bain privée",
      "Conciergerie disponible 24h/24",
    ],
  },
  "riad-citrus-courtyard": {
    shortDescriptionFr: "Riad cour aux orangers — petit-déjeuner marocain inclus.",
    descriptionFr:
      "Riad familial avec cour intérieure plantée d'orangers et de citronniers. Trois chambres décorées de tapis berbères et lits en fer forgé. Le petit-déjeuner marocain est servi chaque matin sur la terrasse parmi les bougainvilliers. Cinq minutes à pied du Palais Bahia.",
    highlightsFr: [
      "Cour intérieure aux orangers",
      "Petit-déjeuner marocain quotidien",
      "À 5 min à pied du Palais Bahia",
    ],
  },
  "villa-palmeraie-oasis": {
    shortDescriptionFr: "Villa étendue, piscine chauffée, palmiers et chef sur demande.",
    descriptionFr:
      "Villa de cinq chambres entourée de palmiers dattiers, à vingt minutes de la Médina. Piscine chauffée, transats et grand salon extérieur conçu pour les longs déjeuners. Chaque chambre est ensuite avec vue sur jardin ; un chef peut préparer des menus dégustation marocains sur demande.",
    highlightsFr: [
      "5 000 m² de terrain privé",
      "Piscine chauffée toute l'année",
      "Chef et petit-déjeuner en option",
    ],
  },
  "villa-atlas-views": {
    shortDescriptionFr:
      "Villa avec vue Atlas — piscine à débordement et court de tennis.",
    descriptionFr:
      "Villa six chambres sur la route de l'Ourika, avec vue dégagée sur la chaîne de l'Atlas. Piscine à débordement, court de tennis privé et grand jardin avec oliviers centenaires. Idéal pour groupes recherchant tranquillité et activités en plein air, à vingt minutes du centre-ville.",
    highlightsFr: [
      "Vue panoramique sur l'Atlas",
      "Piscine à débordement",
      "Court de tennis privé",
    ],
  },
  "villa-bohemian-retreat": {
    shortDescriptionFr: "Villa bohème — hammam privé et piscine à eau salée.",
    descriptionFr:
      "Villa quatre chambres au design bohème : matelas berbères, tentures kilim, mobilier en cuir patiné. Hammam privé en tadelakt rouge, piscine à eau salée et jardin clos. Atmosphère détendue, idéale pour retraites créatives ou séjours en famille élargie.",
    highlightsFr: [
      "Hammam privé en tadelakt",
      "Piscine à eau salée",
      "Décoration bohème, design unique",
    ],
  },
  "gueliz-modern-loft": {
    shortDescriptionFr:
      "Loft lumineux deux chambres, à deux pas des galeries et de Majorelle.",
    descriptionFr:
      "Loft de deux chambres dans une rue calme de Gueliz, sols en béton ciré, tapis berbères vintage et cuisine ouverte conçue pour les matins lents. Huit minutes à pied du Jardin Majorelle, des meilleures galeries contemporaines de la ville et d'une longue liste de bonnes adresses pour le dîner.",
    highlightsFr: [
      "À 8 min à pied du Jardin Majorelle",
      "Rue résidentielle calme",
      "Rénové par un designer en 2024",
    ],
  },
  "kasbah-style-apartment": {
    shortDescriptionFr: "Appartement kasbah — terrasse privée près du Palais Royal.",
    descriptionFr:
      "Appartement de style kasbah au cœur du quartier historique, à courte distance du Palais Royal. Salon avec banquettes traditionnelles, cuisine équipée et terrasse privée donnant sur les ruelles ocre du quartier. Calme, élégant, parfait pour un séjour culturel.",
    highlightsFr: [
      "Terrasse privée sur la kasbah",
      "À deux pas du Palais Royal",
      "Décoration traditionnelle marocaine",
    ],
  },
};

async function main() {
  let updated = 0;
  for (const [slug, fr] of Object.entries(FR_BY_SLUG)) {
    const existing = await prisma.property.findUnique({ where: { slug } });
    if (!existing) {
      console.log(`✗ ${slug} — not found, skipping`);
      continue;
    }
    await prisma.property.update({
      where: { slug },
      data: {
        shortDescriptionFr: fr.shortDescriptionFr,
        descriptionFr: fr.descriptionFr,
        // Overwrite highlightsJson with the FR list when provided.
        // Single-locale column so this also serves EN/AR users until we
        // localise the column itself.
        ...(fr.highlightsFr
          ? { highlightsJson: JSON.stringify(fr.highlightsFr) }
          : {}),
      },
    });
    console.log(`✓ ${slug}`);
    updated++;
  }
  console.log(`\n✓ Translated ${updated} properties to French.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
