"use client";

import { Hero } from "@/components/Hero";
import { PropertyGrid } from "@/components/PropertyGrid";
import { HomePortal } from "@/components/HomePortal";
import { OwnerCallout } from "@/components/OwnerCallout";
import { useI18n } from "@/i18n/I18nProvider";
import type { Property } from "@/lib/properties";
import type { HeroSettings } from "@/lib/settings-repo";
import { pickField, type PageContentMap } from "@/lib/page-content-schema";

type Props = {
  featured: Property[];
  hero: HeroSettings;
  pageContent?: PageContentMap;
};

export function HomeContent({ featured, hero, pageContent }: Props) {
  const { t, locale } = useI18n();
  // Admin-edit overrides → fallback to dictionary defaults. The
  // pickField helper handles the locale fallback (admin's chosen
  // language → FR → dictionary).
  const get = (key: string, fallback: string) =>
    pickField(pageContent, key, locale, fallback);

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
          team's specialty system (Court séjour / Long durée / Achat),
          so the entry point on the home page maps one-to-one with the
          conseillers on /about. Anchor target for the hero's scroll-
          cue chevron lives on this section. */}
      <HomePortal />

      {/* One featured property per kind - editorial sample of the
          catalogue. Kept under the portal so visitors who already know
          which lane they want can scroll past the portal to the cards;
          visitors who need to be guided take the portal first.

          Editorial transition: a thin vertical hairline drops from the
          portal section above into this section, softening the hard
          colour edge of an active portal column and signalling "next
          chapter" without being loud. */}
      <div className="container-page pt-12 sm:pt-20">
        {/* Vertical chapter mark - delicate brand-tinted hairline that
            visually bridges the saturated portal column above (which on
            mobile is whatever lane is currently in view) with the cream
            featured section below. */}
        <span
          aria-hidden
          className="mx-auto block h-14 w-px bg-gradient-to-b from-brand-500/0 via-brand-500/40 to-brand-500/0 sm:h-20"
        />
        <div className="mx-auto mb-10 mt-10 max-w-2xl text-center sm:mb-14 sm:mt-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-600">
            {get("sectionEyebrow", t.home.sectionEyebrow)}
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl [text-wrap:balance]">
            {get("sectionTitle", t.home.sectionTitle)}
          </h2>
          <span aria-hidden className="mx-auto mt-5 block h-px w-12 bg-brand-500/60" />
        </div>
        <PropertyGrid properties={featured} />

        {/* Closing chapter mark for the featured grid - mirrors the
            opening hairline above so the section feels bookended, and
            softens the seam between the cream featured grid and the
            dark Owner band that follows. */}
        <span
          aria-hidden
          className="mx-auto mt-16 block h-14 w-px bg-gradient-to-b from-brand-500/0 via-brand-500/40 to-brand-500/0 sm:mt-24 sm:h-20"
        />
      </div>

      {/* Owner pivot - dark editorial band that targets a different
          audience (owners who want their property managed). Routes the
          interested ones to /gestion where the full pitch + lead form
          lives, so the home page stays focused on the buyer/renter
          journey. */}
      <OwnerCallout />
    </>
  );
}
