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
        surface: "var(--surface)",
        ink: "var(--ink)",
        accent: "var(--accent)",
        secondary: "var(--secondary)",
        border: "var(--border)",
        muted: "var(--muted)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        glow: "0 20px 60px rgba(0, 77, 64, 0.18)",
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at top left, rgba(0, 121, 107, 0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(255, 138, 101, 0.2), transparent 30%)",
      },
    },
  },
  plugins: [],
};

export default config;
