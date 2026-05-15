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
const PG_FOOTER_FR = `
📍 EMPLACEMENT — Résidence Pearl Garden
Située sur le Boulevard Abdelkarim Al Khattabi, la résidence est un complexe sécurisé avec accès 24/7, grande piscine paysagée, jardins luxuriants et parking privé. Idéale pour profiter de Marrakech en toute sérénité.

🛣 À PROXIMITÉ
• 9 km de l'aéroport Marrakech-Ménara
• 5 km du Jardin Majorelle & Musée Yves Saint Laurent
• 6 km de la Médina, de la Koutoubia et de la place Jemaa el-Fna
• Restaurants, supérette et commerces à 5 minutes à pied

✨ EXPÉRIENCE NEXTWIN STAY
Check-in flexible, conciergerie WhatsApp 7j/7, transferts aéroport sur demande, paniers de bienvenue marocains à la livraison.`;

const PG_FOOTER_EN = `
📍 LOCATION — Pearl Garden Residence
Located on Boulevard Abdelkarim Al Khattabi, the residence is a 24/7 secured complex with a large landscaped pool, lush gardens and private parking. The perfect base for exploring Marrakech in complete serenity.

🛣 NEARBY
• 9 km from Marrakech-Ménara Airport
• 5 km from Jardin Majorelle & Yves Saint Laurent Museum
• 6 km from the Medina, Koutoubia & Jemaa el-Fna square
• Restaurants, supermarket and shops a 5-minute walk away

✨ THE NEXTWIN STAY EXPERIENCE
Flexible check-in, 7-day WhatsApp concierge, airport transfers on request, Moroccan welcome baskets on arrival.`;

const PG_FOOTER_AR = `
📍 الموقع — إقامة بيرل غاردن
تقع على شارع عبد الكريم الخطابي. مجمع آمن على مدار الساعة، مع مسبح واسع وحدائق غناء وموقف سيارات خاص. القاعدة المثالية لاستكشاف مراكش في هدوء تام.

🛣 المعالم القريبة
• 9 كم من مطار مراكش-المنارة
• 5 كم من حديقة ماجوريل ومتحف إيف سان لوران
• 6 كم من المدينة القديمة، صومعة الكتبية وساحة جامع الفنا
• مطاعم وسوبر ماركت ومحلات على بُعد 5 دقائق سيراً على الأقدام

✨ تجربة NEXTWIN STAY
تسجيل وصول مرن، خدمة كونسيرج عبر واتساب 7 أيام، خدمة نقل من المطار عند الطلب، سلة ترحيب مغربية عند الوصول.`;

