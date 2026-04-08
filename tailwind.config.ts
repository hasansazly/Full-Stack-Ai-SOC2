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
        border: "hsl(240 6% 16%)",
        input: "hsl(240 6% 16%)",
        ring: "hsl(239 84% 67%)",
        background: "hsl(240 10% 4%)",
        foreground: "hsl(0 0% 98%)",
        primary: {
          DEFAULT: "hsl(239 84% 67%)",
          foreground: "hsl(0 0% 100%)"
        },
        secondary: {
          DEFAULT: "hsl(240 6% 12%)",
          foreground: "hsl(0 0% 98%)"
        },
        muted: {
          DEFAULT: "hsl(240 5% 10%)",
          foreground: "hsl(240 5% 65%)"
        },
        accent: {
          DEFAULT: "hsl(239 50% 18%)",
          foreground: "hsl(239 90% 84%)"
        },
        card: {
          DEFAULT: "hsl(240 6% 8%)",
          foreground: "hsl(0 0% 98%)"
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
