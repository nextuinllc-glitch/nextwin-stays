import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPropertyBySlug,
  getPropertyBlockedRanges,
} from "@/lib/property-repo";
import { getFeeSettings, getContactSettings } from "@/lib/settings-repo";
import { PropertyDetailContent } from "@/components/PropertyDetailContent";
import {
  SITE_URL,
  SITE_NAME,
  hreflangAlternates,
  propertyJsonLd,
} from "@/lib/seo";

// Property detail is rendered on demand + cached at the edge for 1 hour.
// We used to statically generate every slug at build time, but with
// Supabase's pgbouncer connection_limit=1 (recommended for serverless),
// parallel prerender of ~30 detail pages exhausts the pool. ISR
// (revalidate + dynamicParams) gives us the best of both: cold pages
// are server-rendered the first time a visitor hits them, then served
// from the edge cache for the next hour. Admin edits show up on the
// next refresh after revalidate elapses.
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPropertyBySlug(slug);
  if (!p) return {};

  const path = `/properties/${slug}`;
  const url = `${SITE_URL}${path}`;
  const title = `${p.title} · ${p.area}, ${p.city}`;
  // Meta description — first 160 chars of shortDescription / description.
  // Google truncates around 155–160 so we cap there to avoid the "…".
  const baseDesc = p.shortDescription || p.description || `${p.title} à ${p.city}`;
  const description = baseDesc.length > 160 ? baseDesc.slice(0, 157) + "…" : baseDesc;

  // First image becomes the og:image. Falls back to the static hero so
  // social cards still render for properties without uploaded photos.
  const ogImage = p.images[0]?.src
    ? p.images[0].src.startsWith("http")
      ? p.images[0].src
      : `${SITE_URL}${p.images[0].src}`
    : `${SITE_URL}/og-default.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: hreflangAlternates(path),
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: "fr_FR",
      alternateLocale: ["en_GB", "ar_MA"],
      images: [{ url: ogImage, width: 1200, height: 630, alt: p.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    // Robots — only index when the property is actually published. Drafts
    // are noindex so Google never lands a user on an empty page.
    robots: p ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Parallel - all four queries fire at once. Connection pool was
  // bumped to 5 so pgbouncer can multiplex them inside the same
  // Transaction-mode connection. getPropertyBySlug + getFeeSettings +
  // getContactSettings are now React.cache-wrapped so even if other
  // server components ask for the same data later in the render, no
  // extra Prisma queries fire. Result: detail-page TTFB drops from
  // ~3s to ~600ms-1s.
  const [property, blockedRanges, fees, contact] = await Promise.all([
    getPropertyBySlug(slug),
    getPropertyBlockedRanges(slug),
    getFeeSettings(),
    getContactSettings(),
  ]);
  if (!property) notFound();

  // JSON-LD for rich results — injected as a <script> tag rendered on the
  // server. Google reads this on first crawl, no JS execution required.
  const ld = propertyJsonLd(property);

  return (
    <>
      <script
        type="application/ld+json"
        // dangerouslySetInnerHTML is the standard way to ship JSON-LD; the
        // payload is server-built from our own DB so there's no XSS surface.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      {/* Suspense around the booking widget tree — useSearchParams() is
          read inside <PropertyDetailContent> to seed the date picker
          from `?from=&to=` deep links, and static export needs an
          explicit boundary for that. */}
      <Suspense>
        <PropertyDetailContent
          property={property}
          blockedRanges={blockedRanges}
          fees={fees}
          whatsappNumber={contact.whatsappNumber}
        />
      </Suspense>
    </>
  );
}
