// One-shot importer for the NEXTWIN STAY WhatsApp Business catalog.
// Source: extracted from web.whatsapp.com → Tools → Catalog by reading the
// rendered DOM (titles + description text only — images are session-bound
// blob URLs and cannot be used as <img src> on a public site, so they're
// left empty for the admin to upload via /admin/properties/[id]).
//
// Run:  npx tsx prisma/scripts/import-whatsapp-catalog.ts
//
// Idempotent — re-running updates the existing rows by slug.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Item = {
  title: string;
  desc: string;
  type: "apartment" | "villa";
  bedrooms: number;
  bathrooms: number;
  guests: number;
  area: string;
};

const ITEMS: Item[] = [
  {
    title: "Appt 54 — Glamour & Prestige · Grande Terrasse Vue Piscine",
    desc: "L'appartement le plus glamour de la collection, décoration artistique et luxueuse. Canapé velours bordeaux royal avec lustres dorés multiples et appliques gold partout. Œuvres d'art encadrées aux murs — ambiance galerie de luxe. Chambre élégante avec lit blanc & noir, couloir décoré, lustre bleu nuit. Grande terrasse avec balançoire suspendue, salon lounge, vue sur piscine et jardins de jour comme de nuit. Terrasse de nuit éclairée — magique. Éclairage LED or, finitions stuc argenté, plafonds travaillés.",
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    area: "Marrakech",
  },
  {
    title: "Appt D32 — Style Urbain Chic · Vue Piscine & Jardins",
    desc: "Un appartement au design contemporain et épuré — ambiance moderne et raffinée. Salon gris moderne avec canapé en L, smart TV rétroéclairée, ventilateur de plafond design et touches jaune moutarde. Cuisine ouverte avec bar et éclairage suspendu. Chambre dark luxury — lit double avec linge noir & blanc premium, appliques murales, parquet sombre et ambiance cosy. Vue imprenable sur la grande piscine et les jardins paysagers de la résidence. Parking inclus · Résidence sécurisée.",
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    area: "Marrakech",
  },
  {
    title: "Appart 36 — Standing Royal · Vue Piscine & Jardins",
    desc: "L'appartement le plus raffiné de notre collection — décoration digne d'un palace. Hall d'entrée en marbre — première impression inoubliable. Salon classique avec lustre cristal & appliques dorées, panneau bois rétroéclairé et grand lustre gold. Vue panoramique sur la piscine et les jardins verdoyants de la résidence. Chambre royale avec lit capitonné XL, tête de lit velours, parquet et éclairage LED bleu ambiant. Finitions premium partout : marbre, bois, velours, or. Parking inclus · Résidence sécurisée.",
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    area: "Marrakech",
  },
  {
    title: "Appt Duplex 26 — Double Hauteur & Patio Privé",
    desc: "Un duplex d'exception avec architecture spectaculaire — double hauteur sous plafond et volumes généreux. Salon avec pendants lumineux design en or, panneau bois rétroéclairé, smart TV et cuisine ouverte. Vue plongeante depuis l'étage sur le salon — effet loft unique. Chambres avec tête de lit capitonnée matelassée, parquet chaud et éclairage LED doux. Patio privé ensoleillé avec parasol rouge, salon de jardin fer forgé et palmiers — votre coin détente exclusif. Finitions soignées, ambiance chaleureuse et cosy.",
    type: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    area: "Marrakech",
  },
  {
    title: "Appart 22 — Duplex Moderne & Cosy",
    desc: "Découvrez notre duplex moderne au design soigné, alliant confort et élégance. Salon spacieux avec canapé en L, décoration chaleureuse. Coin cuisine et salle à manger intégrés. Éclairage ambiant, parquet et touches dorées pour une atmosphère haut de gamme. Disponible à la location — idéal pour familles ou séjours entre amis. Contactez-nous pour réserver ou avoir plus d'infos.",
    type: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    area: "Marrakech",
  },
  {
    title: "Villa Prestige — Route Agadir · 4 Chambres · Piscine Chauffée",
    desc: "Une villa d'exception pour des vacances inoubliables à Marrakech. Piscine privée chauffée + chaises longues + grand jardin avec cyprès — votre resort privé. 4 chambres spacieuses avec TV, climatisation et linge hôtel. Grande salle à manger avec table 6 personnes, chaises velours orange et salon séparé. Cuisine rouge bold entièrement équipée avec bar et réfrigérateur américain. Villa sur 2 étages avec escalier décoratif — volumes généreux. Barbecue extérieur privatif inclus. Emplacement idéal — 10 min Carrefour Targa, 18 min Gueliz, Route Agadir.",
    type: "villa",
    bedrooms: 4,
    bathrooms: 3,
    guests: 8,
    area: "Route d'Agadir, Marrakech",
  },
  {
    title: "Appart 39 — Luxe & Authenticité · Piscine & Parking Sous-Sol",
    desc: "Un appartement de luxe alliant modernité et touches marocaines authentiques. Salon élégant avec canapé en L, smart TV, panneau bois rétroéclairé et lustre cristal. Cuisine ouverte avec bar et îlot entièrement équipée. Terrasse privée avec table en mosaïque marocaine, vue directe sur la piscine et les jardins. Accès piscine de la résidence — entourée de palmiers et espaces verts. Parking sous-sol sécurisé inclus. Éclairage LED ambiant, finitions premium, résidence gardée 24h/24.",
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    area: "Marrakech",
  },
  {
    title: "Appart 84 — Premium avec Terrasse Vue Ville",
    desc: "Salon ultra-moderne avec grand canapé en L et cuisine ouverte équipée. Terrasse privée avec vue panoramique sur la ville et les jardins — parfaite pour profiter du soleil. Lumineux, spacieux, design haut de gamme. Netflix · Cuisine équipée · Terrasse vue dégagée. Idéal pour couples, familles ou groupes d'amis. Contactez-nous pour disponibilités et tarifs.",
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    area: "Marrakech",
  },
  {
    title: "Appt 63 — Appartement Luxe avec Terrasse & Piscine",
    desc: "Un appartement haut de gamme dans l'une des plus belles résidences de Marrakech. Salon spacieux avec grand canapé, cuisine ouverte avec bar et lustre design. Chambre élégante avec lit double, TV murale, parquet et touche hôtelière. Grande terrasse privée avec vue panoramique sur les jardins et palmiers de Marrakech. Accès à la grande piscine de la résidence entourée de palmiers. Éclairage LED ambiant, finitions marbre, décoration soignée. Parking gratuit · Résidence sécurisée.",
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    area: "Marrakech",
  },
  {
    title: "Appt 57 — Appartement Moderne & Complet · Marrakech",
    desc: "Un appartement décoré avec goût et prêt à vous accueillir. Salon confortable avec canapé en L, smart TV, bibliothèque murale intégrée et éclairage LED ambiant. Cuisine ouverte entièrement équipée — bar avec tabourets, réfrigérateur américain, plaques gaz, micro-ondes. Chambre style hôtel avec lit double, literie blanche impeccable, armoire en bois et parquet. Design moderne, finitions marbre & béton ciré, luminaires design.",
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    area: "Marrakech",
  },
  {
    title: "Appartement Gueliz — Luxe & Modernité en Plein Cœur de Marrakech",
    desc: "Appartement haut standing situé dans le quartier le plus prisé de Marrakech — Gueliz. Salon spacieux et lumineux avec canapé en L, Netflix et rideaux volants élégants. Cuisine entièrement équipée avec îlot central, lave-linge, plaques gaz — finitions bois & marbre. Éclairage LED ambiant dans toutes les pièces. Petite terrasse privée avec salon de jardin — parfaite pour prendre le café. Emplacement idéal : à deux pas des restaurants, boutiques et vie nocturne de Gueliz.",
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    area: "Gueliz, Marrakech",
  },
  {
    title: "Appt 76 — Appartement de Luxe au Cœur de la Perle",
    desc: "Bienvenue dans un appartement d'exception au cœur de la Perle de Marrakech. Salon moderne avec grand canapé en L, TV écran plat et cheminée décorative. Cuisine ouverte entièrement équipée. Accès piscine privée de la résidence — éclairée la nuit, magique. Terrasse privée avec vue directe sur la piscine et les jardins illuminés. Parking gratuit inclus. Résidence sécurisée, cadre verdoyant et paisible.",
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    area: "Marrakech",
  },
];

