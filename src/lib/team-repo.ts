import { prisma } from "@/lib/db";

export type Lang = "fr" | "en" | "ar";

export type TeamSpecialty = "SHORT_STAY" | "RENT_LONG" | "SALE";

export type TeamMemberPublic = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  photoUrl: string | null;
  whatsapp: string | null;
  email: string | null;
  phone: string | null;
  specialty: TeamSpecialty | null;
  // All-language bundle so the client can re-render on locale switch
  // without a fresh fetch. FR is the guaranteed non-null field.
  i18n: {
    role: { fr: string; en: string | null; ar: string | null };
    bio: { fr: string; en: string | null; ar: string | null };
  };
};

function pickRole(row: { roleFr: string; roleEn: string | null; roleAr: string | null }, lang: Lang) {
  if (lang === "en") return row.roleEn ?? row.roleFr;
  if (lang === "ar") return row.roleAr ?? row.roleFr;
  return row.roleFr;
}

function pickBio(row: { bioFr: string; bioEn: string | null; bioAr: string | null }, lang: Lang) {
  if (lang === "en") return row.bioEn ?? row.bioFr;
  if (lang === "ar") return row.bioAr ?? row.bioFr;
  return row.bioFr;
}

export async function getPublishedTeam(lang: Lang = "fr"): Promise<TeamMemberPublic[]> {
  const rows = await prisma.teamMember.findMany({
    where: { published: true },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((row) => ({
    slug: row.slug,
    name: row.name,
    role: pickRole(row, lang),
    bio: pickBio(row, lang),
    photoUrl: row.photoUrl,
    whatsapp: row.whatsapp,
    email: row.email,
    phone: row.phone,
    // Cast around the Prisma client in case it hasn't fully regenerated yet.
    specialty: ((row as unknown as { specialty?: string | null }).specialty ?? null) as TeamSpecialty | null,
    i18n: {
      role: { fr: row.roleFr, en: row.roleEn, ar: row.roleAr },
      bio: { fr: row.bioFr, en: row.bioEn, ar: row.bioAr },
    },
  }));
}
