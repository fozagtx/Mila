import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#F0E7D5",
          deep: "#E7DBC4",
          soft: "#F6F0E4",
        },
        navy: {
          DEFAULT: "#1E2A44",
          soft: "#2c3a5c",
          line: "#d8ccb4",
        },
        critical: "#b5302e",
        high: "#c4641f",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      zIndex: {
        skip: "60",
      },
    },
  },
  plugins: [],
};

export default config;
