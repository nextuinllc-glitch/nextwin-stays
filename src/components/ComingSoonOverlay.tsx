"use client";

import { useI18n } from "@/i18n/I18nProvider";

/**
 * Locale-aware text overlay layered on top of the cream coming-soon
 * placeholder SVG. The SVG provides the visual chrome (gradient, frame,
 * brand-pink hairline ornament); this component sits absolutely on top
 * and renders the brand eyebrow + display headline + caption in the
 * active locale (FR / EN / AR).
 *
 * Used by:
 *   - PropertyCard (the card carousel preview on listing grids + home)
 *   - Gallery       (the full image gallery on /properties/[slug])
 *
 * `size` toggles type scale: "card" is tighter for the small card preview;
 * "gallery" is larger for the full-width detail-page hero.
 */
type Props = {
  size?: "card" | "gallery";
};

export function ComingSoonOverlay({ size = "card" }: Props) {
  const { t } = useI18n();
  const isGallery = size === "gallery";

  return (
    <div
      aria-label={t.comingSoon.title}
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div className="px-6 text-center">
        <span
          className={`block font-semibold uppercase text-brand-600 ${
            isGallery
              ? "text-[12px] tracking-[0.42em]"
              : "text-[9px] tracking-[0.32em] sm:text-[10px] sm:tracking-[0.36em]"
          }`}
        >
          {t.comingSoon.eyebrow}
        </span>
        <h3
          className={`mt-3 font-display italic font-medium text-ink [text-wrap:balance] ${
            isGallery ? "text-5xl sm:text-7xl" : "text-2xl sm:text-3xl"
          }`}
        >
          {t.comingSoon.title}
        </h3>
        {isGallery && (
          <p className="mx-auto mt-5 max-w-md text-sm text-ink-muted sm:text-base">
            {t.comingSoon.caption}
          </p>
        )}
      </div>
    </div>
  );
}
