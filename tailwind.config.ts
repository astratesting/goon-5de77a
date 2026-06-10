import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0B0F",
          2: "#11131A",
          3: "#1A1D27",
        },
        border: "#232734",
        text: {
          DEFAULT: "#E6E8EE",
          dim: "#8A90A0",
          faint: "#54586A",
        },
        indigo: "#5B5BFF",
        cyan: "#4DD0E1",
        teal: "#2EE6B0",
        amber: "#F5B547",
        red: "#FF5A6B",
      },
      fontFamily: {
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        xs: "12px",
        sm: "13px",
        base: "14px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "48px",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        6: "24px",
        8: "32px",
        12: "48px",
        16: "64px",
      },
      borderRadius: {
        card: "12px",
        input: "6px",
      },
      maxWidth: {
        content: "1280px",
      },
      lineHeight: {
        body: "1.5",
        display: "1.2",
      },
      letterSpacing: {
        tight: "-0.01em",
        tighter: "-0.02em",
      },
    },
  },
  plugins: [],
};

export default config;
