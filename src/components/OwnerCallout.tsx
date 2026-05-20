"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Dark editorial band that pivots the home page from buyer/renter
 * messaging to owners. Routes interested owners to /gestion where the
 * full pitch + lead form lives. Restrained, minimal, ink background.
 */
export function OwnerCallout() {
  const { t } = useI18n();
  return (
    <section aria-label={t.ownerCallout.eyebrow} className="bg-ink">
      <div className="container-page py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-400">
            {t.ownerCallout.eyebrow}
          </span>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl [text-wrap:balance]">
            {t.ownerCallout.title}
          </h2>
          <span aria-hidden className="mx-auto mt-5 block h-px w-12 bg-brand-500/60" />
          <p className="mt-5 text-sm leading-relaxed text-white/75 sm:text-base">
            {t.ownerCallout.body}
          </p>
          <div className="mt-8 flex justify-center sm:mt-10">
            <Link
              href="/gestion"
              className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-ink transition hover:bg-brand-600 hover:text-white hover:ring-2 hover:ring-white/40"
            >
              {t.ownerCallout.cta}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
