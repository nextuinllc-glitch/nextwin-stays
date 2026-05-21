"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

// Leaflet only runs in the browser — load the inner map client-side
// via dynamic import. The skeleton matches the rendered map's height
// so the page doesn't jump on hydration.
const OfficeMapInner = dynamic(() => import("@/components/OfficeMapInner"), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full animate-pulse rounded-2xl bg-cream-100 sm:h-96" />
  ),
});

// Coordinates for the NEXTWIN IMMOBILIER office — Burj Malak, Route de
// Safi, Marrakech. Resolved from the Google Maps share link the user
// provided (Knowledge Graph ID /g/11tbh86_dg, CID 0xdafed7d7d06ac6d).
// Hard-coded for now; can be promoted to admin Settings if the office
// moves.
const OFFICE_LAT = 31.6643497;
const OFFICE_LNG = -8.0327965;
const OFFICE_ADDRESS = "Route de Safi, Burj Malak, Bureau A12, Marrakech 40000, Maroc";
const OFFICE_PHONE = "+212 6 68 84 03 98";
const OFFICE_EMAIL = "hello@nextwin.ma";

// Google Maps universal-URL deep links. Both work in browsers and
// hand off cleanly to the native iOS / Android Maps apps when those
// are installed.
//   - directions: opens "Itinéraire" from the user's location
//   - place:      drops a pin on the office (used as the "Voir sur
//                 Google Maps" secondary affordance)
const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${OFFICE_LAT},${OFFICE_LNG}`;
const MAPS_PLACE_URL = `https://www.google.com/maps/search/?api=1&query=${OFFICE_LAT},${OFFICE_LNG}`;

/**
 * Home-page office strip. Sits between the choose-your-lane portal
 * and the owner pivot. Two columns on desktop (address + contact /
 * map), single column stacked on mobile.
 */
export function OfficeMap() {
  // Fetch admin-managed contact info if it's been updated, otherwise
  // fall back to the hard-coded defaults. Same pattern other surfaces
  // use to swap the WhatsApp number / email without a redeploy.
  const [contact, setContact] = useState({
    address: OFFICE_ADDRESS,
    phone: OFFICE_PHONE,
    email: OFFICE_EMAIL,
    phoneHref: `tel:${OFFICE_PHONE.replace(/[^\d+]/g, "")}`,
    mailtoHref: `mailto:${OFFICE_EMAIL}`,
  });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/contact")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!cancelled && j?.contact) {
          setContact({
            address: j.contact.addressLine || OFFICE_ADDRESS,
            phone: j.contact.phone || OFFICE_PHONE,
            email: j.contact.email || OFFICE_EMAIL,
            phoneHref: j.contact.phoneHref || `tel:${OFFICE_PHONE.replace(/[^\d+]/g, "")}`,
            mailtoHref: j.contact.mailtoHref || `mailto:${OFFICE_EMAIL}`,
          });
        }
      })
      .catch(() => {
        // Silent fallback — defaults are already in state.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section aria-label="Notre bureau" className="bg-cream-50">
      <div className="container-page py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-600">
            Notre bureau
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl [text-wrap:balance]">
            Passez nous voir à Marrakech.
          </h2>
          <span aria-hidden className="mx-auto mt-5 block h-px w-12 bg-brand-500/60" />
          <p className="mt-5 text-sm leading-relaxed text-ink-muted sm:text-base">
            Un thé à la menthe vous attend. Nos conseillers vous reçoivent du
            lundi au samedi, sur rendez-vous.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-12">
          {/* Address + contact list */}
          <div className="flex flex-col justify-center">
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                    Adresse
                  </div>
                  <p className="mt-1 text-[15px] leading-relaxed text-ink">
                    {contact.address}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Phone className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                    Téléphone
                  </div>
                  <a
                    href={contact.phoneHref}
                    className="mt-1 block text-[15px] font-medium text-ink transition hover:text-brand-700"
                  >
                    {contact.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
                    Email
                  </div>
                  <a
                    href={contact.mailtoHref}
                    className="mt-1 block text-[15px] font-medium text-ink transition hover:text-brand-700"
                  >
                    {contact.email}
                  </a>
                </div>
              </li>
            </ul>

            <Link
              href="/contact"
              className="group mt-8 inline-flex items-center gap-2 self-start text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-700 transition hover:text-brand-800"
            >
              Prendre rendez-vous
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Map - real Google Maps embed iframe (see OfficeMapInner).
              The iframe is fully interactive: visitors can pan, zoom,
              tap businesses around our pin, etc. We layer a corner
              "Itinéraire" pill on top via z-[10] so a single tap on
              the pill opens directions in a new tab. We don't put a
              full-area click overlay anymore because that would block
              the iframe's own pointer events. */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-100 shadow-card">
            <OfficeMapInner lat={OFFICE_LAT} lng={OFFICE_LNG} />
            <a
              href={MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="group absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink shadow-md backdrop-blur transition hover:bg-brand-600 hover:text-white"
            >
              Itinéraire
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>

        {/* Secondary affordance under the map - "Open in Google Maps"
            without driving directions, in case the visitor just wants
            to scope the area without committing to a route. */}
        <div className="mx-auto mt-6 text-center">
          <a
            href={MAPS_PLACE_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted underline-offset-4 transition hover:text-brand-700 hover:underline"
          >
            Voir sur Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}
