import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fbff",
          100: "#d9f4ff",
          200: "#b6e9ff",
          300: "#7fd8ff",
          400: "#40c0f3",
          500: "#1895cd",
          600: "#1278ab",
          700: "#126189",
          800: "#155270",
          900: "#17445d"
        },
        mint: {
          50: "#eefcf7",
          100: "#d7f7ea",
          200: "#b2ecd6",
          300: "#7edcb9",
          400: "#45c599",
          500: "#1fad7f",
          600: "#158b66",
          700: "#146f55",
          800: "#145947",
          900: "#12493b"
        }
      },
      boxShadow: {
        soft: "0 20px 60px rgba(17, 43, 60, 0.12)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top left, rgba(24,149,205,0.2), transparent 28%), radial-gradient(circle at bottom right, rgba(31,173,127,0.18), transparent 30%)"
      }
    }
  },
  plugins: []
};

export default config;
