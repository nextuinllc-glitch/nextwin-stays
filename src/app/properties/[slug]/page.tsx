import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPropertyBySlug,
  getAllPropertySlugs,
  getPropertyBlockedRanges,
} from "@/lib/property-repo";
import { PropertyDetailContent } from "@/components/PropertyDetailContent";
import {
  SITE_URL,
  SITE_NAME,
  hreflangAlternates,
  propertyJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

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
  const [property, blockedRanges] = await Promise.all([
    getPropertyBySlug(slug),
    getPropertyBlockedRanges(slug),
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
      <PropertyDetailContent property={property} blockedRanges={blockedRanges} />
    </>
  );
}
