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
        midnight: {
          950: "#03050a",
          900: "#060914",
          850: "#090d1e",
          800: "#0e152e",
          700: "#152042",
          600: "#1e2c59",
        },
        violet: {
          glow: "#8b5cf6",
          dark: "#6d28d9",
          soft: "#c4b5fd",
        },
        cyan: {
          glow: "#06b6d4",
          dark: "#0e7490",
          soft: "#a5f3fc",
        },
        surface: {
          glass: "rgba(13, 19, 38, 0.65)",
          glassHover: "rgba(18, 26, 52, 0.8)",
          card: "#0d1326",
          border: "rgba(255, 255, 255, 0.08)",
          borderGlow: "rgba(139, 92, 246, 0.3)",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "radial-highlight": "radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
        "radial-cyan": "radial-gradient(circle at 100% 100%, rgba(6, 182, 212, 0.1) 0%, transparent 60%)",
        "glow-border": "linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.2), transparent 70%)",
      },
      boxShadow: {
        "glow-violet": "0 0 25px -5px rgba(139, 92, 246, 0.25)",
        "glow-cyan": "0 0 25px -5px rgba(6, 182, 212, 0.25)",
        "glow-card": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      animation: {
        "pulse-subtle": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        }
      }
    },
  },
  plugins: [],
};

export default config;
