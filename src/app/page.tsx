import { HomeContent } from "@/components/HomeContent";
import { getPublishedProperties } from "@/lib/property-repo";
import { getHeroSettings, getHomeFeaturedSlugs } from "@/lib/settings-repo";
import { getPageContent } from "@/lib/page-content-repo";

function inferVideoMime(url: string) {
  return url.split("?")[0].toLowerCase().endsWith(".webm")
    ? "video/webm"
    : "video/mp4";
}

export default async function HomePage() {
  // Featured strip on the home page is one property per listing kind
  // (Acheter, Louer, Court séjour) - a single editorial sample so the
  // visitor sees the breadth at a glance, then taps a category pill to
  // browse the full catalogue. Fetched in parallel.
  const [saleList, rentList, stayList, hero, pageContent, featuredSlugs] = await Promise.all([
    getPublishedProperties({ listingKind: "SALE" }),
    getPublishedProperties({ listingKind: "RENT_LONG" }),
    getPublishedProperties({ listingKind: "SHORT_STAY" }),
    getHeroSettings(),
    getPageContent("home"),
    getHomeFeaturedSlugs(),
  ]);
  // Admin-picked slug → fall back to per-kind default. Louer keeps its
  // Appartement preference (typical long-term-rental product); SALE +
  // SHORT_STAY fall back to the catalogue's natural ordering.
  const pick = (list: typeof saleList, slug: string | null, fallback = list[0]) =>
    (slug ? list.find((p) => p.slug === slug) : null) ?? fallback;
  const saleFeatured = pick(saleList, featuredSlugs.sale);
  const rentFeatured = pick(
    rentList,
    featuredSlugs.rentLong,
    rentList.find((p) => p.type === "apartment") ?? rentList[0],
  );
  const stayFeatured = pick(stayList, featuredSlugs.shortStay);
  // Order matches the pills above: Court séjour, Long durée, Acheter. .filter
  // drops any kind that has zero properties so we never render an empty
  // card slot.
  const featured = [stayFeatured, rentFeatured, saleFeatured].filter(Boolean);
  return (
    <>
      {/* Preload the hero poster JPEGs first — these are tiny (≤300KB)
          and paint instantly as <video poster>, eliminating the dark
          gap on cold load. `fetchPriority="high"` jumps them ahead of
          the property thumbnails further down the page. */}
      {hero.videoPosterDesktop && (
        <link
          rel="preload"
          as="image"
          href={hero.videoPosterDesktop}
          fetchPriority="high"
          media="(min-width: 768px)"
        />
      )}
      {hero.videoPosterMobile && (
        <link
          rel="preload"
          as="image"
          href={hero.videoPosterMobile}
          fetchPriority="high"
          media="(max-width: 767.98px)"
        />
      )}
      {/* Preload the video bytes in parallel so they're decode-ready by
          the time the <video> element mounts — without this hint the
          browser only starts fetching after the JS bundle hydrates,
          which costs ~500ms on a cold load. */}
      {hero.videoDesktop && (
        <link
          rel="preload"
          as="video"
          href={hero.videoDesktop}
          type={inferVideoMime(hero.videoDesktop)}
          media="(min-width: 768px)"
        />
      )}
      {hero.videoMobile && (
        <link
          rel="preload"
          as="video"
          href={hero.videoMobile}
          type={inferVideoMime(hero.videoMobile)}
          media="(max-width: 767.98px)"
        />
      )}
      <HomeContent
        featured={featured}
        hero={hero}
        pageContent={pageContent}
      />
    </>
  );
}
