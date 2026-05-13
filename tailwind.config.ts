import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Airbnb-style palette — magenta primary (`#FF385C`), bone-white
        // surfaces, near-black ink. Token names kept (brand / cream /
        // ink) so every existing `bg-brand-500`, `text-ink-muted` etc.
        // re-themes without per-component edits.
        brand: {
          50: "#FFF1F4",
          100: "#FFE4EA",
          200: "#FFC9D4",
          300: "#FFA3B7",
          400: "#FF5A5F", // Airbnb light
          500: "#FF385C", // Airbnb primary
          600: "#E00B41", // Airbnb dark — hover state
          700: "#D70466",
          800: "#9B0033",
          900: "#5C001C",
          DEFAULT: "#FF385C",
        },
        // Airbnb text scale — strict-neutral, no warmth. Pair the
        // magenta primary with a pure-grey ink so CTAs stay loud
        // without competing with body copy.
        ink: {
          DEFAULT: "#222222",
          muted: "#717171",
          soft: "#B0B0B0",
        },
        // White-and-grey surface scale. cream-50 is the page bg (pure
        // white) — kept the `cream` name so existing utilities don't
        // need a rename. cream-100 is the Airbnb panel grey, cream-200
        // mid-grey for hover states, cream-300 is the input border.
        cream: {
          DEFAULT: "#FFFFFF",
          50: "#FFFFFF",
          100: "#F7F7F7",
          200: "#F0F0F0",
          300: "#DDDDDD",
        },
      },
      fontFamily: {
        // Both stacks resolve to Inter (see layout.tsx). `display` is
        // kept for semantic clarity — components that use it inherit a
        // heavier weight in their utility classes (font-semibold etc).
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
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
