import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-fira-code)", "monospace"],
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        // Custom brand colors — StellarStream Electric Cyan / Deep Violet
        stellar: {
          50: "hsl(185, 100%, 97%)",
          100: "hsl(185, 98%, 90%)",
          200: "hsl(185, 96%, 78%)",
          300: "hsl(185, 95%, 65%)",
          400: "hsl(185, 100%, 55%)",  // Electric Cyan (#00F0FF)
          500: "hsl(185, 100%, 45%)",
          600: "hsl(185, 100%, 36%)",
          700: "hsl(185, 100%, 27%)",
          800: "hsl(185, 100%, 17%)",
          900: "hsl(185, 100%, 9%)",
        },
        violet: {
          50: "hsl(270, 100%, 97%)",
          100: "hsl(270, 98%, 90%)",
          200: "hsl(270, 96%, 80%)",
          300: "hsl(270, 95%, 72%)",
          400: "hsl(270, 100%, 65%)",  // Deep Violet (#9D00FF)
          500: "hsl(270, 100%, 55%)",
          600: "hsl(270, 100%, 45%)",
          700: "hsl(270, 100%, 35%)",
          800: "hsl(270, 100%, 22%)",
          900: "hsl(270, 100%, 12%)",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient":
          "linear-gradient(135deg, hsl(185,100%,4%) 0%, hsl(222,47%,6%) 50%, hsl(270,60%,7%) 100%)",
        "card-gradient":
          "linear-gradient(135deg, rgba(0,240,255,0.03) 0%, rgba(255,255,255,0.02) 100%)",
        "stellar-gradient":
          "linear-gradient(135deg, hsl(185,100%,40%) 0%, hsl(210,100%,50%) 50%, hsl(270,100%,55%) 100%)",
        "stream-gradient":
          "linear-gradient(90deg, hsl(185,100%,45%) 0%, hsl(210,100%,60%) 50%, hsl(270,100%,60%) 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(185 100% 50% / 0.25)",
          },
          "50%": {
            boxShadow: "0 0 45px hsl(185 100% 50% / 0.55), 0 0 80px hsl(270 100% 60% / 0.15)",
          },
        },
        "stream-flow": {
          "0%": { backgroundPosition: "100% 0" },
          "100%": { backgroundPosition: "-100% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.4s ease-out",
        shimmer: "shimmer 2s infinite linear",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glow: "0 0 30px hsl(185 100% 50% / 0.25)",
        "glow-cyan": "0 0 30px hsl(185 100% 55% / 0.25)",
        "glow-violet": "0 0 30px hsl(270 100% 60% / 0.2)",
        "glow-stream": "0 0 20px hsl(185 100% 50% / 0.3), 0 0 50px hsl(270 100% 60% / 0.1)",
        card: "0 4px 24px rgba(0, 0, 0, 0.35)",
        "card-hover": "0 8px 40px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
