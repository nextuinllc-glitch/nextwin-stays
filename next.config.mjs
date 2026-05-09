/** @type {import('next').NextConfig} */

// When STATIC_EXPORT=true, we build a fully-static site for GitHub Pages.
// In that mode all admin/API routes are physically removed in the CI
// workflow before `next build` runs, so the export build never sees them.
const isExport = process.env.STATIC_EXPORT === "true";

// GitHub Pages serves the site at https://<user>.github.io/<repo>/, which
// means every internal URL needs a `/<repo>` prefix. The CI workflow sets
// GITHUB_REPOSITORY (e.g. "nextuinllc-glitch/nextwin-stays") so we can
// derive the repo slug automatically. Override with NEXT_PUBLIC_BASE_PATH
// to deploy under a custom domain (set it to "" to drop the prefix).
const basePath = (() => {
  if (process.env.NEXT_PUBLIC_BASE_PATH !== undefined)
    return process.env.NEXT_PUBLIC_BASE_PATH;
  if (!isExport) return "";
  const repo = (process.env.GITHUB_REPOSITORY ?? "").split("/")[1];
  return repo ? `/${repo}` : "";
})();

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
