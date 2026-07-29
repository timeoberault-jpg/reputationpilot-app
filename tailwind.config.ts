import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0F6E56",
          light: "#1D9E75",
          dark: "#085041",
        },
      },
    },
  },
  plugins: [],
};

export default config;
