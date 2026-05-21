"use client";

type Props = {
  lat: number;
  lng: number;
};

/**
 * Office map - real Google Maps embed iframe instead of the previous
 * Leaflet + OpenStreetMap tiles. Why the swap:
 *   - Google Maps shows the surrounding business names, road labels,
 *     Sanaoubar / Sidi Ghanem area markers, and traffic context that
 *     visitors actually use to orient themselves
 *   - No API key needed for the basic `maps.google.com/maps?...&output=embed`
 *     URL - works on Vercel without per-request signing
 *   - Native Google look & feel; visitors recognise the chrome
 *
 * Interactive: visitors can pan, zoom, click the pin to see Burj Malak
 * details on Google's own card. The wrapper component (OfficeMap)
 * still layers an "Itinéraire" pill in the corner so a single tap on
 * the pill opens Google Maps directions in a new tab.
 */
export default function OfficeMapInner({ lat, lng }: Props) {
  // Classic Google Maps embed URL. `q=<lat>,<lng>` drops the pin at the
  // exact office location; `z=16` is the right zoom to see the
  // immediate neighbourhood (a couple of blocks each side); `hl=fr`
  // forces French labels to match the rest of the site.
  const embedSrc = `https://maps.google.com/maps?q=${lat},${lng}&hl=fr&z=16&output=embed`;
  return (
    <iframe
      src={embedSrc}
      title="Carte Google Maps de notre bureau à Marrakech"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      // Leaflet's previous CSS reserved h-72 / sm:h-96. We keep the
      // same heights so the rest of the OfficeMap section (skeleton,
      // overlay pill, secondary link) lines up identically.
      className="h-72 w-full border-0 sm:h-96"
      allowFullScreen
    />
  );
}
