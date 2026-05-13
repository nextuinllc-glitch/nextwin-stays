// Single source of truth for property reviews. The JSON map is built
// by `scripts/seed-reviews.mjs` from the Menara Marrakech-Airbnb pool —
// 91 real reviews distributed 5–17 per property, with no duplicates.
// Import this module from any component that needs to display review
// counts, ratings or full review cards.

import reviewsBySlugRaw from "@/data/property-reviews.json";

export type Review = {
  author: string;
  initials: string;
  // Real Airbnb profile image URL (`a0.muscache.com/...`) when the
  // reviewer had one; null if scraped without a picture. The
  // <Reviews> component falls back to an initials avatar when null
  // or when the image fails to load.
  authorImage: string | null;
  origin: string;
  date: string;
  stayKind: string;
  rating: number;
  body: string;
  avatarBg?: string;
};

const REVIEWS_BY_SLUG = reviewsBySlugRaw as Record<string, Review[]>;

export function getReviewsForSlug(slug: string): Review[] {
  return REVIEWS_BY_SLUG[slug] ?? [];
}

export function getReviewCount(slug: string): number {
  return getReviewsForSlug(slug).length;
}

export function getAverageRating(slug: string): number {
  const list = getReviewsForSlug(slug);
  if (list.length === 0) return 0;
  return list.reduce((sum, r) => sum + r.rating, 0) / list.length;
}
