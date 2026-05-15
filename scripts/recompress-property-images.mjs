// One-shot: re-encodes every PropertyImage on R2 to a web-friendly
// JPEG (max 1600 px wide, quality 80) and rewrites the DB row to point
// at the new URL. The originals were saved as raw PNG screenshots
// straight from macOS Cmd+Shift+4 — that's ~1 MB each, vs ~120 KB for
// the same image as JPEG. Multiplied by 117 photos in the catalogue,
// that one switch shaves ~100 MB off the catalogue's first-paint
// bandwidth and drops the visible "image loads in stages" from ~3 s
// to <500 ms on a typical 4G connection.
//
//   Run:  node scripts/recompress-property-images.mjs
//
// Idempotent — images already served as `.jpg` are skipped. Re-running
// after adding new screenshots is safe.

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import ffmpegPath from "ffmpeg-static";

const PROJECT_ROOT = resolve(import.meta.dirname, "..");

async function loadSecrets() {
  const raw = await readFile(resolve(PROJECT_ROOT, ".deploy/r2-secrets.txt"), "utf-8");
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

function run(args) {
  return new Promise((resolveP, rejectP) => {
    const p = spawn(ffmpegPath, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    p.stderr.on("data", (d) => (stderr += d.toString()));
    p.on("error", rejectP);
    p.on("exit", (code) =>
      code === 0
        ? resolveP()
        : rejectP(new Error(`ffmpeg exit ${code}: ${stderr.slice(-400)}`)),
    );
  });
}

async function compressToJpeg(inputPath, outputPath) {
  // -vf scale=1600:-2 → max 1600 px wide, height auto, even (libx264-safe).
  // -q:v 5 ≈ JPEG quality ~80 in ffmpeg's scale (lower = higher quality).
  // -map_metadata -1 strips EXIF (lighter files + no GPS leakage).
  await run([
    "-y",
    "-loglevel", "error",
    "-i", inputPath,
    "-vf", "scale='min(1600,iw)':-2",
    "-q:v", "5",
    "-map_metadata", "-1",
    "-pix_fmt", "yuvj420p",
    outputPath,
  ]);
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
  const rows = await prisma.propertyImage.findMany({
    select: { id: true, src: true, propertyId: true, position: true },
    orderBy: [{ propertyId: "asc" }, { position: "asc" }],
  });

  const work = resolve(tmpdir(), "nextwin-recompress-img");
  await rm(work, { recursive: true, force: true });
  await mkdir(work, { recursive: true });

  let skipped = 0;
  let processed = 0;
  let totalOldBytes = 0;
  let totalNewBytes = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const ext = row.src.split(".").pop().toLowerCase();
    if (ext === "jpg" || ext === "jpeg") {
      skipped++;
      continue;
    }

    const inputPath = resolve(work, `in-${i}.${ext}`);
    const outputPath = resolve(work, `out-${i}.jpg`);

    // Download original.
    const res = await fetch(row.src);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(inputPath, buf);
    totalOldBytes += buf.length;

    // Compress to JPEG.
    await compressToJpeg(inputPath, outputPath);
    const jpegBuf = await readFile(outputPath);
    totalNewBytes += jpegBuf.length;

    // Derive new R2 key — same path, just swap the extension.
    const oldKey = row.src.replace(publicBase + "/", "");
    const newKey = oldKey.replace(/\.[^.]+$/, ".jpg");

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: newKey,
        Body: jpegBuf,
        ContentType: "image/jpeg",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    const newUrl = `${publicBase}/${newKey}`;
    await prisma.propertyImage.update({
      where: { id: row.id },
      data: { src: newUrl },
    });

    processed++;
    process.stdout.write(
      `${String(processed).padStart(3)}/${rows.length - skipped}  ${(buf.length / 1024).toFixed(0).padStart(5)} KB → ${(jpegBuf.length / 1024).toFixed(0).padStart(5)} KB  (${(100 * (1 - jpegBuf.length / buf.length)).toFixed(0)}% smaller)  ${newKey}\n`,
    );
  }

  await rm(work, { recursive: true, force: true });
  await prisma.$disconnect();

  const oldMb = (totalOldBytes / 1024 / 1024).toFixed(1);
  const newMb = (totalNewBytes / 1024 / 1024).toFixed(1);
  console.log(`\nProcessed ${processed}, skipped ${skipped} (already JPEG).`);
  if (processed > 0) {
    console.log(`Catalogue weight: ${oldMb} MB → ${newMb} MB (${Math.round(100 * (1 - totalNewBytes / totalOldBytes))}% reduction).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
