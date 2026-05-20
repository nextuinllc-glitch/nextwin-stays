"use client";

import { Hero } from "@/components/Hero";
import { HomePortal } from "@/components/HomePortal";
import { OfficeMap } from "@/components/OfficeMap";
import { OwnerCallout } from "@/components/OwnerCallout";
import type { Property } from "@/lib/properties";
import type { HeroSettings } from "@/lib/settings-repo";
import { type PageContentMap } from "@/lib/page-content-schema";

type Props = {
  // Kept on the type for backward compatibility with /app/page.tsx,
  // even though we no longer render the featured cards on the home page.
  featured?: Property[];
  hero: HeroSettings;
  pageContent?: PageContentMap;
};

export function HomeContent({ hero }: Props) {
  return (
    <>
      <Hero
        posterImage={hero.posterImage}
        videoDesktop={hero.videoDesktop}
        videoMobile={hero.videoMobile}
        videoPosterDesktop={hero.videoPosterDesktop}
        videoPosterMobile={hero.videoPosterMobile}
        subtitle={hero.subtitle}
        tagline={hero.tagline}
      />

      {/* Choose-your-lane portal - directly under the hero, qualifies the
          visitor in a single tap. Three full-bleed columns mirror the
          team's specialty system (Court séjour / Long durée / Achat).
          Anchor target for the hero's scroll-cue chevron. */}
      <HomePortal />

      {/* Owner pivot - dark editorial band that targets a different
          audience (owners who want their property managed). Routes the
          interested ones to /gestion where the full pitch + lead form
          lives. Placed before the office map so the rhythm is
          dark → light, ending the page on the warm cream office strip. */}
      <OwnerCallout />

      {/* Office map - editorial location strip with the agency address
          + a Leaflet pin on Marrakech. Tapping the map opens Google
          Maps with driving directions. Closing chapter of the page. */}
      <OfficeMap />
    </>
  );
}
