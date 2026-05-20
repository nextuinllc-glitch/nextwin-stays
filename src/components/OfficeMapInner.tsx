"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Props = {
  lat: number;
  lng: number;
};

// Locked zoom — 15 puts the office pin in the middle with a clear sense
// of neighbourhood, same convention used by PropertyMapZone.
const ZOOM = 15;

// Brand-pink pin marker. Renders the lucide map-pin glyph in a circle
// styled in our brand colour, big enough to read on mobile.
function officeIcon() {
  const html = `
    <div style="
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #E00B41;
      box-shadow: 0 8px 20px rgba(224,11,65,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      border: 3px solid white;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2.4"
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 1 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
  `;
  return L.divIcon({
    html,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 38],
  });
}

// Same `invalidateSize` dance as PropertyMapZone — Leaflet otherwise
// caches the wrong tile grid when the container hydrates after layout.
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

export default function OfficeMapInner({ lat, lng }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={ZOOM}
      scrollWheelZoom={false}
      className="h-72 w-full rounded-2xl sm:h-96"
      style={{ background: "#F8F4EC" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} icon={officeIcon()} />
      <MapBootstrap lat={lat} lng={lng} />
    </MapContainer>
  );
}
