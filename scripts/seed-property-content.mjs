// One-shot: writes a polished info.txt + meta.json into each of the
// 12 catalogue folders. All Pearl Garden apartments share the same
// address + GPS + base amenity list (per the Booking.com listing the
// owner referenced); Villa Prestige and the Gueliz apartment are
// stand-alone and get their own area/coords.
//
//   Run:  node scripts/seed-property-content.mjs
//
// Re-run is idempotent (overwrites info.txt + meta.json). Photos are
// untouched. After running, kick the data into the DB with:
//   node scripts/bulk-import-properties.mjs --refresh

import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = resolve(process.env.HOME, "Documents/nwx-import");

// Pearl Garden Residence — Boulevard Abdelkarim Al Khattabi, Marrakech.
// Coordinates pulled from the Google Maps short-link the owner shared
// (maps.app.goo.gl/gfeWpv3KUCGz9sn18). The locationRadius default (200 m)
// renders as a privacy zone-circle on the public page.
const PEARL_GARDEN = {
  area: "Résidence Pearl Garden · Bd Abdelkarim Al Khattabi",
  lat: 31.6762777,
  lng: -8.0032887,
  // Comprehensive amenity list — every Pearl Garden apartment in the
  // residence is fitted to the same standard (per the Booking.com
  // listing for "Modern apartment with pool view"), so we ship the
  // full list with each unit instead of asking the admin to re-tick.
  baseAmenities: [
    "Wi-Fi rapide gratuit",
    "Climatisation",
    "Chauffage",
    "Piscine extérieure (résidence)",
    "Parking privé gratuit",
    "Balcon",
    "Vue sur le jardin",
    "Télévision écran plat",
    "Cuisine entièrement équipée",
    "Lave-linge",
    "Linge de lit et serviettes premium",
    "Résidence sécurisée 24/7",
    "Langues parlées : Français · Arabe · Anglais",
  ],
};

// Boilerplate description footer shared by every Pearl Garden listing —
// the location/neighbourhood context the owner mentioned. Kept short so
// it doesn't dilute the per-apartment narrative.
const PG_FOOTER = `
📍 EMPLACEMENT — Résidence Pearl Garden
Située sur le Boulevard Abdelkarim Al Khattabi, la résidence est un complexe sécurisé avec accès 24/7, grande piscine paysagée, jardins luxuriants et parking privé. Idéale pour profiter de Marrakech en toute sérénité.

🛣 À PROXIMITÉ
• 9 km de l'aéroport Marrakech-Ménara
• 5 km du Jardin Majorelle & Musée Yves Saint Laurent
• 6 km de la Médina, de la Koutoubia et de la place Jemaa el-Fna
• Restaurants, supérette et commerces à 5 minutes à pied

✨ EXPÉRIENCE NEXTWIN STAY
Check-in flexible, conciergerie WhatsApp 7j/7, transferts aéroport sur demande, paniers de bienvenue marocains à la livraison.`;

