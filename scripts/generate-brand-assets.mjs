// One-shot generator for social media + WhatsApp Business + Facebook
// cover assets. Outputs the in-app Moorish-arch monogram in three
// colour treatments at the sizes each platform expects:
//
//   profile/light-on-cream  — red on cream, profile-picture style
//   profile/light-on-white  — red on white (cleaner)
//   profile/dark-on-red     — white on brand-red gradient (app tile)
//   profile/transparent     — red on transparent (overlays)
//   wordmark/horizontal     — monogram + "NEXTWIN STAY · MARRAKECH"
//   cover/facebook          — 1640×624 banner with full wordmark
//
// Sizes per profile variant: 320 / 400 / 640 / 1024 — covers Facebook
// (320 displayed), LinkedIn/Twitter (400), WhatsApp Business (640),
// generic Apple/App Store (1024).
//
// Run:  node scripts/generate-brand-assets.mjs
// Output: ./brand-assets/

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const ROOT = resolve(import.meta.dirname, "..", "brand-assets");

const BRAND_RED_TOP = "#FF385C";
const BRAND_RED_BTM = "#E00B41";
const CREAM = "#FAF8F4";
const INK = "#1A1A1A";

// Master arch + N path, identical to the in-app Logo. viewBox 24×24,
// drawn as three layered paths so each can take its own stroke
// thickness (arch ~1.3, base line ~1.0, N ~1.3 at this scale).
function monogramPaths(stroke) {
  return `
    <path d="M4 22 L4 11 A 8 8 0 0 1 20 11 L 20 22"
          fill="none" stroke="${stroke}" stroke-width="1.3"
          stroke-linecap="round" stroke-linejoin="round" />
    <path d="M3 22 L21 22"
          fill="none" stroke="${stroke}" stroke-width="1.0"
          stroke-linecap="round" stroke-linejoin="round" opacity="0.85" />
    <path d="M8.5 17 V9 L 15.5 17 V9"
          fill="none" stroke="${stroke}" stroke-width="1.3"
          stroke-linecap="round" stroke-linejoin="round" />
  `;
}

// Square profile-picture SVG with a centred monogram and a configurable
// background. Padding leaves ~22 % breathing room around the glyph so
// the round crop Facebook/WhatsApp apply doesn't bite into the strokes.
function squareSvg({ size, bg, stroke, radius = 0 }) {
  const pad = size * 0.22;
  const glyphSize = size - pad * 2;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${
    bg
      ? `<rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${bg}" />`
      : ""
  }
  <svg x="${pad}" y="${pad}" width="${glyphSize}" height="${glyphSize}" viewBox="0 0 24 24">
    ${monogramPaths(stroke)}
  </svg>
</svg>`;
}

// Square profile with a SVG `linearGradient` background — used for the
// "dark-on-red" tile that mirrors the apple-icon style.
function squareGradientSvg({ size, top, bottom, stroke, radius = 0 }) {
  const pad = size * 0.2;
  const glyphSize = size - pad * 2;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${top}" />
      <stop offset="100%" stop-color="${bottom}" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="url(#g)" />
  <svg x="${pad}" y="${pad}" width="${glyphSize}" height="${glyphSize}" viewBox="0 0 24 24">
    ${monogramPaths(stroke)}
  </svg>
</svg>`;
}

