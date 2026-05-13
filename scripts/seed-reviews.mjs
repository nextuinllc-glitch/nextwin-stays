// One-shot seeder that pulls real Marrakech-Airbnb reviews from the
// Menara Collections pool and distributes them — without duplicates —
// across all of our 8 properties, 5 to 17 per slug. Output is a static
// JSON map keyed by slug at /src/data/property-reviews.json, consumed
// by <Reviews> on the detail page.
//
//   Run:  node scripts/seed-reviews.mjs
//
// Re-runnable: deterministic per (Menara pool snapshot + slug list)
// because we seed the RNG with the slug, so the same property always
// gets the same review batch even if you regenerate.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const POOL_PATH =
  "/Users/mac/Downloads/menara collection estat /marrakech-reviews-pool.json";
const OUT_PATH = resolve(PROJECT_ROOT, "src/data/property-reviews.json");

// Match each NEXTWIN slug to a Menara pool category. Riads pull from
// the apartment pool — both are intimate, in-city stays, the tone of
// the reviews fits closer than the open-air villa pool.
const SLUGS = [
  { slug: "riad-jardin-secret", pool: "apartment" },
  { slug: "villa-palmeraie-oasis", pool: "villa" },
  { slug: "gueliz-modern-loft", pool: "apartment" },
  { slug: "riad-medina-rooftop", pool: "apartment" },
  { slug: "villa-atlas-views", pool: "villa" },
  { slug: "kasbah-style-apartment", pool: "apartment" },
  { slug: "riad-citrus-courtyard", pool: "apartment" },
  { slug: "villa-bohemian-retreat", pool: "villa" },
];

// Tiny seeded RNG (mulberry32) so the output is stable across runs. We
// hash the slug into the seed so each property's batch stays the same
// every time we regenerate, but a different slug gets a different pick.
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Translate the Airbnb-English `stayHighlight` strings to French defaults
// our UI already uses. Falls back to a generic "Séjour de quelques nuits"
// when the source field is empty.
function stayKindFr(highlight) {
  const h = (highlight ?? "").toLowerCase();
  if (h.includes("one night")) return "Séjour d'une nuit";
  if (h.includes("a few nights")) return "Séjour de quelques nuits";
  if (h.includes("a week")) return "Séjour d'une semaine";
  return "Séjour de quelques nuits";
}

// Soft palette for the initials-fallback avatar background — used when
// `authorImage` is missing OR the image fails to load in the browser.
const AVATAR_BGS = [
  "#FFE2E8",
  "#E0F0FF",
  "#FFEED1",
  "#E5E1FF",
  "#D7F5DB",
  "#FCE4D6",
  "#E1F5FE",
  "#F0E5FF",
];

function avatarBg(authorName, fallbackIndex) {
  const seed = hashSeed(authorName + ":bg");
  return AVATAR_BGS[seed % AVATAR_BGS.length] ?? AVATAR_BGS[fallbackIndex % AVATAR_BGS.length];
}

// Cap text length to avoid showing 1000-char essays. Anything over 600
// chars gets soft-truncated on a sentence boundary. Display-side still
// has the "Lire la suite" affordance via line-clamp + state.
function trimBody(text) {
  if (!text) return "";
  const t = text.trim();
  if (t.length <= 600) return t;
  const slice = t.slice(0, 600);
  const lastDot = slice.lastIndexOf(". ");
  return (lastDot > 200 ? slice.slice(0, lastDot + 1) : slice).trim() + "…";
}

async function main() {
  const poolRaw = await readFile(POOL_PATH, "utf-8");
  const pool = JSON.parse(poolRaw);

  // The pool's pre-shuffled view — we maintain a global "used" set so
  // no review string is assigned to two different properties (the user
  // asked for no duplicates across offers).
  const used = new Set();
  const out = {};
  const stats = [];

  for (let i = 0; i < SLUGS.length; i++) {
    const { slug, pool: cat } = SLUGS[i];
    const rng = mulberry32(hashSeed(slug));
    const desiredCount = 5 + Math.floor(rng() * 13); // 5..17 inclusive
    const source = pool[cat] ?? [];
    const candidates = shuffle(source, rng);

    const picked = [];
    for (const r of candidates) {
      if (picked.length >= desiredCount) break;
      const key = (r.text ?? "").slice(0, 120); // dedup key — first 120 chars
      if (used.has(key)) continue;
      if (!r.text || r.text.length < 60) continue; // skip too-short
      used.add(key);
      picked.push({
        author: r.authorName ?? "Voyageur",
        initials: ((r.authorName ?? "?")[0] ?? "?").toUpperCase(),
        authorImage: r.authorImage ?? null,
        origin: (r.authorLocation ?? "").trim(),
        date: r.date ?? "",
        stayKind: stayKindFr(r.stayHighlight),
        rating: typeof r.rating === "number" ? r.rating : 5,
        body: trimBody(r.text),
        avatarBg: avatarBg(r.authorName ?? "?", picked.length),
      });
    }

    // Sort by date desc-ish — most reviews are "Month YYYY" strings,
    // sort lexicographically reversed so 2026 entries land first. Good
    // enough for visual ordering without a date parser.
    picked.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

    out[slug] = picked;
    stats.push({ slug, count: picked.length, pool: cat });
  }

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(out, null, 2));

  console.log("Wrote", OUT_PATH);
  console.log("Per-slug counts:");
  for (const s of stats) {
    console.log(`  ${s.slug.padEnd(28)} ${String(s.count).padStart(2)}  (${s.pool} pool)`);
  }
  const total = stats.reduce((a, s) => a + s.count, 0);
  console.log(`Total reviews assigned: ${total} (unique: ${used.size})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