// Each Pearl Garden property gets its own "narrative" — the bullet
// points the owner wrote on WhatsApp, re-styled into editorial copy
// that highlights what makes THIS unit different from the others.
const PG_UNITS = {
  "d32-style-urbain-chic": {
    titleFr: "Appartement D32 — Style urbain chic, vue piscine & jardins",
    titleEn: "D32 — Urban Chic with Pool & Garden View",
    titleAr: "شقة D32 — أناقة عصرية بإطلالة على المسبح",
    pricePerNight: 68,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    narrative: `Un appartement au design contemporain et épuré — ambiance moderne et raffinée, pensé pour les voyageurs en quête de cachet.

Le salon gris graphite accueille un canapé d'angle profond, une smart TV rétroéclairée, un ventilateur de plafond design et des touches jaune moutarde qui réchauffent l'espace. La cuisine ouverte sur le séjour s'organise autour d'un bar et d'une suspension architecturale.

Côté nuit, la chambre se décline en "dark luxury" — lit double habillé de linge premium noir & blanc, appliques murales, parquet sombre et atmosphère cocon. Le balcon offre une vue dégagée sur la grande piscine et les jardins paysagers de la résidence.`,
    highlights: ["Vue piscine & jardins", "Décoration contemporaine", "Chambre dark luxury"],
  },
  "appt-54-glamour-prestige": {
    titleFr: "Appartement 54 — Glamour & Prestige, grande terrasse vue piscine",
    titleEn: "54 — Glamour & Prestige with Large Terrace Pool View",
    titleAr: "شقة 54 — فخامة وأناقة مع تراس واسع",
    pricePerNight: 68,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    narrative: `L'appartement le plus glamour de la collection — décoration artistique et luxueuse, pensée comme une galerie privée.

Le salon impose son canapé en velours bordeaux royal, ses lustres dorés multiples et ses appliques gold posées sur des murs habillés d'œuvres encadrées. La chambre joue l'élégance moderne : lit blanc & noir, lustre bleu nuit, couloir d'accès soigneusement décoré.

Le clou du séjour : une grande terrasse privative avec balançoire suspendue, salon lounge et vue plongeante sur la piscine et les jardins — magique de jour, féerique de nuit avec l'éclairage LED or et les finitions stuc argenté.`,
    highlights: ["Grande terrasse privative", "Décoration galerie d'art", "Balançoire suspendue"],
  },
  "appt-duplex-26-double-hauteur": {
    titleFr: "Duplex 26 — Double hauteur & patio privé",
    titleEn: "Duplex 26 — Double Height & Private Patio",
    titleAr: "دوبلكس 26 — ارتفاع مزدوج وفناء خاص",
    pricePerNight: 68,
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    narrative: `Un duplex d'exception, sculpté autour d'une architecture spectaculaire à double hauteur. L'escalier suspendu sépare un séjour cathédral, baigné de lumière, d'un coin nuit refuge à l'étage.

Le rez-de-chaussée s'ouvre sur un patio privé planté, idéal pour les petits-déjeuners marocains à l'ombre du citronnier. La cuisine en îlot, équipée plaque induction et four, dialogue avec le salon par un comptoir-bar.

À l'étage, une suite parentale habillée de matières nobles (lin, bois sombre, laine berbère) et une seconde chambre cosy. Les deux salles d'eau sont en zellige contemporain.`,
    highlights: ["Double hauteur", "Patio privé planté", "Deux chambres confortables"],
  },
  "appart-36-standing-royal": {
    titleFr: "Appartement 36 — Standing royal, vue piscine & jardins",
    titleEn: "36 — Royal Standing with Pool & Garden View",
    titleAr: "شقة 36 — فخامة ملكية بإطلالة على المسبح",
    pricePerNight: 68,
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    narrative: `L'appartement le plus raffiné de notre collection — décoration royale, matières nobles, palette ivoire et or pâle pour une élégance intemporelle.

Le séjour double-exposition baigne dans la lumière du jour. Canapés profonds en lin écru, tapis berbère, table basse en marbre travertin et boiseries sculptées encadrent un téléviseur grand format. La cuisine s'intègre dans le séjour avec un bar finition laquée.

Les deux chambres sont des suites — lits king-size, tête de lit capitonnée, miroirs vénitiens et salles de bains marbre crème avec douche italienne XL. Vue dégagée sur la piscine et les palmiers de la résidence.`,
    highlights: ["Standing royal", "Deux suites avec salle d'eau", "Vue piscine & palmeraie"],
  },
  "appart-39-luxe-authenticite": {
    titleFr: "Appartement 39 — Luxe & Authenticité, piscine & parking",
    titleEn: "39 — Authentic Luxury with Pool & Parking",
    titleAr: "شقة 39 — فخامة وأصالة مع مسبح وموقف خاص",
    pricePerNight: 68,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    narrative: `Un appartement de luxe alliant modernité et touches d'authenticité marocaine. L'art du zellige rencontre le design contemporain dans un dialogue subtil.

Le salon s'organise autour d'un grand canapé d'angle taupe, d'une cheminée moderne et de luminaires en laiton brossé. Un tapis kilim ancien rappelle l'héritage berbère ; les murs en tadelakt nude apportent une douceur minérale.

La chambre est un cocon : tête de lit en bois sculpté, suspensions en raphia, linge de lit lin lavé. La salle d'eau, finition tadelakt, est équipée d'une douche italienne et de produits artisans marocains.`,
    highlights: ["Tadelakt & zellige", "Pièces signature", "Cheminée moderne"],
  },
  "appart-22-duplex-moderne": {
    titleFr: "Appartement 22 — Duplex moderne & cosy",
    titleEn: "22 — Modern & Cosy Duplex",
    titleAr: "شقة 22 — دوبلكس عصري ومريح",
    pricePerNight: 68,
    bedrooms: 1,
    bathrooms: 1,
    guests: 3,
    narrative: `Un duplex au design contemporain et chaleureux — l'idéal pour une escapade en couple ou en petite famille.

Au rez-de-chaussée, un séjour ouvert avec cheminée TV intégrée, canapé d'angle généreux et grandes baies vitrées qui laissent entrer la lumière toute la journée. La cuisine est entièrement équipée, lumineuse et fonctionnelle.

L'étage abrite la chambre principale, calme et soignée, ainsi qu'une salle d'eau moderne. Le balcon donne sur la grande piscine et les jardins paysagers de Pearl Garden.`,
    highlights: ["Duplex chaleureux", "Cheminée TV", "Vue piscine"],
  },
  "appart-84-premium-terrasse-vue-ville": {
    titleFr: "Appartement 84 — Premium avec terrasse vue ville",
    titleEn: "84 — Premium with City-View Terrace",
    titleAr: "شقة 84 — فاخرة مع تراس بإطلالة على المدينة",
    pricePerNight: 68,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    narrative: `Un appartement premium situé en étage élevé, offrant une perspective ouverte sur Marrakech et ses palmeraies au loin.

Le salon ultra-moderne dispose d'un grand canapé en L, d'un grand téléviseur, et d'un mobilier signé. Les baies vitrées coulissantes ouvrent sur une terrasse privative où l'on prend ses repas face au coucher de soleil sur la ville.

La chambre principale dispose d'un lit king-size, d'un dressing sur mesure et d'une salle d'eau en marbre clair avec douche pluie. La cuisine, équipée des appareils Bosch / Whirlpool, est prête pour les longs séjours.`,
    highlights: ["Terrasse vue ville", "Étage élevé", "Couchers de soleil sur Marrakech"],
  },
  "appt-63-luxe-terrasse-piscine": {
    titleFr: "Appartement 63 — Luxe avec terrasse & piscine",
    titleEn: "63 — Luxury with Terrace & Pool",
    titleAr: "شقة 63 — فخامة مع تراس ومسبح",
    pricePerNight: 68,
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    narrative: `Un appartement haut de gamme dans l'une des plus belles ailes de Pearl Garden — finitions luxueuses et plein de lumière naturelle.

Le salon décline une palette beige doré : canapé bouclette crème, tapis tissé main, lustres en travertin et grande télévision encastrée. La cuisine ouverte intègre un îlot central et une cave à vin. Une vaste terrasse meublée prolonge l'espace de vie à l'extérieur, avec une vue directe sur la piscine et les palmiers.

Les deux chambres sont des suites parentales avec leur propre salle d'eau, dressings sur mesure et balcon privatif.`,
    highlights: ["Vaste terrasse meublée", "Deux suites parentales", "Vue piscine"],
  },
  "appt-57-moderne-complet": {
    titleFr: "Appartement 57 — Moderne & complet",
    titleEn: "57 — Modern & Fully Equipped",
    titleAr: "شقة 57 — عصرية ومجهزة بالكامل",
    pricePerNight: 68,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    narrative: `Un appartement décoré avec goût et prêt à vous accueillir dès l'arrivée. Conception fonctionnelle, mobilier moderne, atmosphère apaisante.

Le séjour ouvert s'organise autour d'un canapé confortable, d'une table basse design et d'un coin télévision équipé Netflix. La cuisine entièrement équipée vous permet de cuisiner sereinement vos plats marocains ou européens.

La chambre principale est habillée d'un mobilier scandinave épuré, et la salle d'eau dispose d'une douche italienne et de produits cosmétiques bio fournis. Idéal pour les voyageurs d'affaires ou les courts séjours.`,
    highlights: ["Prêt à vivre", "Idéal courts séjours", "Netflix inclus"],
  },
  "appt-76-de-luxe": {
    titleFr: "Appartement 76 — Appartement de luxe",
    titleEn: "76 — Luxury Apartment",
    titleAr: "شقة 76 — شقة فاخرة",
    pricePerNight: 68,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    narrative: `Bienvenue dans un appartement d'exception au cœur de la résidence Pearl Garden. Tout y a été pensé pour le confort haut de gamme.

Le séjour, baigné de lumière, est aménagé d'un canapé en lin grège, de fauteuils designer, d'une bibliothèque encastrée et d'une grande télévision murale. La cuisine ouverte, totalement équipée, dispose d'une cave à vin et d'un coin petit-déjeuner.

La chambre principale offre un grand lit, du linge en coton long staple, et des rideaux occultants pour des nuits parfaites. Salle d'eau en marbre crème, douche italienne XL, miroir éclairé LED.`,
    highlights: ["Confort haut de gamme", "Coin lecture", "Salle d'eau marbre"],
  },
};

