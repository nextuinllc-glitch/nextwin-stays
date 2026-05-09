import type { Property } from "@/lib/properties";

// Public origin used for canonical URLs, Open Graph URLs, and the sitemap.
// Override in prod via NEXT_PUBLIC_SITE_URL — defaults to localhost so
// preview environments don't pretend to be production.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export const SITE_NAME = "NEXTWIN STAY";

// Locales the public site supports — kept in sync with i18n/dictionaries.
// `x-default` is the locale Google falls back to for unmatched users.
export const LOCALES = ["fr", "en", "ar"] as const;
export const DEFAULT_LOCALE = "fr";

// Builds the language-alternate map for `<link rel="alternate" hreflang>`.
// Today the locale is selected client-side and the URL doesn't change, so
// every entry points at the same canonical — but Google still prefers
// seeing the explicit list over silence.
export function hreflangAlternates(path: string): Record<string, string> {
  const url = `${SITE_URL}${path}`;
  return {
    "fr-FR": url,
    "en-GB": url,
    "ar-MA": url,
    "x-default": url,
  };
}

// Compact JSON-LD for one property — LodgingBusiness with embedded offer +
// aggregateRating + image array. This is what powers Google's rich result
// chips ("From €X / night, ★4.85, photo").
export function propertyJsonLd(property: Property) {
  const path = `/properties/${property.slug}`;
  const url = `${SITE_URL}${path}`;
  const images = property.images.map((i) =>
    i.src.startsWith("http") ? i.src : `${SITE_URL}${i.src}`,
  );

  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": url,
    name: property.title,
    url,
    description:
      property.shortDescription || property.description?.slice(0, 300) || property.title,
    image: images.length ? images : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.area || property.city,
      addressRegion: property.city,
      addressCountry: "MA",
    },
    ...(property.location
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: property.location.lat,
            longitude: property.location.lng,
          },
        }
      : {}),
    priceRange: property.pricePerNight > 0 ? `€${property.pricePerNight}` : undefined,
    aggregateRating:
      property.rating && property.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: property.rating,
            reviewCount: property.reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    // Single offer summarising the nightly rate — Google reads this for the
    // price chip in search results when the field is populated.
    makesOffer:
      property.pricePerNight > 0
        ? {
            "@type": "Offer",
            priceCurrency: property.currency || "EUR",
            price: property.pricePerNight,
            url,
            availability: "https://schema.org/InStock",
          }
        : undefined,
    amenityFeature: (property.amenities || []).slice(0, 12).map((label) => ({
      "@type": "LocationFeatureSpecification",
      name: label,
    })),
    numberOfRooms: property.bedrooms,
    occupancy: {
      "@type": "QuantitativeValue",
      maxValue: property.guests,
    },
  };
}
