import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface:        "var(--surface)",
        ink:            "var(--ink)",
        accent:         "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-subtle":"var(--accent-subtle)",
        secondary:      "var(--secondary)",
        border:         "var(--border)",
        muted:          "var(--muted)",
        "ink-muted":    "var(--ink-muted)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        soft:     "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        card:     "0 4px 16px rgba(0,0,0,0.06)",
        elevated: "0 12px 40px rgba(0,0,0,0.08)",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #f0f9ff 0%, #f8fafc 60%, #ffffff 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
