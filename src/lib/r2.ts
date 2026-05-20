// R2 upload helper. Used by /api/admin/upload/video and /api/admin/upload
// to stream hero videos + property photos to Cloudflare R2, bypassing
// Supabase Storage's egress and per-object size limits.
//
// Credentials lookup is cloud-friendly: environment variables first
// (Vercel / Netlify / Cloudflare Pages all inject them), with a
// gitignored .deploy/r2-secrets.txt fallback for local dev so a fresh
// clone keeps working without re-keying .env. Production hosts only
// need the 5 R2_* env vars set.

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

type R2Secrets = {
  endpoint: string;
  bucket: string;
  publicUrl: string;
  accessKeyId: string;
  secretAccessKey: string;
};

const REQUIRED_KEYS = [
  "R2_S3_ENDPOINT",
  "R2_BUCKET",
  "R2_PUBLIC_URL",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
] as const;

let cached: { client: S3Client; secrets: R2Secrets } | null = null;

function fromEnv(): Record<string, string | undefined> {
  return {
    R2_S3_ENDPOINT: process.env.R2_S3_ENDPOINT,
    R2_BUCKET: process.env.R2_BUCKET,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  };
}

function fromSecretsFile(): Record<string, string> {
  const path = resolve(process.cwd(), ".deploy/r2-secrets.txt");
  if (!existsSync(path)) return {};
  const raw = readFileSync(path, "utf-8");
  const out: Record<string, string> = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    out[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return out;
}

function loadSecrets(): R2Secrets {
  // Env wins; file fills in any missing keys so local dev keeps working
  // when a teammate hasn't copied the R2 vars into .env yet.
  const envSrc = fromEnv();
  const fileSrc = fromSecretsFile();
  const merged: Record<string, string | undefined> = {};
  for (const k of REQUIRED_KEYS) {
    merged[k] = envSrc[k] ?? fileSrc[k];
  }
  const missing = REQUIRED_KEYS.filter((k) => !merged[k]);
  if (missing.length) {
    throw new Error(
      `R2 credentials missing: ${missing.join(", ")}. Set them as environment variables on your host (preferred) or in .deploy/r2-secrets.txt for local dev.`,
    );
  }
  return {
    endpoint: merged.R2_S3_ENDPOINT!,
    bucket: merged.R2_BUCKET!,
    publicUrl: merged.R2_PUBLIC_URL!,
    accessKeyId: merged.R2_ACCESS_KEY_ID!,
    secretAccessKey: merged.R2_SECRET_ACCESS_KEY!,
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
