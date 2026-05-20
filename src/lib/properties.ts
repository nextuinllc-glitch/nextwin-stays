export type PropertyType =
  | "riad"
  | "villa"
  | "apartment"
  | "terrain"
  | "bureau"      // office / plateau de bureaux (covers any office floor, big or small)
  | "magasin"     // shop / retail unit
  | "commercial"; // legacy catch-all, kept for back-compat with seeded rows

// Listing kind — drives both the public flow (booking vs. inquiry) and which
// price field is canonical. Stored as a plain string in the DB for flexibility.
//   "SHORT_STAY" : nightly rental, uses pricePerNight + Reservation calendar
//   "RENT_LONG"  : monthly long-term lease, uses monthlyRent + inquiry form
//   "SALE"       : property for sale, uses salePrice + inquiry form
export type ListingKind = "SHORT_STAY" | "RENT_LONG" | "SALE";

export const LISTING_KINDS: ListingKind[] = ["SHORT_STAY", "RENT_LONG", "SALE"];

// Localised string bundle — { fr, en, ar } per textual field. Server
// resolves a sensible default (locale-resolved string) into the top-level
// `title`/`description`/`shortDescription` fields; client components that
// know the active locale can read from `i18n.*[locale]` instead with FR
// fallback when a translation is missing.
type LocalizedString = { fr: string; en: string | null; ar: string | null };

