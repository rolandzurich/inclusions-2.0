/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./app/globals.css",
    "./components/**/*.{ts,tsx}",
  ],
  // Kritische Klassen aus globals.css @apply und body – immer im Build behalten
  safelist: [
    "bg-brand-gray",
    "text-white",
    "text-brand-pink",
    "font-bangers",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#FF04D3",
          dark: "#05060A",
          gray: "#0F1017"
        }
      },
      fontFamily: {
        bangers: ["var(--font-bangers)", "Bangers", "cursive"],
      },
      transitionDuration: {
        250: "250ms",
      },
      ringOffsetColor: {
        "brand-gray": "#0F1017",
        "brand-dark": "#05060A",
      },
    }
  },
  plugins: []
};

