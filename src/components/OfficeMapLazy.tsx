"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// Defer the entire OfficeMap section (which pulls Leaflet + react-leaflet,
// the heaviest client dep on the home page) until the visitor scrolls
// within 600px of its slot. Cuts the initial JS bundle on the home page
// and the Lighthouse Total-Blocking-Time number with no visible UX cost.
const OfficeMap = dynamic(
  () => import("@/components/OfficeMap").then((m) => m.OfficeMap),
  { ssr: false },
);

export function OfficeMapLazy() {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setReady(true);
          obs.disconnect();
        }
      },
      // Start fetching 600px before the slot enters the viewport so
      // the map is ready by the time the user actually sees it.
      { rootMargin: "600px 0px 600px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="min-h-[400px] bg-cream-50">
      {/* Reserve roughly the same space as the loaded section so the
          page doesn't jump when the map mounts. Renders nothing until
          the observer fires - keeps the initial JS bundle lean. */}
      {ready ? <OfficeMap /> : null}
    </div>
  );
}
