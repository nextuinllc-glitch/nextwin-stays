import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";

export const runtime = "nodejs";

// Property image upload. Streams the file straight to Cloudflare R2
// (same bucket the hero videos / About-page images live in) so every
// public surface reads from the edge cache and we never hit Supabase
// Storage's egress meter. 10 MB cap leaves plenty of room for full-
// resolution iPhone photos without bloating page weight.
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);
const MAX_BYTES = 10 * 1024 * 1024;

function sanitizeBase(name: string): string {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "image"
  );
}

function extFromType(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/avif") return "avif";
  if (type === "image/gif") return "gif";
  return "jpg";
}

export async function POST(req: Request) {
  const { valid } = await getCurrentSession();
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Fichier manquant" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { ok: false, error: "Format non supporté (JPG, PNG, WebP, AVIF, GIF)" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return NextResponse.json(
      { ok: false, error: `Image trop lourde (${sizeMb} MB) — 10 MB max.` },
      { status: 400 },
    );
  }

  const ext = extFromType(file.type);
  const safeBase = sanitizeBase(file.name);
  const stamp = Date.now();
  // Property images live in their own R2 prefix so the dashboard list
  // is easy to scan when debugging — hero/, pages/, properties/.
  const key = `properties/${safeBase}-${stamp}.${ext}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadToR2(buffer, file.type, key);
    return NextResponse.json({ ok: true, src: url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
