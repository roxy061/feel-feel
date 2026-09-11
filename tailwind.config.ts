import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#010101",
        surface: {
          DEFAULT: "#010101",
          card: "#090A0F",
          accent: "#272835",
          muted: "#13141C",
        },
        accent: {
          DEFAULT: "#272835",
          hover: "#343647",
          foreground: "#EEEFF2",
        },
        neutral: {
          DEFAULT: "#EEEFF2",
          muted: "#8E919D",
          dark: "#1A1B23",
        },
        border: {
          DEFAULT: "#EEEFF2",
          subtle: "rgba(238, 239, 242, 0.12)",
          strong: "rgba(238, 239, 242, 0.28)",
        },
      },
      borderRadius: {
        xl: "12px",
        base: "12px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-inter)", "sans-serif"],
        bebas: ["var(--font-bebas)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
