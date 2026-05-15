import { ImageResponse } from "next/og";

// Browser favicon — mirrors the new Logo monogram: a Moorish-arch
// silhouette (the iconic Marrakech keyhole doorway) with the
// editorial N inside, grounded by a stone-threshold base line.
// At 32 px the strokes are pumped up vs. the in-app SVG so the
// glyph survives sub-pixel rasterisation in the browser tab.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";
// Required for `output: 'export'` — bake into a real .png at build
// time instead of generating per-request.
export const dynamic = "force-static";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          borderRadius: 7,
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#E00B41"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Horseshoe arch — two columns + 270° arc on top. */}
          <path
            d="M4 22 L4 11 A 8 8 0 0 1 20 11 L 20 22"
            strokeWidth="1.6"
          />
          {/* Stone-threshold base line. */}
          <path d="M3 22 L21 22" strokeWidth="1.4" opacity="0.85" />
          {/* The N — hairline verticals + a single diagonal. */}
          <path d="M8.5 17 V9 L 15.5 17 V9" strokeWidth="1.6" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
