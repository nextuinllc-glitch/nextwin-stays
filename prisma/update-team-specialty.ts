// One-shot: assign each founder their listing-kind specialty and refresh
// the FR/EN/AR role label to match. Bios are left alone so the admin can
// keep their own copy edits. Safe to re-run.

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type Update = {
  slug: string;
  specialty: "SHORT_STAY" | "RENT_LONG" | "SALE";
  roleFr: string;
  roleEn: string;
  roleAr: string;
};

const UPDATES: Update[] = [
  {
    slug: "abdou",
    specialty: "RENT_LONG",
    roleFr: "Spécialiste · Long durée",
    roleEn: "Specialist · Long-term rentals",
    roleAr: "متخصص · الإيجار طويل الأمد",
  },
  {
    slug: "ahmed",
    specialty: "SHORT_STAY",
    roleFr: "Spécialiste · Court séjour",
    roleEn: "Specialist · Short stays",
    roleAr: "متخصص · الإقامة القصيرة",
  },
  {
    slug: "simo",
    specialty: "SALE",
    roleFr: "Spécialiste · Achat",
    roleEn: "Specialist · Sales",
    roleAr: "متخصص · المبيعات",
  },
];

async function main() {
  for (const u of UPDATES) {
    const existing = await prisma.teamMember.findUnique({ where: { slug: u.slug } });
    if (!existing) {
      console.log(`! skipped ${u.slug} (not found — run seed-team.ts first)`);
      continue;
    }
    await prisma.teamMember.update({
      where: { slug: u.slug },
      data: {
        specialty: u.specialty,
        roleFr: u.roleFr,
        roleEn: u.roleEn,
        roleAr: u.roleAr,
      },
    });
    console.log(`= updated ${u.slug} → ${u.specialty}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
