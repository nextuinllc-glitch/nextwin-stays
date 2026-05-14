import { HomeContent } from "@/components/HomeContent";
import { getPublishedProperties } from "@/lib/property-repo";
import { getHeroSettings } from "@/lib/settings-repo";
import { getPageContent } from "@/lib/page-content-repo";

function inferVideoMime(url: string) {
  return url.split("?")[0].toLowerCase().endsWith(".webm")
    ? "video/webm"
    : "video/mp4";
}

export default async function HomePage() {
  // Fetch in parallel — the hero + page content rows are tiny so this
  // adds no waterfall.
  const [featured, hero, pageContent] = await Promise.all([
    getPublishedProperties(),
    getHeroSettings(),
    getPageContent("home"),
  ]);
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
        featured={featured.slice(0, 6)}
        hero={hero}
        pageContent={pageContent}
      />
    </>
  );
}
