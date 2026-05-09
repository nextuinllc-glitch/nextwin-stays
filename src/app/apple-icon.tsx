import { ImageResponse } from "next/og";

// iOS / iPadOS home-screen icon — same Marrakech horseshoe-arch mark as
// the in-app Logo, scaled to 180×180 and paired with the NEXTWIN word
// in champagne gold beneath the glyph. Terracotta gradient backdrop.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

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
          background: "linear-gradient(135deg, #B85432 0%, #7C2F1A 100%)",
          fontFamily: "Georgia, serif",
        }}
      >
        <svg width="100" height="100" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 4 L17 6.6 L19.6 5.7 L18.7 8.3 L21.3 9.3 L18.7 10.3 L19.6 12.9 L17 12 L16 14.6 L15 12 L12.4 12.9 L13.3 10.3 L10.7 9.3 L13.3 8.3 L12.4 5.7 L15 6.6 Z"
            fill="#E5C68A"
          />
          <path
            d="M9 27 L9 17 C 9 12, 14.5 11, 16 11 C 17.5 11, 23 12, 23 17 L23 27"
            fill="none"
            stroke="#E5C68A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M6 27 L26 27" stroke="#E5C68A" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
        </svg>
        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.3em",
            color: "#E5C68A",
          }}
        >
          NEXTWIN
        </div>
      </div>
    ),
    { ...size },
  );
}
