"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/I18nProvider";

export function CategoryButtons() {
  const { t } = useI18n();
  const CATEGORIES = [
    { type: "villa", label: t.type.villa },
    { type: "apartment", label: t.type.apartment },
    { type: "riad", label: t.type.riad },
  ];
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {CATEGORIES.map((c) => (
        <Link
          key={c.type}
          href={`/properties?type=${c.type}`}
          className="inline-flex items-center rounded-full border border-brand-600 bg-white px-6 py-2 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-600 hover:text-white"
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}
