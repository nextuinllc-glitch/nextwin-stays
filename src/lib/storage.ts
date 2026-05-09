// Storage adapter — uploads go to Supabase Storage in production, local
// disk in dev. The decision is purely env-driven: if SUPABASE_URL +
// SUPABASE_SERVICE_ROLE_KEY are present, we use Supabase. Otherwise we
// fall back to writing under /public/uploads so a fresh clone works
// without any cloud setup.
//
// The service-role key is required (not anon) because uploads run on
// the server during admin actions — we never expose this key to the
// browser. RLS is bypassed by service-role, which is intentional: only
// authenticated admin sessions reach this code path (see the auth
// guard in each upload route).
//
// Public URLs are stored verbatim in the DB (Property.images.src,
// Settings.heroVideoDesktop, etc.), so the resulting `src` works the
// same way whether it points at /uploads/foo.jpg (local) or
// https://<project>.supabase.co/storage/v1/object/public/uploads/foo.jpg
// (prod).

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "uploads";

let cachedClient: SupabaseClient | null = null;
function getSupabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  if (cachedClient) return cachedClient;
  cachedClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

export function isSupabaseStorageEnabled(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

export type UploadResult = { src: string };

/**
 * Upload a file buffer and return a publicly-readable URL.
 *
 * @param buffer       Raw file bytes.
 * @param contentType  MIME (e.g. "image/jpeg", "video/mp4").
 * @param filename     Final filename (caller is responsible for safe
 *                     name + extension + dedup token).
 * @param folder       Optional sub-folder inside the bucket / under
 *                     /public/uploads. Defaults to root.
 */
export async function uploadFile(
  buffer: Buffer,
  contentType: string,
  filename: string,
  folder?: string,
): Promise<UploadResult> {
  const supabase = getSupabase();
  const objectPath = folder ? `${folder}/${filename}` : filename;

  if (supabase) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(objectPath, buffer, {
        contentType,
        upsert: false,
        cacheControl: "31536000", // 1 year — we always rename on write
      });
    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    return { src: data.publicUrl };
  }

  // Local dev fallback — write to /public/uploads/<folder>/<file>.
  const baseDir = folder
    ? path.join(process.cwd(), "public", "uploads", folder)
    : path.join(process.cwd(), "public", "uploads");
  await mkdir(baseDir, { recursive: true });
  const filepath = path.join(baseDir, filename);
  await writeFile(filepath, buffer);
  const urlPath = folder ? `/uploads/${folder}/${filename}` : `/uploads/${filename}`;
  return { src: urlPath };
}
