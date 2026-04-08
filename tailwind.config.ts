import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(215 25% 88%)",
        input: "hsl(215 25% 88%)",
        ring: "hsl(206 100% 42%)",
        background: "hsl(48 29% 96%)",
        foreground: "hsl(210 39% 16%)",
        primary: {
          DEFAULT: "hsl(206 100% 42%)",
          foreground: "hsl(0 0% 100%)"
        },
        secondary: {
          DEFAULT: "hsl(164 42% 92%)",
          foreground: "hsl(165 74% 18%)"
        },
        muted: {
          DEFAULT: "hsl(40 18% 92%)",
          foreground: "hsl(215 18% 35%)"
        },
        accent: {
          DEFAULT: "hsl(17 89% 92%)",
          foreground: "hsl(14 74% 31%)"
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(210 39% 16%)"
        },
        destructive: {
          DEFAULT: "hsl(0 84% 60%)",
          foreground: "hsl(0 0% 100%)"
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-serif", "Georgia"]
      },
      boxShadow: {
        soft: "0 20px 50px rgba(22, 44, 68, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
