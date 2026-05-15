import { NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

export const runtime = "nodejs";

// Dev-only ingest endpoint used by the one-shot WhatsApp catalogue
// scrape. Accepts a base64 data URL + a filename hint, uploads to R2,
// returns the resulting public URL. Permissive CORS so the scrape
// (running on web.whatsapp.com) can POST cross-origin.
//
// Security: this route is stripped from the static-export build by
// the CI workflow (rm -rf src/app/api), so it never reaches
// production. It also refuses to run when NODE_ENV !== "development"
// as a belt-and-braces guard.
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  } as Record<string, string>;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { ok: false, error: "Dev-only endpoint." },
      { status: 403, headers: corsHeaders() },
    );
  }
  const body = await req.json().catch(() => null);
  const dataUrl: unknown = body?.dataUrl;
  const filename: unknown = body?.filename;
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) {
    return NextResponse.json(
      { ok: false, error: "dataUrl missing or malformed." },
      { status: 400, headers: corsHeaders() },
    );
  }
  if (typeof filename !== "string" || !filename) {
    return NextResponse.json(
      { ok: false, error: "filename missing." },
      { status: 400, headers: corsHeaders() },
    );
  }

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json(
      { ok: false, error: "Only base64 data URLs are supported." },
      { status: 400, headers: corsHeaders() },
    );
  }
  const [, mime, b64] = match;
  const buffer = Buffer.from(b64, "base64");

  const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const safe = filename
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "image";
  const key = `properties/${safe}-${Date.now()}.${ext}`;

  try {
    const { url } = await uploadToR2(buffer, mime, key);
    return NextResponse.json({ ok: true, url }, { headers: corsHeaders() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500, headers: corsHeaders() },
    );
  }
}
