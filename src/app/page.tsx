import { HomeContent } from "@/components/HomeContent";
import { getPublishedProperties } from "@/lib/property-repo";
import { getHeroSettings } from "@/lib/settings-repo";
import { getPageContent } from "@/lib/page-content-repo";

export default async function HomePage() {
  // Fetch in parallel — the hero + page content rows are tiny so this
  // adds no waterfall.
  const [featured, hero, pageContent] = await Promise.all([
    getPublishedProperties(),
    getHeroSettings(),
    getPageContent("home"),
  ]);
  return (
    <HomeContent
      featured={featured.slice(0, 6)}
      hero={hero}
      pageContent={pageContent}
    />
  );
}
