/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
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
        bangers: ["var(--font-bangers)", "cursive"],
      }
    }
  },
  plugins: []
};

