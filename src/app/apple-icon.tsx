import { ImageResponse } from "next/og";

// iOS / iPadOS home-screen icon — the Moorish-arch monogram on a
// brand-red gradient backdrop with the "NEXTWIN" wordmark tracked
// beneath it. Mirrors the in-app Logo but inverts the colour story
// so the mark stands out as an app tile (white-on-red) rather than
// the cream-on-red of the header.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
// Required for `output: 'export'` — bake into a real .png at build time.
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
        <svg
          width="96"
          height="96"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 22 L4 11 A 8 8 0 0 1 20 11 L 20 22" strokeWidth="1.4" />
          <path d="M3 22 L21 22" strokeWidth="1.2" opacity="0.85" />
          <path d="M8.5 17 V9 L 15.5 17 V9" strokeWidth="1.4" />
        </svg>
        <div
          style={{
            marginTop: 14,
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
