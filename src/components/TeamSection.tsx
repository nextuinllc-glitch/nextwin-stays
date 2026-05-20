"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Mail, Phone } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import type { TeamMemberPublic, TeamSpecialty } from "@/lib/team-repo";

type Locale = "fr" | "en" | "ar";

// Per-specialty visual chrome. Label comes from `t.nav.*` at render time
// so the pill always speaks the active locale; pill background + the
// catalogue route stay constant.
const SPECIALTY_CHROME: Record<TeamSpecialty, { pill: string; href: string }> = {
  SHORT_STAY: {
    pill: "border-sky-200 bg-sky-50 text-sky-700",
    href: "/properties",
  },
  RENT_LONG: {
    pill: "border-amber-200 bg-amber-50 text-amber-700",
    href: "/louer",
  },
  SALE: {
    pill: "border-emerald-200 bg-emerald-50 text-emerald-700",
    href: "/acheter",
  },
};

function pickLocalized(
  bundle: { fr: string; en: string | null; ar: string | null },
  locale: Locale,
): string {
  if (locale === "en") return bundle.en || bundle.fr;
  if (locale === "ar") return bundle.ar || bundle.fr;
  return bundle.fr;
}

/**
 * Editorial "Notre équipe" section. Each card carries a portrait (or an
 * elegant monogram tile fallback), the first name, the role line, a short
 * bio, and direct-contact shortcuts. Used on /about and conceivably on a
 * future /equipe deep-dive page.
 */
export function TeamSection({ team }: { team: TeamMemberPublic[] }) {
  const { t, locale } = useI18n();
  const loc = (locale ?? "fr") as Locale;
  if (team.length === 0) return null;

  return (
    <section id="team" className="bg-cream-50">
      <div className="container-page py-14 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-600">
            {t.team.eyebrow}
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl [text-wrap:balance]">
            {t.team.title}
          </h2>
          <span aria-hidden className="mx-auto mt-5 block h-px w-16 bg-brand-500/60" />
          <p className="mt-5 text-sm text-ink-muted sm:text-base">
            {t.team.subtitle}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <TeamCard key={m.slug} member={m} locale={loc} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCard({ member, locale }: { member: TeamMemberPublic; locale: Locale }) {
  const { t } = useI18n();
  const role = pickLocalized(member.i18n.role, locale);
  const bio = pickLocalized(member.i18n.bio, locale);
  const initial = member.name.trim().charAt(0).toUpperCase() || "?";

  // Specialty label switches with the active locale - SHORT_STAY → t.nav.shortStay,
  // RENT_LONG → t.nav.rentLong, SALE → t.nav.buy. Mirrors the same vocabulary as
  // the navbar pills and the home page portal so the brand language is consistent.
  const specialtyLabel = member.specialty
    ? member.specialty === "SHORT_STAY"
      ? t.nav.shortStay
      : member.specialty === "RENT_LONG"
        ? t.nav.rentLong
        : t.nav.buy
    : null;

  const portraitAlt = t.team.portraitAlt.replace("{{name}}", member.name);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card transition hover:shadow-card-hover">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-cream-100">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={portraitAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 via-cream-100 to-cream-200">
            <span className="font-display text-7xl font-light text-brand-600">{initial}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-display text-xl font-semibold text-ink">{member.name}</h3>
          {member.specialty && specialtyLabel && (
            <Link
              href={SPECIALTY_CHROME[member.specialty].href}
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] transition hover:opacity-90 ${
                SPECIALTY_CHROME[member.specialty].pill
              }`}
            >
              {specialtyLabel}
            </Link>
          )}
        </div>
        <p className="mt-1 text-[13px] font-medium uppercase tracking-[0.12em] text-brand-700">
          {role}
        </p>
        <span aria-hidden className="mt-4 block h-px w-12 bg-brand-500/40" />
        {bio && <p className="mt-4 text-[14px] leading-relaxed text-ink-muted">{bio}</p>}

        {(member.whatsapp || member.email || member.phone) && (
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
            {member.whatsapp && (
              <a
                href={`https://wa.me/${member.whatsapp.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                {t.team.whatsapp}
              </a>
            )}
            {member.email && (
              <a
                href={`mailto:${member.email}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:border-ink hover:text-ink"
              >
                <Mail className="h-3.5 w-3.5" />
                {t.team.email}
              </a>
            )}
            {member.phone && (
              <a
                href={`tel:${member.phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:border-ink hover:text-ink"
              >
                <Phone className="h-3.5 w-3.5" />
                {t.team.phone}
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
