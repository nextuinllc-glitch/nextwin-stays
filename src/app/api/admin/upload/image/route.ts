import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";

export const runtime = "nodejs";

// Lean image upload — no transcoding, no derivative generation. The
// Pages editor uploads a single image into a stable R2 prefix and gets
// back a public URL it can drop into pageContent. Used for About hero
// + gallery slots; reusable for any future page-level image fields.
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
// 10 MB cap — well above any real-world photograph. The R2 free tier
// has no per-object limit but huge uploads choke the dev server's
// memory; clients should resize >4K originals before sending.
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
  return "jpg";
}

export async function POST(req: Request) {
  const { valid } = await getCurrentSession();
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  // Optional `folder` lets the caller group uploads (e.g. "about",
  // "properties"). Falls back to a flat `pages/` namespace.
  const folderRaw = form?.get("folder");
  const folder =
    typeof folderRaw === "string" && /^[a-z0-9-]+$/.test(folderRaw)
      ? folderRaw
      : "pages";

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Fichier manquant" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { ok: false, error: "Format non supporté (JPEG, PNG, WebP, AVIF)" },
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
  const key = `${folder}/${safeBase}-${stamp}.${ext}`;

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadToR2(buffer, file.type, key);
    return NextResponse.json({ ok: true, src: url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
