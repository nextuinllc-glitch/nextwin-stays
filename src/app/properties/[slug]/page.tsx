import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPropertyBySlug,
  getAllPropertySlugs,
  getPropertyBlockedRanges,
} from "@/lib/property-repo";
import { getFeeSettings } from "@/lib/settings-repo";
import { PropertyDetailContent } from "@/components/PropertyDetailContent";
import {
  SITE_URL,
  SITE_NAME,
  hreflangAlternates,
  propertyJsonLd,
} from "@/lib/seo";

export async function generateStaticParams() {
  const slugs = await getAllPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

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
  // Sequential — the Supabase Transaction pooler is opened with
  // `connection_limit=1` so Promise.all over three queries blocks on
  // the pool. Each call here is ~50ms; sequential is ~150ms per page,
  // which is fine for 16 pre-rendered pages at build time.
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();
  const blockedRanges = await getPropertyBlockedRanges(slug);
  const fees = await getFeeSettings();

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
        <PropertyDetailContent property={property} blockedRanges={blockedRanges} fees={fees} />
      </Suspense>
    </>
  );
}
