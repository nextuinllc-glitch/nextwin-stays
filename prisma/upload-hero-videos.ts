// One-shot: upload the re-encoded hero videos to R2 and update the
// Settings row so the public site serves the lighter MP4s. Keeps the
// original objects on R2 in case we ever need to roll back.

import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { uploadToR2 } from "@/lib/r2";

const prisma = new PrismaClient();

async function main() {
  const desktopBuf = readFileSync("/tmp/hero-reencode/desktop-optimized.mp4");
  const mobileBuf = readFileSync("/tmp/hero-reencode/mobile-optimized.mp4");

  const stamp = Date.now();
  const desktopKey = `hero/desktop-1080p-${stamp}.mp4`;
  const mobileKey = `hero/mobile-720p-${stamp}.mp4`;

  console.log(`Uploading desktop (${(desktopBuf.length / 1024 / 1024).toFixed(2)} MB)...`);
  const { url: desktopUrl } = await uploadToR2(desktopBuf, "video/mp4", desktopKey);
  console.log(`  -> ${desktopUrl}`);

  console.log(`Uploading mobile (${(mobileBuf.length / 1024 / 1024).toFixed(2)} MB)...`);
  const { url: mobileUrl } = await uploadToR2(mobileBuf, "video/mp4", mobileKey);
  console.log(`  -> ${mobileUrl}`);

  await prisma.settings.update({
    where: { id: 1 },
    data: {
      heroVideoDesktop: desktopUrl,
      heroVideoMobile: mobileUrl,
    },
  });
  console.log("Settings.heroVideoDesktop + heroVideoMobile updated.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
