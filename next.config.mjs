/** @type {import('next').NextConfig} */

// Supabase Storage public URLs look like:
//   https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/...
// We auto-derive the hostname from NEXT_PUBLIC_SUPABASE_URL so deploys
// to a different Supabase project don't need a config edit.
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
};

export default nextConfig;
