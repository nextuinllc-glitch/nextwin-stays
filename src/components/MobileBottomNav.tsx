"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Calendar, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileDatesSheet } from "./MobileDatesSheet";

// Floating bottom navigation — the signature feature of the GoTrip /
// hotel-app reference. Only renders on mobile (`lg:hidden`); desktop has
// the full top header nav.
//
// Hidden on:
//  - /admin/* (admin panel has its own sidebar)
//  - /properties/[slug] (the BookingWidget already owns the bottom bar)
//  - */reserve (checkout has its own sticky CTA)
export function MobileBottomNav() {
  const pathname = usePathname() ?? "/";
  const [datesOpen, setDatesOpen] = useState(false);

  if (
    pathname.startsWith("/admin") ||
    pathname.endsWith("/reserve") ||
    /^\/properties\/[^/]+$/.test(pathname)
  ) {
    return null;
  }

  // Static link items (Home / Search / Contact). The "Dates" entry is
  // a button, not a link, so it gets handled separately below.
  const linkItems = [
    { href: "/", icon: Home, label: "Home", match: (p: string) => p === "/" },
    {
      href: "/properties",
      icon: Search,
      label: "Search",
      match: (p: string) => p.startsWith("/properties"),
    },
    {
      href: "/contact",
      icon: MessageCircle,
      label: "Contact",
      match: (p: string) => p.startsWith("/contact"),
    },
  ];

  return (
    <>
      <nav
        aria-label="Mobile primary navigation"
        className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-4 lg:hidden"
      >
        {/* Pill body — ink-navy with subtle lime ring + glow, mirrors the
            dark floating capsule in the GoTrip mock. */}
        <div className="flex items-center gap-1 rounded-full bg-ink/95 px-2 py-1.5 shadow-[0_8px_30px_rgba(15,23,41,0.30)] ring-1 ring-brand-500/20 backdrop-blur">
          {/* Home */}
          {(() => {
            const item = linkItems[0];
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-full transition",
                  active
                    ? "bg-brand-500 text-ink shadow-sm"
                    : "text-white/70 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })()}

          {/* Search */}
          {(() => {
            const item = linkItems[1];
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-full transition",
                  active
                    ? "bg-brand-500 text-ink shadow-sm"
                    : "text-white/70 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })()}

          {/* Dates — opens the standalone bottom-sheet (calendar → guests
              → navigate to /properties with filters set). */}
          <button
            type="button"
            onClick={() => setDatesOpen(true)}
            aria-label="Dates"
            aria-expanded={datesOpen}
            className={cn(
              "relative flex h-11 w-11 items-center justify-center rounded-full transition",
              datesOpen
                ? "bg-brand-500 text-ink shadow-sm"
                : "text-white/70 hover:text-white",
            )}
          >
            <Calendar className="h-5 w-5" />
          </button>

          {/* Contact */}
          {(() => {
            const item = linkItems[2];
            const Icon = item.icon;
            const active = item.match(pathname);
            return (
              <Link
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-full transition",
                  active
                    ? "bg-brand-500 text-ink shadow-sm"
                    : "text-white/70 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })()}
        </div>
      </nav>

      {/* The dates+guests sheet is owned by the nav so its open state is
          tied to the trigger that opens it. */}
      <MobileDatesSheet open={datesOpen} onClose={() => setDatesOpen(false)} />
    </>
  );
}
