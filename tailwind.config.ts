import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        gold: {
          DEFAULT: "#C9A84C",
          light: "#E8D48B",
          dark: "#8B6914",
          50: "#FBF6E4",
          100: "#F5E9BD",
          200: "#EDDA93",
          300: "#E5CB69",
          400: "#DEBF4A",
          500: "#C9A84C",
          600: "#A88B3E",
          700: "#8B6914",
          800: "#5C4A1F",
          900: "#2E2510",
        },
        crimson: {
          DEFAULT: "#8B1A1A",
          light: "#C93545",
          dark: "#5C1010",
          50: "#FDE8E8",
          100: "#F9BFBF",
          200: "#F49393",
          300: "#E06060",
          400: "#C93545",
          500: "#8B1A1A",
          600: "#741515",
          700: "#5C1010",
          800: "#3D0A0A",
          900: "#1E0505",
        },
        arcane: {
          DEFAULT: "#4A6FA5",
          light: "#7BA3D9",
          dark: "#2D4A73",
          50: "#EBF0F7",
          100: "#C5D5EA",
          200: "#9FBADD",
          300: "#7BA3D9",
          400: "#5C8CC5",
          500: "#4A6FA5",
          600: "#3B5A87",
          700: "#2D4A73",
          800: "#1E3250",
          900: "#0F1928",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Georgia", "serif"],
        heading: ["var(--font-sans)", "Georgia", "serif"],
        body: ["var(--font-sans)", "Georgia", "serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glow-gold": "0 0 20px rgba(201, 168, 76, 0.3)",
        "glow-crimson": "0 0 20px rgba(139, 26, 26, 0.3)",
        "glow-arcane": "0 0 20px rgba(74, 111, 165, 0.3)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer": "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
