import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        noche: { DEFAULT: "#1C2340", 700: "#2A3358", 500: "#4A5480", 300: "#9AA1C0", 100: "#E4E6F0" },
        porcelana: "#F2F3F6",
        vela: { DEFAULT: "#B8893A", 600: "#9A7130", 100: "#F5EBD8" },
        mar: { DEFAULT: "#2C6B6E", 600: "#22575A", 100: "#DCEDEC" },
        malva: { DEFAULT: "#A2566E", 100: "#F4E3E8" },
        tinta: "#1A1C26",
        gris: "#6B6F80",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: { xl2: "1.25rem" },
      boxShadow: {
        suave: "0 1px 2px rgba(28,35,64,.06), 0 8px 24px -12px rgba(28,35,64,.18)",
        flotante: "0 12px 32px -8px rgba(28,35,64,.45)",
      },
    },
  },
  plugins: [],
};
export default config;
