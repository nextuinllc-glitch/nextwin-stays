// One-shot: pulls frame 0 out of each hero video on R2, encodes it
// as a JPEG, and uploads the result back to R2 as `hero/poster-*.jpg`.
// Using the video's actual first frame as the <video poster> means the
// browser displays the *same* image the video starts on — no scene
// change, no flash — while the bytes are still buffering.
//
//   Run:  node scripts/extract-hero-posters.mjs

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import ffmpegPath from "ffmpeg-static";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

async function loadSecrets() {
  const raw = await readFile(resolve(PROJECT_ROOT, ".deploy/r2-secrets.txt"), "utf-8");
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

function run(cmd, args) {
  return new Promise((resolveP, rejectP) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "inherit", "inherit"] });
    p.on("error", rejectP);
    p.on("exit", (code) => (code === 0 ? resolveP() : rejectP(new Error(`${cmd} exit ${code}`))));
  });
}

async function downloadTo(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
  const ab = await res.arrayBuffer();
  await writeFile(dest, Buffer.from(ab));
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

  const work = resolve(tmpdir(), "nextwin-poster-extract");
  if (!existsSync(work)) await mkdir(work, { recursive: true });

  const sources = [
    { kind: "desktop", url: settings.heroVideoDesktop, key: "hero/poster-desktop.jpg" },
    { kind: "mobile", url: settings.heroVideoMobile, key: "hero/poster-mobile.jpg" },
  ].filter((s) => s.url);

  const results = {};
  for (const s of sources) {
    const videoPath = resolve(work, `${s.kind}.mp4`);
    const posterPath = resolve(work, `${s.kind}.jpg`);
    console.log(`Downloading ${s.kind} video → ${videoPath}`);
    await downloadTo(s.url, videoPath);

    // -ss 00:00:00 grabs frame 0. Scale to a sensible width — 1600px
    // for desktop covers retina at typical hero widths, 800px for the
    // portrait mobile clip is plenty. -q:v 7 ≈ ~80% JPEG quality which
    // is invisible on a placeholder that shows for ~200ms before the
    // video covers it.
    const targetWidth = s.kind === "desktop" ? 1600 : 800;
    console.log(`Extracting frame 0 (scaled to ${targetWidth}w) → ${posterPath}`);
    await run(ffmpegPath, [
      "-y",
      "-loglevel", "error",
      "-ss", "00:00:00",
      "-i", videoPath,
      "-frames:v", "1",
      "-vf", `scale=${targetWidth}:-2`,
      "-q:v", "7",
      posterPath,
    ]);

    const body = await readFile(posterPath);
    const sizeKb = (body.length / 1024).toFixed(1);
    console.log(`Uploading ${sizeKb} KB → r2://${bucket}/${s.key}`);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: s.key,
        Body: body,
        ContentType: "image/jpeg",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    const newUrl = `${publicUrl}/${s.key}?v=${Date.now()}`;
    results[s.kind] = newUrl;
    console.log(`  ✓ ${newUrl}`);
  }

  // Strip the cache-busting `?v=` suffix before storing — R2's
  // immutable cache-control means the URL is stable, and the suffix
  // would just clutter the DB.
  const cleanUrl = (u) => u && u.split("?")[0];
  await prisma.settings.update({
    where: { id: 1 },
    data: {
      heroPosterDesktop: cleanUrl(results.desktop) ?? null,
      heroPosterMobile: cleanUrl(results.mobile) ?? null,
    },
  });
  console.log("\nSettings updated:");
  console.log(`  heroPosterDesktop = ${cleanUrl(results.desktop) ?? "(none)"}`);
  console.log(`  heroPosterMobile  = ${cleanUrl(results.mobile) ?? "(none)"}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
