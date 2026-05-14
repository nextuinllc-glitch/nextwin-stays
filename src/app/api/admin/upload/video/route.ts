import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";
import { extractFirstFrameJpeg } from "@/lib/video-poster";

export const runtime = "nodejs";

// Kept tight: only the formats every modern browser autoplays inline. mov
// works on Safari but not on Chrome/Firefox so we skip it here — admins
// should transcode to mp4/webm before upload.
const ALLOWED_TYPES = new Set(["video/mp4", "video/webm"]);
// R2 has no practical object-size limit; the cap here is just to keep
// the dev server's memory usage sane and discourage uploading raw 4K
// masters. 100 MB is plenty for a 15-30 s hero clip transcoded at
// ~5 Mbps via HandBrake / ffmpeg.
const MAX_BYTES = 100 * 1024 * 1024;

function sanitizeBase(name: string): string {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "video"
  );
}

export async function POST(req: Request) {
  const { valid } = await getCurrentSession();
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  // `kind` tells us which slot the upload belongs to so we can name the
  // poster correctly and let the admin form save it to the matching
  // Settings column without having to round-trip back to the client to
  // ask. Falls back to "desktop" for backwards compat.
  const kindRaw = form?.get("kind");
  const kind: "desktop" | "mobile" =
    typeof kindRaw === "string" && (kindRaw === "desktop" || kindRaw === "mobile")
      ? kindRaw
      : "desktop";

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
        error: `Vidéo trop lourde (${sizeMb} MB) — 100 MB max. Compressez avec HandBrake ou ffmpeg avant l'envoi.`,
      },
      { status: 400 },
    );
  }

  const ext = (file.name.split(".").pop() ?? "mp4").toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeBase = sanitizeBase(file.name);
  const stamp = Date.now();
  const videoKey = `hero/${kind}-${safeBase}-${stamp}.${ext}`;
  // Stable poster filename — overwriting the previous poster on each
  // upload is fine because R2 + immutable cache-control means a fresh
  // timestamp on the *video* URL is enough to bust caches downstream;
  // the poster URL is paired with the video URL in Settings.
  const posterKey = `hero/${kind}-${safeBase}-${stamp}-poster.jpg`;

  try {
    const videoBuffer = Buffer.from(await file.arrayBuffer());

    // Upload the video first — if ffmpeg dies, the admin still gets a
    // working video, and the poster falls back to bg-ink in Hero.tsx.
    const { url: videoUrl } = await uploadToR2(videoBuffer, file.type, videoKey);

    let posterUrl: string | null = null;
    try {
      // Mobile videos are portrait so 800w is plenty; desktop landscape
      // gets 1600w for retina sharpness without bloating the JPEG.
      const targetWidth = kind === "desktop" ? 1600 : 800;
      const posterBuffer = await extractFirstFrameJpeg(videoBuffer, { targetWidth });
      const { url } = await uploadToR2(posterBuffer, "image/jpeg", posterKey);
      posterUrl = url;
    } catch (err) {
      // Don't block the upload on poster failure — log it and continue.
      // The admin will see the video saved correctly; the poster will
      // just be missing and Hero.tsx falls back to bg-ink.
      console.error("[upload/video] poster extraction failed:", err);
    }

    return NextResponse.json({ ok: true, src: videoUrl, poster: posterUrl, kind });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
