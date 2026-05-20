"use client";

/**
 * Subtle "NEXTWIN" watermark that overlays Court séjour property photos
 * — discourages straight-up reuse of the listing images on competitor
 * sites and Airbnb scrapers. Two sizes:
 *   - "card": small bottom-right mark for grid cards (PropertyCard)
 *   - "gallery": larger centred mark for the detail page hero gallery
 * The mark is purely visual (text + lockup), so theft via right-click
 * still grabs the underlying URL, but any reproduction of the visible
 * photo carries our brand back. Pointer-events disabled so the
 * watermark never intercepts clicks on the underlying carousel.
 */
type Props = {
  size?: "card" | "gallery";
};

export function NextwinWatermark({ size = "card" }: Props) {
  const isGallery = size === "gallery";
  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {isGallery ? (
        // Centred diagonal lockup — big enough to be a clear theft
        // deterrent, soft enough not to break the photograph.
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-display text-5xl font-medium uppercase tracking-[0.3em] text-white/10 sm:text-7xl"
            style={{
              transform: "rotate(-18deg)",
              textShadow: "0 2px 8px rgba(0,0,0,0.25)",
            }}
          >
            NEXTWIN
          </span>
        </div>
      ) : (
        // Bottom-right tracked wordmark — discrete on the card preview
        // so the photo still sells the property, but legible enough
        // that a download carries the brand. Backdrop ensures contrast
        // against both bright and dark photos.
        <div
          className="absolute bottom-2 right-2 rounded px-2 py-0.5"
          style={{
            background: "linear-gradient(120deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.25) 100%)",
            backdropFilter: "blur(2px)",
          }}
        >
          <span
            className="font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-white/85"
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.45)" }}
          >
            NEXTWIN
          </span>
        </div>
      )}
    </div>
  );
}
