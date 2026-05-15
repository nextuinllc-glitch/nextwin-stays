// Bulk import properties from a folder tree. One subfolder per
// property, each containing the photos + an `info.txt` describing it.
//
//   ~/Documents/nwx-import/
//     d32-style-urbain-chic/
//       info.txt            ← title (line 1) + blank line + description (rest)
//       price.txt           ← optional, just the number (EUR/night)
//       1.jpg, 2.jpg, …     ← photos, alphabetical order = display order
//     villa-prestige-route-agadir/
//       info.txt
//       1.jpg, 2.jpg, …
//     …
//
// What this script does:
//   • Walks every subfolder of nwx-import/
//   • For each: reads info.txt (title + description), uploads every
//     image (jpg/jpeg/png/webp/heic) to R2 under properties/<slug>/,
//     and writes a Property + image rows into Postgres via Prisma.
//   • Sets sensible defaults (Marrakech, EUR currency, published=true,
//     auto-derived type from the title's keyword: villa/riad/appart…).
//   • Skips a folder if a Property with that slug already exists (so
//     re-running is idempotent — add more folders, re-run, only new
//     ones get imported).

import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, basename, extname } from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";

// CLI args:
//   node bulk-import-properties.mjs [root] [--only <folder>]
// `root` defaults to ~/Documents/nwx-import. `--only` restricts to a
// single subfolder by name (useful for testing one property end-to-end
// before importing the full batch).
const rawArgs = process.argv.slice(2);
const onlyIdx = rawArgs.indexOf("--only");
const ONLY = onlyIdx >= 0 ? rawArgs[onlyIdx + 1] : null;
// --refresh re-imports a folder that already exists: drops the
// PropertyImage rows for that property (cascades the R2 URL refs),
// re-uploads every image fresh, and rewrites title/description from
// info.txt. Use when you add new photos to a folder mid-batch.
const REFRESH = rawArgs.includes("--refresh");
const positional = rawArgs.filter((a, i) => !a.startsWith("--") && i !== onlyIdx + 1);
const IMPORT_ROOT = positional[0] || resolve(process.env.HOME, "Documents/nwx-import");

const IMG_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic", ".gif"]);

function inferType(title) {
  const t = title.toLowerCase();
  if (t.includes("villa")) return "villa";
  if (t.includes("riad")) return "riad";
  // "appart", "appt", "duplex", "loft", "studio" → appartement
  return "apartment";
}

function inferGuestCounts(title, description) {
  const text = `${title}\n${description}`.toLowerCase();
  const chamMatch =
    text.match(/(\d+)\s*chambres?/) ||
    text.match(/(\d+)\s*ch\b/) ||
    text.match(/(\d+)\s*bedrooms?/);
  const sdbMatch =
    text.match(/(\d+)\s*salles? de bain/) ||
    text.match(/(\d+)\s*sdb\b/) ||
    text.match(/(\d+)\s*bathrooms?/);
  // No explicit guest count — derive from chambres × 2 as a sane default.
  const ch = chamMatch ? parseInt(chamMatch[1], 10) : 1;
  const sdb = sdbMatch ? parseInt(sdbMatch[1], 10) : Math.max(1, ch);
  return { guests: Math.max(2, ch * 2), bedrooms: ch, bathrooms: sdb };
}

function inferAmenities(description) {
  const t = description.toLowerCase();
  const found = [];
  const map = {
    "Wifi rapide": /\bwifi|wi-fi\b/,
    Piscine: /\bpiscine|pool\b/,
    Parking: /\bparking\b/,
    Climatisation: /\bclim|climati|air-cond|ac\b/,
    Terrasse: /\bterrasse|terrace|rooftop|balcon\b/,
    Cuisine: /\bcuisine|kitchen\b/,
    "Smart TV": /\bsmart tv|television|tv\b/,
    Hammam: /\bhammam\b/,
    Jardin: /\bjardin|garden\b/,
    Sécurité: /\bsécurisé|secur|gard/,
  };
  for (const [name, re] of Object.entries(map)) {
    if (re.test(t)) found.push(name);
  }
  return found;
}

async function loadSecrets() {
  const raw = await readFile(resolve(import.meta.dirname, "../.deploy/r2-secrets.txt"), "utf-8");
  const out = {};
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 0) continue;
    out[t.slice(0, eq)] = t.slice(eq + 1);
  }
  return out;
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function contentTypeFor(ext) {
  switch (ext.toLowerCase()) {
    case ".png": return "image/png";
    case ".webp": return "image/webp";
    case ".gif": return "image/gif";
    case ".heic": return "image/heic";
    default: return "image/jpeg";
  }
}

