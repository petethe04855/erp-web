import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: { sans: ["IBM Plex Sans Thai", "sans-serif"] },
      colors: {
        brand: { DEFAULT: "#0057D9", light: "#DCEBFF", dark: "#001F5C", muted: "#DCEBFF" },
        ink: { DEFAULT: "#001F5C", 2: "#374151", 3: "#6B7280", 4: "#9CA3AF", 5: "#FAFBFC" },
        success: { DEFAULT: "#10B981", light: "#D1FAE5" },
        warning: { DEFAULT: "#F59E0B", light: "#FEF3C7" },
        danger: { DEFAULT: "#EF4444", light: "#FEE2E2" },
      },
    },
  },
  plugins: [],
};
export default config;
