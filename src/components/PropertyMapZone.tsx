"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Circle, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  lat: number;
  lng: number;
  radius?: number; // metres
  // Legacy prop — accepted but unused. The old floating "approximate
  // zone" chip caused z-index conflicts with modals; the privacy
  // signal now lives in the section copy below the map.
  label?: string;
};

// Locked zoom — 15 puts the home pin in the middle with a generous
// surrounding neighborhood. Hardcoded so Leaflet's `getZoom()` race
// condition can't drift the view.
const ZOOM = 15;

// Black "home" pin marker — matches the Airbnb listing-preview pin
// (dark circle with a white house glyph). Rendered as a Leaflet
// divIcon so we don't need to ship a PNG.
function homeIcon() {
  const html = `
    <div style="
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #222222;
      box-shadow: 0 6px 16px rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2.2"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9 12 2 21 9v12a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-6a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

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
    const t1 = setTimeout(() => map.invalidateSize(), 80);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [lat, lng, map]);
  return null;
}

// `label` is accepted but no longer rendered — see Props comment above.
export default function PropertyMapZone({ lat, lng, radius = 200 }: Props) {
  // Memo the divIcon so React doesn't recreate it on every render.
  // Created on the client only — Leaflet's L global isn't available
  // during SSR, but this whole file is dynamic-imported with
  // `ssr: false` by the caller, so the import is safe at module
  // level.
  const icon = useMemo(() => homeIcon(), []);

  return (
    // Fixed-pixel height — Leaflet refuses to render properly when its
    // parent has `height: auto` from flex/grid, so we force concrete
    // numbers here. `relative` + `overflow-hidden` cap the tile bleed.
    // Taller than before so the neighborhood context reads better.
    <div className="relative h-80 w-full overflow-hidden rounded-2xl border border-cream-300 bg-cream-100 sm:h-96">
      <MapContainer
        // Force a full remount when coordinates change — much simpler
        // than chasing Leaflet's internal state, and guaranteed to
        // produce a correctly-sized map every time the property changes.
        key={`${lat.toFixed(5)}-${lng.toFixed(5)}-${radius}`}
        center={[lat, lng]}
        zoom={ZOOM}
        // Lock the map down to a static "image of an area" — the whole
        // point of this view is to suggest the neighbourhood, not let
        // the user pan to the front door.
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
        {/* CARTO Voyager — Google-Maps-style raster tiles: coloured
            parks, water, transit dots, building footprints + road
            labels. Free for non-commercial use, no API key required.
            Subdomains a-d round-robin so we don't hammer a single host. */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />
        {/* Privacy zone — soft Airbnb-style pink circle around the
            approximate location. Stroke kept thin so the area reads as
            a halo, not a fence. */}
        <Circle
          center={[lat, lng]}
          radius={radius}
          pathOptions={{
            color: "#FF385C",
            weight: 1,
            fillColor: "#FF385C",
            fillOpacity: 0.16,
          }}
        />
        <Marker position={[lat, lng]} icon={icon} />
        <MapBootstrap lat={lat} lng={lng} />
      </MapContainer>
    </div>
  );
}
