import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";

export const runtime = "nodejs";

async function guard() {
  const { valid } = await getCurrentSession();
  if (!valid) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  return NextResponse.json({ ok: true, settings });
}

export async function PATCH(req: Request) {
  const denied = await guard();
  if (denied) return denied;
  const body = await req.json().catch(() => ({}));

  // Whitelist editable fields so a malicious payload can't poke other rows.
  const editable = [
    "heroSubtitleFr",
    "heroSubtitleEn",
    "heroSubtitleAr",
    "heroTaglineFr",
    "heroTaglineEn",
    "heroTaglineAr",
    "heroImage",
    "heroVideoDesktop",
    "heroVideoMobile",
    "heroPosterDesktop",
    "heroPosterMobile",
    "whatsappNumber",
    "email",
    "phone",
    "addressLine",
    "footerBlurbFr",
    "footerBlurbEn",
    "footerBlurbAr",
    "cleaningFee",
    "serviceFeeRate",
  ] as const;

  // Nullable fields — admin may explicitly clear by sending null or "" so
  // the hero falls back to the static image. Poster fields are paired
  // with their video — clearing a video also clears its poster.
  const nullable = new Set<string>([
    "heroVideoDesktop",
    "heroVideoMobile",
    "heroPosterDesktop",
    "heroPosterMobile",
  ]);

  const data: Record<string, string | number | null> = {};
  for (const key of editable) {
    if (body[key] === undefined) continue;
    if (key === "cleaningFee") {
      const n = Number(body[key]);
      if (!Number.isNaN(n) && n >= 0) data[key] = Math.round(n);
    } else if (key === "serviceFeeRate") {
      const n = Number(body[key]);
      if (!Number.isNaN(n) && n >= 0 && n <= 1) data[key] = n;
    } else if (nullable.has(key) && (body[key] === null || body[key] === "")) {
      data[key] = null;
    } else if (typeof body[key] === "string") {
      data[key] = body[key];
    }
  }

  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
  return NextResponse.json({ ok: true, settings });
}
