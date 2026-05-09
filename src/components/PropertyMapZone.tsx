"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  lat: number;
  lng: number;
  radius?: number; // metres
  label?: string;
};

// Locked zoom — at 16 the 200–300m circle takes ~half the visible area,
// which reads as "approximate zone" without revealing the exact street.
// Hardcoded so Leaflet's `getZoom()` race condition can't drift the view.
const ZOOM = 16;

// Pinpoints the right viewport on first render AND fixes Leaflet's most
// common bug: when the container is rendered before tiles fully load (or
// the page reflows after hydration), Leaflet caches the wrong tile-grid
// size and renders zoomed wrong. `invalidateSize()` recomputes; calling
// it twice covers both the synchronous mount and a later async layout
// pass (e.g. after the booking sheet pushes the page).
function MapBootstrap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], ZOOM, { animate: false });
    // Two invalidations — the first picks up containers sized after first
    // paint, the second catches anything that resizes during a layout
    // pass (sticky footer, mobile sheet open, etc.).
    const t1 = setTimeout(() => map.invalidateSize(), 80);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [lat, lng, map]);
  return null;
}

export default function PropertyMapZone({ lat, lng, radius = 200, label }: Props) {
  return (
    // Fixed-pixel height — Leaflet refuses to render properly when its
    // parent has `height: auto` from flex/grid, so we force concrete
    // numbers here. `relative` + `overflow-hidden` cap the tile bleed.
    <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-cream-300 bg-cream-100 sm:h-80">
      <MapContainer
        // Force a full remount when coordinates change — much simpler
        // than chasing Leaflet's internal state, and guaranteed to
        // produce a correctly-sized map every time the property changes.
        key={`${lat.toFixed(5)}-${lng.toFixed(5)}-${radius}`}
        center={[lat, lng]}
        zoom={ZOOM}
        // Lock the map down to a static "image of an area" — the whole
        // point of this view is to suggest the neighbourhood, not let
        // the user pan to the front door. Disabling these handlers also
        // avoids most Leaflet sizing/zoom drift bugs we kept hitting.
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        zoomControl={false}
        attributionControl={false}
        className="!h-full !w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // OSM tile policy requires attribution somewhere visible —
          // we surface it inside the privacy chip below the map so it
          // doesn't pollute the corner of every listing card.
          attribution='&copy; OpenStreetMap'
        />
        <Circle
          center={[lat, lng]}
          radius={radius}
          pathOptions={{
            color: "#7C2F1A",
            weight: 1.5,
            fillColor: "#B85432",
            fillOpacity: 0.22,
          }}
        />
        <MapBootstrap lat={lat} lng={lng} />
      </MapContainer>

      {/* Privacy hint chip — communicates that we don't show the exact
          location until the booking is confirmed. `pointer-events-none`
          on the wrapper so the chip never blocks interactions even
          though the map is locked. */}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[1000]">
        <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-cream-300 bg-cream-50/95 px-3 py-1.5 text-[11px] font-semibold text-ink shadow-sm backdrop-blur">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 text-brand-600"
            aria-hidden
          >
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {label ?? `Zone approximative (~${radius} m)`}
        </div>
      </div>
    </div>
  );
}
