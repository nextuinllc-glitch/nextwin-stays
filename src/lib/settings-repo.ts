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
};

export async function getHeroSettings(): Promise<HeroSettings> {
  const s = await getSettings();
  return {
    posterImage: s.heroImage,
    videoDesktop: s.heroVideoDesktop,
    videoMobile: s.heroVideoMobile,
  };
}
