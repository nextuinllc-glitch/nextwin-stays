import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";

export const runtime = "nodejs";

// Kept tight: only the formats every modern browser autoplays inline. mov
// works on Safari but not on Chrome/Firefox so we skip it here — admins
// should transcode to mp4/webm before upload.
const ALLOWED_TYPES = new Set(["video/mp4", "video/webm"]);
// 50 MB matches the Supabase free-tier per-object cap. Pro plan can take
// up to 5 GB — bump this when upgrading. For raw 1080p hero footage,
// transcode to ~5 Mbps before upload (HandBrake / ffmpeg) to fit a
// 30-second clip comfortably under the cap.
const MAX_BYTES = 50 * 1024 * 1024;

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
      { ok: false, error: "Format non supporté (MP4 ou WebM)" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return NextResponse.json(
      {
        ok: false,
        error: `Vidéo trop lourde (${sizeMb} MB) — 50 MB max. Compressez avec HandBrake ou ffmpeg avant l'envoi.`,
      },
      { status: 400 },
    );
  }

  const ext = (file.name.split(".").pop() ?? "mp4").toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeBase =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "video";
  const filename = `hero-${safeBase}-${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const { src } = await uploadFile(buffer, file.type, filename);
    return NextResponse.json({ ok: true, src });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
