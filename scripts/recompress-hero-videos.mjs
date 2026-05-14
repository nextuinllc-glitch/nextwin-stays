// One-shot: re-encodes the current hero videos at web-friendly
// bitrates, regenerates their frame-0 poster, uploads everything back
// to R2, and rewrites the Settings row to point at the lighter files.
//
//   Run:  node scripts/recompress-hero-videos.mjs
//
// Why: the originals were 4K masters (15-18 MB each). Mobile clients
// on a typical 4G connection stalled 2-3 seconds on the poster before
// the <video> had buffered enough to actually start playing. The
// targets here are 1080p / 720p at ~1.5 Mbps — visually equivalent at
// hero-loop resolution but a fraction of the byte count.

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
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
      code === 0 ? resolveP() : rejectP(new Error(`ffmpeg exit ${code}: ${stderr.slice(-400)}`)),
    );
  });
}

async function fetchToFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
  const ab = await res.arrayBuffer();
  await writeFile(dest, Buffer.from(ab));
}

// Re-encode parameters:
//   - libx264 (universal browser + iOS Safari support)
//   - -preset slow → better quality/size ratio (one-shot, time is fine)
//   - -crf 26 → visually transparent at this resolution for hero loops
//   - -movflags +faststart → moov atom at the front so the browser can
//     start playback before downloading the whole file
//   - -pix_fmt yuv420p → Safari/QuickTime compatibility
//   - -an → strip audio (hero video plays muted, audio is dead weight)
async function transcode(input, output, opts) {
  await run([
    "-y",
    "-loglevel", "error",
    "-i", input,
    "-vf", `scale=${opts.width}:-2`,
    "-c:v", "libx264",
    "-preset", "slow",
    "-crf", String(opts.crf),
    "-maxrate", opts.maxrate,
    "-bufsize", opts.bufsize,
    "-movflags", "+faststart",
    "-pix_fmt", "yuv420p",
    "-r", String(opts.fps),
    "-an",
    output,
  ]);
}

async function extractPoster(input, output, width) {
  await run([
    "-y",
    "-loglevel", "error",
    "-ss", "00:00:00",
    "-i", input,
    "-frames:v", "1",
    "-vf", `scale=${width}:-2`,
    "-q:v", "7",
    output,
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
  const publicUrl = secrets.R2_PUBLIC_URL;

  const prisma = new PrismaClient();
  const settings = await prisma.settings.findUnique({
    where: { id: 1 },
    select: { heroVideoDesktop: true, heroVideoMobile: true },
  });
  if (!settings) throw new Error("Settings row not found");

  const work = resolve(tmpdir(), "nextwin-recompress");
  if (existsSync(work)) await rm(work, { recursive: true, force: true });
  await mkdir(work, { recursive: true });

  // Hero loops don't need to be cinema-grade — 1080p desktop / 720p
  // portrait mobile is plenty. Bitrate is anchored by CRF; maxrate
  // clamps the worst-case spike (helps mobile networks).
  const targets = [
    {
      kind: "desktop",
      url: settings.heroVideoDesktop,
      videoKey: `hero/desktop-${Date.now()}.mp4`,
      posterKey: `hero/poster-desktop.jpg`,
      videoOpts: { width: 1920, crf: 26, maxrate: "2500k", bufsize: "5000k", fps: 25 },
      posterWidth: 1600,
    },
    {
      kind: "mobile",
      url: settings.heroVideoMobile,
      videoKey: `hero/mobile-${Date.now()}.mp4`,
      posterKey: `hero/poster-mobile.jpg`,
      videoOpts: { width: 720, crf: 27, maxrate: "1500k", bufsize: "3000k", fps: 25 },
      posterWidth: 800,
    },
  ].filter((t) => t.url);

  const results = {};
  for (const t of targets) {
    const srcPath = resolve(work, `${t.kind}-src.mp4`);
    const outPath = resolve(work, `${t.kind}-out.mp4`);
    const posterPath = resolve(work, `${t.kind}-poster.jpg`);

    console.log(`\n[${t.kind}] Downloading source: ${t.url}`);
    await fetchToFile(t.url, srcPath);
    const srcSize = (await readFile(srcPath)).length;
    console.log(`[${t.kind}] Source size: ${(srcSize / 1024 / 1024).toFixed(2)} MB`);

    console.log(`[${t.kind}] Re-encoding @ ${t.videoOpts.width}w CRF ${t.videoOpts.crf}…`);
    await transcode(srcPath, outPath, t.videoOpts);
    const newBody = await readFile(outPath);
    console.log(
      `[${t.kind}] New size: ${(newBody.length / 1024 / 1024).toFixed(2)} MB ` +
        `(${(100 * (1 - newBody.length / srcSize)).toFixed(0)}% smaller)`,
    );

    console.log(`[${t.kind}] Extracting fresh poster…`);
    await extractPoster(outPath, posterPath, t.posterWidth);
    const posterBody = await readFile(posterPath);
    console.log(`[${t.kind}] Poster size: ${(posterBody.length / 1024).toFixed(1)} KB`);

    console.log(`[${t.kind}] Uploading video → r2://${bucket}/${t.videoKey}`);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: t.videoKey,
        Body: newBody,
        ContentType: "video/mp4",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    console.log(`[${t.kind}] Uploading poster → r2://${bucket}/${t.posterKey}`);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: t.posterKey,
        Body: posterBody,
        ContentType: "image/jpeg",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    results[t.kind] = {
      videoUrl: `${publicUrl}/${t.videoKey}`,
      posterUrl: `${publicUrl}/${t.posterKey}`,
    };
  }

  await prisma.settings.update({
    where: { id: 1 },
    data: {
      heroVideoDesktop: results.desktop?.videoUrl ?? undefined,
      heroVideoMobile: results.mobile?.videoUrl ?? undefined,
      heroPosterDesktop: results.desktop?.posterUrl ?? undefined,
      heroPosterMobile: results.mobile?.posterUrl ?? undefined,
    },
  });
  console.log("\nSettings updated. New URLs:");
  for (const [kind, r] of Object.entries(results)) {
    console.log(`  ${kind}.video  = ${r.videoUrl}`);
    console.log(`  ${kind}.poster = ${r.posterUrl}`);
  }

  await rm(work, { recursive: true, force: true });
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
