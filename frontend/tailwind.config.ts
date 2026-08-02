import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: {
          DEFAULT: "#1B1D1F",
          light: "#26292C",
          lighter: "#33373B"
        },
        concrete: "#8B8F94",
        chalk: "#EDEDE9",
        signal: {
          amber: "#F5B700",
          orange: "#FF6B35",
          green: "#3DDC84",
          red: "#FF4545"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      backgroundImage: {
        "road-lines":
          "repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(245,183,0,0.08) 24px, rgba(245,183,0,0.08) 48px)"
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        }
      },
      animation: {
        "fade-in-up": "fade-in-up 0.8s ease-out both",
        "fade-in": "fade-in 0.8s ease-out both"
      }
    }
  },
  plugins: []
};

export default config;