async function main() {
  const secrets = await loadSecrets();
  const s3 = new S3Client({
    region: "auto",
    endpoint: secrets.R2_S3_ENDPOINT,
    credentials: {
      accessKeyId: secrets.R2_ACCESS_KEY_ID,
      secretAccessKey: secrets.R2_SECRET_ACCESS_KEY,
    },
  });
  const bucket = secrets.R2_BUCKET;
  const publicBase = secrets.R2_PUBLIC_URL;

  const prisma = new PrismaClient();

  const entries = await readdir(IMPORT_ROOT, { withFileTypes: true });
  let folders = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  if (ONLY) folders = folders.filter((f) => f === ONLY);
  if (!folders.length) {
    console.log(`No matching folder${ONLY ? ` "${ONLY}"` : ""} in ${IMPORT_ROOT}.`);
    await prisma.$disconnect();
    return;
  }

  let created = 0;
  let skipped = 0;
  for (const folder of folders) {
    const dir = resolve(IMPORT_ROOT, folder);
    const slug = slugify(folder);

    // Idempotency — skip if already imported, unless --refresh.
    const existing = await prisma.property.findUnique({ where: { slug } });
    if (existing && !REFRESH) {
      console.log(`↷ skip ${slug} (already in DB; use --refresh to re-import)`);
      skipped++;
      continue;
    }
    if (existing && REFRESH) {
      console.log(`↻ refreshing ${slug} — dropping ${existing.id}'s images`);
      // Cascade-delete via the FK relation on PropertyImage.
      await prisma.propertyImage.deleteMany({ where: { propertyId: existing.id } });
    }

    const infoPath = resolve(dir, "info.txt");
    let infoText = "";
    try {
      infoText = await readFile(infoPath, "utf-8");
    } catch {
      console.log(`⚠ ${folder}: missing info.txt, skipping`);
      continue;
    }
    const lines = infoText.trim().split("\n");
    const titleFr = lines[0]?.trim() || folder;
    const descriptionFr = lines.slice(1).join("\n").trim();
    const shortDescriptionFr = descriptionFr.split("\n").find((l) => l.trim())?.slice(0, 180) || "";

    // Optional meta.json — per-folder overrides for fields the title +
    // description can't carry: lat/lng for the map, exact area string,
    // explicit price, guest/bedroom counts, amenities array, etc.
    // Falls back to defaults when missing or partial.
    let meta = {};
    try {
      meta = JSON.parse(await readFile(resolve(dir, "meta.json"), "utf-8"));
    } catch {
      // Optional file — silently fall through.
    }

    let pricePerNight = meta.price ?? 200;
    if (meta.price == null) {
      try {
        const priceRaw = await readFile(resolve(dir, "price.txt"), "utf-8");
        const n = parseInt(priceRaw.replace(/[^\d]/g, ""), 10);
        if (n > 0) pricePerNight = n;
      } catch {
        // No price file — keep default.
      }
    }

    // Images = every file with an image extension, alphabetically sorted
    // so the admin can rename "01-front.jpg", "02-pool.jpg", etc. to
    // control display order.
    const files = (await readdir(dir))
      .filter((f) => IMG_EXT.has(extname(f).toLowerCase()))
      .sort();

    if (!files.length) {
      console.log(`⚠ ${folder}: no images, skipping`);
      continue;
    }

    console.log(`\n→ ${slug}`);
    console.log(`  title: ${titleFr}`);
    console.log(`  images: ${files.length}`);

    const uploadedImages = [];
    for (let i = 0; i < files.length; i++) {
      const fname = files[i];
      const ext = extname(fname).toLowerCase();
      const buf = await readFile(resolve(dir, fname));
      const key = `properties/${slug}/${String(i + 1).padStart(2, "0")}-${slugify(basename(fname, ext)) || "photo"}${ext}`;
      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buf,
        ContentType: contentTypeFor(ext),
        CacheControl: "public, max-age=31536000, immutable",
      }));
      const url = `${publicBase}/${key}`;
      uploadedImages.push({ src: url, alt: basename(fname, ext), position: i });
      process.stdout.write(`  · uploaded ${fname} (${(buf.length / 1024).toFixed(0)} KB)\n`);
    }

    const inferred = inferGuestCounts(titleFr, descriptionFr);
    const guests = meta.guests ?? inferred.guests;
    const bedrooms = meta.bedrooms ?? inferred.bedrooms;
    const bathrooms = meta.bathrooms ?? inferred.bathrooms;
    const type = meta.type ?? inferType(titleFr);
    const amenities = meta.amenities ?? inferAmenities(descriptionFr);
    const area = meta.area ?? "Marrakech";
    const latitude = meta.lat ?? null;
    const longitude = meta.lng ?? null;
    const minNights = meta.minNights ?? 1;

    if (existing && REFRESH) {
      // Update the existing record with fresh metadata + new images.
      await prisma.property.update({
        where: { id: existing.id },
        data: {
          type,
          area,
          latitude,
          longitude,
          minNights,
          pricePerNight,
          guests,
          bedrooms,
          bathrooms,
          titleFr,
          titleEn: meta.titleEn ?? undefined,
          titleAr: meta.titleAr ?? undefined,
          shortDescriptionFr,
          shortDescriptionEn: meta.shortDescriptionEn ?? undefined,
          shortDescriptionAr: meta.shortDescriptionAr ?? undefined,
          descriptionFr,
          descriptionEn: meta.descriptionEn ?? undefined,
          descriptionAr: meta.descriptionAr ?? undefined,
          amenitiesJson: JSON.stringify(amenities),
          highlightsJson: JSON.stringify(meta.highlights ?? []),
          images: { create: uploadedImages },
        },
      });
      console.log(`  ✓ refreshed Property + ${uploadedImages.length} images`);
    } else {
      await prisma.property.create({
        data: {
          slug,
          type,
          area,
          city: "Marrakech",
          currency: "EUR",
          latitude,
          longitude,
          pricePerNight,
          guests,
          bedrooms,
          bathrooms,
          titleFr,
          titleEn: meta.titleEn ?? null,
          titleAr: meta.titleAr ?? null,
          shortDescriptionFr,
          shortDescriptionEn: meta.shortDescriptionEn ?? null,
          shortDescriptionAr: meta.shortDescriptionAr ?? null,
          descriptionFr,
          descriptionEn: meta.descriptionEn ?? null,
          descriptionAr: meta.descriptionAr ?? null,
          amenitiesJson: JSON.stringify(amenities),
          highlightsJson: JSON.stringify(meta.highlights ?? []),
          hostName: "NEXTWIN",
          hostYears: 1,
          images: { create: uploadedImages },
        },
      });
      console.log(`  ✓ created Property + ${uploadedImages.length} images`);
    }
    created++;
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped}.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
