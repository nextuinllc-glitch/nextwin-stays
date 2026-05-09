"use client";

import Image from "next/image";
import { Suspense } from "react";
import { SearchBar } from "./SearchBar";
import { useI18n } from "@/i18n/I18nProvider";

type Props = {
  // Static fallback — also used as the <video poster> so the hero paints
  // instantly while the video frames stream in.
  posterImage: string;
  // Optional uploaded videos. When both are null, the static image is the
  // entire background (no <video> tag is rendered).
  videoDesktop?: string | null;
  videoMobile?: string | null;
};

// Width breakpoint that tells the browser which <source> to use. Mirrors
// Tailwind's `md:` so the visual switch lines up with our CSS layout.
const MOBILE_MEDIA = "(max-width: 767px)";

function inferMime(url: string) {
  const lower = url.split("?")[0].toLowerCase();
  if (lower.endsWith(".webm")) return "video/webm";
  return "video/mp4";
}

export function Hero({ posterImage, videoDesktop, videoMobile }: Props) {
  const { t } = useI18n();
  const hasVideo = Boolean(videoDesktop || videoMobile);

  return (
    <section className="relative">
      <div className="absolute inset-0 overflow-hidden">
        {hasVideo ? (
          // The browser evaluates <source media="…"> in document order and
          // picks the first match — listing mobile first makes phones load
          // the lighter portrait file. Desktop falls through to the
          // unconstrained <source>. `poster` paints immediately so users
          // never see a black frame on slow networks.
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={posterImage}
            // Object-cover ensures the video fills the section regardless
            // of its native aspect ratio — same behaviour as the image.
            className="h-full w-full object-cover"
            // disablePictureInPicture + disableRemotePlayback keep the
            // video locked as decoration, not media the user can extract.
            disablePictureInPicture
            disableRemotePlayback
          >
            {videoMobile && (
              <source src={videoMobile} type={inferMime(videoMobile)} media={MOBILE_MEDIA} />
            )}
            {videoDesktop && (
              <source src={videoDesktop} type={inferMime(videoDesktop)} />
            )}
            {/* If neither source loads (e.g., codec unsupported), the
                browser falls through and the poster image stays visible. */}
          </video>
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

      <div className="relative flex min-h-screen items-center">
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
      </div>
    </section>
  );
}
