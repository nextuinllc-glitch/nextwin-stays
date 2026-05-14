// R2 upload helper. Reads credentials from .deploy/r2-secrets.txt at
// process start (gitignored, lives outside .env so the keys don't leak
// into the Next.js client bundle). Used by /api/admin/upload/video to
// stream hero videos + auto-generated posters straight to Cloudflare R2,
// bypassing Supabase Storage's egress and per-object size limits.
//
// All admin/API routes get stripped from the static export build, so
// this code only ever runs locally during dev when the admin uploads
// new media. Production traffic reads the resulting URLs from the DB.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type R2Secrets = {
  endpoint: string;
  bucket: string;
  publicUrl: string;
  accessKeyId: string;
  secretAccessKey: string;
};

let cached: { client: S3Client; secrets: R2Secrets } | null = null;

function loadSecrets(): R2Secrets {
  const raw = readFileSync(
    resolve(process.cwd(), ".deploy/r2-secrets.txt"),
    "utf-8",
  );
  const out: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    out[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  const missing = [
    "R2_S3_ENDPOINT",
    "R2_BUCKET",
    "R2_PUBLIC_URL",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
  ].filter((k) => !out[k]);
  if (missing.length) {
    throw new Error(
      `R2 secrets file is missing: ${missing.join(", ")}. Check .deploy/r2-secrets.txt.`,
    );
  }
  return {
    endpoint: out.R2_S3_ENDPOINT,
    bucket: out.R2_BUCKET,
    publicUrl: out.R2_PUBLIC_URL,
    accessKeyId: out.R2_ACCESS_KEY_ID,
    secretAccessKey: out.R2_SECRET_ACCESS_KEY,
  };
}

function getClient() {
  if (cached) return cached;
  const secrets = loadSecrets();
  const client = new S3Client({
    region: "auto",
    endpoint: secrets.endpoint,
    credentials: {
      accessKeyId: secrets.accessKeyId,
      secretAccessKey: secrets.secretAccessKey,
    },
  });
  cached = { client, secrets };
  return cached;
}

export async function uploadToR2(
  buffer: Buffer,
  contentType: string,
  key: string,
): Promise<{ url: string }> {
  const { client, secrets } = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: secrets.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Every upload renames with a timestamp suffix, so the URL itself
      // is the cache key — safe to mark immutable for a year.
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return { url: `${secrets.publicUrl}/${key}` };
}
