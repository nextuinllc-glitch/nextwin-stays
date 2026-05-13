"use client";

import Image from "next/image";
import { Suspense } from "react";
import { ChevronDown } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

type Props = {
  // Static fallback — also used as the <video poster> so the hero paints
  // instantly while the video frames stream in.
  posterImage: string;
  // Optional uploaded videos. When both are null, the static image is the
  // entire background (no <video> tag is rendered).
  videoDesktop?: string | null;
  videoMobile?: string | null;
};

function inferMime(url: string) {
  const lower = url.split("?")[0].toLowerCase();
  if (lower.endsWith(".webm")) return "video/webm";
  return "video/mp4";
}

export function Hero({ posterImage, videoDesktop, videoMobile }: Props) {
  const { t } = useI18n();
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
    <section className="relative">
      <div className="absolute inset-0 overflow-hidden">
        {hasVideo ? (
          <>
            {videoMobile && (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={posterImage}
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
                preload="metadata"
                poster={posterImage}
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

      {/* Hero takes 90vh on every breakpoint — leaves a strip of the next
          section visible at the fold so users see the page is scrollable.
          `min-h-` (not `h-`) so the content can still grow on very small
          phones where the wordmark + subtitle + safe-area padding need
          more room than 90vh would give them. */}
      <div className="relative flex min-h-[90vh] items-center">
        <div className="container-page flex w-full flex-col items-center justify-center py-16 text-center sm:py-20 lg:py-24">
          <h1 className="font-display text-6xl font-semibold leading-none tracking-tight text-white drop-shadow-[0_8px_30px_rgba(0,0,0,0.45)] sm:text-7xl lg:text-[128px]">
            NEXT<span className="text-shimmer-blue">WIN</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg">
            {t.hero.subtitle}
          </p>
          <div className="mt-3 h-px w-16 bg-white/40" />

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