// Slugify with FR diacritic stripping — same algorithm the admin POST uses
// so admins can tweak slugs later and they stay consistent.
function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Short marketing tagline = first sentence of the description, capped at
// 140 chars. Powers the listing card subtitle and the meta description.
function buildShortDesc(desc: string) {
  const firstSentence = desc.split(/(?<=[.!?])\s+/)[0] || desc;
  return firstSentence.length > 140
    ? firstSentence.slice(0, 137).trim() + "…"
    : firstSentence.trim();
}

async function main() {
  let created = 0;
  let updated = 0;

  for (const item of ITEMS) {
    const slug = slugify(item.title);
    const shortDesc = buildShortDesc(item.desc);

    // Sensible defaults — admin fills in price + uploads images post-import.
    // published: false so drafts stay off the public listing until ready.
    const data = {
      slug,
      type: item.type,
      area: item.area,
      city: "Marrakech",
      rating: 4.85,
      reviewCount: 0,
      guests: item.guests,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      pricePerNight: 0,
      currency: "EUR",
      titleFr: item.title,
      titleEn: null,
      titleAr: null,
      shortDescriptionFr: shortDesc,
      shortDescriptionEn: null,
      shortDescriptionAr: null,
      descriptionFr: item.desc,
      descriptionEn: null,
      descriptionAr: null,
      amenitiesJson: "[]",
      highlightsJson: "[]",
      hostName: "NEXTWIN STAY",
      hostYears: 1,
      published: false,
    };

    const existing = await prisma.property.findUnique({ where: { slug } });
    if (existing) {
      await prisma.property.update({ where: { slug }, data });
      updated++;
    } else {
      await prisma.property.create({ data });
      created++;
    }
    console.log(`✓ ${slug} (${existing ? "updated" : "created"})`);
  }

  console.log(`\n✓ Imported ${ITEMS.length} listings — ${created} created, ${updated} updated.`);
  console.log("→ Visit /admin/properties to set prices and upload images.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
