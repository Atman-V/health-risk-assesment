/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src//*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
// tailwind.config.js
module.exports = {
  content: ["./src//*.{js,jsx,ts,tsx}"],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#4f46e5',
        secondary: '#14b8a6',
      },
    },
  },
  plugins: [],
}