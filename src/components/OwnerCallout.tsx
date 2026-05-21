"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Owner pivot band - full-bleed luxe interior photo as the background,
 * with the text + CTA layered on top behind a dark-to-transparent
 * left-to-right scrim so the message stays readable while the photo
 * still breathes. Mirrors the editorial codes of high-end real-estate
 * sites (Sotheby's, Christie's): single immersive image, restrained
 * type, one clear CTA. A slow Ken-Burns zoom + brand-pink halo fire
 * on hover so the section reads as alive, not static.
 */
export function OwnerCallout() {
  const { t } = useI18n();
  return (
    <section
      aria-label={t.ownerCallout.eyebrow}
      className="owner-band group relative overflow-hidden bg-ink"
    >
      {/* Full-bleed background photo. Sits at z-0 behind every overlay
          and the content. Slow Ken-Burns zoom on parent hover. */}
      <Image
        src="/owner-bg.jpg"
        alt={t.ownerCallout.title}
        fill
        sizes="100vw"
        priority={false}
        className="owner-band-img object-cover"
      />

      {/* Dark left-to-right scrim - keeps the text column legible while
          letting the photo breathe on the right. Mobile uses a bottom-
          to-top variant so the centred text on a small screen still
          reads clearly. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-ink/95 via-ink/70 to-ink/30 lg:bg-gradient-to-r lg:from-ink/95 lg:via-ink/70 lg:to-ink/10"
      />

      {/* Brand-pink wash - barely visible at rest, intensifies on hover
          to signal the section is interactive. */}
      <div
        aria-hidden
        className="owner-band-tint pointer-events-none absolute inset-0 z-10 bg-gradient-to-tr from-brand-700/15 via-transparent to-transparent"
      />

      {/* Content - text + CTA. lg:max-w-xl + mr-auto pins it to the
          left half on desktop, leaving the right side of the photo
          visible. Centred on mobile. */}
      <div className="container-page relative z-20 py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-left">
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-400">
            {t.ownerCallout.eyebrow}
          </span>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl [text-wrap:balance]">
            {t.ownerCallout.title}
          </h2>
          <span
            aria-hidden
            className="mt-5 block h-px w-12 bg-brand-500/70 mx-auto lg:mx-0"
          />
          <p className="mt-5 text-sm leading-relaxed text-white/85 sm:text-base lg:max-w-lg">
            {t.ownerCallout.body}
          </p>
          <div className="mt-8 flex justify-center sm:mt-10 lg:justify-start">
            <Link
              href="/gestion"
              className="group/cta inline-flex items-center gap-3 rounded-full bg-white px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-ink shadow-lg transition hover:bg-brand-600 hover:text-white hover:ring-2 hover:ring-white/40"
            >
              {t.ownerCallout.cta}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/cta:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Editorial wordmark anchor in the bottom-right corner - keeps
          the right half of the photo (visible on desktop) feeling
          branded, not anonymous. Locale-aware via t.gestion.heroEyebrow. */}
      <div className="pointer-events-none absolute bottom-4 right-4 z-20 hidden text-right lg:block">
        <span className="text-[10px] font-semibold uppercase tracking-[0.4em] text-white/55">
          Nextwin · {t.gestion.heroEyebrow}
        </span>
      </div>

      {/*
        Slow Ken-Burns zoom on the background photo + brand-pink wash
        intensifies on parent hover. No JS - pure CSS transitions on
        the section's .group state.
      */}
      <style jsx>{`
        .owner-band-img {
          transition: transform 2500ms cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        .owner-band-tint {
          transition: opacity 700ms ease-out;
          opacity: 0.75;
        }
        .group:hover .owner-band-img {
          transform: scale(1.04);
        }
        .group:hover .owner-band-tint {
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
