import { ImageResponse } from "next/og";

// iOS / iPadOS home-screen icon — the editorial monogram (hairline
// ring + thin "N") on a brand-red square, with a small tracked
// "NEXTWIN" wordmark below the ring. Mirrors the in-app Logo while
// inverting the colour story so the mark stands out on the home
// screen: white on red, instead of red on cream.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
// Required for `output: 'export'` — bake the icon at build time.
export const dynamic = "force-static";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FF385C 0%, #E00B41 100%)",
          fontFamily: "Georgia, serif",
        }}
      >
        <svg width="104" height="104" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="16"
            cy="16"
            r="13"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.4"
          />
          <path
            d="M11 23 V9 L21 23 V9"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.7"
            strokeLinecap="butt"
            strokeLinejoin="miter"
          />
        </svg>
        <div
          style={{
            marginTop: 12,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.32em",
            color: "#ffffff",
          }}
        >
          NEXTWIN
        </div>
      </div>
    ),
    { ...size },
  );
}
