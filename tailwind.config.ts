import type { Config } from "tailwindcss";

// ============================================================================
// Klantis Farms design tokens — per Document 9 (UI/UX Design System Spec).
// This is the CURRENT, confirmed direction (bright Klantis Green / white
// commerce look). Do NOT reintroduce the old tomato/citrus/leaf/lime palette.
// ============================================================================
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          DEFAULT: "#1F6B45", // Klantis Green — primary
          dark: "#17532F",
        },
        forest: "#123B2A",     // Klantis Forest — header/footer/dark sections
        mist: {
          DEFAULT: "#EAF4EE",  // Klantis Mist — light tinted backgrounds
          light: "#F1F8F3",
        },
        gold: "#D99A2B",       // Harvest Gold — accent, ratings
        soil: "#795548",       // earth accent, used sparingly
        ink: {
          DEFAULT: "#17221C",
          soft: "#66736B",
        },
        border: "#DCE4DE",
        surface: "#F7F9F7",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
    },
  },
  plugins: [],
};

export default config;
