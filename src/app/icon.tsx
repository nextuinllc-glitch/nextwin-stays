import { ImageResponse } from "next/og";

// Browser favicon — the same Marrakech-inspired horseshoe arch as the
// in-app Logo. Terracotta tile, champagne-gold arch + 8-pointed star,
// rounded-square frame. Reads as a Moroccan doorway stamp at 32 px.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

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
          // Terracotta gradient — sun-baked sandstone, the colour of the
          // Marrakech Medina walls at golden hour.
          background: "linear-gradient(135deg, #B85432 0%, #7C2F1A 100%)",
          borderRadius: 7,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          {/* 8-pointed star (Khatim) — the classic Marrakech zellige
              ornament, in champagne gold. */}
          <path
            d="M16 4 L17 6.6 L19.6 5.7 L18.7 8.3 L21.3 9.3 L18.7 10.3 L19.6 12.9 L17 12 L16 14.6 L15 12 L12.4 12.9 L13.3 10.3 L10.7 9.3 L13.3 8.3 L12.4 5.7 L15 6.6 Z"
            fill="#E5C68A"
          />
          {/* Horseshoe arch — the iconic Moorish doorway silhouette. */}
          <path
            d="M9 27 L9 17 C 9 12, 14.5 11, 16 11 C 17.5 11, 23 12, 23 17 L23 27"
            fill="none"
            stroke="#E5C68A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Baseline */}
          <path d="M6 27 L26 27" stroke="#E5C68A" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