// Each Pearl Garden property gets its own "narrative" — the bullet
// points the owner wrote on WhatsApp, re-styled into editorial copy
// that highlights what makes THIS unit different from the others.
const PG_UNITS = {
  "d32-style-urbain-chic": {
    titleFr: "Appartement D32 — Style urbain chic, vue piscine & jardins",
    titleEn: "D32 — Urban Chic with Pool & Garden View",
    titleAr: "شقة D32 — أناقة عصرية بإطلالة على المسبح",
    pricePerNight: 72,
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
    pricePerNight: 74,
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
    pricePerNight: 76,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    narrative: `Un duplex d'exception, sculpté autour d'une architecture spectaculaire à double hauteur. L'escalier suspendu sépare un séjour cathédral, baigné de lumière, d'un coin nuit refuge à l'étage.

Le rez-de-chaussée s'ouvre sur un patio privé planté, idéal pour les petits-déjeuners marocains à l'ombre du citronnier. La cuisine en îlot, équipée plaque induction et four, dialogue avec le salon par un comptoir-bar.

À l'étage, une suite parentale habillée de matières nobles (lin, bois sombre, laine berbère) et une seconde chambre cosy. Les deux salles d'eau sont en zellige contemporain.`,
    highlights: ["Double hauteur", "Patio privé planté", "Deux chambres confortables"],
  },
  "appart-36-standing-royal": {
    titleFr: "Appartement 36 — Standing royal, vue piscine & jardins",
    titleEn: "36 — Royal Standing with Pool & Garden View",
    titleAr: "شقة 36 — فخامة ملكية بإطلالة على المسبح",
    pricePerNight: 73,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    narrative: `L'appartement le plus raffiné de notre collection — décoration royale, matières nobles, palette ivoire et or pâle pour une élégance intemporelle.

Le séjour double-exposition baigne dans la lumière du jour. Canapés profonds en lin écru, tapis berbère, table basse en marbre travertin et boiseries sculptées encadrent un téléviseur grand format. La cuisine s'intègre dans le séjour avec un bar finition laquée.

Les deux chambres sont des suites — lits king-size, tête de lit capitonnée, miroirs vénitiens et salles de bains marbre crème avec douche italienne XL. Vue dégagée sur la piscine et les palmiers de la résidence.`,
    highlights: ["Standing royal", "Deux suites avec salle d'eau", "Vue piscine & palmeraie"],
  },
  "appart-39-luxe-authenticite": {
    titleFr: "Appartement 39 — Luxe & Authenticité, piscine & parking",
    titleEn: "39 — Authentic Luxury with Pool & Parking",
    titleAr: "شقة 39 — فخامة وأصالة مع مسبح وموقف خاص",
    pricePerNight: 72,
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
    pricePerNight: 75,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    narrative: `Un duplex au design contemporain et chaleureux — l'idéal pour une escapade en couple ou en petite famille.

Au rez-de-chaussée, un séjour ouvert avec cheminée TV intégrée, canapé d'angle généreux et grandes baies vitrées qui laissent entrer la lumière toute la journée. La cuisine est entièrement équipée, lumineuse et fonctionnelle.

L'étage abrite la chambre principale, calme et soignée, ainsi qu'une salle d'eau moderne. Le balcon donne sur la grande piscine et les jardins paysagers de Pearl Garden.`,
    highlights: ["Duplex chaleureux", "Cheminée TV", "Vue piscine"],
  },
  "appart-84-premium-terrasse-vue-ville": {
    titleFr: "Appartement 84 — Premium avec terrasse vue ville",
    titleEn: "84 — Premium with City-View Terrace",
    titleAr: "شقة 84 — فاخرة مع تراس بإطلالة على المدينة",
    pricePerNight: 74,
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
    pricePerNight: 76,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
    narrative: `Un appartement haut de gamme dans l'une des plus belles ailes de Pearl Garden — finitions luxueuses et plein de lumière naturelle.

Le salon décline une palette beige doré : canapé bouclette crème, tapis tissé main, lustres en travertin et grande télévision encastrée. La cuisine ouverte intègre un îlot central et une cave à vin. Une vaste terrasse meublée prolonge l'espace de vie à l'extérieur, avec une vue directe sur la piscine et les palmiers.

Les deux chambres sont des suites parentales avec leur propre salle d'eau, dressings sur mesure et balcon privatif.`,
    highlights: ["Vaste terrasse meublée", "Deux suites parentales", "Vue piscine"],
  },
  "appt-57-moderne-complet": {
    titleFr: "Appartement 57 — Moderne & complet",
    titleEn: "57 — Modern & Fully Equipped",
    titleAr: "شقة 57 — عصرية ومجهزة بالكامل",
    pricePerNight: 73,
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
    pricePerNight: 75,
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
    pricePerNight: 76,
    bedrooms: 1,
    bathrooms: 1,
    guests: 2,
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

// EN narratives — same structure as the FR narrative, written for
// English-speaking guests. Keep parity in length + tone so the page
// doesn't visually shrink when the user toggles locale.
const NARRATIVES_EN = {
  "d32-style-urbain-chic": `A contemporary, refined design apartment — modern yet warm, made for travellers with an eye for detail.

The graphite-grey living room features a deep sectional sofa, a backlit smart TV, a sculptural ceiling fan and accents of mustard yellow. The open kitchen anchors the room around a bar with an architectural pendant light.

The "dark luxury" bedroom dresses a double bed in premium black & white linens with wall sconces, dark parquet and a cocooning atmosphere. The balcony opens onto an uninterrupted view of the large pool and the residence's landscaped gardens.`,
  "appt-54-glamour-prestige": `The most glamorous apartment in the collection — artistic, luxurious decoration conceived like a private gallery.

A royal burgundy velvet sofa anchors the living room, paired with multiple gilded chandeliers, gold sconces and framed artworks on the walls. The bedroom plays modern elegance: black & white bed, midnight-blue chandelier, lavishly decorated hallway.

The hero feature: a wide private terrace with a hanging swing, lounge sofa and a sweeping view of the pool and gardens — magical by day, enchanting at night with the gold LED lighting and silvered stucco finishes.`,
  "appt-duplex-26-double-hauteur": `An exceptional duplex sculpted around dramatic double-height architecture. The suspended staircase separates a cathedral-like living room, bathed in light, from a cocooning sleeping area upstairs.

The ground floor opens onto a private planted patio — perfect for Moroccan breakfasts in the shade of the lemon tree. The island kitchen, equipped with induction hob and oven, dialogues with the living room through a bar counter.

Upstairs: a master suite in noble materials (linen, dark wood, Berber wool) and a second cosy bedroom. Both bathrooms in contemporary zellige.`,
  "appart-36-standing-royal": `The most refined apartment in the collection — royal decor, noble materials, an ivory and pale-gold palette for timeless elegance.

The double-aspect living room is flooded with daylight. Deep sofas in écru linen, a Berber rug, a travertine coffee table and sculpted woodwork frame a large flat-screen TV. The kitchen integrates into the living room behind a lacquered bar.

Both bedrooms are suites — king-size beds, padded headboards, Venetian mirrors and cream-marble bathrooms with extra-large rain showers. Open views of the residence's pool and palms.`,
  "appart-39-luxe-authenticite": `A luxury apartment blending modernity with authentic Moroccan touches. The art of zellige meets contemporary design in a subtle dialogue.

The living room organises around a deep taupe sectional sofa, a modern fireplace and brushed-brass light fixtures. An antique Kilim rug recalls Berber heritage; nude tadelakt walls bring a mineral softness.

The bedroom is a cocoon: carved wooden headboard, raffia pendants, washed-linen bedding. The tadelakt-finished bathroom features a walk-in rain shower and locally-crafted Moroccan toiletries.`,
  "appart-22-duplex-moderne": `A modern, warm duplex — perfect for couples or small families wanting a Marrakech escape.

Ground floor: an open living room with an integrated TV-fireplace, a generous sectional sofa and floor-to-ceiling glazing that lets daylight in all day. Fully-equipped kitchen — bright, functional.

Upstairs: a quiet, polished master bedroom and a modern bathroom. The balcony overlooks the large pool and landscaped gardens of Pearl Garden.`,
  "appart-84-premium-terrasse-vue-ville": `A premium apartment on an upper floor with an open perspective over Marrakech and the distant palm groves.

The ultra-modern living room features a large L-shaped sofa, a wide flat-screen TV and signature furniture. Sliding glass doors open onto a private terrace where you take your meals facing the sunset over the city.

The master bedroom has a king-size bed, bespoke dressing room and a light-marble bathroom with a rain shower. The kitchen, equipped with Bosch / Whirlpool appliances, is ready for longer stays.`,
  "appt-63-luxe-terrasse-piscine": `A high-end apartment in one of Pearl Garden's most beautiful wings — luxe finishes and abundant natural light.

The living room decants a golden-beige palette: cream bouclé sofa, hand-woven rug, travertine pendant lights and a built-in television. The open kitchen integrates a central island and a wine fridge. A wide furnished terrace extends the living space outdoors with direct views of the pool and palms.

Both bedrooms are master suites with their own en-suite bathroom, bespoke dressing rooms and private balconies.`,
  "appt-57-moderne-complet": `A tastefully decorated apartment, ready to welcome you on arrival. Functional design, modern furniture, soothing atmosphere.

The open living room sits around a comfortable sofa, a designer coffee table and a TV corner with Netflix. The fully-equipped kitchen lets you cook your Moroccan or European dishes with ease.

The main bedroom is dressed with refined Scandinavian-inspired furniture, and the bathroom offers an Italian walk-in shower and complimentary organic toiletries. Ideal for business travellers or short stays.`,
  "appt-76-de-luxe": `Welcome to an exceptional apartment in the heart of Pearl Garden. Every detail has been considered for high-end comfort.

The living room, bathed in light, is furnished with a beige-linen sofa, designer armchairs, a built-in bookcase and a wall-mounted television. The fully-equipped open kitchen features a wine fridge and a breakfast nook.

The master bedroom offers a large bed, long-staple cotton linens, and blackout curtains for perfect nights. Cream-marble bathroom, extra-large Italian shower, LED-lit mirror.`,
  "appartement-gueliz-luxe-modernite": `A high-standing apartment in Marrakech's most prized district — Gueliz, the nerve centre of the new town, steps from the Majorelle Garden, the YSL Museum and the city's finest tables.

The Marrakchi Art Deco living room marries black marble, brushed brass and celadon velvet. The fully-equipped kitchen is concealed behind sliding doors. The balcony opens onto the main avenue.

Both bedrooms are suites — one in taupe and pale wood, the other more dramatic in petrol blue. Marble bathrooms with extra-large rain showers.`,
  "villa-prestige-route-agadir": `An exceptional villa for unforgettable holidays — 3 bedrooms, 3 bathrooms, a year-round heated private pool and a large landscaped garden on the Agadir Road, 15 minutes from central Marrakech.

The architecture combines local stone and raw tadelakt, opening onto a large covered terrace with a lounge area, dining table for 12 and a barbecue corner. The 12-metre heated pool is lined with sun loungers, palms and bougainvillea — comfortable swimming even in winter.

Inside: a double living room with central fireplace, a formal dining room, and a professional fully-equipped kitchen. The 3 bedrooms are suites — the master suite has a marble bathroom, private hammam and dressing room.

On-site staff available on request: chef, daily housekeeping, 24/7 caretaker.`,
};

// AR narratives — Modern Standard Arabic, RTL renders natively.
const NARRATIVES_AR = {
  "d32-style-urbain-chic": `شقة بتصميم عصري أنيق — أجواء حديثة راقية، مصمَّمة للمسافرين الباحثين عن الذوق الرفيع.

صالة جلوس رمادية أنيقة مع أريكة زاوية عميقة، شاشة ذكية بإضاءة خلفية، مروحة سقف بتصميم مميز ولمسات صفراء دافئة. مطبخ مفتوح حول بار مع إضاءة معلقة.

غرفة نوم بأجواء "الفخامة الداكنة" — سرير مزدوج بمفروشات سوداء وبيضاء فاخرة، إضاءات جدارية، أرضية باركيه داكنة وأجواء حميمية. تطل الشرفة على المسبح الكبير والحدائق الخضراء للإقامة.`,
  "appt-54-glamour-prestige": `الشقة الأكثر فخامة في المجموعة — ديكور فني وفاخر مصمَّم كأنه معرض فني خاص.

أريكة من المخمل العنابي الملكي مع ثريات ذهبية متعددة وإضاءات جدارية ذهبية ولوحات فنية مؤطرة. غرفة النوم تجمع بين الأناقة الحديثة: سرير أبيض وأسود، ثريا زرقاء نيلية وممر مزخرف بعناية.

الميزة الأبرز: شرفة خاصة كبيرة مع أرجوحة معلقة وأريكة استرخاء وإطلالة بانورامية على المسبح والحدائق — ساحرة نهاراً، رومانسية ليلاً مع الإضاءة الذهبية وتشطيبات الجص الفضي.`,
  "appt-duplex-26-double-hauteur": `دوبلكس استثنائي بهندسة معمارية بارتفاع مزدوج مذهل. درج معلق يفصل صالة جلوس فسيحة مغمورة بالضوء عن مساحة النوم في الطابق العلوي.

الطابق الأرضي يفتح على فناء خاص بأشجار — مثالي للإفطارات المغربية تحت ظل شجرة الليمون. مطبخ بجزيرة، مجهز بموقد كهربائي وفرن، يتصل بالصالة عبر بار.

الطابق العلوي: جناح رئيسي بمواد فاخرة (كتان، خشب داكن، صوف أمازيغي) وغرفة نوم ثانية مريحة. الحماماتان مزيَّنتان بالزليج العصري.`,
  "appart-36-standing-royal": `الشقة الأكثر رقياً في مجموعتنا — ديكور ملكي، مواد نبيلة، لوحة عاجية وذهبية فاتحة لأناقة خالدة.

صالة جلوس مزدوجة الإطلالة مغمورة بضوء النهار. أرائك عميقة بكتان أبيض، سجادة أمازيغية، طاولة من رخام التراڤرتين، وأعمال خشبية محفورة تحيط بتلفاز كبير. المطبخ مدمج في الصالة مع بار بتشطيب لاكيه.

غرفتا النوم جناحان — أسرّة فاخرة، مساند رأس منجدة، مرايا فينيسية، حمامات بالرخام الكريمي مع دش مطر إيطالي. إطلالات مفتوحة على المسبح ونخيل الإقامة.`,
  "appart-39-luxe-authenticite": `شقة فاخرة تجمع بين الحداثة ولمسات الأصالة المغربية. الزليج التقليدي يلتقي بالتصميم العصري في حوار رفيع.

صالة الجلوس تنتظم حول أريكة زاوية كبيرة بلون مائل للبني، موقد عصري وإضاءات بالنحاس المصقول. سجادة كيليم عتيقة تذكِّر بالموروث الأمازيغي؛ جدران من التادلكت تضيف نعومة معدنية.

غرفة النوم مكان حميم: رأس سرير من الخشب المنحوت، إضاءات معلقة من الرافيا، مفروشات كتان مغسول. حمام التادلكت مزود بدش مطر إيطالي ومنتجات تجميل مغربية مصنوعة يدوياً.`,
  "appart-22-duplex-moderne": `دوبلكس عصري ودافئ — مثالي للأزواج أو العائلات الصغيرة الباحثة عن استراحة مراكشية.

الطابق الأرضي: صالة مفتوحة مع تلفاز بإطار موقد، أريكة زاوية واسعة ونوافذ زجاجية كبيرة تسمح بدخول ضوء النهار طوال اليوم. مطبخ مجهز بالكامل، مشرق وعملي.

الطابق العلوي: غرفة نوم رئيسية هادئة وأنيقة، وحمام عصري. تطل الشرفة على المسبح الكبير وحدائق إقامة بيرل غاردن.`,
  "appart-84-premium-terrasse-vue-ville": `شقة فاخرة في طابق علوي مع منظور مفتوح على مدينة مراكش وواحات النخيل في الأفق.

صالة جلوس عصرية للغاية مع أريكة كبيرة بشكل حرف L، تلفاز كبير وأثاث مميز. الأبواب الزجاجية المنزلقة تفتح على شرفة خاصة لتناول الوجبات في مواجهة غروب الشمس على المدينة.

غرفة النوم الرئيسية بسرير فاخر، دريسنغ مخصَّص وحمام بالرخام الفاتح مع دش مطر. المطبخ مجهز بأجهزة Bosch / Whirlpool، جاهز للإقامات الطويلة.`,
  "appt-63-luxe-terrasse-piscine": `شقة راقية في أحد أجمل أجنحة بيرل غاردن — تشطيبات فاخرة وإضاءة طبيعية وفيرة.

صالة الجلوس بلوحة بيج ذهبية: أريكة بوكلية كريمية، سجادة منسوجة يدوياً، إضاءات معلقة من الترافرتين وتلفاز مدمج. مطبخ مفتوح بجزيرة مركزية وثلاجة نبيذ. شرفة واسعة مفروشة تمتد بمساحة المعيشة إلى الخارج بإطلالة مباشرة على المسبح والنخيل.

غرفتا النوم جناحان رئيسيان مع حمام خاص بكل منهما، خزائن مخصصة وشرفات خاصة.`,
  "appt-57-moderne-complet": `شقة مزينة بذوق رفيع وجاهزة لاستقبالك فور وصولك. تصميم عملي، أثاث عصري، أجواء مريحة.

صالة مفتوحة حول أريكة مريحة، طاولة قهوة بتصميم مميز وزاوية تلفاز مع نتفليكس. مطبخ مجهز بالكامل يتيح لك تحضير أطباقك المغربية أو الأوروبية بسهولة.

غرفة النوم الرئيسية بأثاث إسكندنافي بسيط، والحمام يضم دشاً إيطالياً ومنتجات تجميل عضوية. مثالي لرجال الأعمال أو الإقامات القصيرة.`,
  "appt-76-de-luxe": `أهلاً بك في شقة استثنائية في قلب إقامة بيرل غاردن. كل التفاصيل صُمِّمت من أجل راحة فاخرة.

صالة جلوس مغمورة بالضوء مفروشة بأريكة كتانية بلون بيج، كراسي بتصميم مميز، مكتبة مدمجة وتلفاز كبير على الحائط. مطبخ مفتوح مجهز بالكامل مع ثلاجة نبيذ وركن للإفطار.

غرفة النوم الرئيسية بسرير كبير، مفروشات قطنية فاخرة، وستائر معتمة لنوم مثالي. حمام رخامي كريمي، دش إيطالي واسع، مرآة بإضاءة LED.`,
  "appartement-gueliz-luxe-modernite": `شقة راقية في الحي الأكثر تميزاً في مراكش — جليز، قلب المدينة الجديدة، على بُعد خطوات من حديقة ماجوريل ومتحف إيف سان لوران وأرقى مطاعم المدينة.

صالة الجلوس بروح آرت ديكو مراكشية تجمع بين الرخام الأسود، النحاس المصقول والمخمل الفاتح. مطبخ مجهز بالكامل مخفي خلف أبواب منزلقة. الشرفة تطل على الجادة الرئيسية.

غرفتا النوم جناحان — الأولى بألوان البيج والخشب الفاتح، الثانية أكثر جرأة بالأزرق البترولي. حمامات رخامية بدش مطر إيطالي.`,
  "villa-prestige-route-agadir": `فيلا استثنائية لعطلات لا تُنسى — 3 غرف نوم، 3 حمامات، مسبح خاص مُدفأ طوال السنة وحديقة واسعة على طريق أغادير، على بُعد 15 دقيقة من وسط مراكش.

تجمع الهندسة بين الحجر المحلي والتادلكت الخام، وتفتح على تراس واسع مغطى مع صالة استرخاء وطاولة طعام لـ 12 شخصاً وركن للشواء. المسبح المُدفأ بطول 12 متراً محاط بالأرائك والنخيل والجهنميات — سباحة مريحة حتى في الشتاء.

من الداخل: صالة جلوس مزدوجة مع موقد مركزي، غرفة طعام رسمية، ومطبخ احترافي مجهز بالكامل. غرف النوم الثلاث أجنحة — الجناح الرئيسي يحوي حماماً رخامياً، حماماً خاصاً (هَمّام) وغرفة ملابس.

طاقم خدمة عند الطلب: طاهي، تنظيف يومي، حارس على مدار الساعة.`,
};

async function writeFolder(
  slug,
  data,
  baseAmenities = null,
  footers = { fr: "", en: "", ar: "" },
) {
  const dir = resolve(ROOT, slug);
  await mkdir(dir, { recursive: true });

  // FR description (info.txt) is the canonical body — title on line 1,
  // narrative + shared footer below. Bulk-import reads from here.
  const descFr = `${data.narrative.trim()}\n${footers.fr}`.trim();
  const infoText = `${data.titleFr}\n\n${descFr}\n`;
  await writeFile(resolve(dir, "info.txt"), infoText, "utf-8");

  // EN / AR narratives composed alongside their footer counterparts.
  // Empty if the slug has no translation entry yet — the public page
  // falls back to FR via pickField() in that case.
  const narrativeEn = NARRATIVES_EN[slug] ?? null;
  const narrativeAr = NARRATIVES_AR[slug] ?? null;
  const descEn = narrativeEn ? `${narrativeEn.trim()}\n${footers.en}`.trim() : null;
  const descAr = narrativeAr ? `${narrativeAr.trim()}\n${footers.ar}`.trim() : null;
  const shortEn = descEn?.split("\n").find((l) => l.trim())?.slice(0, 180) ?? null;
  const shortAr = descAr?.split("\n").find((l) => l.trim())?.slice(0, 180) ?? null;

  const type = data.type ?? "apartment";
  const meta = {
    titleEn: data.titleEn,
    titleAr: data.titleAr,
    descriptionEn: descEn,
    descriptionAr: descAr,
    shortDescriptionEn: shortEn,
    shortDescriptionAr: shortAr,
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
  const pgFooters = { fr: PG_FOOTER_FR, en: PG_FOOTER_EN, ar: PG_FOOTER_AR };
  for (const [slug, data] of Object.entries(PG_UNITS)) {
    await writeFolder(slug, data, PEARL_GARDEN.baseAmenities, pgFooters);
  }
  // Gueliz + Villa are stand-alone — no shared footer.
  const emptyFooters = { fr: "", en: "", ar: "" };
  for (const [slug, data] of Object.entries(GUELIZ)) {
    await writeFolder(slug, data, null, emptyFooters);
  }
  for (const [slug, data] of Object.entries(VILLA)) {
    await writeFolder(slug, data, null, emptyFooters);
  }
  console.log("\nSeed complete. Now run: node scripts/bulk-import-properties.mjs --refresh");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
