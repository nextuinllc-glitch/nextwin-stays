/** @type {import('next').NextConfig} */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// When STATIC_EXPORT=true, we build a fully-static site for GitHub Pages.
// In that mode all admin/API routes are physically removed in the CI
// workflow before `next build` runs, so the export build never sees them.
const isExport = process.env.STATIC_EXPORT === "true";

// Detect a custom-domain build by looking for `public/CNAME` (the file
// GitHub Pages uses to map an apex domain to the project site). When
// it's present, the site is served at the apex — so we drop the
// `/<repo>` URL prefix AND swap the canonical site URL over to the
// custom domain. This keeps the CI workflow unchanged across both
// "github.io subdomain" and "nextwinstay.com" deploys.
const customDomain = (() => {
  const path = resolve(process.cwd(), "public/CNAME");
  if (!existsSync(path)) return null;
  const raw = readFileSync(path, "utf-8").trim();
  return raw || null;
})();

// GitHub Pages serves the site at https://<user>.github.io/<repo>/, which
// means every internal URL needs a `/<repo>` prefix UNLESS a custom
// domain is wired up. The CI workflow sets GITHUB_REPOSITORY for the
// derived value; NEXT_PUBLIC_BASE_PATH still wins for explicit
// override (e.g. previewing the prefixed build locally).
const basePath = (() => {
  if (process.env.NEXT_PUBLIC_BASE_PATH !== undefined)
    return process.env.NEXT_PUBLIC_BASE_PATH;
  if (!isExport) return "";
  if (customDomain) return "";
  const repo = (process.env.GITHUB_REPOSITORY ?? "").split("/")[1];
  return repo ? `/${repo}` : "";
})();

// Canonical site URL is read from NEXT_PUBLIC_SITE_URL in src/lib/seo
// and propagated to <link rel="canonical">, og:url, etc. When a custom
// domain is present we override the CI-derived github.io URL so Google
// indexes the apex instead of the subdomain.
if (customDomain && !process.env.NEXT_PUBLIC_SITE_URL?.includes(customDomain)) {
  process.env.NEXT_PUBLIC_SITE_URL = `https://${customDomain}`;
}

// Supabase Storage public URLs look like:
//   https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/...
// Auto-derived from NEXT_PUBLIC_SUPABASE_URL so deploys to a different
// project don't need a config edit.
const supabaseHost = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
})();

const nextConfig = {
  reactStrictMode: true,
  // `ffmpeg-static` ships a native binary that Next.js otherwise tries to
  // trace into the .next bundle, which breaks the resolved path at
  // runtime (`spawn .next/server/vendor-chunks/ffmpeg ENOENT`). Marking
  // it as a server-external package leaves the require/import alone so
  // it resolves to the real `node_modules/ffmpeg-static/ffmpeg` binary
  // when /api/admin/upload/video extracts a poster.
  serverExternalPackages: ["ffmpeg-static"],
  // Hide the Next.js dev-mode floating "N" badge (the build-activity
  // indicator in the bottom-left). It never renders in production but
  // confuses the eye while previewing the cinematic hero locally.
  devIndicators: false,
  ...(isExport && {
    output: "export",
    trailingSlash: true,
    basePath,
    // Static export can't use Next.js's image optimisation server, so all
    // <Image> tags resolve to plain <img> with the original src.
    images: {
      unoptimized: true,
      remotePatterns: [
        { protocol: "https", hostname: "images.unsplash.com" },
        { protocol: "https", hostname: "images.pexels.com" },
        ...(supabaseHost
          ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
          : []),
      ],
    },
  }),
  ...(!isExport && {
    images: {
      // Local /public/uploads is served as static files at /uploads/*, so we
      // don't need to whitelist it here — but local Image optimisation in dev
      // chokes on some larger user uploads, so we disable it in dev only.
      unoptimized: process.env.NODE_ENV !== "production",
      remotePatterns: [
        { protocol: "https", hostname: "images.unsplash.com" },
        { protocol: "https", hostname: "images.pexels.com" },
        ...(supabaseHost
          ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
          : []),
      ],
      formats: ["image/avif", "image/webp"],
    },
  }),
};

export default nextConfig;
