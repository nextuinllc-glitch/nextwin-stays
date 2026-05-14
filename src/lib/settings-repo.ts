import { prisma } from "@/lib/db";

// Single-row settings table — id is always 1. We `upsert` on read so the
// public site never crashes if seeding hasn't run yet, and so the admin
// panel always has a row to PATCH against.
export async function getSettings() {
  return prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}

// Slim subset shipped to the client Hero — keeps the prop surface tight
// and avoids leaking unrelated fields (fees, contact info, etc.).
export type HeroSettings = {
  posterImage: string;
  videoDesktop: string | null;
  videoMobile: string | null;
  videoPosterDesktop: string | null;
  videoPosterMobile: string | null;
  // Per-locale subtitle copy. Empty strings mean "fall back to the
  // i18n dictionary default" — that's the convention the client side
  // uses when picking which value to render.
  subtitle: { fr: string; en: string; ar: string };
  // Per-locale editorial dateline (the small tracked label flanked by
  // hairline rules under the wordmark). Empty string per locale hides
  // the line for that locale.
  tagline: { fr: string; en: string; ar: string };
};

export async function getHeroSettings(): Promise<HeroSettings> {
  const s = await getSettings();
  return {
    posterImage: s.heroImage,
    videoDesktop: s.heroVideoDesktop,
    videoMobile: s.heroVideoMobile,
    videoPosterDesktop: s.heroPosterDesktop,
    videoPosterMobile: s.heroPosterMobile,
    subtitle: {
      fr: s.heroSubtitleFr,
      en: s.heroSubtitleEn,
      ar: s.heroSubtitleAr,
    },
    tagline: {
      fr: s.heroTaglineFr,
      en: s.heroTaglineEn,
      ar: s.heroTaglineAr,
    },
  };
}

// Fee config consumed by the booking widget + checkout summary. Lives
// on the single Settings row so the admin can edit it from the Settings
// page — every property uses the same fees site-wide.
export type FeeSettings = {
  cleaningFee: number;
  serviceFeeRate: number;
};

export async function getFeeSettings(): Promise<FeeSettings> {
  const s = await getSettings();
  return {
    cleaningFee: s.cleaningFee ?? 0,
    serviceFeeRate: s.serviceFeeRate ?? 0,
  };
}

// Contact info threaded into Footer / ContactContent / BookingWidget /
// CheckoutForm so the admin can change the WhatsApp number, email,
// phone, and address in one place and have every public surface pick
// up the new values on the next build.
export type ContactSettings = {
  whatsappNumber: string;
  whatsappDigits: string;
  whatsappHref: string;
  phone: string;
  phoneHref: string;
  email: string;
  mailtoHref: string;
  addressLine: string;
};

// Pretty-print a phone number with French spacing — "+212 6 00 00 00 00".
// Falls back to the raw value if the format isn't what we expect, so a
// custom format the admin types in stays intact.
function formatPhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  // "+212XYYYYYYYY" → "+212 X YY YY YY YY"
  const m = digits.match(/^(\+\d{1,3})(\d)(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (m) return `${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]} ${m[6]}`;
  return raw;
}

export async function getContactSettings(): Promise<ContactSettings> {
  const s = await getSettings();
  const whatsappDigits = s.whatsappNumber.replace(/[^\d]/g, "");
  return {
    whatsappNumber: s.whatsappNumber,
    whatsappDigits,
    whatsappHref: `https://wa.me/${whatsappDigits}`,
    phone: formatPhone(s.phone),
    phoneHref: `tel:${s.phone.replace(/[^\d+]/g, "")}`,
    email: s.email,
    mailtoHref: `mailto:${s.email}`,
    addressLine: s.addressLine,
  };
}
