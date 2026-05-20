"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import { Logo } from "./Logo";
import { useI18n } from "@/i18n/I18nProvider";
import type { ContactSettings } from "@/lib/settings-repo";

type Props = { contact: ContactSettings };

export function Footer({ contact }: Props) {
  const { t } = useI18n();
  const pathname = usePathname();

  // Hide on the checkout flow and the admin panel.
  if (pathname?.endsWith("/reserve") || pathname?.startsWith("/admin")) return null;

  return (
    // Editorial footer — bone-cream panel with a gold hairline at the
    // top instead of a grey border, so the section feels finished by a
    // metal rule rather than a sheet break. Five-column grid on desktop
    // (brand block spans 2 + three link columns) so the four service
    // categories (Court séjour / Long durée / Achat / Gestion) fit
    // alongside the Société and Nous joindre lists.
    <footer className="mt-24 border-t border-brand-500/30 bg-cream-100 text-ink-muted">
      <div className="container-page py-20 sm:py-24">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed">
              {t.footer.blurb}
            </p>
            <div className="mt-6 flex items-center gap-2">
              <a
                href="#"
                aria-label="Facebook"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-ink-muted transition hover:border-ink hover:text-ink"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-ink-muted transition hover:border-ink hover:text-ink"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-ink-muted transition hover:border-ink hover:text-ink"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Nos offres - the four service entry points */}
          <div>
            <h4 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink">
              {t.footer.explore}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/properties" className="transition hover:text-ink">{t.footer.shortStay}</Link></li>
              <li><Link href="/louer" className="transition hover:text-ink">{t.footer.rentLong}</Link></li>
              <li><Link href="/acheter" className="transition hover:text-ink">{t.footer.buy}</Link></li>
              <li><Link href="/gestion" className="transition hover:text-ink">{t.footer.gestion}</Link></li>
            </ul>
          </div>

          {/* Société - brand pages (about, team, contact) */}
          <div>
            <h4 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink">
              {t.footer.company}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/about" className="transition hover:text-ink">{t.footer.about}</Link></li>
              <li><Link href="/about#team" className="transition hover:text-ink">{t.footer.team}</Link></li>
              <li><Link href="/contact" className="transition hover:text-ink">{t.footer.contact}</Link></li>
            </ul>
          </div>

          {/* Nous joindre - admin-managed contact info (address, phone, email) */}
          <div>
            <h4 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink">
              {t.footer.reach}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span>{contact.addressLine}</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <a href={contact.phoneHref} className="transition hover:text-ink">{contact.phone}</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <a href={contact.mailtoHref} className="transition hover:text-ink">{contact.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-6 text-xs md:flex-row">
          <p>© {new Date().getFullYear()} NEXTWIN. {t.footer.rights}.</p>
          <div className="flex items-center gap-5">
            <Link href="#" className="transition hover:text-ink">{t.footer.terms}</Link>
            <Link href="#" className="transition hover:text-ink">{t.footer.privacy}</Link>
            <Link href="#" className="transition hover:text-ink">{t.footer.cookies}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
