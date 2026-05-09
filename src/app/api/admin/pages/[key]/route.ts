import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { getPageContent, setPageContent } from "@/lib/page-content-repo";
import { PAGE_SCHEMAS, type PageKey } from "@/lib/page-content-schema";

export const runtime = "nodejs";

const VALID_KEYS = new Set<PageKey>(["home", "about", "contact"]);

async function guard() {
  const { valid } = await getCurrentSession();
  if (!valid) return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  return null;
}

function isValidKey(k: string): k is PageKey {
  return (VALID_KEYS as Set<string>).has(k);
}

export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const denied = await guard();
  if (denied) return denied;
  const { key } = await params;
  if (!isValidKey(key)) {
    return NextResponse.json({ ok: false, error: "Page inconnue" }, { status: 404 });
  }
  const content = await getPageContent(key);
  return NextResponse.json({ ok: true, content });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  const denied = await guard();
  if (denied) return denied;
  const { key } = await params;
  if (!isValidKey(key)) {
    return NextResponse.json({ ok: false, error: "Page inconnue" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.content !== "object") {
    return NextResponse.json({ ok: false, error: "Contenu manquant" }, { status: 400 });
  }

  // Whitelist field keys — anything not in the schema is dropped.
  // Stops the admin (or a malicious payload) from polluting the JSON
  // with unrelated keys that the public pages never read anyway.
  const allowedKeys = new Set(PAGE_SCHEMAS[key].map((f) => f.key));
  const clean: Record<string, { fr?: string; en?: string; ar?: string }> = {};
  for (const [k, v] of Object.entries(body.content as Record<string, unknown>)) {
    if (!allowedKeys.has(k)) continue;
    if (typeof v !== "object" || v === null) continue;
    const bundle = v as Record<string, unknown>;
    const fr = typeof bundle.fr === "string" ? bundle.fr : undefined;
    const en = typeof bundle.en === "string" ? bundle.en : undefined;
    const ar = typeof bundle.ar === "string" ? bundle.ar : undefined;
    // Skip empty bundles entirely — keeps the JSON tight and lets the
    // dictionary fallback kick in cleanly.
    if (!fr && !en && !ar) continue;
    clean[k] = { fr, en, ar };
  }

  await setPageContent(key, clean);
  return NextResponse.json({ ok: true, content: clean });
}
