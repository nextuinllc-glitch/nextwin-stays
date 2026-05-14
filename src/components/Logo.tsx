"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  variant?: "default" | "light";
};

// Editorial monogram + wordmark — modelled on the signage of high-end
// hospitality brands (Aman, Belmond, Cheval Blanc).
//
//   ┌───┐  NEXTWIN · STAY
//   │ N │  ─ MARRAKECH
//   └───┘
//
// Responsive sizing is the bigger story than the visual style: this
// mark must clear an iPhone SE / mini (320–375 px viewport) WITH the
// hamburger menu beside it. Mobile uses a compact monogram + tighter
// letter-spacing; everything opens up at the `sm` breakpoint so
// tablets and desktops get the breathy luxury proportions.
export function Logo({ className, variant = "default" }: LogoProps) {
  const isLight = variant === "light";
  const inkTone = isLight ? "text-white" : "text-ink";
  const subtleTone = isLight ? "text-white/60" : "text-ink-soft";
  const markBorder = isLight ? "border-white/70" : "border-brand-500/70";
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
          "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors min-[380px]:h-8 min-[380px]:w-8 sm:h-9 sm:w-9",
          markBorder,
          markStroke,
        )}
      >
        <svg
          viewBox="0 0 20 20"
          className="h-[15px] w-[15px] min-[380px]:h-4 min-[380px]:w-4 sm:h-[18px] sm:w-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.4}
          strokeLinecap="butt"
        >
          {/* Editorial N — hairline verticals connected by a single
              diagonal, sized to leave a sliver of negative space
              inside the ring on every side. */}
          <path d="M5 15.5V4.5L15 15.5V4.5" />
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