// Gueliz — different neighbourhood (city centre), one of the catalogue's
// stand-alone apartments. Coordinates approximate (centre Gueliz).
const GUELIZ = {
  "appartement-gueliz-luxe-modernite": {
    area: "Gueliz · Centre-ville",
    lat: 31.6354,
    lng: -8.0089,
    titleFr: "Appartement Gueliz — Luxe & Modernité en plein centre",
    titleEn: "Gueliz — Luxury & Modernity in the City Centre",
    titleAr: "شقة جليز — فخامة وحداثة في قلب المدينة",
    pricePerNight: 68,
    bedrooms: 2,
    bathrooms: 2,
    guests: 4,
    narrative: `Appartement haut standing situé dans le quartier le plus prisé de Marrakech — Gueliz, centre névralgique de la nouvelle ville, à deux pas du Jardin Majorelle, du Musée YSL et des plus belles tables de la ville.

Le séjour à l'esprit Art Déco marrakchi marie le marbre noir, les laitons brossés et les velours céladon. La cuisine, totalement équipée, est intégrée derrière des portes coulissantes. Le balcon donne sur l'avenue principale.

Les deux chambres sont des suites — l'une habillée en taupe et bois clair, l'autre plus dramatique en bleu pétrole. Salles de bains en marbre, douches pluie XL.`,
    amenities: [
      "Wi-Fi rapide",
      "Climatisation",
      "Cuisine équipée",
      "Smart TV",
      "Balcon en centre-ville",
      "Ascenseur",
      "Linge de lit et serviettes premium",
      "Service de ménage en supplément",
    ],
    highlights: ["Quartier Gueliz", "À deux pas YSL & Majorelle", "Esprit Art Déco"],
  },
};

