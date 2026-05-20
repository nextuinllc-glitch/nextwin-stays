// DB-backed property reads. Returns the Property shape the public components
// already expect, so admin edits flow straight into /properties, /properties/[slug],
// and the home grid without forcing a UI refactor.
import { cache } from "react";
import { prisma } from "./db";
import type { Property, PropertyType, ListingKind } from "./properties";

// PRE-LAUNCH: the SHORT_STAY catalogue ships with real bookable listings.
// SALE + RENT_LONG aren't ready yet, so for now every public read of those
// kinds gets a single placeholder image at /coming-soon.svg. Admin reads
// (raw prisma) are untouched - editors still see and manage the real images
// in /admin/acheter and /admin/louer. Flip COMING_SOON_NON_STAY to false
// once the buy/long-term inventory is photographed and ready.
const COMING_SOON_NON_STAY = true;
const COMING_SOON_PLACEHOLDER = {
  src: "/coming-soon.svg",
  alt: "Bientôt disponible",
};

type Lang = "fr" | "en" | "ar";

function fetchOne(slug: string) {
  return prisma.property.findUnique({
    where: { slug },
    include: { images: { orderBy: { position: "asc" } } },
  });
}

type PropertyRow = NonNullable<Awaited<ReturnType<typeof fetchOne>>>;

function pickTitle(p: PropertyRow, lang: Lang) {
  if (lang === "en") return p.titleEn ?? p.titleFr;
  if (lang === "ar") return p.titleAr ?? p.titleFr;
  return p.titleFr;
}
function pickShort(p: PropertyRow, lang: Lang) {
  if (lang === "en") return p.shortDescriptionEn ?? p.shortDescriptionFr ?? "";
  if (lang === "ar") return p.shortDescriptionAr ?? p.shortDescriptionFr ?? "";
  return p.shortDescriptionFr ?? "";
}
function pickDescription(p: PropertyRow, lang: Lang) {
  if (lang === "en") return p.descriptionEn ?? p.descriptionFr ?? "";
  if (lang === "ar") return p.descriptionAr ?? p.descriptionFr ?? "";
  return p.descriptionFr ?? "";
}

function rowToProperty(row: PropertyRow, lang: Lang = "fr"): Property {
  const location =
    row.latitude != null && row.longitude != null
      ? { lat: row.latitude, lng: row.longitude, radius: row.locationRadius ?? 200 }
      : null;
  const listingKind = ((row as unknown as { listingKind?: string | null }).listingKind ?? "SHORT_STAY") as ListingKind;
  // Per the pre-launch flag, SALE and RENT_LONG listings ship with a
  // single placeholder image instead of the real photos. SHORT_STAY
  // keeps the real carousel because those listings are bookable today.
  const useComingSoonImage =
    COMING_SOON_NON_STAY && (listingKind === "SALE" || listingKind === "RENT_LONG");
  const publicImages = useComingSoonImage
    ? [COMING_SOON_PLACEHOLDER]
    : row.images.map((i) => ({ src: i.src, alt: i.alt }));
  return {
    slug: row.slug,
    type: row.type as PropertyType,
    area: row.area,
    city: row.city,
    rating: row.rating,
    reviewCount: row.reviewCount,
    guests: row.guests,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    listingKind,
    pricePerNight: row.pricePerNight,
    monthlyRent: (row as unknown as { monthlyRent?: number | null }).monthlyRent ?? null,
    salePrice: (row as unknown as { salePrice?: number | null }).salePrice ?? null,
    surfaceM2: (row as unknown as { surfaceM2?: number | null }).surfaceM2 ?? null,
    currency: row.currency as "EUR" | "MAD",
    // Real-estate structured fields - all optional, all nullable.
    // Cast around the Prisma client in case it hasn't regenerated yet.
    landSurfaceM2:   (row as unknown as { landSurfaceM2?:   number | null }).landSurfaceM2   ?? null,
    floor:           (row as unknown as { floor?:           number | null }).floor           ?? null,
    totalFloors:     (row as unknown as { totalFloors?:     number | null }).totalFloors     ?? null,
    yearBuilt:       (row as unknown as { yearBuilt?:       number | null }).yearBuilt       ?? null,
    condition:       (row as unknown as { condition?:       string | null }).condition       ?? null,
    standing:        (row as unknown as { standing?:        string | null }).standing        ?? null,
    orientation:     (row as unknown as { orientation?:     string | null }).orientation     ?? null,
    furnished:       (row as unknown as { furnished?:       boolean | null }).furnished      ?? null,
    parkingSpaces:   (row as unknown as { parkingSpaces?:   number | null }).parkingSpaces   ?? null,
    landStatus:      (row as unknown as { landStatus?:      string | null }).landStatus      ?? null,
    landZoning:      (row as unknown as { landZoning?:      string | null }).landZoning      ?? null,
    securityDeposit: (row as unknown as { securityDeposit?: number | null }).securityDeposit ?? null,
    monthlyCharges:  (row as unknown as { monthlyCharges?:  number | null }).monthlyCharges  ?? null,
    agencyFeeMonths: (row as unknown as { agencyFeeMonths?: number | null }).agencyFeeMonths ?? null,
    ceilingHeight:   (row as unknown as { ceilingHeight?:   number | null }).ceilingHeight   ?? null,
    salons:           (row as unknown as { salons?:           number | null }).salons           ?? null,
    apartmentSubtype: (row as unknown as { apartmentSubtype?: string | null }).apartmentSubtype ?? null,
    availability:     (row as unknown as { availability?:     string | null }).availability     ?? null,
    title: pickTitle(row, lang),
    shortDescription: pickShort(row, lang),
    description: pickDescription(row, lang),
    // All-language bundle — clients read this directly via `useI18n()`
    // to render the user's locale without a re-fetch. FR is the only
    // guaranteed-non-null field; EN / AR fall back to FR at the
    // consuming site if missing.
    i18n: {
      title: {
        fr: row.titleFr,
        en: row.titleEn,
        ar: row.titleAr,
      },
      shortDescription: {
        fr: row.shortDescriptionFr ?? "",
        en: row.shortDescriptionEn,
        ar: row.shortDescriptionAr,
      },
      description: {
        fr: row.descriptionFr ?? "",
        en: row.descriptionEn,
        ar: row.descriptionAr,
      },
    },
    amenities: safeJsonArray(row.amenitiesJson),
    highlights: safeJsonArray(row.highlightsJson),
    images: publicImages,
    host: { name: row.hostName, yearsHosting: row.hostYears },
    location,
    rules: {
      checkIn: row.ruleCheckIn,
      checkOut: row.ruleCheckOut,
      pets: row.rulePets,
      smoking: row.ruleSmoking,
      additional: row.ruleAdditional ?? null,
    },
    minNights: row.minNights ?? 1,
  };
}

