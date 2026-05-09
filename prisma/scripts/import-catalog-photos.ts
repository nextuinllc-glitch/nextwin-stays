// Reads photos from /catalog-photos/<FOLDER>/ on disk and wires them into
// the site. Each top-level folder maps to one property by slug; for every
// folder that contains at least one image the script wipes that
// property's placeholder PropertyImage rows and replaces them with the
// real photos copied into /public/uploads/cat/<slug>/.
//
// Run:  npx tsx prisma/scripts/import-catalog-photos.ts
//
// Idempotent — re-runs always wipe-then-insert. Folders left empty are
// skipped so partial uploads don't blow away placeholders for listings
// you haven't filmed yet.
import { PrismaClient } from "@prisma/client";
import { readdir, mkdir, copyFile, stat } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// Folder name (exactly as it appears in /catalog-photos) → DB slug.
// Keeping the human-readable WhatsApp shorthand on the left so the user
// doesn't have to think about slugs when uploading.
const FOLDER_TO_SLUG: Record<string, string> = {
  "Appt 54": "appt-54-glamour-prestige-grande-terrasse-vue-piscine",
  "Appt D32": "appt-d32-style-urbain-chic-vue-piscine-jardins",
  "Appart 36": "appart-36-standing-royal-vue-piscine-jardins",
  "Appt Duplex 26": "appt-duplex-26-double-hauteur-patio-prive",
  "Appart 22": "appart-22-duplex-moderne-cosy",
  "Villa Prestige": "villa-prestige-route-agadir-4-chambres-piscine-chauffee",
  "Appart 39": "appart-39-luxe-authenticite-piscine-parking-sous-sol",
  "Appart 84": "appart-84-premium-avec-terrasse-vue-ville",
  "Appt 63": "appt-63-appartement-luxe-avec-terrasse-piscine",
  "Appt 57": "appt-57-appartement-moderne-complet-marrakech",
  "Appartement Gueliz": "appartement-gueliz-luxe-modernite-en-plein-c-ur-de-marrakech",
  "Appt 76": "appt-76-appartement-de-luxe-au-c-ur-de-la-perle",
};

const PHOTO_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "catalog-photos");
const DEST_BASE = path.join(ROOT, "public", "uploads", "cat");

// Sanitize the original filename so it survives URL routing — strip
// accents, lowercase, allow only [a-z0-9.-_], cap length.
function safeName(original: string) {
  return original
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "photo.jpg";
}

async function main() {
  let folders: string[];
  try {
    folders = await readdir(SRC_DIR);
  } catch {
    console.error(`✗ /catalog-photos directory missing — nothing to do.`);
    process.exit(1);
  }

  let touchedListings = 0;
  let totalImages = 0;

  for (const folder of folders) {
    if (folder.startsWith(".") || folder === "README.md") continue;

    const slug = FOLDER_TO_SLUG[folder];
    if (!slug) {
      console.log(`⚠ Skipping "${folder}" — not in the slug map. Rename to one of: ${Object.keys(FOLDER_TO_SLUG).join(", ")}`);
      continue;
    }

    const folderPath = path.join(SRC_DIR, folder);
    const folderStat = await stat(folderPath).catch(() => null);
    if (!folderStat?.isDirectory()) continue;

    // Pull all valid photo files, sorted alphabetically (admin uses 01_,
    // 02_, … prefixes when they care about order).
    const entries = await readdir(folderPath);
    const photos = entries
      .filter((f) => !f.startsWith("."))
      .filter((f) => PHOTO_EXTS.has(path.extname(f).toLowerCase()))
      .sort();

    if (photos.length === 0) {
      console.log(`· "${folder}" empty — placeholder images kept.`);
      continue;
    }

    const property = await prisma.property.findUnique({ where: { slug } });
    if (!property) {
      console.log(`✗ "${folder}" → slug "${slug}" not found in DB.`);
      continue;
    }

    // Copy files into /public/uploads/cat/<slug>/.
    const destDir = path.join(DEST_BASE, slug);
    await mkdir(destDir, { recursive: true });

    const newRows: { src: string; alt: string; position: number }[] = [];
    for (let i = 0; i < photos.length; i++) {
      const original = photos[i];
      // Prefix with NN- so two re-runs with different photo orderings
      // never collide on disk and the DB always points at the freshest.
      const prefix = String(i + 1).padStart(2, "0");
      const filename = `${prefix}-${safeName(original)}`;
      const fromPath = path.join(folderPath, original);
      const toPath = path.join(destDir, filename);
      await copyFile(fromPath, toPath);
      newRows.push({
        src: `/uploads/cat/${slug}/${filename}`,
        alt: `${property.titleFr} — photo ${i + 1}`,
        position: i,
      });
    }

    // Wipe-then-insert in a single transaction so the property is never
    // momentarily image-less to anyone hitting the page mid-import.
    await prisma.$transaction([
      prisma.propertyImage.deleteMany({ where: { propertyId: property.id } }),
      prisma.propertyImage.createMany({
        data: newRows.map((r) => ({ ...r, propertyId: property.id })),
      }),
    ]);

    console.log(`✓ ${folder}  →  ${slug}  (${newRows.length} photos)`);
    touchedListings++;
    totalImages += newRows.length;
  }

  console.log(
    `\n✓ Updated ${touchedListings} listings, copied ${totalImages} photos to /public/uploads/cat/.`,
  );
  if (touchedListings === 0) {
    console.log("→ No folder had photos. Drop images into /catalog-photos/<NAME>/ and re-run.");
  } else {
    console.log("→ Visit /properties to see the new images.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
