import { NextResponse } from "next/server";
import { getContactSettings } from "@/lib/settings-repo";

export const runtime = "nodejs";
// Cached at the edge for an hour — admin edits surface on the next
// refresh after that window. Keeps the home page snappy.
export const revalidate = 3600;

/**
 * Public read of the admin-managed contact info: address, phone,
 * email, WhatsApp. Used by the home page OfficeMap to keep the office
 * details in sync with what the admin set in /admin/settings, without
 * shipping every Settings field down to the client.
 */
export async function GET() {
  const contact = await getContactSettings();
  return NextResponse.json({ ok: true, contact });
}