// Horizontal lockup — monogram on the left, three-line wordmark on the
// right. The wordmark mirrors the in-app Logo composition exactly:
//   NEXTWIN · STAY  (uppercase, semibold, wide tracking)
//   MARRAKECH       (smaller, tracked further)
// Used for Facebook cover + email signatures.
function wordmarkSvg({ width, height, bg = "transparent", inkColor = INK, markStroke = BRAND_RED_BTM, accentColor = BRAND_RED_BTM }) {
  // Layout constants — chosen so a 1640×624 canvas renders the wordmark
  // visually centred with generous margins above and below.
  const monoSize = Math.min(height * 0.42, 280);
  const monoX = width / 2 - (monoSize + 32 + width * 0.28) / 2; // approx
  const monoY = (height - monoSize) / 2;
  const textX = monoX + monoSize + 28;
  const titleFontSize = Math.round(height * 0.085);
  const titleY = height / 2 - 6;
  const subFontSize = Math.round(height * 0.04);
  const subY = titleY + titleFontSize + 18;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${bg !== "transparent" ? `<rect x="0" y="0" width="${width}" height="${height}" fill="${bg}" />` : ""}
  <svg x="${monoX}" y="${monoY}" width="${monoSize}" height="${monoSize}" viewBox="0 0 24 24">
    ${monogramPaths(markStroke)}
  </svg>
  <text x="${textX}" y="${titleY}"
        font-family="Inter, -apple-system, system-ui, sans-serif"
        font-size="${titleFontSize}"
        font-weight="600"
        letter-spacing="${titleFontSize * 0.22}"
        fill="${inkColor}"
        dominant-baseline="middle">
    NEXTWIN <tspan fill="${accentColor}">·</tspan> STAY
  </text>
  <text x="${textX}" y="${subY}"
        font-family="Inter, -apple-system, system-ui, sans-serif"
        font-size="${subFontSize}"
        font-weight="600"
        letter-spacing="${subFontSize * 0.5}"
        fill="${inkColor}"
        opacity="0.6"
        dominant-baseline="hanging">
    MARRAKECH
  </text>
</svg>`;
}

async function writeSvgAndPngs(folder, baseName, svg, sizes) {
  const dir = resolve(ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, `${baseName}.svg`), svg, "utf-8");
  for (const size of sizes) {
    const pngPath = resolve(dir, `${baseName}-${size}.png`);
    await sharp(Buffer.from(svg))
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(pngPath);
    console.log(`  · ${folder}/${baseName}-${size}.png`);
  }
}

async function writeWordmark(folder, baseName, svg, width, height) {
  const dir = resolve(ROOT, folder);
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, `${baseName}.svg`), svg, "utf-8");
  const pngPath = resolve(dir, `${baseName}-${width}x${height}.png`);
  await sharp(Buffer.from(svg))
    .png({ compressionLevel: 9 })
    .toFile(pngPath);
  console.log(`  · ${folder}/${baseName}-${width}x${height}.png`);
}

async function main() {
  await mkdir(ROOT, { recursive: true });
  const PROFILE_SIZES = [320, 400, 640, 1024];

  console.log("Profile pictures · red on white");
  await writeSvgAndPngs(
    "profile",
    "light-on-white",
    squareSvg({ size: 1024, bg: "#ffffff", stroke: BRAND_RED_BTM, radius: 0 }),
    PROFILE_SIZES,
  );

  console.log("Profile pictures · red on cream");
  await writeSvgAndPngs(
    "profile",
    "light-on-cream",
    squareSvg({ size: 1024, bg: CREAM, stroke: BRAND_RED_BTM, radius: 0 }),
    PROFILE_SIZES,
  );

  console.log("Profile pictures · white on red gradient (app-tile style)");
  await writeSvgAndPngs(
    "profile",
    "dark-on-red",
    squareGradientSvg({ size: 1024, top: BRAND_RED_TOP, bottom: BRAND_RED_BTM, stroke: "#ffffff", radius: 0 }),
    PROFILE_SIZES,
  );

  console.log("Profile pictures · red on transparent");
  await writeSvgAndPngs(
    "profile",
    "transparent",
    squareSvg({ size: 1024, bg: null, stroke: BRAND_RED_BTM, radius: 0 }),
    PROFILE_SIZES,
  );

  console.log("\nWordmark · cream background (light)");
  await writeWordmark(
    "wordmark",
    "horizontal-light",
    wordmarkSvg({ width: 1600, height: 400, bg: CREAM, inkColor: INK, markStroke: BRAND_RED_BTM, accentColor: BRAND_RED_BTM }),
    1600,
    400,
  );

  console.log("Wordmark · ink background (dark)");
  await writeWordmark(
    "wordmark",
    "horizontal-dark",
    wordmarkSvg({ width: 1600, height: 400, bg: INK, inkColor: "#ffffff", markStroke: "#ffffff", accentColor: BRAND_RED_TOP }),
    1600,
    400,
  );

  console.log("Wordmark · transparent (overlay)");
  await writeWordmark(
    "wordmark",
    "horizontal-transparent",
    wordmarkSvg({ width: 1600, height: 400, bg: "transparent", inkColor: INK, markStroke: BRAND_RED_BTM, accentColor: BRAND_RED_BTM }),
    1600,
    400,
  );

  console.log("\nFacebook cover · 1640×624 (2x retina)");
  await writeWordmark(
    "cover",
    "facebook-cream",
    wordmarkSvg({ width: 1640, height: 624, bg: CREAM, inkColor: INK, markStroke: BRAND_RED_BTM, accentColor: BRAND_RED_BTM }),
    1640,
    624,
  );
  await writeWordmark(
    "cover",
    "facebook-dark",
    wordmarkSvg({ width: 1640, height: 624, bg: INK, inkColor: "#ffffff", markStroke: "#ffffff", accentColor: BRAND_RED_TOP }),
    1640,
    624,
  );
  await writeWordmark(
    "cover",
    "facebook-red",
    wordmarkSvg({
      width: 1640,
      height: 624,
      bg: BRAND_RED_BTM,
      inkColor: "#ffffff",
      markStroke: "#ffffff",
      accentColor: "#ffffff",
    }),
    1640,
    624,
  );

  console.log(`\nDone. Assets written to ${ROOT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
