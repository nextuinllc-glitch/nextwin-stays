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
      {/* Preload hero video bytes in parallel with HTML parsing so the
          first frame is decode-ready by the time the <video> element
          mounts — without this hint the browser only starts fetching
          after the JS bundle hydrates the Hero, which costs ~500ms
          on a cold load. `media` ensures each device only downloads
          the file it will actually display. */}
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
