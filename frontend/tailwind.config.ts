import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syncopate'", "'Futura'", "'Avenir Next'", "sans-serif"],
        sans: ["'Space Grotesk'", "'Avenir Next'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'JetBrains Mono'", "'SF Mono'", "'Menlo'", "ui-monospace", "monospace"],
      },
      colors: {
        void: {
          DEFAULT: "#000000",
          950: "#000000",
          900: "#050608",
          850: "#0a0b10",
          800: "#11131a",
        },
        electric: {
          DEFAULT: "#56B4F9",
          light: "#7CC8FF",
          dark: "#2589D8",
        },
        cyber: {
          DEFAULT: "#FF2E93",
          light: "#FF66B2",
          dark: "#D11471",
        },
        surface: {
          base: "#050608",
          elevated: "#0a0b10",
          border: "rgba(255, 255, 255, 0.12)",
          borderStrong: "rgba(255, 255, 255, 0.22)",
        },
      },
      boxShadow: {
        "blue-glow": "0 0 32px -4px rgba(86, 180, 249, 0.35)",
        "pink-glow": "0 0 32px -4px rgba(255, 46, 147, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
