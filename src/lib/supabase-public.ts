// Browser-side Supabase client used by the public site (static export).
// Hits the anon API only — so it can never modify rows outside what RLS
// permits (INSERT a new pending review, SELECT approved/pending rows).
// The service-role key NEVER ships to the browser; it stays in admin
// API routes that only run in `npm run dev` and Vercel/Render server
// builds (which we're not using right now, but the boundary is intact).

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getPublicSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (client) return client;
  client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

// LocalStorage key used to track which reviews the current browser has
// submitted, so we can show "your review is pending" cards even though
// the rest of the world can't see those rows publicly.
export const PENDING_REVIEW_IDS_KEY = "nextwin_pending_review_ids";

export function loadPendingReviewIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PENDING_REVIEW_IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function savePendingReviewId(id: string) {
  if (typeof window === "undefined") return;
  const current = loadPendingReviewIds();
  if (current.includes(id)) return;
  current.push(id);
  // Cap to last 50 so the localStorage doesn't grow unbounded for
  // long-lived browsers.
  window.localStorage.setItem(
    PENDING_REVIEW_IDS_KEY,
    JSON.stringify(current.slice(-50)),
  );
}