// Villa Prestige — Route Agadir, stand-alone property with private pool.
const VILLA = {
  "villa-prestige-route-agadir": {
    type: "villa",
    area: "Route d'Agadir",
    lat: 31.5750,
    lng: -8.0700,
    titleFr: "Villa Prestige — Route d'Agadir, 3 chambres, piscine chauffée",
    titleEn: "Villa Prestige — Agadir Road, 3 Bedrooms, Heated Pool",
    titleAr: "فيلا برستيج — طريق أغادير، 3 غرف، مسبح مُدفأ",
    pricePerNight: 260,
    bedrooms: 3,
    bathrooms: 3,
    guests: 8,
    narrative: `Une villa d'exception pour des vacances inoubliables — 3 chambres, 3 salles de bains, piscine privée chauffée toute l'année et grand jardin paysager sur la Route d'Agadir, à 15 minutes du centre de Marrakech.

L'architecture marie la pierre locale et le tadelakt brut, ouvert sur une grande terrasse couverte avec salon lounge, table à manger 12 couverts et coin barbecue. La piscine chauffée de 12 m est entourée de transats et bordée de palmiers et de bougainvilliers — baignade confortable même en hiver.

À l'intérieur : double salon avec cheminée centrale, salle à manger formelle, cuisine professionnelle équipée. Les 3 chambres sont des suites — la suite parentale dispose d'une salle de bains en marbre, hammam privatif et dressing.

Personnel sur place sur demande : cuisinier, ménage quotidien, gardiennage 24/7.`,
    amenities: [
      "Wi-Fi rapide",
      "Climatisation toutes pièces",
      "Piscine privée chauffée toute l'année",
      "Grand jardin paysager",
      "Parking privé multi-voitures",
      "Cuisine professionnelle",
      "Hammam privatif",
      "Cheminée",
      "Barbecue extérieur",
      "Linge de lit et serviettes premium",
      "Personnel sur demande",
      "Gardien 24/7",
    ],
    highlights: ["Piscine chauffée toute l'année", "3 suites", "Hammam privatif"],
  },
};

async function writeFolder(slug, data, baseAmenities = null, baseFooter = "") {
  const dir = resolve(ROOT, slug);
  await mkdir(dir, { recursive: true });

  const description = `${data.narrative.trim()}\n${baseFooter}`.trim();
  const infoText = `${data.titleFr}\n\n${description}\n`;
  await writeFile(resolve(dir, "info.txt"), infoText, "utf-8");

  const type = data.type ?? "apartment";
  const meta = {
    titleEn: data.titleEn,
    titleAr: data.titleAr,
    price: data.pricePerNight,
    guests: data.guests,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    // Calendar enforces a minimum stay — villas (full house rentals)
    // are 3 nights, apartments are 2.
    minNights: data.minNights ?? (type === "villa" ? 3 : 2),
    type,
    area: data.area ?? PEARL_GARDEN.area,
    lat: data.lat ?? PEARL_GARDEN.lat,
    lng: data.lng ?? PEARL_GARDEN.lng,
    amenities: data.amenities ?? baseAmenities ?? [],
    highlights: data.highlights ?? [],
  };
  await writeFile(resolve(dir, "meta.json"), JSON.stringify(meta, null, 2), "utf-8");
  console.log(`✓ ${slug}`);
}

async function main() {
  for (const [slug, data] of Object.entries(PG_UNITS)) {
    await writeFolder(slug, data, PEARL_GARDEN.baseAmenities, PG_FOOTER);
  }
  for (const [slug, data] of Object.entries(GUELIZ)) {
    await writeFolder(slug, data);
  }
  for (const [slug, data] of Object.entries(VILLA)) {
    await writeFolder(slug, data);
  }
  console.log("\nSeed complete. Now run: node scripts/bulk-import-properties.mjs --refresh");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
