// DB-backed property reads. Returns the Property shape the public components
// already expect, so admin edits flow straight into /properties, /properties/[slug],
// and the home grid without forcing a UI refactor.
import { prisma } from "./db";
import type { Property, PropertyType } from "./properties";

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
    pricePerNight: row.pricePerNight,
    currency: row.currency as "EUR",
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
    images: row.images.map((i) => ({ src: i.src, alt: i.alt })),
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
  lang?: Lang;
}): Promise<Property[]> {
  const where: Record<string, unknown> = { published: true };
  if (opts?.type) where.type = opts.type;
  if (opts?.guests) where.guests = { gte: opts.guests };

  const rows = await prisma.property.findMany({
    where,
    orderBy: [{ position: "asc" }, { reviewCount: "desc" }, { createdAt: "desc" }],
    include: { images: { orderBy: { position: "asc" } } },
  });

  return rows.map((row) => rowToProperty(row, opts?.lang ?? "fr"));
}

export async function getPropertyBySlug(slug: string, lang: Lang = "fr"): Promise<Property | null> {
  const row = await fetchOne(slug);
  if (!row) return null;
  if (!row.published) return null;
  return rowToProperty(row, lang);
}

export async function getAllPropertySlugs(): Promise<string[]> {
  const rows = await prisma.property.findMany({
    where: { published: true },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}

export async function getPropertyTypeCounts() {
  const groups = await prisma.property.groupBy({
    by: ["type"],
    where: { published: true },
    _count: { _all: true },
  });
  const counts = { all: 0, villa: 0, riad: 0, apartment: 0 };
  for (const g of groups) {
    counts.all += g._count._all;
    if (g.type === "villa" || g.type === "riad" || g.type === "apartment") {
      counts[g.type] = g._count._all;
    }
  }
  return counts;
}
