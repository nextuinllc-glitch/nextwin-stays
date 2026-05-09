import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";

// Auto-generated from the DB at build time — published properties only.
// Drafts and admin/api routes are excluded so Google doesn't index drafts
// before the admin sets prices and adds images. Re-run the deploy workflow
// after publishing a new property to refresh the sitemap.
//
// `force-static` is required when Next.js is built with `output: 'export'`
// — it tells the framework to bake the sitemap into a real .xml file
// rather than expecting a server to render it per-request.
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await prisma.property.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const staticPaths: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/properties`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const propertyPaths: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${SITE_URL}/properties/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPaths, ...propertyPaths];
}
