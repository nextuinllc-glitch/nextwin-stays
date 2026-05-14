import { ImageResponse } from "next/og";

// Browser favicon — the same monogram as the Logo component: a
// hairline ring with an editorial "N" inside, in the brand red.
// Strokes are stepped up slightly vs. the in-app logo (which sits
// at 36 px on a calm cream backdrop) because at 32 px on a tiny
// browser tab, true hairlines disappear into sub-pixel aliasing.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";
// Required for `output: 'export'` — bake the icon into a real .png at
// build time instead of generating it per-request.
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
        <svg width="28" height="28" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          {/* Hairline ring — 1.6px stroke reads as a thin line on
              retina without vanishing at the 32 px favicon size. */}
          <circle
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke="#E00B41"
            strokeWidth="1.6"
          />
          {/* Editorial N — same path as the Logo SVG, scaled into the
              circle with a touch of inset on every side. */}
          <path
            d="M11 23 V9 L21 23 V9"
            fill="none"
            stroke="#E00B41"
            strokeWidth="1.8"
            strokeLinecap="butt"
            strokeLinejoin="miter"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
