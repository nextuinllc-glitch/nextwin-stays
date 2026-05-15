"use client";

import { Hero } from "@/components/Hero";
import { PropertyGrid } from "@/components/PropertyGrid";
import { CategoryButtons } from "@/components/CategoryButtons";
import { ShieldCheck, MessageCircle, Sparkles } from "lucide-react";
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

      {/* Editorial section header — tighter top padding so the
          "Marrakech · Curated stays" eyebrow + the section title peek
          above the fold on first load and tell the visitor there's
          more to scroll, instead of leaving them looking at a pure
          black band under the hero. `#properties` is the anchor
          target for the hero's scroll-cue chevron. */}
      <section id="properties" className="container-page pb-4 pt-8 sm:pt-12">
        <div className="flex flex-col items-center gap-8 text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-600">
            {get("sectionEyebrow", t.home.sectionEyebrow)}
          </span>
          <h2 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            {get("sectionTitle", t.home.sectionTitle)}
          </h2>
          <span aria-hidden className="block h-px w-16 bg-brand-500/60" />
          <CategoryButtons />
        </div>
      </section>

      <div className="pt-12 sm:pt-16">
        <PropertyGrid properties={featured} />
      </div>

      <section className="mt-24 bg-cream-100 sm:mt-32">
        <div className="container-page py-24 sm:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-600">
              Reservation
            </span>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
              {get("bookingSimpleTitle", t.home.bookingSimpleTitle)}
            </h2>
            <span aria-hidden className="mx-auto mt-6 block h-px w-16 bg-brand-500/60" />
            <p className="mt-6 text-base leading-relaxed text-ink-muted sm:text-lg">
              {get("bookingSimpleSubtitle", t.home.bookingSimpleSubtitle)}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
            <Step
              icon={<Sparkles className="h-5 w-5" />}
              title={get("stepCuratedTitle", t.home.stepCuratedTitle)}
              body={get("stepCuratedBody", t.home.stepCuratedBody)}
            />
            <Step
              icon={<ShieldCheck className="h-5 w-5" />}
              title={get("stepCancelTitle", t.home.stepCancelTitle)}
              body={get("stepCancelBody", t.home.stepCancelBody)}
            />
            <Step
              icon={<MessageCircle className="h-5 w-5" />}
              title={get("stepConciergeTitle", t.home.stepConciergeTitle)}
              body={get("stepConciergeBody", t.home.stepConciergeBody)}
            />
          </div>
        </div>
      </section>
    </>
  );
}

function Step({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    /* Editorial step card — bone surface, hairline border, gold accent
       wrapping the icon. Generous padding so the card breathes. */
    <div className="rounded-none border border-cream-300 bg-cream-50 p-10">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-brand-500/60 text-brand-600">
        {icon}
      </div>
      <h3 className="mt-6 font-display text-xl font-semibold text-ink">{title}</h3>
      <span aria-hidden className="mt-4 block h-px w-10 bg-brand-500/40" />
      <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}
