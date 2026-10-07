/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tauriq: {
          black: "#0a0a0f",
          dark: "#0d0d14",
          panel: "#111118",
          border: "#1a1a28",
          blue: "#0ea5e9",
          cyan: "#06b6d4",
          violet: "#7c3aed",
          glow: "#38bdf8",
          muted: "#4a4a6a",
          text: "#e2e8f0",
          dim: "#94a3b8",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 20px rgba(14, 165, 233, 0.15)",
        "glow-lg": "0 0 40px rgba(14, 165, 233, 0.2)",
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.15)",
        "glow-violet": "0 0 20px rgba(124, 58, 237, 0.15)",
        panel: "0 8px 32px rgba(0,0,0,0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
}

