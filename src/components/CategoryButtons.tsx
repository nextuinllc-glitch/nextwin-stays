"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Top-of-home filter pills. Switched from property TYPE (Villa / Riad /
 * Apartment) to listing KIND (Acheter / Louer / Court séjour) so the home
 * page surfaces the three top-level catalogues directly. Each pill is a
 * <Link> to the matching kind-scoped route, where the per-section filters
 * (type, neighborhood, price) live.
 */
export function CategoryButtons() {
  const { t } = useI18n();
  // Order matches the global nav: Court séjour first (most populated
  // catalogue + flagship product), then Long durée, then Acheter.
  const KINDS = [
    { href: "/properties", label: t.nav.shortStay },
    { href: "/louer",      label: t.nav.rentLong },
    { href: "/acheter",    label: t.nav.buy },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {KINDS.map((c) => (
        <Link
          key={c.href}
          href={c.href}
          className="inline-flex items-center rounded-full border border-brand-600 bg-white px-6 py-2 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-600 hover:text-white"
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}
