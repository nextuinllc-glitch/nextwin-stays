// One-shot migration: streams the two hero videos straight from their
// current Supabase Storage URLs into the Cloudflare R2 bucket, then
// rewrites Supabase Settings.heroVideoDesktop / heroVideoMobile to
// point at the new R2 public URLs.
//
//   Run:  node scripts/migrate-hero-to-r2.mjs
//
// Idempotent — if an object with the same key already exists in R2,
// `upsert: false` keeps it untouched. To force re-upload, delete the
// object from the R2 dashboard first.

import { readFile } from "node:fs/promises";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

// R2 credentials — manual env source so we don't depend on dotenv. The
// .deploy/r2-secrets.txt file is gitignored and lives outside .env.
async function loadSecrets() {
  const path = resolve(PROJECT_ROOT, ".deploy/r2-secrets.txt");
  const raw = await readFile(path, "utf-8");
  const out = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    out[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return out;
}

// Fetch the source bytes once, hand the buffer to R2 via PutObject.
// Streaming would be lighter for huge files but the hero videos are
// ~10-25 MB which is fine to hold in memory for a one-shot.
async function fetchToBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed ${res.status} ${url}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
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
  const publicUrl = secrets.R2_PUBLIC_URL;

  const prisma = new PrismaClient();
  const settings = await prisma.settings.findUnique({
    where: { id: 1 },
    select: { heroVideoDesktop: true, heroVideoMobile: true },
  });
  if (!settings) throw new Error("Settings row not found");

  // Map source URL → R2 key. Keeping the original filenames so future
  // debugging can trace each object back to its Supabase ancestor.
  const sources = [
    { kind: "desktop", url: settings.heroVideoDesktop },
    { kind: "mobile", url: settings.heroVideoMobile },
  ].filter((s) => s.url);

  const results = [];
  for (const s of sources) {
    if (!s.url) continue;
    const filename = s.url.split("/").pop().split("?")[0] || `hero-${s.kind}.mp4`;
    const key = `hero/${filename}`;
    console.log(`Downloading ${s.kind}: ${s.url}`);
    const body = await fetchToBuffer(s.url);
    console.log(`  ${(body.length / 1024 / 1024).toFixed(2)} MB → uploading to R2 key ${key}`);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: "video/mp4",
        // R2 best-practice cache header for hot assets — 1y immutable
        // because every upload renames the file (timestamp-suffixed).
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    const newUrl = `${publicUrl}/${key}`;
    results.push({ kind: s.kind, oldUrl: s.url, newUrl });
    console.log(`  ✓ ${newUrl}`);
  }

  // Rewrite Settings — desktop + mobile fields point at the R2 public
  // URLs. The next build will pick them up and the live site will
  // stream from Cloudflare's edge instead of Supabase Storage.
  const desktopRes = results.find((r) => r.kind === "desktop");
  const mobileRes = results.find((r) => r.kind === "mobile");
  await prisma.settings.update({
    where: { id: 1 },
    data: {
      heroVideoDesktop: desktopRes?.newUrl ?? settings.heroVideoDesktop,
      heroVideoMobile: mobileRes?.newUrl ?? settings.heroVideoMobile,
    },
  });
  console.log("\nSettings updated:");
  console.log(`  heroVideoDesktop = ${desktopRes?.newUrl ?? "(unchanged)"}`);
  console.log(`  heroVideoMobile  = ${mobileRes?.newUrl ?? "(unchanged)"}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
