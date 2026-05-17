import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#fbfaf6",
        sage: "#7aa37a",
        lilac: "#c8b6ff"
      }
    }
  },
  plugins: []
} satisfies Config;
