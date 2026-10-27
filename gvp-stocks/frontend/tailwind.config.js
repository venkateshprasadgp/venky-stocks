/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0B0E14',
        'brand-green': '#00C076',
        'brand-red': '#FF3B30',
      },
    },
  },
  plugins: [],
}
