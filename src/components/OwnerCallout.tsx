"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Dark editorial band that pivots the home page from buyer/renter
 * messaging to owners. Two-column layout on desktop (text + bespoke
 * villa-and-key illustration), single column stacked on mobile. The
 * illustration carries a subtle hover animation - the key lifts and
 * rotates on parent hover, signalling "we hand you the keys to a
 * managed property".
 */
export function OwnerCallout() {
  const { t } = useI18n();
  return (
    <section aria-label={t.ownerCallout.eyebrow} className="group bg-ink">
      <div className="container-page py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          {/* Text column - centred on mobile, left-aligned on desktop
              so the illustration on the right reads as the editorial
              counter-weight. */}
          <div className="text-center lg:text-left">
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-400">
              {t.ownerCallout.eyebrow}
            </span>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
              {t.ownerCallout.title}
            </h2>
            <span
              aria-hidden
              className="mt-5 block h-px w-12 bg-brand-500/60 mx-auto lg:mx-0"
            />
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base lg:mx-0 mx-auto">
              {t.ownerCallout.body}
            </p>
            <div className="mt-8 flex justify-center sm:mt-10 lg:justify-start">
              <Link
                href="/gestion"
                className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-ink transition hover:bg-brand-600 hover:text-white hover:ring-2 hover:ring-white/40"
              >
                {t.ownerCallout.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Illustration column - bespoke villa + key SVG. Wrapped in
              a Link so the whole illustration is a click target into
              /gestion (mirrors how the cards on the catalogue work).
              On hover the section group adds a class that the inline
              <style> below targets to lift + rotate the key. */}
          <Link
            href="/gestion"
            aria-label={t.ownerCallout.cta}
            className="relative mx-auto block w-full max-w-md lg:max-w-none"
          >
            <Image
              src="/owner-illustration.svg"
              alt=""
              width={600}
              height={600}
              priority={false}
              className="owner-illo h-auto w-full select-none"
            />
          </Link>
        </div>
      </div>

      {/*
        Hover interaction on the illustration. We can't put inline
        CSS animations on parts of an <img> SVG (the browser flattens
        it), so the SVG is shipped as a static <Image> and the
        animation is achieved by applying a subtle composite transform
        to the whole image on hover. Slow ease, never noisy.
      */}
      <style jsx>{`
        .owner-illo {
          transform-origin: 50% 60%;
          transition: transform 700ms cubic-bezier(0.2, 0.7, 0.2, 1),
                      filter 700ms ease-out;
          filter: drop-shadow(0 14px 30px rgba(224, 11, 65, 0.18));
        }
        .group:hover .owner-illo {
          transform: scale(1.03) rotate(-1.5deg);
          filter: drop-shadow(0 22px 44px rgba(224, 11, 65, 0.32));
        }
      `}</style>
    </section>
  );
}
