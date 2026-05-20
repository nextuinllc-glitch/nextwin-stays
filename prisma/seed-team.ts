// One-shot seed for the founding team. Inserts Abdou, Simo, Ahmed if
// their slugs don't exist yet; otherwise leaves their current bios /
// photos alone (so re-running this script never overwrites edits the
// admin made in the panel). Safe to re-run.

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type Seed = {
  slug: string;
  name: string;
  roleFr: string;
  roleEn: string;
  roleAr: string;
  bioFr: string;
  bioEn: string;
  bioAr: string;
  position: number;
};

const TEAM: Seed[] = [
  {
    slug: "abdou",
    name: "Abdou",
    roleFr: "Fondateur, conseil & sélection",
    roleEn: "Founder, advisory & curation",
    roleAr: "المؤسس، الاستشارة والاختيار",
    bioFr:
      "Abdou pilote Nextwin et accompagne chaque client de bout en bout, de la première visite à la signature. Né et grandi à Marrakech, il connaît chaque quartier et négocie au prix juste.",
    bioEn:
      "Abdou leads Nextwin and walks every client from first viewing to the signature. Born and raised in Marrakech, he knows every neighbourhood and negotiates at the right price.",
    bioAr:
      "يدير عبدو شركة Nextwin ويرافق كل عميل من المعاينة الأولى حتى التوقيع. ولد ونشأ في مراكش، يعرف كل حي ويفاوض على السعر العادل.",
    position: 0,
  },
  {
    slug: "simo",
    name: "Simo",
    roleFr: "Cofondateur, ventes & investissement",
    roleEn: "Co-founder, sales & investment",
    roleAr: "الشريك المؤسس، المبيعات والاستثمار",
    bioFr:
      "Simo structure les dossiers de vente et accompagne les investisseurs marocains et internationaux. Son réseau notaires-banques fluidifie chaque transaction.",
    bioEn:
      "Simo structures sale files and supports Moroccan and international investors. His notary and banking network smooths every transaction.",
    bioAr:
      "يهيكل سيمو ملفات البيع ويرافق المستثمرين المغاربة والدوليين. تجعل شبكته من الموثقين والبنوك كل معاملة سلسة.",
    position: 1,
  },
  {
    slug: "ahmed",
    name: "Ahmed",
    roleFr: "Court séjour & marketing digital",
    roleEn: "Short stay & digital marketing",
    roleAr: "الإقامة القصيرة والتسويق الرقمي",
    bioFr:
      "Ahmed gère la mise en ligne de nos biens en court séjour (Airbnb, Booking, réseaux sociaux) et veille à ce que chaque annonce capte l'attention des bons voyageurs.",
    bioEn:
      "Ahmed manages our short-stay listings (Airbnb, Booking, social media) and makes sure every page catches the right traveller's eye.",
    bioAr:
      "يدير أحمد إعلانات الإقامة القصيرة (Airbnb وBooking ومنصات التواصل) ويتأكد من أن كل صفحة تلفت انتباه المسافرين المناسبين.",
    position: 2,
  },
];

async function main() {
  for (const t of TEAM) {
    const existing = await prisma.teamMember.findUnique({ where: { slug: t.slug } });
    if (existing) {
      // Only refresh the position so the order stays stable; leave the
      // rest alone (admin may have edited bios / uploaded photos).
      await prisma.teamMember.update({
        where: { slug: t.slug },
        data: { position: t.position },
      });
      console.log(`= kept  ${t.slug} (position refreshed)`);
      continue;
    }
    await prisma.teamMember.create({
      data: {
        slug: t.slug,
        name: t.name,
        roleFr: t.roleFr,
        roleEn: t.roleEn,
        roleAr: t.roleAr,
        bioFr: t.bioFr,
        bioEn: t.bioEn,
        bioAr: t.bioAr,
        position: t.position,
        published: true,
      },
    });
    console.log(`+ added ${t.slug}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
