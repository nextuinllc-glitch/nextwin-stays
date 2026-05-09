// Publishes the 12 WhatsApp-imported drafts so they appear on the public
// site immediately. Sets sensible type-based default prices and seeds a
// type-matched Unsplash placeholder photo for each — admin replaces with
// the real photos via /admin/properties/[id] when ready.
//
// Idempotent — re-running re-applies defaults and re-seeds the placeholder
// image set. Properties that already have admin-uploaded images are left
// alone (we only seed placeholders when the row has zero images).
//
// Run:  npx tsx prisma/scripts/publish-catalog.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Default nightly rate per type — "okay enough until admin sets the real
// number" rather than a real market rate. Listed in EUR to match the rest
// of the site. The admin sees these on /admin/properties and can edit
// each one before customers actually book.
const DEFAULT_PRICE: Record<string, number> = {
  apartment: 95,
  villa: 350,
  riad: 180,
};

// Type-matched Unsplash placeholder photos. Three per type so the gallery
// has enough variety to look real, but every alt text is prefixed with
// "PLACEHOLDER —" so an admin scanning the property editor knows to
// replace them. URLs use the same Unsplash size params as the seed.
const STOCK = {
  apartment: [
    {
      src: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2000&q=80",
      alt: "PLACEHOLDER — Salon moderne avec canapé d'angle",
    },
    {
      src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=2000&q=80",
      alt: "PLACEHOLDER — Cuisine ouverte design",
    },
    {
      src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=2000&q=80",
      alt: "PLACEHOLDER — Chambre élégante avec lit double",
    },
  ],
  villa: [
    {
      src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=2000&q=80",
      alt: "PLACEHOLDER — Villa avec piscine au coucher du soleil",
    },
    {
      src: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2000&q=80",
      alt: "PLACEHOLDER — Salon spacieux d'une villa",
    },
    {
      src: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=2000&q=80",
      alt: "PLACEHOLDER — Piscine privée et jardin",
    },
  ],
  riad: [
    {
      src: "https://images.unsplash.com/photo-1577003811926-53b288a6e5d0?auto=format&fit=crop&w=2000&q=80",
      alt: "PLACEHOLDER — Patio de riad avec fontaine",
    },
  ],
};

// Slugs created by the WhatsApp importer. Anything not in this list is
// untouched — the original 8 seed properties stay as the admin left them.
const IMPORTED_SLUGS = [
  "appt-54-glamour-prestige-grande-terrasse-vue-piscine",
  "appt-d32-style-urbain-chic-vue-piscine-jardins",
  "appart-36-standing-royal-vue-piscine-jardins",
  "appt-duplex-26-double-hauteur-patio-prive",
  "appart-22-duplex-moderne-cosy",
  "villa-prestige-route-agadir-4-chambres-piscine-chauffee",
  "appart-39-luxe-authenticite-piscine-parking-sous-sol",
  "appart-84-premium-avec-terrasse-vue-ville",
  "appt-63-appartement-luxe-avec-terrasse-piscine",
  "appt-57-appartement-moderne-complet-marrakech",
  "appartement-gueliz-luxe-modernite-en-plein-c-ur-de-marrakech",
  "appt-76-appartement-de-luxe-au-c-ur-de-la-perle",
];

async function main() {
  let published = 0;
  let imagesSeeded = 0;
  let priceSet = 0;

  for (const slug of IMPORTED_SLUGS) {
    const p = await prisma.property.findUnique({
      where: { slug },
      include: { images: true },
    });
    if (!p) {
      console.log(`✗ ${slug} — not found, skipping`);
      continue;
    }

    // Pick photo set by type, with riad as a sensible fallback for any
    // type we don't know about.
    const photos = STOCK[p.type as keyof typeof STOCK] ?? STOCK.riad;
    const defaultPrice = DEFAULT_PRICE[p.type] ?? 100;

    // Only set price if it's still 0 — never overwrite a price the admin
    // already typed in.
    const nextPrice = p.pricePerNight === 0 ? defaultPrice : p.pricePerNight;
    if (nextPrice !== p.pricePerNight) priceSet++;

    // Only seed images if the property has none — admin uploads always win.
    if (p.images.length === 0) {
      await prisma.propertyImage.createMany({
        data: photos.map((img, i) => ({
          propertyId: p.id,
          src: img.src,
          alt: img.alt,
          position: i,
        })),
      });
      imagesSeeded += photos.length;
    }

    await prisma.property.update({
      where: { id: p.id },
      data: {
        pricePerNight: nextPrice,
        published: true,
      },
    });
    published++;

    console.log(
      `✓ ${slug}  price=€${nextPrice} images=${p.images.length || photos.length} published=true`,
    );
  }

  console.log(
    `\n✓ Published ${published} listings, seeded ${imagesSeeded} placeholder images, applied ${priceSet} default prices.`,
  );
  console.log("→ Open /admin/properties/[id] on each to upload real photos and set the actual price.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