// Public read for the inline "Jours disponibles" widget. Returns the date
// ranges that are NOT bookable on the public page (existing reservations
// in any blocking status).
export async function getPropertyBlockedRanges(slug: string) {
  const property = await prisma.property.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!property) return [];
  const rows = await prisma.reservation.findMany({
    where: {
      propertyId: property.id,
      status: { in: ["PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED"] },
      // Future + currently active stays only — past completed bookings
      // don't need to be marked on the calendar.
      checkOut: { gte: new Date() },
    },
    select: { checkIn: true, checkOut: true },
    orderBy: { checkIn: "asc" },
  });
  return rows.map((r) => ({
    start: r.checkIn.toISOString(),
    end: r.checkOut.toISOString(),
  }));
}

function safeJsonArray(s: string | null | undefined): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export async function getPublishedProperties(opts?: {
  type?: PropertyType;
  guests?: number;
  listingKind?: ListingKind;
  lang?: Lang;
}): Promise<Property[]> {
  const where: Record<string, unknown> = { published: true };
  if (opts?.type) where.type = opts.type;
  if (opts?.guests) where.guests = { gte: opts.guests };
  if (opts?.listingKind) where.listingKind = opts.listingKind;

  const rows = await prisma.property.findMany({
    where,
    orderBy: [{ position: "asc" }, { reviewCount: "desc" }, { createdAt: "desc" }],
    include: { images: { orderBy: { position: "asc" } } },
  });

  return rows.map((row) => rowToProperty(row, opts?.lang ?? "fr"));
}

/**
 * Count published properties grouped by listing kind. Used to render the
 * "Acheter (12) / Louer (8) / Court-séjour (10)" tab badges on the top-level
 * navigation pills.
 */
export async function getListingKindCounts(): Promise<{
  all: number;
  SHORT_STAY: number;
  RENT_LONG: number;
  SALE: number;
}> {
  const groups = await prisma.property.groupBy({
    by: ["listingKind"],
    where: { published: true },
    _count: { _all: true },
  });
  const counts = { all: 0, SHORT_STAY: 0, RENT_LONG: 0, SALE: 0 };
  for (const g of groups) {
    counts.all += g._count._all;
    const k = g.listingKind as keyof typeof counts;
    if (k in counts) counts[k] = g._count._all;
  }
  return counts;
}

// React.cache dedupes within a single request so generateMetadata + the
// page itself + any nested server component asking for the same property
// only hit the DB once. Used to be the biggest single contributor to
// detail-page TTFB.
export const getPropertyBySlug = cache(async function getPropertyBySlug(
  slug: string,
  lang: Lang = "fr",
): Promise<Property | null> {
  const row = await fetchOne(slug);
  if (!row) return null;
  if (!row.published) return null;
  return rowToProperty(row, lang);
});

export async function getAllPropertySlugs(): Promise<string[]> {
  const rows = await prisma.property.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

export async function getPropertyTypeCounts(opts?: { listingKind?: ListingKind }) {
  const where: Record<string, unknown> = { published: true };
  if (opts?.listingKind) where.listingKind = opts.listingKind;

  const groups = await prisma.property.groupBy({
    by: ["type"],
    where,
    _count: { _all: true },
  });
  const counts = {
    all: 0,
    villa: 0,
    riad: 0,
    apartment: 0,
    terrain: 0,
    bureau: 0,
    magasin: 0,
    commercial: 0,
  };
  for (const g of groups) {
    counts.all += g._count._all;
    if (g.type in counts) {
      counts[g.type as keyof typeof counts] = g._count._all;
    }
  }
  return counts;
}
