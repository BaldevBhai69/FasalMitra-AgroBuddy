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
        background: "var(--background)",
        foreground: "var(--foreground)",
        agro: {
          cream: "#f7f1e5",
          gold: "#e7b10a",
          olive: "#898121",
          deep: "#4c4b16",
          dark: "#14160c",
          surface: "#1e2010",
        },
      },
    },
  },
  plugins: [],
};
export default config;
