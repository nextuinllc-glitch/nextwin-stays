"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
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

  // iOS Safari quirk: the `autoplay` attribute is honoured at HTML-
  // parse time, but when React mounts the <video> via JS (which
  // happens on every client-side navigation back to "/"), Safari
  // sometimes refuses to auto-start the new element and leaves it
  // frozen on its poster frame. Calling .play() explicitly on mount,
  // and again whenever the page is restored from the bfcache, makes
  // playback start reliably regardless of how the user got here.
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const tryPlay = (v: HTMLVideoElement | null) => {
      if (!v) return;
      const p = v.play();
      if (p && typeof p.catch === "function") {
        // Autoplay can still be blocked (Low Power Mode, user setting).
        // Swallow the rejection — the poster stays visible in that
        // case rather than throwing in the console.
        p.catch(() => {});
      }
    };
    tryPlay(mobileVideoRef.current);
    tryPlay(desktopVideoRef.current);
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        tryPlay(mobileVideoRef.current);
        tryPlay(desktopVideoRef.current);
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [videoMobile, videoDesktop]);
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
    // -mt-16 pulls the section up under the transparent home-page
    // header (Header.tsx renders bg-transparent when overHero is
    // true) so the video starts at Y=0 and the Logo + nav appear to
    // float directly on top of it, edge-to-edge. The header's 64 px
    // height is restored on the inner content by the flex centring,
    // so the wordmark + search bar stay vertically balanced within
    // the visible video area.
    <section className="relative -mt-16 bg-ink">
      <div className="absolute inset-0 overflow-hidden bg-ink">
        {hasVideo ? (
          <>
            {/* Persistent <img> poster layer behind the videos. On
                client-side navigation back to "/" the new <video>
                element sometimes paints a brief black frame before its
                own `poster=` decodes — by stacking the poster as a
                plain <img> underneath, the visitor sees the still
                photo immediately and the video fades in on top once
                it's ready. The browser deduplicates the URL with the
                <video poster> attribute, so this costs no extra fetch. */}
            {videoPosterMobile && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={videoPosterMobile}
                alt=""
                aria-hidden
                fetchPriority="high"
                decoding="async"
                className={cn(
                  // z-0 keeps the poster image strictly below the
                  // video layer. Without this it'd render on top
                  // (positioned elements paint above unpositioned
                  // siblings in the same stacking context) and hide
                  // the video entirely.
                  // `fetchPriority="high"` tells the browser this is
                  // the LCP candidate so it downloads ahead of the
                  // video bytes — keeps LCP locked on the poster
                  // (~1.5s) instead of the video first frame (~2.5s).
                  "absolute inset-0 z-0 h-full w-full object-cover",
                  bothPresent && "md:hidden",
                )}
              />
            )}
            {videoPosterDesktop && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={videoPosterDesktop}
                alt=""
                aria-hidden
                fetchPriority="high"
                decoding="async"
                className={cn(
                  "absolute inset-0 z-0 h-full w-full object-cover",
                  bothPresent && "hidden md:block",
                )}
              />
            )}
            {videoMobile && (
              <video
                ref={mobileVideoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={videoPosterMobile ?? undefined}
                disablePictureInPicture
                disableRemotePlayback
                className={cn(
                  // `relative z-10` puts the video above the poster
                  // <img> layer (z-0) but below the dark gradient
                  // overlay (z-20). Without an explicit z the
                  // positioned <img> would paint on top.
                  "relative z-10 h-full w-full object-cover",
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
                ref={desktopVideoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={videoPosterDesktop ?? undefined}
                disablePictureInPicture
                disableRemotePlayback
                className={cn(
                  "relative z-10 h-full w-full object-cover",
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
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/35 via-black/30 to-black/55" />
      </div>

      {/* Hero is 85vh on phones / 90vh on ≥md — the 5-point trim on
          mobile keeps Safari's URL bar and home-indicator from cropping
          the wordmark + scroll-cue chevron at the fold. `min-h-` (not
          `h-`) so the content can still grow on very small phones
          where the wordmark + subtitle need more room. */}
      <div className="relative z-30 flex min-h-[92vh] items-center md:min-h-[94vh]">
        <div className="container-page flex w-full flex-col items-center justify-center py-16 text-center sm:py-20 lg:py-24">
          <h1
            className="whitespace-nowrap font-sans text-[20px] font-normal uppercase leading-[1.05] tracking-[0.08em] text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)] min-[380px]:text-2xl min-[380px]:tracking-[0.1em] sm:text-4xl sm:tracking-[0.18em] md:text-5xl md:tracking-[0.2em] lg:text-[68px]"
          >
            Nextwin
            <span aria-hidden className="mx-1.5 align-middle text-white/45 sm:mx-3">·</span>
            {t.logo.tagline}
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

          {/* Date + guests search bar intentionally removed from the global
              hero. It was a SHORT_STAY-only entry point (Airbnb-style book-
              ing flow); now that the site spans Acheter, Louer and Court
              séjour, the canonical entry is the kind-aware category pills
              on the "Nos meilleures propriétés" section just below the
              hero. The date picker still ships on /properties (the Court
              séjour catalogue) for the booking flow. */}
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
