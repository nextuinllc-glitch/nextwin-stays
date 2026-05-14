"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, Fragment } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { LanguageToggle } from "./LanguageToggle";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

export function Header() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const NAV = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.properties, href: "/properties" },
    { label: t.nav.about, href: "/about" },
    { label: t.nav.contact, href: "/contact" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Hide on the checkout flow + the admin panel — both have their own
  // self-contained chrome.
  if (pathname?.endsWith("/reserve") || pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-transparent bg-cream-50/95 backdrop-blur transition",
        scrolled && "border-gray-100 shadow-sm",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-3 sm:gap-6">
        <Logo />

        <nav className="hidden items-center gap-2 md:flex">
          {NAV.map((item, idx) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Fragment key={item.href}>
                {idx > 0 && (
                  <span aria-hidden className="text-xs text-ink-soft">
                    •
                  </span>
                )}
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-md px-2 py-1 text-sm font-medium transition",
                    isActive
                      ? "text-brand-700 ring-1 ring-brand-400/60"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              </Fragment>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          <Link href="/properties" className="btn-primary !px-4 !py-2 !text-xs">
            {t.nav.bookCta}
          </Link>
        </div>

        <button
          aria-label={t.nav.toggleMenu}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-ink md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <>
          {/* Backdrop — dims the page behind the menu and dismisses on tap */}
          <div
            className="fixed inset-0 top-16 z-30 bg-black/30 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          {/* Overlay menu — absolute under the header, doesn't push content */}
          <div className="absolute inset-x-0 top-full z-40 border-t border-gray-100 bg-white shadow-lg md:hidden">
            <div className="container-page flex flex-col gap-1 py-4">
              {NAV.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium transition",
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-ink-muted hover:bg-gray-50",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <LanguageToggle />
                <Link href="/properties" className="btn-primary !px-4 !py-2 !text-xs">
                  {t.nav.bookCta}
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
