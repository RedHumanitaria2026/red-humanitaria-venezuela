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
        primary: {
          50: "#eef3f8",
          100: "#d5e3ef",
          200: "#adc8df",
          300: "#7aacc9",
          400: "#4f90b3",
          500: "#2d759e",
          600: "#1e3a5f",
          700: "#162d4a",
          800: "#0e1e30",
          900: "#070f18",
          950: "#030810",
        },
        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#059669",
          600: "#047857",
          700: "#065f46",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#d97706",
          600: "#b45309",
          700: "#92400e",
        },
        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#dc2626",
          600: "#b91c1c",
          700: "#991b1b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)",
        dropdown:
          "0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.05)",
        modal: "0 20px 50px -10px rgba(0,0,0,0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
