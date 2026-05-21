"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BedDouble, KeyRound, Building2 } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Home page "choose your lane" portal. Three full-bleed columns - Court
 * séjour, Long durée, Achat - sit directly under the hero and qualify
 * the visitor in a single tap. Editorial / minimalist on rest; on hover
 * the column floods with the kind's accent colour so the eye knows
 * exactly where the click will land.
 *
 * Inspired by Empire Mansions's 4-column landing portal, adapted to our
 * three listing kinds and our existing sky / amber / emerald palette
 * (the same accents used for the team specialty pills on /about).
 */
type Accent = "sky" | "amber" | "emerald";

type Lane = {
  href: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  accent: Accent;
};

// Per-accent classes. Tailwind JIT only generates CSS for class names it
// sees as literal strings in source - it cannot follow string
// interpolation like `hover:${a.bgFill}` because that string is only
// assembled at runtime. So every variant (filled / hover / group-hover)
// is spelled out below as a literal, and the lookup just picks the
// right column. Adding a new accent is one entry here.
const ACCENT: Record<
  Accent,
  {
    filledBg: string;       // applied when the column is "filled" (active/in-view)
    hoverBg: string;        // applied as hover: on the Link itself
    ctaFilledText: string;  // CTA text colour over the white pill in filled state
    ctaHoverText: string;   // CTA text colour on group-hover over white pill
    ctaRestBg: string;      // CTA fill colour at rest (kind-tinted pill on cream column)
  }
> = {
  sky: {
    filledBg: "bg-sky-700",
    hoverBg: "hover:bg-sky-700",
    ctaFilledText: "text-sky-700",
    ctaHoverText: "group-hover:text-sky-700",
    ctaRestBg: "bg-sky-600",
  },
  amber: {
    filledBg: "bg-amber-700",
    hoverBg: "hover:bg-amber-700",
    ctaFilledText: "text-amber-700",
    ctaHoverText: "group-hover:text-amber-700",
    ctaRestBg: "bg-amber-600",
  },
  emerald: {
    filledBg: "bg-emerald-800",
    hoverBg: "hover:bg-emerald-800",
    ctaFilledText: "text-emerald-800",
    ctaHoverText: "group-hover:text-emerald-800",
    ctaRestBg: "bg-emerald-700",
  },
};

export function HomePortal() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  // Index of the lane that is currently "active" on touch devices.
  // Lifted to the parent so we can guarantee at most one lane is filled
  // at any moment - during scroll, two lanes briefly overlap the centre
  // band; without this we'd see two colours at once.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const lanes: Lane[] = [
    {
      href: "/properties",
      icon: <BedDouble className="h-5 w-5" />,
      eyebrow: t.nav.shortStay,
      title: t.portal.shortStayTitle,
      body: t.portal.shortStayBody,
      cta: t.portal.shortStayCta,
      accent: "sky",
    },
    {
      href: "/louer",
      icon: <KeyRound className="h-5 w-5" />,
      eyebrow: t.nav.rentLong,
      title: t.portal.rentLongTitle,
      body: t.portal.rentLongBody,
      cta: t.portal.rentLongCta,
      accent: "amber",
    },
    {
      href: "/acheter",
      icon: <Building2 className="h-5 w-5" />,
      eyebrow: t.nav.buy,
      title: t.portal.buyTitle,
      body: t.portal.buyBody,
      cta: t.portal.buyCta,
      accent: "emerald",
    },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Auto-fill on scroll only on touch devices (no-hover). Desktop
    // shows all 3 lanes side-by-side in the same 100dvh section, so
    // there's no "scroll between lanes" to trigger off - the hover
    // interaction is the right affordance there. On mobile each lane
    // takes its own 100dvh, so the lane crossing the viewport centre
    // becomes the active one and floods with its accent colour.
    const noHover = window.matchMedia("(hover: none)").matches;
    if (!noHover) return;

    const section = sectionRef.current;
    if (!section) return;
    const elements = Array.from(
      section.querySelectorAll<HTMLElement>("[data-lane-index]"),
    );
    if (elements.length === 0) return;

    // Compute on every scroll which lane's centre is closest to the
    // viewport centre — that's the single "active" lane. Guarantees no
    // two lanes are ever filled at the same time, even mid-transition.
    // rAF-throttled to keep the scroll cheap.
    let raf = 0;
    const recalculate = () => {
      raf = 0;
      const viewportCenter = window.innerHeight / 2;
      let bestIdx: number | null = null;
      let bestDist = Infinity;
      for (const el of elements) {
        const idx = Number(el.dataset.laneIndex);
        const rect = el.getBoundingClientRect();
        // Skip lanes that are entirely off-screen so we don't activate
        // a lane the user can't see.
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - viewportCenter);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = idx;
        }
      }
      // Only activate a lane whose centre is within ~40% of the
      // viewport height — otherwise neither column is "the one being
      // read" (e.g. user is between the portal and the next section).
      if (bestDist > window.innerHeight * 0.4) bestIdx = null;
      setActiveIndex(bestIdx);
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(recalculate);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    // Full-bleed band - breaks out of container-page so the columns
    // stretch edge-to-edge like the competitor reference. Top + bottom
    // hairlines keep it visually anchored between hero and featured grid.
    <section
      ref={sectionRef}
      id="properties"
      aria-label={t.portal.ariaLabel}
      className="border-y border-gray-100 bg-cream-50"
    >
      {/* Mobile: single column - each lane stacks vertically and fills
          the viewport (one category per scroll, full focus).
          Desktop (md+): 3 columns side-by-side, each STILL taking the
          full viewport height (100dvh). The whole portal section then
          measures 100dvh on desktop with three equal-width lanes, so
          the visitor sees the entire offering in one screen, each
          lane reading as its own immersive panel. */}
      <div className="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-3 md:divide-x md:divide-y-0">
        {lanes.map((lane, idx) => (
          <LaneCard
            key={lane.href}
            lane={lane}
            index={idx}
            active={activeIndex === idx}
          />
        ))}
      </div>
    </section>
  );
}

