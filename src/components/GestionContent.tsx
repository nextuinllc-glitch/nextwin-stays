"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Calendar, Wrench } from "lucide-react";
import { GestionLeadForm } from "@/components/GestionLeadForm";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Client-side content for /gestion. The route page is a thin server
 * component that just renders this so the whole pitch can read from
 * the i18n bundle (active locale) without re-fetching anything.
 */
export function GestionContent() {
  const { t } = useI18n();

  return (
    <>
      {/* Dark editorial hero - same ink band language as OwnerCallout
          so a visitor arriving from the home page feels continuity. */}
      <section className="relative overflow-hidden bg-ink">
        <div className="container-page py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white ring-1 ring-white/30 backdrop-blur">
              {t.gestion.heroEyebrow}
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl [text-wrap:balance]">
              {t.gestion.heroTitle}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              {t.gestion.heroBody}
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="#demande"
                className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.22em] text-ink transition hover:bg-brand-600 hover:text-white"
              >
                {t.gestion.heroCta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial benefits - 4-pillar grid */}
      <section className="container-page py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-600">
            {t.gestion.serviceEyebrow}
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl [text-wrap:balance]">
            {t.gestion.serviceTitle}
          </h2>
          <span aria-hidden className="mx-auto mt-5 block h-px w-12 bg-brand-500/60" />
          <p className="mt-5 text-sm leading-relaxed text-ink-muted sm:text-base">
            {t.gestion.serviceSubtitle}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Pillar
            icon={<Sparkles className="h-5 w-5" />}
            title={t.gestion.benefit1Title}
            body={t.gestion.benefit1Body}
          />
          <Pillar
            icon={<ShieldCheck className="h-5 w-5" />}
            title={t.gestion.benefit2Title}
            body={t.gestion.benefit2Body}
          />
          <Pillar
            icon={<Calendar className="h-5 w-5" />}
            title={t.gestion.benefit3Title}
            body={t.gestion.benefit3Body}
          />
          <Pillar
            icon={<Wrench className="h-5 w-5" />}
            title={t.gestion.benefit4Title}
            body={t.gestion.benefit4Body}
          />
        </div>
      </section>

      {/* How it works - editorial 3-step strip */}
      <section className="bg-cream-100">
        <div className="container-page py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-600">
              {t.gestion.howEyebrow}
            </span>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl [text-wrap:balance]">
              {t.gestion.howTitle}
            </h2>
            <span aria-hidden className="mx-auto mt-5 block h-px w-12 bg-brand-500/60" />
          </div>

          <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-3 sm:gap-10">
            <Step number="01" title={t.gestion.step1Title} body={t.gestion.step1Body} />
            <Step number="02" title={t.gestion.step2Title} body={t.gestion.step2Body} />
            <Step number="03" title={t.gestion.step3Title} body={t.gestion.step3Body} />
          </div>
        </div>
      </section>

      {/* Lead form */}
      <section id="demande" className="container-page py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-600">
            {t.gestion.formEyebrow}
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl [text-wrap:balance]">
            {t.gestion.formTitle}
          </h2>
          <span aria-hidden className="mx-auto mt-5 block h-px w-12 bg-brand-500/60" />
          <p className="mt-5 text-sm leading-relaxed text-ink-muted sm:text-base">
            {t.gestion.formSubtitle}
          </p>
        </div>

        <div className="mt-12">
          <GestionLeadForm />
        </div>
      </section>
    </>
  );
}

function Pillar({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}

function Step({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="font-display text-4xl font-light tabular-nums text-brand-500">{number}</div>
      <h3 className="mt-3 font-display text-xl font-semibold text-ink">{title}</h3>
      <span aria-hidden className="mt-3 block h-px w-12 bg-brand-500/40" />
      <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}
