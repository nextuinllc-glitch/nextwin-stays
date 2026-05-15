"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "default" | "light";
};

// Moorish-arch monogram + wordmark — modelled on the engraved signage
// of high-end hospitality brands (Aman, Belmond, Cheval Blanc), but
// rooted in Marrakech architecture: a slim horseshoe-arch silhouette
// (the iconic keyhole doorway you walk through at any riad or palace)
// frames the editorial N, with a tiny base line that grounds the arch
// like a stone threshold.
//
//   ╭─╮  NEXTWIN · STAY
//   │N│  ─ MARRAKECH
//   ─ ─
//
// Responsive sizing keeps the mark compact on iPhone SE / mini /
// 11 Pro (320–375 px viewport) so the Logo + hamburger never crowd.
// At `sm` and `md` everything opens up to luxury proportions.
export function Logo({ className, variant = "default" }: LogoProps) {
  const isLight = variant === "light";
  const inkTone = isLight ? "text-white" : "text-ink";
  const subtleTone = isLight ? "text-white/60" : "text-ink-soft";
  const markStroke = isLight ? "text-white" : "text-brand-600";
  const dotTone = isLight ? "text-white/60" : "text-brand-500";

  return (
    <Link
      href="/"
      aria-label="NEXTWIN STAY · Marrakech"
      className={cn(
        "group inline-flex shrink-0 items-center gap-2 sm:gap-2.5",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex h-7 w-7 shrink-0 items-center justify-center transition-colors min-[380px]:h-8 min-[380px]:w-8 sm:h-9 sm:w-9",
          markStroke,
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-full w-full"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Horseshoe arch — two columns + a 270° arc on top, mirroring
              Marrakech's signature keyhole doorways. */}
          <path d="M4 22 L4 11 A 8 8 0 0 1 20 11 L 20 22" />
          {/* Tiny base line — grounds the arch like a stone threshold. */}
          <path d="M3 22 L21 22" strokeWidth="1" opacity="0.85" />
          {/* The N — hairline verticals connected by a single
              diagonal, sized to sit inside the arch with breathing
              room on every side. */}
          <path d="M8.5 17 V9 L 15.5 17 V9" />
        </svg>
      </span>

      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[11px] font-semibold uppercase tracking-[0.14em] min-[380px]:text-[12px] min-[380px]:tracking-[0.18em] sm:text-[15px] sm:tracking-[0.28em] md:text-base",
            inkTone,
          )}
        >
          Nextwin <span className={dotTone}>·</span> Stay
        </span>
        <span
          className={cn(
            "mt-0.5 text-[7px] font-semibold uppercase tracking-[0.28em] min-[380px]:mt-1 min-[380px]:text-[8px] min-[380px]:tracking-[0.36em] sm:mt-1.5 sm:text-[9px] sm:tracking-[0.5em]",
            subtleTone,
          )}
        >
          Marrakech
        </span>
      </span>
    </Link>
  );
}
