// tailwind.config.ts
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
        cream: "#faf7f2",
        parchment: "#f0e9de",
        "tan-light": "#e8dfd3",
        "tan-dark": "#ddd2c2",
        amber: { DEFAULT: "#d97706", light: "#fef3e2" },
        gold: { DEFAULT: "#b8860b" },
        ink: { DEFAULT: "#2d2a24", body: "#4a4539", muted: "#8a7a65" },
        "locked-bg": "#f5f0e8",
      },
      fontFamily: {
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
        hand: ["var(--font-caveat)", "cursive"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
