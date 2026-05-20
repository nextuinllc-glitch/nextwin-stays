import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Public endpoint for property inquiries (SALE + RENT_LONG flows + the
 * generic contact page). Anonymous - no auth required. Stores the lead
 * in the Inquiry table; the admin queue at /admin/inquiries picks it up.
 *
 * Body shape:
 *   {
 *     propertySlug?: string,
 *     propertyTitle?: string,
 *     kind?: "SALE" | "RENT_LONG" | "GENERAL" | "MANAGEMENT",
 *     name: string,
 *     email?: string,
 *     phone?: string,
 *     message: string,
 *     source?: "DETAIL" | "CONTACT" | "WHATSAPP"
 *   }
 *
 * Minimum required: name + message + at least one of email/phone.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const name = String(body.name ?? "").trim();
  const message = String(body.message ?? "").trim();
  const email = body.email ? String(body.email).trim() : null;
  const phone = body.phone ? String(body.phone).trim() : null;

  if (!name || !message) {
    return NextResponse.json(
      { ok: false, error: "Nom et message requis." },
      { status: 400 },
    );
  }
  if (!email && !phone) {
    return NextResponse.json(
      { ok: false, error: "Email ou téléphone requis." },
      { status: 400 },
    );
  }

  // Lightweight spam guard: cap message length, require sensible name length.
  if (message.length > 4000 || name.length > 120) {
    return NextResponse.json({ ok: false, error: "Message trop long." }, { status: 400 });
  }

  const kindRaw = String(body.kind ?? "SALE");
  const kind = ["SALE", "RENT_LONG", "GENERAL", "MANAGEMENT"].includes(kindRaw) ? kindRaw : "SALE";

  const sourceRaw = String(body.source ?? "DETAIL");
  const source = ["DETAIL", "CONTACT", "WHATSAPP"].includes(sourceRaw) ? sourceRaw : "DETAIL";

  await prisma.inquiry.create({
    data: {
      propertySlug: body.propertySlug ? String(body.propertySlug) : null,
      propertyTitle: body.propertyTitle ? String(body.propertyTitle).slice(0, 220) : null,
      kind,
      name,
      email,
      phone,
      message,
      source,
    },
  });

  return NextResponse.json({ ok: true });
}
