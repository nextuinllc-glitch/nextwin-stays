import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Marrakech-luxe palette — terracotta and warm sand, the colours
        // of the Medina walls at sunset. brand-500 is the canonical
        // primary (CTAs, accents); brand-300 is the lighter wash for
        // glass surfaces and hovers. The 50–900 scale tracks ochre /
        // terracotta / burnt-sienna in a continuous progression so
        // existing brand-* references re-theme without per-component
        // edits.
        brand: {
          50: "#FBF1EB",
          100: "#F2DDC9",
          200: "#E5BC9B",
          300: "#D89466",
          400: "#C77144",
          500: "#B85432",
          600: "#9D3F23",
          700: "#7C2F1A",
          800: "#5C2113",
          900: "#3D160C",
          DEFAULT: "#B85432",
        },
        // Warm near-black — feels candle-lit on the sand background,
        // never industrial. Body text pairs cleanly with the ochre
        // primary; soft is for meta lines / disabled states.
        ink: {
          DEFAULT: "#1A1410",
          muted: "#5A4A3E",
          soft: "#9A8B7E",
        },
        // Sand surfaces. cream-100 is the page bg (warm bone), cream-50
        // is bright bone for cards, cream-200 is dune for alt panels.
        // Replaces the cool sky tint with a sun-dried adobe undertone.
        cream: {
          DEFAULT: "#F5EFE2",
          50: "#FAF6EC",
          100: "#F5EFE2",
          200: "#EDE0CB",
          300: "#D9C5A5",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      boxShadow: {
        // Neutral charcoal shadows — Airbnb pages have a softer, less
        // tinted depth than the old navy-toned palette.
        card: "0 1px 2px rgba(0,0,0,0.05), 0 6px 16px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08), 0 18px 32px rgba(0,0,0,0.12)",
        widget: "0 6px 16px rgba(0,0,0,0.12)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
