"use client";

import Image from "next/image";
import { Suspense } from "react";
import { ChevronDown } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

type Props = {
  // Static fallback used when no videos are uploaded.
  posterImage: string;
  // Optional uploaded videos. When both are null, the static image is the
  // entire background (no <video> tag is rendered).
  videoDesktop?: string | null;
  videoMobile?: string | null;
  // First-frame snapshots auto-generated from the videos themselves
  // (scripts/extract-hero-posters.mjs). Used as `<video poster>` so the
  // hero paints an image *identical* to frame 0 while the bytes are
  // still streaming — the handoff from still → motion is invisible.
  videoPosterDesktop?: string | null;
  videoPosterMobile?: string | null;
  // Admin-edited subtitle per locale. An empty string in any slot means
  // "use the i18n dictionary default" — keeps the seeded copy as the
  // fallback when the admin only translates one language.
  subtitle?: { fr: string; en: string; ar: string };
  // Editorial dateline (tracked label under the wordmark). Per-locale;
  // empty string in a slot hides the line for that locale.
  tagline?: { fr: string; en: string; ar: string };
};

function inferMime(url: string) {
  const lower = url.split("?")[0].toLowerCase();
  if (lower.endsWith(".webm")) return "video/webm";
  return "video/mp4";
}

export function Hero({
  posterImage,
  videoDesktop,
  videoMobile,
  videoPosterDesktop,
  videoPosterMobile,
  subtitle,
  tagline,
}: Props) {
  const { t, locale } = useI18n();
  // Three states for the admin subtitle:
  //   - undefined  → prop wasn't threaded through (admin preview, etc.) → dictionary default
  //   - "something" → admin typed copy → use it verbatim
  //   - ""         → admin explicitly cleared the field → render NOTHING
  // The previous `||` short-circuit treated "" and undefined identically,
  // so clearing the field silently fell back to the dictionary and the
  // admin's intent was lost.
  const raw = subtitle?.[locale]?.trim();
  const heroSubtitle = raw === undefined ? t.hero.subtitle : raw;

  // Tagline: per-locale, empty = hide. Default falls back to the FR
  // seed if the prop wasn't threaded through (admin previews), so the
  // dateline never disappears in the wrong context.
  const heroTagline = tagline?.[locale]?.trim() ?? "Maisons de Marrakech";
  const hasVideo = Boolean(videoDesktop || videoMobile);
  // Both ends present? Render two `<video>` elements with mutually-
  // exclusive Tailwind visibility so each viewport sees ONE consistent
  // file. The old single-`<video>` with `<source media="…">` approach
  // is unreliable: most browsers commit to the source they pick on
  // first load and never re-evaluate on resize/orientation, and on
  // some mobile Safari versions the picker chose the desktop source
  // anyway. The two-video pattern is the only deterministic fix.
  const bothPresent = Boolean(videoDesktop && videoMobile);

  return (
    <section className="relative bg-ink">
      <div className="absolute inset-0 overflow-hidden bg-ink">
        {hasVideo ? (
          <>
            {videoMobile && (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={videoPosterMobile ?? undefined}
                disablePictureInPicture
                disableRemotePlayback
                className={cn(
                  "h-full w-full object-cover",
                  // Hide on ≥md ONLY if there's a separate desktop video
                  // to swap in; otherwise the mobile video doubles as
                  // the desktop fallback so we leave it visible.
                  bothPresent && "md:hidden",
                )}
              >
                <source src={videoMobile} type={inferMime(videoMobile)} />
              </video>
            )}
            {videoDesktop && (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={videoPosterDesktop ?? undefined}
                disablePictureInPicture
                disableRemotePlayback
                className={cn(
                  "h-full w-full object-cover",
                  // Hide on <md ONLY when there's a separate mobile
                  // video; otherwise this video covers both viewports.
                  bothPresent && "hidden md:block",
                )}
              >
                <source src={videoDesktop} type={inferMime(videoDesktop)} />
              </video>
            )}
          </>
        ) : (
          <Image
            src={posterImage}
            alt="Villa pool at golden hour"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        {/* Dark gradient overlay — keeps the white headline readable over
            any video frame regardless of brightness. */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/30 to-black/55" />
      </div>

      {/* Hero is 85vh on phones / 90vh on ≥md — the 5-point trim on
          mobile keeps Safari's URL bar and home-indicator from cropping
          the wordmark + scroll-cue chevron at the fold. `min-h-` (not
          `h-`) so the content can still grow on very small phones
          where the wordmark + subtitle need more room. */}
      <div className="relative flex min-h-[85vh] items-center md:min-h-[90vh]">
        <div className="container-page flex w-full flex-col items-center justify-center py-16 text-center sm:py-20 lg:py-24">
          <h1
            className="whitespace-nowrap font-sans text-[20px] font-normal uppercase leading-[1.05] tracking-[0.08em] text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)] min-[380px]:text-2xl min-[380px]:tracking-[0.1em] sm:text-4xl sm:tracking-[0.18em] md:text-5xl md:tracking-[0.2em] lg:text-[68px]"
          >
            Nextwin
            <span aria-hidden className="mx-1.5 align-middle text-white/45 sm:mx-3">·</span>
            Stay
          </h1>

          {/* Editorial dateline — tracked label below the wordmark
              flanked by hairline rules, the Aman/Belmond signage
              convention. The rules carry the framing on their own so
              we drop the standalone end-caps; spacing rebalances
              automatically when the tagline or subtitle is hidden. */}
          {heroTagline && (
            <span className="mt-3 inline-flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.24em] text-white/75 min-[380px]:text-[9px] min-[380px]:tracking-[0.32em] sm:mt-5 sm:gap-3 sm:text-[10px] sm:tracking-[0.5em] md:text-[11px]">
              <span aria-hidden className="h-px w-5 bg-white/45 min-[380px]:w-8 sm:w-12 md:w-14" />
              {heroTagline}
              <span aria-hidden className="h-px w-5 bg-white/45 min-[380px]:w-8 sm:w-12 md:w-14" />
            </span>
          )}

          {heroSubtitle && (
            <p className="mt-5 max-w-md text-[13px] font-light leading-relaxed text-white/85 sm:mt-6 sm:text-sm md:text-base">
              {heroSubtitle}
            </p>
          )}

          {/* Search form: desktop only. On mobile the floating bottom-nav
              "Dates" button is the entry point — we keep the hero clean
              and cinematic instead of crowded with form fields. */}
          <div className="mt-12 hidden w-full md:block">
            <div className="flex justify-center">
              {/* Suspense boundary required because SearchBar reads
                  useSearchParams() to hydrate dates / guests from URL,
                  which static-export builds can't pre-render without
                  it. */}
              <Suspense>
                <SearchBar variant="hero" />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Scroll cue — a glass pill at the bottom-center of the hero
            telling users there's more below. The translucent fill +
            backdrop-blur read as a soft 3D button floating in front of
            the video; the bouncing chevron animates the affordance. The
            link target is a hash to #properties (the first section the
            home page renders below the hero) so a tap on the pill scrolls
            smoothly there too. */}
        <a
          href="#properties"
          aria-label="Scroll to listings"
          className="group absolute bottom-6 left-1/2 z-10 -translate-x-1/2 sm:bottom-10"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md transition group-hover:scale-110 group-hover:border-white/60 group-hover:bg-white/20 sm:h-14 sm:w-14">
            <ChevronDown className="h-6 w-6 animate-bounce sm:h-7 sm:w-7" strokeWidth={2.25} />
          </span>
        </a>
      </div>
    </section>
  );
}
