import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Crawlers may index everything public, but the admin panel and the API
// surface are off-limits — they hold draft data and require auth anyway.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