export type Property = {
  slug: string;
  title: string;
  type: PropertyType;
  area: string; // e.g. "Medina", "Palmeraie"
  city: string;
  rating: number;
  reviewCount: number;
  guests: number;
  bedrooms: number;
  bathrooms: number;

  // Listing kind. Determines which price field is the canonical one and
  // which public flow the property uses (booking calendar vs. inquiry).
  // Optional on the TS type so the legacy seed array doesn't need to be
  // exhaustively annotated; the DB column defaults to "SHORT_STAY" and the
  // repo always returns a value.
  listingKind?: ListingKind;

  pricePerNight: number;          // SHORT_STAY: nightly rate, minor units (cents)
  monthlyRent?: number | null;    // RENT_LONG : monthly rent, minor units
  salePrice?: number | null;      // SALE      : total sale price, minor units
  surfaceM2?: number | null;      // "Surface habitable" - built/living area (m²)
  currency: "EUR" | "MAD";

  // -------- Real-estate structured fields (SALE / RENT_LONG) --------
  landSurfaceM2?: number | null;     // Surface terrain (villas, terrains)
  floor?: number | null;             // Étage du bien (apt, bureau, magasin)
  totalFloors?: number | null;       // Total floors of the building (apt)
  yearBuilt?: number | null;         // Année de construction
  condition?: string | null;         // "Neuf" | "Bon état" | "À rénover" | "Jamais habité"
  standing?: string | null;          // "Haut standing" | "Standing moyen" | "Économique"
  orientation?: string | null;       // "Sud", "Sud-Est", etc.
  furnished?: boolean | null;        // Meublé / Non meublé
  parkingSpaces?: number | null;     // Places de parking
  // Terrain-only
  landStatus?: string | null;        // Titré / En cours / Réquisition / Non titré
  landZoning?: string | null;        // Constructible R+1, Lot de villa, etc.
  // Rental-only (RENT_LONG)
  securityDeposit?: number | null;   // Caution, en mois
  monthlyCharges?: number | null;    // Charges syndic mensuelles (minor units)
  agencyFeeMonths?: number | null;   // Frais d'agence en mois
  // Commercial (bureau / magasin)
  ceilingHeight?: number | null;     // Hauteur sous plafond (m)
  // Three universal extras from Avito
  salons?: number | null;            // Nombre de salons
  apartmentSubtype?: string | null;  // Studio / Duplex / Triplex / Loft / Standard
  availability?: string | null;      // "Immédiate" or a date string
  shortDescription: string;
  description: string;
  // All-language variants for client-side locale switching. The server
  // pre-resolves the default (FR) into the flat fields above so SSR is
  // never blank; client re-renders with `i18n.*[locale]` once the
  // I18nProvider mounts and reports the user's preferred locale.
  // Optional because the legacy static `PROPERTIES` array below doesn't
  // carry per-language strings — it's only used as seed data, never
  // shipped to the public site at runtime.
  i18n?: {
    title: LocalizedString;
    shortDescription: LocalizedString;
    description: LocalizedString;
  };
  amenities: string[];
  highlights: string[];
  images: { src: string; alt: string }[];
  host: {
    name: string;
    yearsHosting: number;
  };
  // Privacy-preserving location: only set in admin once geocoded; the public
  // site renders a fuzzy zone circle of `locationRadius` metres instead of
  // an exact pin. null = map section omitted from the page.
  location?: {
    lat: number;
    lng: number;
    radius: number;
  } | null;
  rules?: {
    checkIn: string;
    checkOut: string;
    pets: string;
    smoking: string;
    additional?: string | null;
  };
  // Minimum number of nights the booking calendar will accept. Defaults
  // to 1 if a row doesn't set it. Threaded into <DateRangeCalendar
  // minNights={…} /> on the property + reserve pages so a too-short
  // range can't be selected visually.
  minNights?: number;
};

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const PROPERTIES: Property[] = [
  {
    slug: "riad-jardin-secret",
    title: "Hidden Garden Riad with Pool",
    type: "riad",
    area: "Medina",
    city: "Marrakech",
    rating: 4.92,
    reviewCount: 184,
    guests: 8,
    bedrooms: 4,
    bathrooms: 4,
    pricePerNight: 240,
    currency: "EUR",
    shortDescription: "Classic riad with plunge pool, palm courtyard, and panoramic rooftop.",
    description:
      "A tranquil four-bedroom riad tucked behind a dusty Medina door. The central courtyard wraps around a turquoise plunge pool, with citrus trees, lanterns, and zellige tilework. Mornings are for mint tea on the rooftop; evenings end with the sound of the muezzin and the glow of the Atlas mountains.",
    amenities: [
      "Private pool",
      "Air conditioning",
      "Wi-Fi (fiber)",
      "Full kitchen",
      "Rooftop terrace",
      "Daily housekeeping",
      "Hammam access",
      "Concierge",
    ],
    highlights: [
      "Two minutes on foot to Jemaa el-Fnaa",
      "Architect-renovated in 2023",
      "Sleeps 8 across 4 ensuite bedrooms",
    ],
    images: [
      { src: u("photo-1564501049412-61c2a3083791"), alt: "Riad courtyard with plunge pool" },
      { src: u("photo-1582719478250-c89cae4dc85b"), alt: "Riad rooftop terrace at sunset" },
      { src: u("photo-1505691938895-1758d7feb511"), alt: "Bedroom with carved wood headboard" },
      { src: u("photo-1568084680786-a84f91d1153c"), alt: "Hammam with stone basin" },
      { src: u("photo-1540541338287-41700207dee6"), alt: "Living lounge with Berber rugs" },
    ],
    host: { name: "Yasmine", yearsHosting: 6 },
  },
  {
    slug: "villa-palmeraie-oasis",
    title: "Palmeraie Villa with Heated Pool",
    type: "villa",
    area: "Palmeraie",
    city: "Marrakech",
    rating: 4.88,
    reviewCount: 142,
    guests: 12,
    bedrooms: 5,
    bathrooms: 5,
    pricePerNight: 480,
    currency: "EUR",
    shortDescription: "Sprawling villa, heated pool, palm gardens, full chef service available.",
    description:
      "A serene five-bedroom villa surrounded by date palms, twenty minutes from the Medina. Heated pool, sun loungers, and a wide outdoor lounge built for long lunches. Every bedroom is ensuite with garden views; an optional chef can prepare Moroccan tasting menus on request.",
    amenities: [
      "Heated pool",
      "Garden",
      "Air conditioning",
      "Wi-Fi (fiber)",
      "Full kitchen",
      "BBQ",
      "Free parking",
      "Optional chef",
    ],
    highlights: [
      "5,000 m² of private grounds",
      "Heated pool, year-round swimming",
      "Optional chef and breakfast service",
    ],
    images: [
      { src: u("photo-1613490493576-7fde63acd811"), alt: "Villa pool at golden hour" },
      { src: u("photo-1600585154340-be6161a56a0c"), alt: "Modern living room with skylight" },
      { src: u("photo-1600596542815-ffad4c1539a9"), alt: "Master bedroom with garden view" },
      { src: u("photo-1598928506311-c55ded91a20c"), alt: "Outdoor lounge with day beds" },
      { src: u("photo-1618221195710-dd6b41faaea6"), alt: "Open-plan kitchen" },
    ],
    host: { name: "Karim", yearsHosting: 9 },
  },
  {
    slug: "gueliz-modern-loft",
    title: "Designer Loft in Gueliz",
    type: "apartment",
    area: "Gueliz",
    city: "Marrakech",
    rating: 4.81,
    reviewCount: 96,
    guests: 4,
    bedrooms: 2,
    bathrooms: 2,
    pricePerNight: 130,
    currency: "EUR",
    shortDescription: "Bright two-bed loft, walk to galleries, restaurants, and the Majorelle.",
    description:
      "A light-filled two-bedroom loft on a quiet Gueliz street. Polished concrete floors, vintage Berber rugs, and a working kitchen built for slow mornings. A short walk to Yves Saint Laurent's Jardin Majorelle, the city's best contemporary galleries, and a long list of dinner spots.",
    amenities: [
      "Air conditioning",
      "Wi-Fi (fiber)",
      "Full kitchen",
      "Washer",
      "Workspace",
      "Elevator",
      "Self check-in",
    ],
    highlights: [
      "Walk to Jardin Majorelle in 8 minutes",
      "Quiet residential street",
      "Designer-renovated in 2024",
    ],
    images: [
      { src: u("photo-1502672260266-1c1ef2d93688"), alt: "Loft living area with natural light" },
      { src: u("photo-1560448204-e02f11c3d0e2"), alt: "Bedroom with linen bedding" },
      { src: u("photo-1493809842364-78817add7ffb"), alt: "Open kitchen with marble counter" },
      { src: u("photo-1556909114-f6e7ad7d3136"), alt: "Workspace nook" },
      { src: u("photo-1522708323590-d24dbb6b0267"), alt: "Bathroom with rainfall shower" },
    ],
    host: { name: "Imane", yearsHosting: 4 },
  },
  {
    slug: "riad-medina-rooftop",
    title: "Rooftop Riad near the Souks",
    type: "riad",
    area: "Medina",
    city: "Marrakech",
    rating: 4.95,
    reviewCount: 211,
    guests: 6,
    bedrooms: 3,
    bathrooms: 3,
    pricePerNight: 195,
    currency: "EUR",
    shortDescription: "Three-bed riad with a vast rooftop, plunge pool, and Atlas views.",
    description:
      "A three-bedroom riad with one of the largest private rooftops in the Medina — long enough for a yoga mat at sunrise and a dinner table for ten at dusk. The courtyard pool is surrounded by hand-cut zellige; bedrooms are quiet, with thick traditional walls.",
    amenities: [
      "Plunge pool",
      "Rooftop terrace",
      "Air conditioning",
      "Wi-Fi",
      "Breakfast included",
      "Concierge",
      "Hammam access",
    ],
    highlights: [
      "Largest rooftop on the block",
      "Breakfast included daily",
      "Sunrise yoga setup available",
    ],
    images: [
      { src: u("photo-1551882547-ff40c63fe5fa"), alt: "Riad rooftop with day beds" },
      { src: u("photo-1540541338287-41700207dee6"), alt: "Tiled courtyard with arches" },
      { src: u("photo-1505691938895-1758d7feb511"), alt: "Bedroom with carved doors" },
      { src: u("photo-1582719508461-905c673771fd"), alt: "Breakfast spread on rooftop" },
      { src: u("photo-1576675784201-0e142b423952"), alt: "Lantern-lit lounge at night" },
    ],
    host: { name: "Hicham", yearsHosting: 11 },
  },
  {
    slug: "villa-atlas-views",
    title: "Atlas-View Villa with Tennis Court",
    type: "villa",
    area: "Route de l'Ourika",
    city: "Marrakech",
    rating: 4.79,
    reviewCount: 87,
    guests: 14,
    bedrooms: 6,
    bathrooms: 6,
    pricePerNight: 620,
    currency: "EUR",
    shortDescription: "Six-bed villa with infinity pool, tennis court, and Atlas-mountain views.",
    description:
      "A six-bedroom estate facing the High Atlas, twenty-five minutes from central Marrakech. Infinity pool, hard-court tennis, olive grove, and a generous shaded terrace for outdoor dining. Built for groups, weddings, and long family weeks.",
    amenities: [
      "Infinity pool",
      "Tennis court",
      "Garden",
      "Air conditioning",
      "Wi-Fi",
      "Full kitchen",
      "Free parking",
      "Optional chef",
    ],
    highlights: [
      "Direct Atlas-mountain view",
      "Hard-court tennis",
      "Sleeps 14 across 6 ensuite rooms",
    ],
    images: [
      { src: u("photo-1499793983690-e29da59ef1c2"), alt: "Infinity pool with mountain view" },
      { src: u("photo-1600607687939-ce8a6c25118c"), alt: "Open lounge with high ceilings" },
      { src: u("photo-1600210492493-0946911123ea"), alt: "Bedroom with terrace" },
      { src: u("photo-1600585154526-990dced4db0d"), alt: "Outdoor dining terrace" },
      { src: u("photo-1571508601891-ca5e7a713859"), alt: "Tennis court at golden hour" },
    ],
    host: { name: "Rachid", yearsHosting: 8 },
  },
  {
    slug: "kasbah-style-apartment",
    title: "Kasbah-Style Apartment with Terrace",
    type: "apartment",
    area: "Kasbah",
    city: "Marrakech",
    rating: 4.74,
    reviewCount: 64,
    guests: 3,
    bedrooms: 1,
    bathrooms: 1,
    pricePerNight: 95,
    currency: "EUR",
    shortDescription: "Cozy one-bed apartment with private terrace, walk to the Royal Palace.",
    description:
      "A characterful one-bedroom apartment in a restored Kasbah building. Tadelakt walls, a small private terrace with city views, and a kitchen big enough to cook breakfast. A few quiet streets from the Royal Palace and the Saadian Tombs.",
    amenities: [
      "Private terrace",
      "Air conditioning",
      "Wi-Fi",
      "Kitchen",
      "Self check-in",
      "Washer",
    ],
    highlights: [
      "Walk to Royal Palace",
      "Private terrace",
      "Restored 18th-century building",
    ],
    images: [
      { src: u("photo-1505693416388-ac5ce068fe85"), alt: "Tadelakt living room" },
      { src: u("photo-1501183638710-841dd1904471"), alt: "Bedroom with arched window" },
      { src: u("photo-1556020685-ae41abfc9365"), alt: "Compact kitchen" },
      { src: u("photo-1568605114967-8130f3a36994"), alt: "Private terrace at dusk" },
      { src: u("photo-1522708323590-d24dbb6b0267"), alt: "Bathroom with rainfall shower" },
    ],
    host: { name: "Salima", yearsHosting: 3 },
  },
  {
    slug: "riad-citrus-courtyard",
    title: "Citrus-Courtyard Riad",
    type: "riad",
    area: "Medina",
    city: "Marrakech",
    rating: 4.86,
    reviewCount: 158,
    guests: 6,
    bedrooms: 3,
    bathrooms: 3,
    pricePerNight: 175,
    currency: "EUR",
    shortDescription: "Boutique riad with orange-tree courtyard and a small splash pool.",
    description:
      "A relaxed three-bedroom riad anchored by a square courtyard planted with orange trees. A small splash pool, a quiet salon for reading, and a rooftop with two daybeds. Good for couples traveling together or a small family.",
    amenities: [
      "Splash pool",
      "Rooftop terrace",
      "Air conditioning",
      "Wi-Fi",
      "Breakfast included",
      "Concierge",
    ],
    highlights: [
      "Orange-tree courtyard",
      "Hosted breakfast daily",
      "Walk to Le Jardin Secret",
    ],
    images: [
      { src: u("photo-1542314831-068cd1dbfeeb"), alt: "Citrus courtyard" },
      { src: u("photo-1564501049412-61c2a3083791"), alt: "Splash pool with arches" },
      { src: u("photo-1505691938895-1758d7feb511"), alt: "Riad bedroom" },
      { src: u("photo-1551882547-ff40c63fe5fa"), alt: "Daybeds on rooftop" },
      { src: u("photo-1556909114-f6e7ad7d3136"), alt: "Reading salon with lanterns" },
    ],
    host: { name: "Nadia", yearsHosting: 7 },
  },
  {
    slug: "villa-bohemian-retreat",
    title: "Bohemian Retreat with Hammam",
    type: "villa",
    area: "Sidi Abdallah Ghiat",
    city: "Marrakech",
    rating: 4.83,
    reviewCount: 72,
    guests: 10,
    bedrooms: 5,
    bathrooms: 5,
    pricePerNight: 360,
    currency: "EUR",
    shortDescription: "Five-bed villa with hammam, salt-water pool, and a long garden table.",
    description:
      "A laid-back five-bedroom villa fifteen minutes from Marrakech. Salt-water pool, on-site hammam, vegetable garden, and a long communal table that comfortably seats twelve. The kind of place where a weekend stretches into a week.",
    amenities: [
      "Salt-water pool",
      "Hammam",
      "Vegetable garden",
      "Air conditioning",
      "Wi-Fi",
      "Full kitchen",
      "Free parking",
    ],
    highlights: [
      "On-site hammam",
      "Salt-water pool",
      "Long table for 12",
    ],
    images: [
      { src: u("photo-1582610116397-edb318620f90"), alt: "Salt-water pool" },
      { src: u("photo-1600596542815-ffad4c1539a9"), alt: "Open lounge with sofas" },
      { src: u("photo-1582719478250-c89cae4dc85b"), alt: "Hammam with candles" },
      { src: u("photo-1600585154526-990dced4db0d"), alt: "Garden dining table" },
      { src: u("photo-1505691938895-1758d7feb511"), alt: "Master bedroom with linen drapes" },
    ],
    host: { name: "Othmane", yearsHosting: 5 },
  },
];

export function getProperty(slug: string) {
  return PROPERTIES.find((p) => p.slug === slug);
}

export function getProperties(filter?: { type?: PropertyType }) {
  if (!filter?.type) return PROPERTIES;
  return PROPERTIES.filter((p) => p.type === filter.type);
}

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  riad: "Riad",
  villa: "Villa",
  apartment: "Apartment",
  terrain: "Terrain",
  bureau: "Bureau",
  magasin: "Magasin",
  commercial: "Commercial",
};

// Airbnb / Menara-style neutral badges — solid ink with white text, same
// chip for every type. Type is signalled by the label itself, not by
// colour, so the cards stay calm and the magenta CTA stays the single
// attention-grabbing accent on the page.
export const PROPERTY_TYPE_BADGE_CLASS: Record<PropertyType, string> = {
  villa: "bg-ink text-white",
  apartment: "bg-ink text-white",
  riad: "bg-ink text-white",
  terrain: "bg-ink text-white",
  bureau: "bg-ink text-white",
  magasin: "bg-ink text-white",
  commercial: "bg-ink text-white",
};
