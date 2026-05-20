import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";

export const runtime = "nodejs";

async function guard() {
  const { valid } = await getCurrentSession();
  if (!valid) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  return null;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ ok: false, error: "ID invalide" }, { status: 400 });
  }
  const body = await req.json().catch(() => ({}));

  // Whitelist + cast. roleFr/bioFr stay as strings (cannot be nulled since
  // they're the FR fallback); the other locale variants + contact fields
  // accept an empty string / null to clear.
  const data: Record<string, string | number | boolean | null> = {};
  const stringFields = ["name", "roleFr", "bioFr"] as const;
  const nullableStringFields = [
    "roleEn",
    "roleAr",
    "bioEn",
    "bioAr",
    "photoUrl",
    "whatsapp",
    "email",
    "phone",
  ] as const;
  for (const k of stringFields) {
    if (typeof body[k] === "string") data[k] = body[k];
  }
  for (const k of nullableStringFields) {
    if (body[k] === null || body[k] === "") data[k] = null;
    else if (typeof body[k] === "string") data[k] = body[k];
  }
  if (typeof body.position === "number") data.position = body.position;
  if (typeof body.published === "boolean") data.published = body.published;
  if (body.specialty !== undefined) {
    const ALLOWED = new Set(["SHORT_STAY", "RENT_LONG", "SALE"]);
    if (body.specialty === null || body.specialty === "") data.specialty = null;
    else if (typeof body.specialty === "string" && ALLOWED.has(body.specialty)) {
      data.specialty = body.specialty;
    }
  }

  const updated = await prisma.teamMember.update({ where: { id }, data });
  return NextResponse.json({ ok: true, member: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ ok: false, error: "ID invalide" }, { status: 400 });
  }
  await prisma.teamMember.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