function LaneCard({
  lane,
  index,
  active,
}: {
  lane: Lane;
  index: number;
  active: boolean;
}) {
  const a = ACCENT[lane.accent];
  // `active` (driven by the parent's single-winner scroll calculation
  // on touch devices) and the desktop `:hover` are equivalent visual
  // states. We duplicate the hover-target classes as plain classes when
  // `active` is true so the mobile path doesn't depend on the cursor.
  const filled = active;

  return (
    // Every breakpoint: lane fills the viewport (`portal-lane-full`
    // defined in globals.css uses 100dvh where supported, with a
    // 100vh fallback so older WebKit still works) and centres its
    // content vertically. Desktop now also stacks the lanes vertically
    // - the visitor sees exactly ONE category at a time, scrolls to
    // the next, never sees two overlapping. The padding scales up on
    // larger screens for breathing room around the centred content.
    <Link
      data-lane-index={index}
      href={lane.href}
      className={`group portal-lane-full relative flex flex-col items-center justify-center px-6 py-16 text-center transition-colors duration-500 ease-out sm:px-8 sm:py-20 lg:py-28 ${
        filled ? `${a.filledBg} text-white` : `hover:text-white ${a.hoverBg}`
      }`}
    >
      {/* Icon - thin hairline circle. Becomes a translucent-on-fill
          circle once the column is filled (hover desktop / in-view mobile). */}
      <span
        className={`inline-flex h-12 w-12 items-center justify-center rounded-full border transition ${
          filled
            ? "border-white/50 text-white"
            : "border-gray-200 text-ink-muted group-hover:border-white/50 group-hover:text-white"
        }`}
      >
        {lane.icon}
      </span>

      {/* Eyebrow + display title + hairline. Same editorial language as
          the rest of the home page so it feels native to the brand. */}
      <span
        className={`mt-7 text-[11px] font-semibold uppercase tracking-[0.32em] transition ${
          filled ? "text-white/90" : "text-brand-600 group-hover:text-white/90"
        }`}
      >
        {lane.eyebrow}
      </span>
      <h3
        className={`mt-3 font-display text-3xl font-semibold tracking-tight transition sm:text-4xl [text-wrap:balance] ${
          filled ? "text-white" : "text-ink group-hover:text-white"
        }`}
      >
        {lane.title}
      </h3>
      <span
        aria-hidden
        className={`mt-5 block h-px w-12 transition ${
          filled ? "bg-white/40" : "bg-brand-500/60 group-hover:bg-white/40"
        }`}
      />

      {/* Body - kept short so the column reads in 1 second */}
      <p
        className={`mt-6 max-w-sm text-[14px] leading-relaxed transition sm:text-[15px] ${
          filled ? "text-white/85" : "text-ink-muted group-hover:text-white/85"
        }`}
      >
        {lane.body}
      </p>

      {/* CTA pill - kind-tinted at rest, inverts to white-on-accent
          once the column is filled. `luxe-cta` (in globals.css) layers
          three hover effects on the parent .group: lift + scale, a
          brand-tinted halo, and a diagonal shine sweep that runs once
          across the pill. The arrow gets a bigger nudge (translate-x-2)
          to match the rest of the motion. */}
      <span
        className={`luxe-cta mt-10 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] shadow-sm ${
          filled
            ? `bg-white ${a.ctaFilledText}`
            : `${a.ctaRestBg} text-white group-hover:bg-white ${a.ctaHoverText}`
        }`}
      >
        <span className="relative z-10">{lane.cta}</span>
        <ArrowRight className="relative z-10 h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-2" />
      </span>
    </Link>
  );
}
