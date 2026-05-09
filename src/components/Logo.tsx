"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

type LogoProps = {
  className?: string;
  variant?: "default" | "light";
};

// Marrakech caïdale-tent mark — a more authentic, two-tier silhouette
// of the ceremonial Moroccan tent. Distinct elements (real caïdales
// have all of these):
//
//   1. Five-pointed Moroccan star finial   ← top
//   2. Centre pole
//   3. Upper steep peak (tier 1)
//   4. Wider main canopy (tier 2)           ← the visual mass
//   5. Scalloped lower edge of the canopy  ← classic decorative trim
//   6. Side fabric panels (vertical walls)
//   7. Horseshoe-arch entrance in the front
//
// All elements are drawn so they read at any size (favicon to header).
// No tile / square frame around the mark — the tent stands alone.
export function Logo({ className, variant = "default" }: LogoProps) {
  const { t } = useI18n();
  const tone = variant === "light" ? "text-white" : "text-ink";
  const accent = variant === "light" ? "text-brand-200" : "text-brand-600";

  // Two-tone palette per variant. Default = sun-baked terracotta,
  // light variant flips to champagne-gold for hero overlays.
  const stops =
    variant === "light"
      ? { hi: "#E5C68A", mid: "#C49A52", lo: "#A07835" }
      : { hi: "#D89466", mid: "#B85432", lo: "#7C2F1A" };

  // Doorway "negative space" colour — must match the surface behind
  // the logo so the cut-out reads cleanly. Warm sand on the page bg,
  // dark translucent over hero photos.
  const doorway = variant === "light" ? "rgba(0,0,0,0.30)" : "#FAF6EC";

  return (
    <Link
      href="/"
      aria-label="NEXTWIN"
      className={cn("inline-flex items-center gap-3", className)}
    >
      <svg
        viewBox="0 0 32 36"
        className="h-12 w-12 shrink-0 drop-shadow-[0_2px_5px_rgba(124,47,26,0.22)]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          {/* Vertical gradient — the canopy is sun-lit at the peak,
              fades into deeper terracotta at the base where shadow
              gathers under tent fabric. */}
          <linearGradient id="nx-tent-canopy" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stops.hi} />
            <stop offset="55%" stopColor={stops.mid} />
            <stop offset="100%" stopColor={stops.lo} />
          </linearGradient>
          {/* Side walls — slightly darker so they read as set back
              from the canopy plane. */}
          <linearGradient id="nx-tent-walls" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stops.mid} />
            <stop offset="100%" stopColor={stops.lo} />
          </linearGradient>
        </defs>

        {/* 1 — Five-pointed star finial. Echoes the green star on the
            Moroccan flag. Drawn as a 5-point pentagram fitted into a
            tiny radius so it reads at any size. */}
        <path
          d="M 16 1.6
             L 16.85 3.55
             L 18.95 3.65
             L 17.30 4.95
             L 17.85 7.00
             L 16 5.85
             L 14.15 7.00
             L 14.70 4.95
             L 13.05 3.65
             L 15.15 3.55
             Z"
          fill={stops.hi}
        />

        {/* 2 — Centre pole. Connects the finial to the upper peak. */}
        <line
          x1="16"
          y1="6.5"
          x2="16"
          y2="9.5"
          stroke={stops.mid}
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* 3 — Upper steep peak (tier 1). Small narrow triangle —
            this is what gives caïdale tents their distinctive double-
            pointed silhouette vs. a single-pyramid Western tent. */}
        <path
          d="M 16 9.5
             L 12 14.5
             L 20 14.5
             Z"
          fill="url(#nx-tent-canopy)"
        />

        {/* 4 — Main canopy (tier 2). Wider trapezoidal span. The peak
            of this tier sits a little above the upper peak's base so
            the two tiers visually overlap, giving the silhouette
            depth. */}
        <path
          d="M 16 13
             L 4 27
             L 28 27
             Z"
          fill="url(#nx-tent-canopy)"
        />

        {/* 5 — Scalloped trim along the bottom edge of the main canopy.
            Six small arcs — the classic decorative finish on caïdale
            tent fabric. */}
        <path
          d="M 4.5 27
             Q 6.5 25.6, 8.5 27
             Q 10.5 25.6, 12.5 27
             Q 14.5 25.6, 16 27
             Q 17.5 25.6, 19.5 27
             Q 21.5 25.6, 23.5 27
             Q 25.5 25.6, 27.5 27"
          stroke={stops.lo}
          strokeWidth="0.9"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />

        {/* 6 — Side fabric walls (the vertical panels under the canopy).
            Thin rectangle, slightly darker than the canopy so it reads
            as set back. */}
        <rect
          x="7"
          y="27"
          width="18"
          height="7.5"
          fill="url(#nx-tent-walls)"
        />

        {/* 7 — Horseshoe-arch entrance, cut from the centre of the
            walls. The cut-out fills with the surface colour so the
            arch reads as an opening, not a shape. */}
        <path
          d="M 13 34.5
             L 13 30.5
             C 13 28.7, 16 28.4, 16 28.4
             C 16 28.4, 19 28.7, 19 30.5
             L 19 34.5
             Z"
          fill={doorway}
        />

        {/* 8 — Ground line under the tent. Subtle hairline that
            grounds the silhouette without competing with it. */}
        <path
          d="M 5 35 L 27 35"
          stroke={stops.lo}
          strokeWidth="0.8"
          strokeLinecap="round"
          opacity="0.45"
        />
      </svg>

      <span className="flex flex-col leading-none">
        {/* Split-colour wordmark — NEXT in ink, WIN in terracotta. */}
        <span className={cn("font-display text-xl font-semibold tracking-[-0.01em]", tone)}>
          NEXT
          <span className={variant === "light" ? "text-brand-300" : "text-brand-500"}>
            WIN
          </span>
        </span>
        <span
          className={cn(
            "mt-0.5 text-[10px] font-semibold uppercase tracking-[0.24em]",
            accent,
          )}
        >
          {t.logo.tagline}
        </span>
      </span>
    </Link>
  );
}
