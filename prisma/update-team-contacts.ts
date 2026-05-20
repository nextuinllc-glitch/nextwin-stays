// One-shot: set each founder's WhatsApp / phone / email + flip the
// site-wide Settings.email to contact@nextwin.ma now that email
// forwarding is live. Safe to re-run - just upserts the same values.

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type ContactUpdate = {
  slug: string;
  whatsapp: string;
  phone: string;
  email: string;
};

const UPDATES: ContactUpdate[] = [
  {
    slug: "abdou",
    whatsapp: "212668840398",
    phone: "+212 6 68 84 03 98",
    email: "abdou@nextwin.ma",
  },
  {
    slug: "ahmed",
    whatsapp: "212668840398",
    phone: "+212 6 68 84 03 98",
    email: "ahmed@nextwin.ma",
  },
  {
    slug: "simo",
    whatsapp: "212668770982",
    phone: "+212 6 68 77 09 82",
    email: "simo@nextwin.ma",
  },
];

async function main() {
  for (const u of UPDATES) {
    const existing = await prisma.teamMember.findUnique({ where: { slug: u.slug } });
    if (!existing) {
      console.log(`! skipped ${u.slug} (not found)`);
      continue;
    }
    await prisma.teamMember.update({
      where: { slug: u.slug },
      data: {
        whatsapp: u.whatsapp,
        phone: u.phone,
        email: u.email,
      },
    });
    console.log(`= ${u.slug}: whatsapp + phone + email updated`);
  }

  // Site-wide contact email - threaded into footer, contact page,
  // booking flows, OfficeMap, etc. via getContactSettings().
  await prisma.settings.upsert({
    where: { id: 1 },
    update: { email: "contact@nextwin.ma" },
    create: { id: 1, email: "contact@nextwin.ma" },
  });
  console.log("= Settings.email -> contact@nextwin.ma");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
